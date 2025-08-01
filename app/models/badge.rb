# frozen_string_literal: true

# == Schema Information
#
# Table name: badges
#
#  id         :bigint(8)        not null, primary key
#  icon       :string           not null
#  name       :string           default(""), not null
#  rank       :integer          not null
#  order      :integer          default(0), not null
#  is_active  :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Badge < ApplicationRecord
  has_many :account_badges, inverse_of: :badge, dependent: :destroy
  has_many :accounts, through: :account_badges

  validates :icon, presence: true
  validates :name, presence: true
  validates :rank, presence: true, uniqueness: true
  validates :order, presence: true

  scope :active, -> { where(is_active: true) }
  scope :ordered, -> { order(:order, :rank) }
end 
