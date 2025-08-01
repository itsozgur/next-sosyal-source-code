class AddViewsCountToStatusStats < ActiveRecord::Migration[7.1]
  def change
    add_column :status_stats, :views_count, :integer
  end
end
