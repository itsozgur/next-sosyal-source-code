class AddQuotesCountToStatusStats < ActiveRecord::Migration[7.1]
  def change
    add_column :status_stats, :quotes_count, :bigint, null: false, default: 0
  end
end
