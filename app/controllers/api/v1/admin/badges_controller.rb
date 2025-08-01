# frozen_string_literal: true

class Api::V1::Admin::BadgesController < Api::BaseController
  include Authorization

  before_action :ensure_staff! # Tüm action'lar için aynı auth kuralları
  before_action :set_account, only: [:assign, :remove]

  after_action :verify_authorized, except: [:index, :assign, :remove]

  # Badge'leri listele
  def index
    @badges = Badge.active.ordered
    render json: @badges, each_serializer: REST::BadgeSerializer
  end

  # Kullanıcıya badge ver
  def assign
    badge = Badge.find(params[:badge_id])
    
    # Zaten var mı kontrol et
    if @account.account_badges.exists?(badge: badge)
      render json: { error: 'Badge already assigned' }, status: :unprocessable_entity
      return
    end

    @account.account_badges.create!(badge: badge, awarded_at: Time.current)
    render json: { message: 'Badge assigned successfully' }, status: :created
  end

  # Kullanıcıdan badge çıkar
  def remove
    badge = Badge.find(params[:badge_id])
    account_badge = @account.account_badges.find_by(badge: badge)
    
    if account_badge.nil?
      render json: { error: 'Badge not found on account' }, status: :not_found
      return
    end

    account_badge.destroy!
    render json: { message: 'Badge removed successfully' }, status: :ok
  end

  private

  def set_account
    @account = Account.find(params[:account_id])
  end

  def ensure_staff!
    # Token ile authentication
    if doorkeeper_token&.resource_owner_id
      user = User.find(doorkeeper_token.resource_owner_id)
      unless user.role.can?(:manage_users) || user.role.can?(:manage_taxonomies)
        render json: { error: 'Insufficient permissions' }, status: :forbidden
      end
    # Cookie ile authentication (admin web sayfasından)
    elsif user_signed_in?
      unless current_user.role.can?(:manage_users) || current_user.role.can?(:manage_taxonomies)
        render json: { error: 'Insufficient permissions' }, status: :forbidden
      end
    else
      render json: { error: 'Authentication required' }, status: :unauthorized
    end
  end
end 