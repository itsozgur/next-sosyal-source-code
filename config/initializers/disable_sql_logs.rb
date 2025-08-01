ActiveRecord::LogSubscriber.log_subscribers.each do |subscriber|
  ActiveSupport::Notifications.notifier.listeners_for('sql.active_record').each do |listener|
    ActiveSupport::Notifications.unsubscribe(listener)
  end
end
