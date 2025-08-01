# frozen_string_literal: true

class Api::V1::Trends::LinksController < Api::BaseController
  vary_by 'Authorization, Accept-Language'

  before_action :set_links

  after_action :insert_pagination_headers

  DEFAULT_LINKS_LIMIT = 10

  def index
    cache_if_unauthenticated!
    render json: @links, each_serializer: REST::Trends::LinkSerializer
  end

  private

  def enabled?
    Setting.trends
  end

  def set_links
    @links = if enabled?
               links_from_trends.offset(offset_param).limit(limit_param(DEFAULT_LINKS_LIMIT))
             else
               []
             end
  end

    def links_from_trends
    target_username = ENV['TRENDS_FOLLOWING_FEED_USERNAME'] || 'sosyada'
    target_account = Account.find_by(username: target_username)
    
    if target_account.nil?
      return PreviewCard.none
    end

    following_account_ids = target_account.following.pluck(:id)
    
    if following_account_ids.empty?
      return PreviewCard.none
    end

    statuses = Status.where(account_id: following_account_ids)
                     .public_visibility
                     .without_replies
                     .without_reblogs
                     .joins(:account)
                     .merge(Account.without_suspended.without_silenced)
    
    if user_signed_in?
      statuses = statuses.not_excluded_by_account(current_account)
                         .not_domain_blocked_by_account(current_account)
    end

    status_ids = statuses.pluck(:id)
    
    if status_ids.empty?
      return PreviewCard.none
    end


    simple_scope = PreviewCard.joins(:preview_cards_statuses)
                              .where(preview_cards_statuses: { status_id: status_ids })

    scope = simple_scope.distinct.order('preview_cards.id DESC')


    scope
  end

  def next_path
    api_v1_trends_links_url pagination_params(offset: offset_param + limit_param(DEFAULT_LINKS_LIMIT)) if records_continue?
  end

  def prev_path
    api_v1_trends_links_url pagination_params(offset: offset_param - limit_param(DEFAULT_LINKS_LIMIT)) if offset_param > limit_param(DEFAULT_LINKS_LIMIT)
  end

  def records_continue?
    @links.size == limit_param(DEFAULT_LINKS_LIMIT)
  end

  def offset_param
    params[:offset].to_i
  end
end
