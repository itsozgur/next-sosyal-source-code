# frozen_string_literal: true

class CreateBadges < ActiveRecord::Migration[7.1]
  def change
    create_table :badges do |t|
      t.string :icon, null: false
      t.string :name, null: false, default: ''
      t.integer :rank, null: false
      t.integer :order, null: false, default: 0
      t.boolean :is_active, null: false, default: true

      t.timestamps
    end

    add_index :badges, :rank, unique: true
    add_index :badges, :order
    add_index :badges, :is_active
    add_index :badges, :name
  end
end 