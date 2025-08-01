Rails.configuration.site_name = ENV.fetch("REACT_APP_SITE_NAME", "Sosyal")
Rails.configuration.signup_url = ENV.fetch("REACT_APP_SIGNUP_URL", nil)
Rails.configuration.light_logo_url = ENV.fetch("REACT_APP_LIGHT_LOGO_URL", nil)
Rails.configuration.dark_logo_url = ENV.fetch("REACT_APP_DARK_LOGO_URL", nil)
# Backward compatibility için logo_url (varsayılan olarak light logo)
Rails.configuration.logo_url = ENV.fetch("REACT_APP_LIGHT_LOGO_URL", nil)

