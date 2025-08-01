# frozen_string_literal: true

class SearchQueryTransformer < Parslet::Transform
  SUPPORTED_PREFIXES = %w(
    has
    is
    language
    from
    before
    after
    during
    in
  ).freeze

  class Query
    def initialize(clauses, options = {})
      raise ArgumentError if options[:current_account].nil?

      @clauses = clauses
      @options = options

      flags_from_clauses!
    end

    def request
      search = Chewy::Search::Request.new(*indexes)
      search = search.filter(default_filter)
      base_bool = {}
      m  = must_clauses.map(&:to_query)
      mn = must_not_clauses.map(&:to_query)
      base_bool[:must]     = m  unless m.empty?
      base_bool[:must_not] = mn unless mn.empty?
      # Boost contents created within 14 days
      fs_query = {
        function_score: {
          query: (base_bool.empty? ? { match_all: {} } : { bool: base_bool }),
          functions: [
            {
              gauss: {
                created_at: {
                  origin: 'now',
                  scale:  '14d',
                  offset: '7d',
                  decay:  0.5
                }
              }
            }
          ],
          score_mode: 'avg',
          boost_mode: 'multiply'
        }
      }
      search = search.query(fs_query)
      filter_clauses.each { |clause| search = search.filter(**clause.to_query) }
      search
    end

    private

    def clauses_by_operator
      @clauses_by_operator ||= @clauses.compact.chunk(&:operator).to_h
    end

    def flags_from_clauses!
      @flags = clauses_by_operator.fetch(:flag, []).to_h { |clause| [clause.prefix, clause.term] }
    end

    def must_clauses
      clauses_by_operator.fetch(:must, [])
    end

    def must_not_clauses
      clauses_by_operator.fetch(:must_not, [])
    end

    def filter_clauses
      clauses_by_operator.fetch(:filter, [])
    end

    def indexes
      case @flags['in']
      when 'library'
        [StatusesIndex]
      when 'public'
        [PublicStatusesIndex]
      else
        [PublicStatusesIndex, StatusesIndex]
      end
    end

    def default_filter
      {
        bool: {
          should: [
            {
              term: {
                _index: PublicStatusesIndex.index_name,
              },
            },
            {
              bool: {
                must: [
                  {
                    term: {
                      _index: StatusesIndex.index_name,
                    },
                  },
                  {
                    term: {
                      searchable_by: @options[:current_account].id,
                    },
                  },
                ],
              },
            },
          ],

          minimum_should_match: 1,
        },
      }
    end
  end

  class Operator
    class << self
      def symbol(str)
        case str
        when '+', nil
          :must
        when '-'
          :must_not
        else
          raise "Unknown operator: #{str}"
        end
      end
    end
  end


  class TermClause
    attr_reader :operator, :term

    FIELDS_STRICT = %w[
      text.std^4
      text.stemmed^2
    ].freeze

    FIELD_PREFIX = 'text^3'.freeze

    def initialize(operator, term)
      @operator = Operator.symbol(operator)
      @term     = term
    end

    def to_query
      return hashtag_query if hashtag?

      {
        bool: {
          should: [
            strict_fuzzy_clause,
            prefix_clause
          ],
          minimum_should_match: 1
        }
      }
    end

    private

    def strict_fuzzy_clause
      {
        multi_match: {
          query:          @term,
          type:           'best_fields',
          fields:         FIELDS_STRICT,
          operator:       'and',
          fuzziness:      'AUTO',
          prefix_length:  1,
          max_expansions: 50,
          lenient:        true
        }
      }
    end

    def prefix_clause
      {
        multi_match: {
          query:    @term,
          type:     'bool_prefix',
          fields:   [FIELD_PREFIX],
          operator: 'and',
          lenient:  true
        }
      }
    end

    def hashtag_query
      { match: { tags: { query: @term, operator: 'and' } } }
    end

    def hashtag?
      @term.start_with?('#')
    end
  end

  class PhraseClause
    attr_reader :operator, :phrase

    def initialize(operator, phrase)
      @operator = Operator.symbol(operator)
      @phrase = phrase
    end

    def to_query
      { match_phrase: { text: { query: @phrase } } }
    end
  end

  class PrefixClause
    EPOCH_RE = /\A\d+\z/

    attr_reader :operator, :prefix, :term

    def initialize(prefix, operator, term, options = {})
      @prefix = prefix
      @negated = operator == '-'
      @options = options
      @operator = :filter

      case prefix
      when 'has', 'is'
        @filter = :properties
        @type = :term
        @term = term
      when 'language'
        @filter = :language
        @type = :term
        @term = language_code_from_term(term)
      when 'from'
        @filter = :account_id
        @type = :term
        @term = account_id_from_term(term)
      when 'before'
        @filter = :created_at
        @type = :range
        @term = { lt: date_from_term(term), time_zone: @options[:current_account]&.user_time_zone.presence || 'UTC' }
      when 'after'
        @filter = :created_at
        @type = :range
        @term = { gt: date_from_term(term), time_zone: @options[:current_account]&.user_time_zone.presence || 'UTC' }
      when 'during'
        @filter = :created_at
        @type = :range
        @term = { gte: date_from_term(term), lte: date_from_term(term), time_zone: @options[:current_account]&.user_time_zone.presence || 'UTC' }
      when 'in'
        @operator = :flag
        @term = term
      else
        raise "Unknown prefix: #{prefix}"
      end
    end

    def to_query
      if @negated
        { bool: { must_not: { @type => { @filter => @term } } } }
      else
        { @type => { @filter => @term } }
      end
    end

    private

    def account_id_from_term(term)
      return @options[:current_account]&.id || -1 if term == 'me'

      username, domain = term.gsub(/\A@/, '').split('@')
      domain = nil if TagManager.instance.local_domain?(domain)
      account = Account.find_remote(username, domain)

      # If the account is not found, we want to return empty results, so return
      # an ID that does not exist
      account&.id || -1
    end

    def language_code_from_term(term)
      language_code = term

      return language_code if LanguagesHelper::SUPPORTED_LOCALES.key?(language_code.to_sym)

      language_code = term.downcase

      return language_code if LanguagesHelper::SUPPORTED_LOCALES.key?(language_code.to_sym)

      language_code = term.split(/[_-]/).first.downcase

      return language_code if LanguagesHelper::SUPPORTED_LOCALES.key?(language_code.to_sym)

      term
    end

    def date_from_term(term)
      DateTime.iso8601(term) unless term.match?(EPOCH_RE)
      term
    end
  end

  rule(clause: subtree(:clause)) do
    prefix = clause[:prefix][:term].to_s.downcase if clause[:prefix]
    operator = clause[:operator]&.to_s
    term = clause[:phrase] ? clause[:phrase].map { |term| term[:term].to_s }.join(' ') : clause[:term].to_s

    if clause[:prefix] && SUPPORTED_PREFIXES.include?(prefix)
      PrefixClause.new(prefix, operator, term, current_account: current_account)
    elsif clause[:prefix]
      TermClause.new(operator, "#{prefix} #{term}")
    elsif clause[:term]
      TermClause.new(operator, term)
    elsif clause[:phrase]
      PhraseClause.new(operator, term)
    else
      raise "Unexpected clause type: #{clause}"
    end
  end

  rule(junk: subtree(:junk)) do
    nil
  end

  rule(query: sequence(:clauses)) do
    Query.new(clauses, current_account: current_account)
  end
end
