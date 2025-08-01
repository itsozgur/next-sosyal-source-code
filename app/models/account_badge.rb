# frozen_string_literal: true

# == Schema Information
#
# Table name: account_badges
#
#  id         :bigint(8)        not null, primary key
#  account_id :bigint(8)        not null
#  badge_id   :bigint(8)        not null
#  awarded_at :datetime         not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class AccountBadge < ApplicationRecord
  belongs_to :account, inverse_of: :account_badges
  belongs_to :badge, inverse_of: :account_badges

  validates :account_id, uniqueness: { scope: :badge_id }

  scope :by_badge_order, -> { joins(:badge).merge(Badge.ordered) }
  scope :recent, -> { order(awarded_at: :desc) }
end 
