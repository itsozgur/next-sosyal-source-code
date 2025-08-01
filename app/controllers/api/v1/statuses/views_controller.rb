class Api::V1::Statuses::ViewsController < Api::V1::Statuses::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:statuses' }
  before_action :require_user!

  def create
      StatusView.create!(account_id: current_account.id, status_id: params[:status_id].to_i)
      status_stat = StatusStat.find_or_create_by(status_id: params[:status_id].to_i)
      status_stat.increment!(:views_count)
      StatusViewsWorker.perform_async(current_account.id, params[:status_id].to_i)
      render json: { success: true }, status: :accepted

  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Status not found' }, status: :not_found
  rescue ActiveRecord::RecordInvalid => e
    render json: { success: false, message: e.message }, status: :accepted
  end
end
