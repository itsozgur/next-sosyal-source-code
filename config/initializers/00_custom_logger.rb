require 'logger'
require 'active_support/tagged_logging'
require 'active_support/broadcast_logger'

module CustomLogger
  def self.build
    endpoint   = ENV['BLOG_URL']
    api_key    = ENV['BLOG_API_KEY']
    api_secret = ENV['BLOG_API_SECRET']
    version    = ENV['BLOG_VERSION']
    env        = ENV['BLOG_ENV']

    if [endpoint, api_key, api_secret, version, env].any?(&:blank?)
      puts "CustomLogger: missing environment variables, using STDOUT logger"
      return ActiveSupport::TaggedLogging.new(Logger.new($stdout))
    end

    combined_output = MultiIO.new(
      $stdout,
      CustomLogAdapter.new(endpoint, api_key, api_secret, version, env)
    )

    base_logger = Logger.new(combined_output)

    base_logger.formatter = proc do |severity, datetime, _progname, msg|
      loc = caller_locations.detect { |l| l.absolute_path&.start_with?(Rails.root.to_s) }
      context = Thread.current[:log_context] || {}

      entry = {
        severity:  severity,
        timestamp: datetime.utc.iso8601,
        message:   msg.to_s,
        file:      loc&.path&.sub("#{Rails.root}/", '') || 'unknown',
        line:      loc&.lineno || 0,
        method:    loc&.label || 'unknown'
      }.merge(context)

      entry.to_json + "\n"
    end

    puts "CustomLogger: Active (log server: #{endpoint})"
    ActiveSupport::BroadcastLogger.new(ActiveSupport::TaggedLogging.new(base_logger))
  end
end
