# frozen_string_literal: true

class PublicStatusesIndex < Chewy::Index
  include DatetimeClampingConcern

  settings index: index_preset(refresh_interval: '30s', number_of_shards: 5, max_ngram_diff: 6), analysis: {
    filter: {
      english_stop: {
        type: 'stop',
        stopwords: '_english_',
      },

      english_stemmer: {
        type: 'stemmer',
        language: 'english',
      },

      turkish_stemmer: {
        type: 'stemmer',
        language: 'turkish'
      },

      english_possessive_stemmer: {
        type: 'stemmer',
        language: 'possessive_english',
      },

      edge_ngram_filter: {
        type: 'edge_ngram',
        min_gram: 4,
        max_gram: 10,
      },

      ngram_filter: {
        type: 'ngram',
        min_gram: 4,
        max_gram: 10,
      },
    },

    analyzer: {
      search_std: {
        tokenizer: 'standard',
        filter: %w(lowercase icu_normalizer icu_folding)
      },

      verbatim: {
        tokenizer: 'uax_url_email',
        filter: %w(lowercase),
      },

      content: {
        tokenizer: 'standard',
        filter: %w(
          lowercase
          elision
          english_possessive_stemmer
          english_stop
          english_stemmer
          turkish_stemmer
          edge_ngram_filter
          ngram_filter
          icu_folding
          icu_normalizer
        ),
      },

      hashtag: {
        tokenizer: 'keyword',
        filter: %w(
          word_delimiter_graph
          lowercase
          icu_folding
          icu_normalizer
        ),
      },

      edge_ngram_analyzer: {
        tokenizer: 'standard',
        filter: %w(lowercase edge_ngram_filter icu_folding),
      },
    },
  }

  index_scope ::Status.unscoped
                      .kept
                      .indexable
                      .includes(:media_attachments, :preloadable_poll, :tags, preview_cards_status: :preview_card)

  root date_detection: false do
    field(:id, type: 'long')
    field(:account_id, type: 'long')
    field(:text, type: 'text', analyzer: 'edge_ngram_analyzer', search_analyzer: 'search_std', value: ->(status) { status.searchable_text }) do
      field :stemmed, type: 'text', analyzer: 'content'
      field :std, type: 'text', analyzer: 'search_std', search_analyzer: 'search_std'
      field :verbatim, type: 'text', analyzer: 'verbatim'
    end
    field(:tags, type: 'text', analyzer: 'hashtag', value: ->(status) { status.tags.map(&:display_name) })
    field(:language, type: 'keyword')
    field(:properties, type: 'keyword', value: ->(status) { status.searchable_properties })
    field(:created_at, type: 'date', value: ->(status) { clamp_date(status.created_at) })
  end
end
