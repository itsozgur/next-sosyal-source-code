class Api::V1::Accounts::ProxyInfoController < Api::BaseController
  # GET /api/v1/accounts/proxy_info/
  before_action :require_user!

  def show
    unless current_user && current_user.account && current_user.account.username.present?
      render json: { error: 'Oturum açmış kullanıcı bulunamadı' }, status: :unauthorized and return
    end

    identity = Identity.where(user_id: current_user.id, provider: "openid_connect").last

    unless identity
      render json: { error: 'Kullanıcı için OIDC identity bulunamadı' }, status: :not_found and return
    end

    result = ProxyService.fetch_for(identity.uid)
    if result.present?
      render json: result, status: :ok
    else
      render json: { error: 'Kullanıcıya ait proxy bilgisi bulunamadı' }, status: :not_found
    end
  end
end
