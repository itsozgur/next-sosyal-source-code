# frozen_string_literal: true

# == Schema Information
#
# Table name: status_stats
#
#  id               :bigint(8)        not null, primary key
#  status_id        :bigint(8)        not null
#  replies_count    :bigint(8)        default(0), not null
#  reblogs_count    :bigint(8)        default(0), not null
#  favourites_count :bigint(8)        default(0), not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  views_count      :integer
#  quotes_count     :bigint(8)        default(0), not null
#

class StatusStat < ApplicationRecord
  belongs_to :status, inverse_of: :status_stat

  def replies_count
    [attributes['replies_count'], 0].max
  end

  def reblogs_count
    [attributes['reblogs_count'], 0].max
  end

  def favourites_count
    [attributes['favourites_count'], 0].max
  end

  def views_count
    [attributes['views_count'].to_i, 0].max
  end

  def quotes_count
    [attributes['quotes_count'], 0].max
  end

  def interactions_count
    replies_count + reblogs_count + favourites_count + quotes_count
  end
end
