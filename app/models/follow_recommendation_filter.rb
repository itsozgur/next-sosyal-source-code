# frozen_string_literal: true

class FollowRecommendationFilter
  include Redisable

  KEYS = %i(
    language
    status
  ).freeze

  attr_reader :params, :language

  def initialize(params)
    @language = usable_language(params.delete('language') || I18n.locale)
    @params   = params
  end

  def results
    if params['status'] == 'suppressed'
      Account.includes(:account_stat).joins(:follow_recommendation_suppression).order(FollowRecommendationSuppression.arel_table[:id].desc)
    else
     
      Account.includes(:account_stat, :follow_recommendation, account_badges: :badge)
             .joins(:follow_recommendation)
             .merge(FollowRecommendation.localized(@language))
             .joins(build_badge_boost_sql)
             .order(Arel.sql("(global_follow_recommendations.rank + COALESCE(badge_boosts.badge_boost, 0)) DESC"))
    end
  end

  private

  def build_badge_boost_sql
    # Find all BADGE_RANK_*_BOOST ENV variables dynamically
    badge_boosts = ENV.keys
                     .select { |key| key.start_with?('BADGE_RANK_') && key.end_with?('_BOOST') }
                     .map { |key| 
                       rank = key.match(/BADGE_RANK_(\d+)_BOOST/)[1].to_i
                       boost = ENV[key].to_f
                       [rank, boost]
                     }
                     .reject { |rank, boost| boost.zero? }
                     .sort_by(&:first) # Sort by rank

    # If no badge boosts found, use fallback
    if badge_boosts.empty?
      badge_boosts = [[1, 0.4], [2, 0.2]]
    end

    # Create optimized query with direct JOIN and conditional logic
    boost_values = badge_boosts.to_h
    rank_list = boost_values.keys.join(',')
    
    # Ultra-optimized: Use ROW_NUMBER to get only the highest boost per user
    <<-SQL.squish
      LEFT JOIN (
        SELECT DISTINCT ON (ab.account_id)
          ab.account_id,
          CASE b.rank
            #{badge_boosts.map { |rank, boost| "WHEN #{rank} THEN #{boost}" }.join(' ')}
            ELSE 0
          END as badge_boost
        FROM account_badges ab
        INNER JOIN badges b ON b.id = ab.badge_id 
        WHERE b.is_active = true 
          AND b.rank IN (#{rank_list})
        ORDER BY ab.account_id, b.rank ASC
      ) badge_boosts ON badge_boosts.account_id = accounts.id
    SQL
  end

  def usable_language(locale)
    return locale if Trends.available_locales.include?(locale)

    locale = locale.to_s.split(/[_-]/).first
    return locale if Trends.available_locales.include?(locale)

    nil
  end
end