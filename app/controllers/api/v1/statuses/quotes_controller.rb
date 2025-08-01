# frozen_string_literal: true

class Api::V1::Statuses::QuotesController < Api::V1::Statuses::BaseController
  before_action -> { doorkeeper_authorize! :write, :'write:quotes' }
  before_action :require_user!
  skip_before_action :set_status, only: [:destroy]

  def create
    # Alıntı sayısını artır
    @status.increment_count!(:quotes_count)
    render json: @status, serializer: REST::StatusSerializer
  end

  def destroy
    # Alıntı sayısını azalt
    @status = Status.find(params[:status_id])
    authorize @status, :show?

    count = [@status.quotes_count - 1, 0].max
    @status.decrement_count!(:quotes_count)

    relationships = StatusRelationshipsPresenter.new([@status], current_account.id, attributes_map: { @status.id => { quotes_count: count } })
    render json: @status, serializer: REST::StatusSerializer, relationships: relationships
  rescue Mastodon::NotPermittedError
    not_found
  end
end
