# frozen_string_literal: true

class Settings::Preferences::FeedbackController < Settings::BaseController
  layout 'admin'

  before_action :authenticate_user!

  def show; end

  def update
    # Burada feedback verilerini işleyebilirsiniz
    handle_feedback if feedback_provided?

    if current_user.update(user_params)
      I18n.locale = current_user.locale

      redirect_to after_update_redirect_path, notice: I18n.t('generic.changes_saved_msg')
    else
      render :show
    end
  end

  private

  def feedback_provided?
    params[:feedback_comment].present? || params[:user][:feedback_rating].present? || params[:feedback_file].present?
  end

  def handle_feedback
    feedback_data = {
      comment: params[:feedback_comment],
      rating: params[:user][:feedback_rating],
      contact_permission: params[:feedback_contact_permission].present?,
      username: current_user.account.username,
      email: current_user.email,
      submitted_at: Time.current
    }

    # Process file attachment if present
    if params[:feedback_file].present?
      feedback_data[:file_name] = params[:feedback_file].original_filename
      feedback_data[:file_size] = params[:feedback_file].size
      feedback_data[:file_type] = params[:feedback_file].content_type
      
      # Store the file or send it as attachment
      # Example: params[:feedback_file].read will get the file content
    end

    # Log feedback data (for development)
    Rails.logger.info("Feedback received: #{feedback_data.to_json}")

    # TODO: Implement actual feedback handling:
    # - Store in database
    # - Send email to administrators
    # - Create support ticket
    # - etc.
  end

  def after_update_redirect_path
    settings_feedback_path
  end

  def user_params
    params.require(:user).permit(
      :locale,
      :chosen_languages
    )
  end
end 