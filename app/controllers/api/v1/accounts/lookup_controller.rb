# frozen_string_literal: true

class Api::V1::Accounts::LookupController < Api::BaseController
  before_action -> { authorize_if_got_token! :read, :'read:accounts' }
  before_action :set_account

  def show
    cache_if_unauthenticated!
    render json: @account, serializer: REST::AccountSerializer
  end

  private

  def set_account
    @account = ResolveAccountService.new.call(params[:acct], skip_webfinger: true) || raise(ActiveRecord::RecordNotFound)
  rescue Addressable::URI::InvalidURIError
    raise(ActiveRecord::RecordNotFound)
  end

  def disallow_unauthenticated_api_access?
    base = ENV['DISALLOW_UNAUTHENTICATED_API_ACCESS'] == 'true' || Rails.configuration.x.limited_federation_mode
    if base && ENV['PUBLIC_TIMELINE_ACCESS'] == 'true'
      return false if action_name == 'show'
    end
    base
  end
end
