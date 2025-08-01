# lib/custom_log_adapter.rb
require 'net/http'
require 'uri'
require 'json'
require 'time'

class CustomLogAdapter
  MAPPING = {
    'FATAL'   => 'ERROR',
    'ERROR'   => 'ERROR',
    'WARN'    => 'INFO',
    'INFO'    => 'INFO',
    'DEBUG'   => 'DEBUG',
    'UNKNOWN' => 'ERROR'
  }.freeze

  def initialize(endpoint_url, api_key, api_secret, version, env)
    @endpoint   = URI.parse(endpoint_url)
    @api_key    = api_key
    @api_secret = api_secret
    @version    = version
    @env        = env
    @queue      = Queue.new
    start_worker
  end

  def write(log_line)
    raw = log_line.to_s
    return if raw.include?('[httplog]')
    @queue << raw
  end

  def <<(log_line)
    write(log_line)
  end

  def close; end

  def flush; end

  def tty?
    false
  end

  private

  def start_worker
    Thread.new do
      loop do
        raw = @queue.pop
        entry = begin
          parsed = JSON.parse(raw)
          parsed.is_a?(Hash) ? parsed : {}
        rescue JSON::ParserError
          { 'message' => raw, 'severity' => 'INFO', 'timestamp' => Time.now.utc.iso8601 }
        end
        if entry['file'] == 'unknown' && entry['method'] == 'unknown' &&
          (entry['message'] == 'start' || entry['message'] == 'done')
          next
        end
        payload = entry.merge(Thread.current[:log_context] || {})

        timestamp_val = begin
          Time.parse(entry['timestamp'].to_s).to_f
        rescue
          Time.now.to_f
        end
        
        body = {
          log_type:    MAPPING[entry['severity'].to_s.upcase] || 'INFO',
          version:     @version,
          timestamp:   timestamp_val,
          environment: @env,
          payload:     payload
        }

        begin
          http = Net::HTTP.new(@endpoint.host, @endpoint.port)
          http.use_ssl = (@endpoint.scheme == 'https')
          req = Net::HTTP::Post.new(@endpoint.request_uri)
          req['X-Api-Key']        = @api_key
          req['X-Api-Secret-Key'] = @api_secret
          req['Content-Type']     = 'application/json'
          req.body                = body.to_json
          http.request(req)
        rescue => e
          puts "[CustomLogAdapter ERROR] #{e.class}: #{e.message}"
        end
      end
    end
  end
end
