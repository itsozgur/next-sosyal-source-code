module Auth
  class ProxyCallbackController < ApplicationController
    def callback
      proxy_token = params.delete(:proxy_token)
      cookies[:proxy_token] = {
        value: proxy_token,
        httponly: false,
        secure: false,
        same_site: :lax
      } if proxy_token.present?

      redirect_to uri_with_remaining_params(
                    "#{request.base_url}/auth/auth/openid_connect/callback",
                    params.to_unsafe_h
                  )
    end

    private

    def uri_with_remaining_params(base_url, params)
      uri = URI.parse(base_url)
      uri.query = params.to_query
      uri.to_s
    end
  end
end
