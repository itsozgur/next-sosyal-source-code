# frozen_string_literal: true

module StatusesHelper
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::SanitizeHelper

  EMBEDDED_CONTROLLER = 'statuses'
  EMBEDDED_ACTION = 'embed'

  VISIBLITY_ICONS = {
    public: 'globe',
    unlisted: 'lock_open',
    private: 'lock',
    direct: 'alternate_email',
  }.freeze

  def nothing_here(extra_classes = '')
    content_tag(:div, class: "nothing-here #{extra_classes}") do
      t('accounts.nothing_here')
    end
  end

  def media_summary(status)
    attachments = { image: 0, video: 0, audio: 0 }

    status.ordered_media_attachments.each do |media|
      if media.video?
        attachments[:video] += 1
      elsif media.audio?
        attachments[:audio] += 1
      else
        attachments[:image] += 1
      end
    end

    text = attachments.to_a.reject { |_, value| value.zero? }.map { |key, value| I18n.t("statuses.attached.#{key}", count: value) }.join(' · ')

    return if text.blank?

    I18n.t('statuses.attached.description', attached: text)
  end

  def status_text_summary(status)
    return if status.spoiler_text.blank?

    I18n.t('statuses.content_warning', warning: status.spoiler_text)
  end

  def poll_summary(status)
    return unless status.preloadable_poll

    status.preloadable_poll.options.map { |o| "[ ] #{o}" }.join("\n")
  end

  def status_description(status)
    components = []

    # Priority 1: Actual text content (most important for mobile)
    if status.text.present? && status.text.strip.length > 0
      clean_text = strip_tags(status.text).strip.gsub(/\s+/, ' ')
      # Shorter for mobile compatibility
      truncated_text = truncate(clean_text, length: 120, omission: '…')
      components << truncated_text if truncated_text.present?
    end

    # Priority 2: Content warning (if present)
    if status.spoiler_text.present?
      components << "Content Warning: #{status.spoiler_text}"
    end

    # Priority 3: Poll information (simplified, no emojis)
    if status.preloadable_poll
      poll_options = status.preloadable_poll.options.first(2).map { |o| o }.join(", ")
      if status.preloadable_poll.options.length > 2
        poll_options += " (+#{status.preloadable_poll.options.length - 2} more)"
      end
      components << "Poll: #{poll_options}"
    end

    # Priority 4: Media description (only if no text content)
    if components.empty? && status.with_media?
      media_count = status.ordered_media_attachments.count
      media_types = status.ordered_media_attachments.map(&:type).uniq

      if media_types.include?('image')
        description_text = "#{status.account.display_name} shared #{media_count == 1 ? 'an image' : "#{media_count} images"}"
      elsif media_types.include?('video')
        description_text = "#{status.account.display_name} shared #{media_count == 1 ? 'a video' : "#{media_count} videos"}"
      elsif media_types.include?('audio')
        description_text = "#{status.account.display_name} shared an audio file"
      else
        description_text = "#{status.account.display_name} shared media content"
      end

      components << description_text
    end

    # Priority 5: Fallback for empty posts
    if components.empty?
      components << "#{status.account.display_name} posted on #{site_title}"
    end

    result = components.compact_blank.join(" | ")

    # Mobile-optimized length
    truncate(result, length: 120, omission: '…')
  end

  def stream_link_target
    embedded_view? ? '_blank' : nil
  end

  def visibility_icon(status)
    VISIBLITY_ICONS[status.visibility.to_sym]
  end

  def embedded_view?
    params[:controller] == EMBEDDED_CONTROLLER && params[:action] == EMBEDDED_ACTION
  end

  def prefers_autoplay?
    ActiveModel::Type::Boolean.new.cast(params[:autoplay]) || current_user&.setting_auto_play_gif
  end
end
