require_relative 'custom_log_adapter'
require_relative 'multi_io'

module CustomLogger
  def self.build
    puts "CustomLogger.build running..."

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

    logger = Logger.new(combined_output)

    logger.formatter = proc do |severity, datetime, _progname, msg|
      loc = caller_locations(2, 10).find { |l| l.absolute_path&.start_with?(Rails.root.to_s) }
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

    ActiveSupport::TaggedLogging.new(logger)
  end
end
