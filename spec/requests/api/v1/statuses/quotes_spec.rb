# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Statuses::QuotesController', type: :request do
  let(:user)           { Fabricate(:user) }
  let(:token)          { Fabricate(:accessible_access_token, resource_owner_id: user.id, scopes: scopes) }
  let(:scopes)         { 'write:quotes' }
  let(:headers)        { { 'Authorization' => "Bearer #{token.token}" } }
  let(:status)         { Fabricate(:status, account: user.account) }

  describe 'POST /api/v1/statuses/:status_id/quote' do
    it 'increments quotes count' do
      expect {
        post "/api/v1/statuses/#{status.id}/quote", headers: headers
      }.to change { status.reload.quotes_count }.by(1)

      expect(response).to have_http_status(200)
    end
  end

  describe 'POST /api/v1/statuses/:status_id/unquote' do
    before do
      status.increment_count!(:quotes_count)
    end

    it 'decrements quotes count' do
      expect {
        post "/api/v1/statuses/#{status.id}/unquote", headers: headers
      }.to change { status.reload.quotes_count }.by(-1)

      expect(response).to have_http_status(200)
    end

    it 'does not go below 0' do
      status.update!(quotes_count: 0)

      post "/api/v1/statuses/#{status.id}/unquote", headers: headers

      expect(status.reload.quotes_count).to eq(0)
      expect(response).to have_http_status(200)
    end
  end
end
