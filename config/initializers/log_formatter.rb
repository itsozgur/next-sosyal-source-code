Rails.application.configure do
  config.log_formatter = proc do |severity, datetime, progname, msg|
    # Logu atan yerin dosyasını ve satırını bul
    location = caller_locations(2, 15).find do |loc|
      loc.path.include?(Rails.root.to_s) && !loc.path.include?('/gems/')
    end

    {
      severity:  severity,
      timestamp: datetime.utc.iso8601,
      message:   msg.to_s,
      file:      location&.path&.sub("#{Rails.root}/", ''),
      line:      location&.lineno,
      method:    location&.label
    }.to_json + "\n"
  end
end