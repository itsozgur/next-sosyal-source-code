class StatusViewsWorker

  include Sidekiq::Worker
  sidekiq_options queue: :views, retry: false

  def perform(account_id, status_id)
    StatusView.transaction do
      begin
      # ya yeni create et ya da zaten varsa bul
        puts "worker start"
        StatusView.create!(account_id: account_id, status_id: status_id)
        status_stat = StatusStat.find_or_create_by(status_id: status_id)
        status_stat.increment!(:views_count)
      rescue ActiveRecord::RecordNotUnique
        puts "record not unique"
      end
    end
  rescue => e
    Rails.logger.error("[StatusViewsWorker] #{e.class}: #{e.message}")
  end
end
