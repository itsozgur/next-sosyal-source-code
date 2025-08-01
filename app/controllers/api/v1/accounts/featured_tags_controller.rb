# frozen_string_literal: true

class Api::V1::Accounts::FeaturedTagsController < Api::BaseController
  before_action :set_account
  before_action :set_featured_tags

  respond_to :json

  def index
    render json: @featured_tags, each_serializer: REST::FeaturedTagSerializer
  end

  private

  def set_account
    @account = Account.find(params[:account_id])
  end

  def set_featured_tags
    @featured_tags = @account.suspended? ? [] : @account.featured_tags
  end

  def disallow_unauthenticated_api_access?
    base = ENV['DISALLOW_UNAUTHENTICATED_API_ACCESS'] == 'true' || Rails.configuration.x.limited_federation_mode
    if base && ENV['PUBLIC_TIMELINE_ACCESS'] == 'true'
      return false if action_name == 'index'
    end
    base
  end
end
