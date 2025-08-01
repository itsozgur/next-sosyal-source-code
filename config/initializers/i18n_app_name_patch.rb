module AppNameFallback
  def translate(locale, key, options = {})
    options[:APP_NAME] ||= Rails.configuration.site_name
    super
  end
end
I18n.backend.singleton_class.prepend(AppNameFallback)
