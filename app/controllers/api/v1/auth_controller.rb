# frozen_string_literal: true

require 'ostruct'
require 'net/http'
require 'uri'

class Api::V1::AuthController < Api::BaseController
  skip_before_action :require_authenticated_user!, only: [:login]

  def login


    app = doorkeeper_token&.application || find_superapp

    # Auth sunucusuna username/password gönder
    user_data = verify_credentials_with_auth_server(params[:username], params[:password])

    if user_data
      begin
        # Kullanıcı varsa bul ve token döndür
        user = find_or_create_user_from_auth_server(user_data)

        if user
          token = create_access_token_for_user(app, user)

          render json: {
            access_token: token.token,
            token_type: 'Bearer',
            scope: token.scopes.to_s,
            created_at: token.created_at.to_i
          }
        else
          render json: { error: 'User not found in system' }, status: 404
        end
      rescue StandardError => e
        if e.message.include?('Bu kullanıcı zaten bu auth provider ile kayıtlı')
          render json: { error: e.message }, status: 409 # Conflict
        elsif e.message.include?('Bu kullanıcı adı zaten alınmış')
          render json: { error: e.message }, status: 409 # Conflict
        elsif e.message.include?('Geçerli bir kullanıcı adı oluşturulamadı')
          render json: { error: e.message }, status: 400 # Bad Request
        else
          Rails.logger.error("User creation error: #{e.message}")
          render json: { error: 'User creation failed' }, status: 500
        end
      end
    else
      render json: { error: 'Invalid credentials' }, status: 401







    end
  end

  private

  def find_superapp
    Doorkeeper::Application.find_by(name: 'Web')
  end

  def verify_credentials_with_auth_server(username, password)
    url = URI.join(ENV["AUTH_URL"], "/api/accounts/oidc/internal-login/")

    Rails.logger.info("Auth request to: #{url}")



    request = Net::HTTP::Post.new(url)
    request['Content-Type'] = 'application/json'
    request['X-Next-Internal-Token'] = ENV['INTERNAL_API_SECRET_TOKEN']
    request.body = JSON.generate({

      username: username,
      password: password


    })

    response = Net::HTTP.start(url.hostname, url.port, use_ssl: url.scheme == 'https') do |http|
      http.request(request)
    end




    if response.code.to_i == 200
      JSON.parse(response.body)
    else
      nil


    end
  rescue => e
    Rails.logger.error("Auth server verification error: #{e.message}")
    nil
  end

  def find_or_create_user_from_auth_server(user_data)
    auth_hash = create_auth_hash_from_server_data(user_data)
    identity = Identity.find_for_omniauth(auth_hash)
    user = identity.user
    unless user
      user = reattach_or_create_user_from_auth_server(auth_hash)

      # Identity'yi kullanıcıya bağla
      if user && identity.user.nil?
        identity.user = user
        identity.save!
      end
    end

    user
  end

  def create_auth_hash_from_server_data(user_data)
    # Auth server'dan gelen data'yı Omniauth::AuthHash formatına çevir
    OpenStruct.new(
      uid: user_data['username'],
      provider: 'openid_connect', # Kendi provider adınız
      info: OpenStruct.new(
        email: user_data['email'],
        verified_email: user_data['email'],
        email_verified: true,
        name: user_data['name'] || user_data['display_name'],
        full_name: user_data['full_name'] || user_data['name'],
        first_name: user_data['first_name'],
        last_name: user_data['last_name'],
        image: user_data['avatar_url'] || user_data['profile_image']
      )
    )
  end

    def reattach_or_create_user_from_auth_server(auth_hash)
    email = auth_hash.info.email

    # Önce email'e göre mevcut kullanıcıyı bul
    user = User.find_by(email: email) if email.present?

    # Eğer kullanıcı varsa ve bu provider ile bağlantısı yoksa, bağla
    if user && !Identity.exists?(provider: auth_hash.provider, user_id: user.id)
      return user
    end

    # Eğer kullanıcı varsa ama bu provider ile bağlantısı da varsa hata ver
    if user && Identity.exists?(provider: auth_hash.provider, user_id: user.id)
      raise StandardError, "Bu kullanıcı zaten bu auth provider ile kayıtlı"
    end

    # Eğer kullanıcı yoksa yeni oluştur
    unless user
      user = create_user_from_auth_server(auth_hash)
    end

    user
  end

  def create_user_from_auth_server(auth_hash)
    email = auth_hash.info.email

    # Yeni kullanıcı parametreleri
    user_params = {
      email: email,
      agreement: true,
      external: true,
      approved: true,
      account_attributes: {
        username: ensure_unique_username_from_auth(auth_hash.uid),
        display_name: auth_hash.info.full_name || auth_hash.info.name
      }
    }

    user = User.new(user_params)

    # Avatar'ı ayarla (eğer varsa)
    begin
      if auth_hash.info.image.present? && /\A#{URI::DEFAULT_PARSER.make_regexp(%w(http https))}\z/.match?(auth_hash.info.image)
        user.account.avatar_remote_url = auth_hash.info.image
      end
    rescue => e
      Rails.logger.error("Avatar yükleme hatası: #{e.message}")
      user.account.avatar_remote_url = nil
    end

    # Email'i onaylanmış olarak işaretle
    user.mark_email_as_confirmed!
    user.save!

    user
  end

    def ensure_unique_username_from_auth(starting_username)
    # Username'i temizle
    username = starting_username.to_s.gsub(/[^a-z0-9_]+/i, '').truncate(30, omission: '')

    # Eğer username boş kaldıysa hata ver
    if username.blank?
      raise StandardError, "Geçerli bir kullanıcı adı oluşturulamadı: #{starting_username}"
    end

    # Eğer username zaten varsa hata ver
    if Account.exists?(username: username, domain: nil)
      raise StandardError, "Bu kullanıcı adı zaten alınmış: #{username}"
    end

    username
  end

    def create_access_token_for_user(app, user)
    # SSO gibi tam yetkili scope'lar kullan
    full_scopes = 'read write follow push profile read:accounts'

    Doorkeeper::AccessToken.create!(
      application_id: app.id,
      resource_owner_id: user.id,
      scopes: full_scopes,  # App scope'ları yerine tam yetki
      expires_in: Doorkeeper.configuration.access_token_expires_in,
      revoked_at: nil,
      use_refresh_token: Doorkeeper.configuration.refresh_token_enabled?
    )
  end
end