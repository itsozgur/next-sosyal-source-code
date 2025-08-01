# frozen_string_literal: true

module BrandingHelper
  def logo_as_symbol(version = :icon)
    case version
    when :icon
      _logo_as_symbol_icon
    when :wordmark
      _logo_as_symbol_wordmark
    end
  end

  def _logo_as_symbol_wordmark
    content_tag(:svg, tag.use(href: '#logo-symbol-wordmark'), viewBox: '0 0 261 66', class: 'logo logo--wordmark')
  end

  def _logo_as_symbol_icon
    logo_url = if dark_theme?
              # Önce env'den al, yoksa statik logoyu kullan
              Rails.configuration.dark_logo_url || asset_pack_path('media/images/logo-dark.svg')
            else
              # Önce env'den al, yoksa statik logoyu kullan
              Rails.configuration.light_logo_url || asset_pack_path('media/images/logo-light.svg')
            end
    image_tag(logo_url, alt: Rails.configuration.site_name || 'Next Sosyal', class: 'logo logo--icon')
  end

  def render_logo
    logo_url = if dark_theme?
              # Önce env'den al, yoksa statik logoyu kullan
              Rails.configuration.dark_logo_url || asset_pack_path('media/images/logo-dark.svg')
            else
              # Önce env'den al, yoksa statik logoyu kullan
              Rails.configuration.light_logo_url || asset_pack_path('media/images/logo-light.svg')
            end

    image_tag(logo_url, alt: Rails.configuration.site_name || 'Next Sosyal', class: 'logo logo--icon')
  end

  private

  def dark_theme?
    theme = if respond_to?(:current_theme)
              current_theme
            elsif defined?(current_user) && current_user&.setting_theme.present?
              current_user.setting_theme
            else
              params[:theme] || session[:theme] || cookies[:theme] || Setting.theme || 'default'
            end
    
    # System theme için JavaScript ile kontrol edilecek
    if theme == 'system'
      # Server-side rendering için cookie kontrol et
      if cookies[:prefers_dark] == 'true'
        true   # Sistem dark mode -> dark logo
      elsif cookies[:prefers_dark] == 'false'  
        false  # Sistem light mode -> light logo
      else
        # Cookie henüz set edilmemişse sistem temasını kontrol et
        request.user_agent.to_s.downcase.include?('dark')
      end
    else
      # Light tema sadece mastodon-light, diğerleri dark tema kullanır
      theme != 'mastodon-light'
    end
  end
end
