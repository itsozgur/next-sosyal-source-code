# frozen_string_literal: true

class REST::BadgeSerializer < ActiveModel::Serializer
  attributes :id, :name, :icon, :rank, :order, :is_active

  def id
    object.id.to_s
  end
end 