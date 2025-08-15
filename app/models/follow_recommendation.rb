# frozen_string_literal: true

# == Schema Information
#
# Table name: global_follow_recommendations
#
#  account_id :bigint(8)        primary key
#  rank       :decimal(, )
#  reason     :text             is an Array
#

class FollowRecommendation < ApplicationRecord
  include DatabaseViewRecord

  self.primary_key = :account_id
  self.table_name = :global_follow_recommendations

  belongs_to :account_summary, foreign_key: :account_id, inverse_of: false
  belongs_to :account

  scope :unsupressed, -> { where.not(FollowRecommendationSuppression.where(FollowRecommendationSuppression.arel_table[:account_id].eq(arel_table[:account_id])).select(1).arel.exists) }
  scope :localized, ->(locale) { unsupressed.joins(:account_summary).merge(AccountSummary.localized(locale)) }

  
  def boosted_rank
    base_rank = rank || 0
    badge_boost = calculate_badge_boost
    base_rank + badge_boost
  end

  
  def boosted_reasons
    base_reasons = reason || []
    if has_any_badge?
      base_reasons + ['badge_boost']
    else
      base_reasons
    end
  end

  private

  def calculate_badge_boost
    return @cached_badge_boost unless @cached_badge_boost.nil?
    
    badges = AccountBadge.joins(:badge)
      .where(account_id: account_id)
      .where(badges: { is_active: true })
      .includes(:badge)
    
    max_boost = 0
    badges.each do |account_badge|
      boost = get_boost_for_rank(account_badge.badge.rank)
      max_boost = [max_boost, boost].max
    end
    
    @cached_badge_boost = max_boost
  end

  def get_boost_for_rank(rank)
    ENV.fetch("BADGE_RANK_#{rank}_BOOST", '0').to_f
  end
  
  def has_any_badge?
    calculate_badge_boost > 0
  end
  
  # Legacy method for backward compatibility
  def cached_verified_badge?
    has_any_badge?
  end
  
  def account_has_verified_badge?
    has_any_badge?
  end
end