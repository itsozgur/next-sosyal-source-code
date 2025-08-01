class BadgePolicy < ApplicationPolicy
    def index?
      role.can?(:manage_users)
    end
  
    def show?
      role.can?(:manage_users)
    end
  
    def create?
      role.can?(:manage_users)
    end
  
    def update?
      role.can?(:manage_users)
    end
  
    def destroy?
      role.can?(:manage_users)
    end
  end 