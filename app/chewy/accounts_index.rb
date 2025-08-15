# frozen_string_literal: true

class AccountsIndex < Chewy::Index
  include DatetimeClampingConcern

  settings index: index_preset(refresh_interval: '30s', max_ngram_diff: 14), analysis: {
    normalizer: {
      lowercase_icu: {
        type: 'custom',
        filter: %w(lowercase icu_normalizer icu_folding)
      }
    },

    filter: {
      english_stop: {
        type: 'stop',
        stopwords: '_english_',
      },

      english_stemmer: {
        type: 'stemmer',
        language: 'english',
      },

      english_possessive_stemmer: {
        type: 'stemmer',
        language: 'possessive_english',
      },

      edge_ngram_filter: {
        type: 'edge_ngram',
        min_gram: 1,
        max_gram: 15,
      },

      ngram_filter: {
        type: 'ngram',
        min_gram: 4,
        max_gram: 10,
      },
    },

    analyzer: {
      natural: {
        tokenizer: 'standard',
        filter: %w(
          lowercase
          icu_normalizer
          elision
          english_possessive_stemmer
          english_stop
          english_stemmer
          icu_folding
        ),
      },

      verbatim: {
        tokenizer: 'standard',
        filter: %w(lowercase icu_normalizer icu_folding),
      },

      edge_ngram: {
        tokenizer: 'edge_ngram',
        filter: %w(lowercase icu_normalizer icu_folding),
      },

      autocomplete_analyzer: {
        tokenizer: 'icu_tokenizer',
        filter: %w(
          lowercase
          icu_normalizer
          icu_folding
          edge_ngram_filter
        ),
      },

      autocomplete_search_analyzer: {
        tokenizer: 'icu_tokenizer',
        filter: %w(
          lowercase
          icu_normalizer
          icu_folding
        ),
      },
    },
  }

  index_scope ::Account.searchable.includes(:account_stat)

  root date_detection: false do
    field(:id, type: 'long')
    field(:following_count, type: 'long')
    field(:followers_count, type: 'long')
    field(:properties, type: 'keyword', value: ->(account) { account.searchable_properties })
    field(:last_status_at, type: 'date', value: ->(account) { clamp_date(account.last_status_at || account.created_at) })
    field(:display_name, type: 'text', analyzer: 'verbatim') {
      field :autocomplete, type: 'text', analyzer: 'autocomplete_analyzer', search_analyzer: 'autocomplete_search_analyzer'
      field :exact, type: 'keyword', normalizer: 'lowercase_icu'
    }
    field(:username, type: 'text', analyzer: 'verbatim', value: ->(account) { [account.username, account.domain].compact.join('@') }) {
      field :autocomplete, type: 'text', analyzer: 'autocomplete_analyzer', search_analyzer: 'autocomplete_search_analyzer'
      field :exact, type: 'keyword', normalizer: 'lowercase_icu'
    }
    field :username_without_domain, type: 'keyword',
          normalizer: 'lowercase_icu', value: ->(a) { a.username }
    field(:text, type: 'text', analyzer: 'verbatim', value: ->(account) { account.searchable_text }) {
      field :stemmed, type: 'text', analyzer: 'natural'
    }
  end
end
