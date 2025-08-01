# frozen_string_literal: true

class CreateAccountBadges < ActiveRecord::Migration[7.1]
  def change
    create_table :account_badges do |t|
      t.belongs_to :account, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.belongs_to :badge, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.datetime :awarded_at, null: false, default: -> { 'CURRENT_TIMESTAMP' }

      t.timestamps
    end

    add_index :account_badges, [:account_id, :badge_id], unique: true
    add_index :account_badges, :badge_id
    add_index :account_badges, :awarded_at
  end
end 