# frozen_string_literal: true

class Mastodon::SidekiqMiddleware
  BACKTRACE_LIMIT = 3

  def call(worker, job, queue)
    log_context = {
      request_id: job['jid'],
      controller: worker.class.name,
      action: 'perform',
      params: job['args'],
      user_id: (worker.respond_to?(:user_id) ? worker.user_id : nil),
      user_email: (worker.respond_to?(:user_email) ? worker.user_email : nil),
      source: 'sidekiq',
      queue: queue,
      tags: ["sidekiq", "queue:#{queue}"]
    }
  
    Thread.current[:log_context] = log_context
  
    Chewy.strategy(:mastodon) do
      yield
    end
  rescue Mastodon::HostValidationError
    # Do not retry
  rescue => e
    clean_up_elasticsearch_connections!
    limit_backtrace_and_raise(e)
  ensure
    clean_up_sockets!
    Thread.current[:log_context] = nil
  end

  private

  def limit_backtrace_and_raise(exception)
    exception.set_backtrace(exception.backtrace.first(BACKTRACE_LIMIT)) unless ENV['BACKTRACE']
    raise exception
  end

  def clean_up_sockets!
    clean_up_redis_socket!
    clean_up_statsd_socket!
  end

  def clean_up_elasticsearch_connections!
    return unless Chewy.enabled? && Chewy.current[:chewy_client].present?

    Chewy.client.transport.transport.connections.each do |connection|
      connection.connection.app.instance_variable_get(:@client)&.reset_all
    end

    Chewy.current.delete(:chewy_client)
  rescue
    nil
  end

  def clean_up_redis_socket!
    RedisConnection.pool.checkin if Thread.current[:redis]
    Thread.current[:redis] = nil
  end

  def clean_up_statsd_socket!
    Thread.current[:statsd_socket]&.close
    Thread.current[:statsd_socket] = nil
  end
end
