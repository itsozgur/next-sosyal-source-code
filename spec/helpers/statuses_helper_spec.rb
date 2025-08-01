# frozen_string_literal: true

require 'rails_helper'

RSpec.describe StatusesHelper do
  describe 'status_text_summary' do
    context 'with blank text' do
      let(:status) { Status.new(spoiler_text: '') }

      it 'returns immediately with nil' do
        result = helper.status_text_summary(status)
        expect(result).to be_nil
      end
    end

    context 'with present text' do
      let(:status) { Status.new(spoiler_text: 'SPOILERS!!!') }

      it 'returns the content warning' do
        result = helper.status_text_summary(status)
        expect(result).to eq(I18n.t('statuses.content_warning', warning: 'SPOILERS!!!'))
      end
    end
  end

  describe '#media_summary' do
    it 'describes the media on a status' do
      status = Fabricate :status
      Fabricate :media_attachment, status: status, type: :video
      Fabricate :media_attachment, status: status, type: :audio
      Fabricate :media_attachment, status: status, type: :image

      result = helper.media_summary(status)

      expect(result).to eq('Attached: 1 image · 1 video · 1 audio')
    end
  end

  describe '#status_description' do
    context 'with status containing text and media' do
      let(:status) { Fabricate(:status, text: 'This is a test post with some content.') }

      before do
        Fabricate(:media_attachment, status: status, type: :image)
      end

      it 'prioritizes text content over media summary' do
        result = helper.status_description(status)

        expect(result).to include('This is a test post with some content.')
        expect(result).to include('Attached:')
        expect(result.index('This is a test post')).to be < result.index('Attached:')
      end
    end

    context 'with status containing spoiler text' do
      let(:status) { Fabricate(:status, text: 'Hidden content', spoiler_text: 'Spoiler warning') }

      it 'includes content warning' do
        result = helper.status_description(status)

        expect(result).to include(I18n.t('statuses.content_warning', warning: 'Spoiler warning'))
        expect(result).to include('Hidden content')
      end
    end

    context 'with status containing long text' do
      let(:long_text) { 'A' * 300 }
      let(:status) { Fabricate(:status, text: long_text) }

      it 'truncates text to appropriate length' do
        result = helper.status_description(status)

        expect(result.length).to be <= 200 + 3 # +3 for ellipsis
        expect(result).to end_with('…')
      end
    end

    context 'with status containing HTML tags' do
      let(:status) { Fabricate(:status, text: '<p>Hello <strong>world</strong>!</p>') }

      it 'strips HTML tags' do
        result = helper.status_description(status)

        expect(result).to eq('Hello world!')
        expect(result).not_to include('<p>')
        expect(result).not_to include('<strong>')
      end
    end

    context 'with poll' do
      let(:status) { Fabricate(:status, text: 'What do you prefer?') }
      let(:poll) { Fabricate(:poll, status: status, options: %w(Option1 Option2)) }

      before do
        status.poll = poll
      end

      it 'includes poll summary' do
        result = helper.status_description(status)

        expect(result).to include('What do you prefer?')
        expect(result).to include('[ ] Option1')
        expect(result).to include('[ ] Option2')
      end
    end
  end

  describe 'visibility_icon' do
    context 'with a status that is public' do
      let(:status) { Status.new(visibility: 'public') }

      it 'returns the correct fa icon' do
        result = helper.visibility_icon(status)

        expect(result).to match('globe')
      end
    end

    context 'with a status that is unlisted' do
      let(:status) { Status.new(visibility: 'unlisted') }

      it 'returns the correct fa icon' do
        result = helper.visibility_icon(status)

        expect(result).to match('lock_open')
      end
    end

    context 'with a status that is private' do
      let(:status) { Status.new(visibility: 'private') }

      it 'returns the correct fa icon' do
        result = helper.visibility_icon(status)

        expect(result).to match('lock')
      end
    end

    context 'with a status that is direct' do
      let(:status) { Status.new(visibility: 'direct') }

      it 'returns the correct fa icon' do
        result = helper.visibility_icon(status)

        expect(result).to match('alternate_email')
      end
    end
  end

  describe '#stream_link_target' do
    it 'returns nil if it is not an embedded view' do
      set_not_embedded_view

      expect(helper.stream_link_target).to be_nil
    end

    it 'returns _blank if it is an embedded view' do
      set_embedded_view

      expect(helper.stream_link_target).to eq '_blank'
    end
  end

  def set_not_embedded_view
    params[:controller] = "not_#{StatusesHelper::EMBEDDED_CONTROLLER}"
    params[:action] = "not_#{StatusesHelper::EMBEDDED_ACTION}"
  end

  def set_embedded_view
    params[:controller] = StatusesHelper::EMBEDDED_CONTROLLER
    params[:action] = StatusesHelper::EMBEDDED_ACTION
  end
end
