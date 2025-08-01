class IncreaseDisplayNameLimitInAccounts < ActiveRecord::Migration[7.1]
  def up
    safety_assured do
      change_column :accounts, :display_name, :string, limit: 100
    end
  end

  def down
    safety_assured do
      change_column :accounts, :display_name, :string, limit: 30
    end
  end
end
