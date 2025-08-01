class CreateStatusViews < ActiveRecord::Migration[7.1]
  def change
    create_table :status_views do |t|
      t.references :account, foreign_key: true
      t.references :status, foreign_key: true

      t.timestamps
    end
    add_index :status_views, [:account_id, :status_id], unique: true
  end
end
