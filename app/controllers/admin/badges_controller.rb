class Admin::BadgesController < Admin::BaseController
    before_action :set_badge, only: [:show, :edit, :update, :destroy]
  
    def index
      authorize :badge, :index?
    end
  
    def show
      authorize @badge, :show?
    end
  
    def new
      @badge = Badge.new
      authorize @badge, :create?
    end
  
    def create
      @badge = Badge.new(badge_params)
      authorize @badge, :create?
  
      if @badge.save
        redirect_to admin_badges_path, notice: I18n.t('admin.badges.created_msg')
      else
        render :new, status: :unprocessable_entity
      end
    end
  
    def edit
      authorize @badge, :update?
    end
  
    def update
      authorize @badge, :update?
  
      if @badge.update(badge_params)
        redirect_to admin_badges_path, notice: I18n.t('admin.badges.updated_msg')
      else
        render :edit, status: :unprocessable_entity
      end
    end
  
    def destroy
      authorize @badge, :destroy?
      @badge.destroy!
      redirect_to admin_badges_path, notice: I18n.t('admin.badges.destroyed_msg')
    end
  
    def assign_to_user
      authorize :badge, :create?
      @account = Account.find(params[:account_id])
      @badge = Badge.find(params[:id])
  
      if @account.account_badges.exists?(badge: @badge)
        redirect_to admin_badges_path, alert: I18n.t('admin.badges.already_assigned')
        return
      end
  
      @account.account_badges.create!(badge: @badge, awarded_at: Time.current)
      redirect_to admin_badges_path, notice: I18n.t('admin.badges.assigned_msg')
    end
  
    def remove_from_user
      authorize :badge, :destroy?
      @account = Account.find(params[:account_id])
      @badge = Badge.find(params[:id])
  
      account_badge = @account.account_badges.find_by(badge: @badge)
  
      if account_badge
        account_badge.destroy!
        redirect_to admin_badges_path, notice: I18n.t('admin.badges.removed_msg')
      else
        redirect_to admin_badges_path, alert: I18n.t('admin.badges.not_found')
      end
    end
  
  
  
    private
  
    def set_badge
      @badge = Badge.find(params[:id])
    end
  
    def badge_params
      params.require(:badge).permit(:icon, :name, :rank, :order, :is_active)
    end
  end 