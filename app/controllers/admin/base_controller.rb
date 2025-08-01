# frozen_string_literal: true

module Admin
  class BaseController < ApplicationController
    include Authorization
    include AccountableConcern

    layout 'admin'

    before_action :authenticate_user!
    before_action :require_staff!

    before_action :set_cache_headers

    after_action :verify_authorized

    private

    def require_staff!
      redirect_to root_path unless current_user&.role&.can?(:view_dashboard)
    end


    def set_cache_headers
      response.cache_control.replace(private: true, no_store: true)
    end

    def set_user
      @user = Account.find(params[:account_id]).user || raise(ActiveRecord::RecordNotFound)
    end
  end
end
