# == Schema Information
#
# Table name: status_views
#
#  id         :bigint(8)        not null, primary key
#  account_id :bigint(8)
#  status_id  :bigint(8)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class StatusView < ApplicationRecord
  belongs_to :account
  belongs_to :status, inverse_of: :status_views

  validates :account_id, uniqueness: { scope: :status_id }
end

