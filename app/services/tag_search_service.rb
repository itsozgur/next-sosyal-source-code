# frozen_string_literal: true

class TagSearchService < BaseService
  def call(query, options = {})
    MastodonOTELTracer.in_span('TagSearchService#call') do |span|
      @query = query.strip.delete_prefix('#')
      @offset = options.delete(:offset).to_i
      @limit = options.delete(:limit).to_i
      @options = options

      span.add_attributes(
        'search.offset' => @offset,
        'search.limit' => @limit,
        'search.backend' => Chewy.enabled? ? 'elasticsearch' : 'database'
      )

      results = from_elasticsearch if Chewy.enabled?
      results ||= from_database

      span.set_attribute('search.results.count', results.size)

      results
    end
  end

  private

  def from_elasticsearch
    qb = HybridTagQueryBuilder.new(@query)
    definition = TagsIndex.query(function_score_wrapper(qb.build))
    definition = definition.filter(elastic_search_filter) if @options[:exclude_unreviewed]

    ensure_exact_match(definition.limit(@limit).offset(@offset).objects.compact)
  rescue Faraday::ConnectionFailed, Parslet::ParseFailed
    nil
  end

  # Since the ElasticSearch Query doesn't guarantee the exact match will be the
  # first result or that it will even be returned, patch the results accordingly
  def ensure_exact_match(results)
    return results unless @offset.nil? || @offset.zero?

    normalized_query = Tag.normalize(@query)
    exact_match = results.find { |tag| tag.name.downcase == normalized_query }
    exact_match ||= Tag.find_normalized(normalized_query)
    unless exact_match.nil?
      results.delete(exact_match)
      results = [exact_match] + results
    end

    results
  end

  def function_score_wrapper(inner_query)
    {
      function_score: {
        query: inner_query,
        functions: [
          { field_value_factor: { field: 'usage', modifier: 'log2p', missing: 0 } },
          { gauss: { last_status_at: { scale: '7d', offset: '14d', decay: 0.5 } } }
        ],
        boost_mode: 'multiply'
      }
    }
  end

  def elastic_search_filter
    {
      bool: {
        should: [
          {
            term: {
              reviewed: {
                value: true,
              },
            },
          },

          {
            match: {
              name: {
                query: @query,
              },
            },
          },
        ],
      },
    }
  end

  def from_database
    Tag.search_for(@query, @limit, @offset, @options)
  end

  class HybridTagQueryBuilder
    def initialize(query)
      ; @query = query;
    end

    def build
      if single_term?
        fuzzy_single
      elsif last_term_short?
        prefix_query
      else
        fuzzy_multi
      end
    end

    private

    def terms
      @terms ||= @query.split;
    end

    def single_term?
      terms.size == 1;
    end

    def last_term_short?
      terms.size > 1 && terms.last.length < 2;
    end

    def fuzzy_single
      {
        multi_match: {
          query: @query,
          type: 'best_fields',
          fields: %w(name name.edge_ngram),
          fuzziness: 'AUTO',
          prefix_length: 0,
          max_expansions: 50,
          operator: 'and'
        }
      }
    end

    def fuzzy_multi
      {
        multi_match: {
          query: @query,
          type: 'most_fields',
          fields: %w(name name.edge_ngram),
          fuzziness: 'AUTO',
          prefix_length: 0,
          max_expansions: 50,
          operator: 'and'
        }
      }
    end

    def prefix_query
      {
        multi_match: {
          query: @query,
          type: 'bool_prefix',
          fields: %w(name name.edge_ngram),
          operator: 'and',
          minimum_should_match: '1<75%'
        }
      }
    end
  end
end
