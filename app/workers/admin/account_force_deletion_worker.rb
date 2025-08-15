# frozen_string_literal: true

class Admin::AccountForceDeletionWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull', lock: :until_executed, lock_ttl: 1.week.to_i

  def perform(account_id)
    account = Account.find(account_id)
    Rails.logger.info "FORCE DELETE WORKER: Processing account #{account.username} (ID: #{account_id})"

    DeleteAccountService.new.call(account, reserve_username: false, reserve_email: false)

    Rails.logger.info "FORCE DELETE WORKER: Completed for account #{account.username}"
  rescue ActiveRecord::RecordNotFound
    Rails.logger.warn "FORCE DELETE WORKER: Account #{account_id} not found"
    true
  end
end
