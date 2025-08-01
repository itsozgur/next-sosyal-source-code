class AddQuotedStatusIdToStatuses < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!
  def change
    add_column :statuses, :quoted_status_id, :bigint
    add_index :statuses, :quoted_status_id, algorithm: :concurrently
  end
end
