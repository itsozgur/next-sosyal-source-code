# lib/error_logging_middleware.rb
class ErrorLoggingMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    @app.call(env)
  rescue StandardError => exception
    request = ActionDispatch::Request.new(env)

    Rails.logger.error({
      severity: 'ERROR',
      error_class: exception.class.name,
      message: exception.message,
      backtrace: exception.backtrace&.take(10),
      request_id: request.request_id,
      path: request.path,
      params: request.filtered_parameters,
      user_agent: request.user_agent,
      ip: request.remote_ip
    }.to_json)

    raise exception
  end
end
