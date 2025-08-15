interface I18nMessages {
  add: string;
  remove: string;
  adding: string;
  removing: string;
  added: string;
  removed: string;
  alreadyExists: string;
  notFound: string;
  error: string;
  badgeAddedSuccess: string;
  badgeRemovedSuccess: string;
  badgeAlreadyAssigned: string;
  badgeNotFound: string;
  errorAdding: string;
  errorRemoving: string;
  selectUserAndBadge: string;
  userNotFound: string;
  badgeNotFoundText: string;
  searchError: string;
  loading: string;
  loadMore: string;
  select: string;
}

interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar?: string;
  account?: {
    display_name?: string;
    avatar?: string;
  };
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  rank: number;
}

interface ApiResponse {
  data: Record<string, any>;
  status: number;
}

class AdminBadges {
  private userInput: HTMLInputElement | null = null;
  private userIdHidden: HTMLInputElement | null = null;
  private dropdown: HTMLElement | null = null;
  private dropdownSearch: HTMLInputElement | null = null;
  private loadingIndicator: HTMLElement | null = null;
  private usersList: HTMLElement | null = null;
  private loadMoreContainer: HTMLElement | null = null;
  private loadMoreBtn: HTMLButtonElement | null = null;
  private badgeSelect: HTMLSelectElement | null = null;
  private badgeSearch: HTMLInputElement | null = null;
  private badgeIdHidden: HTMLInputElement | null = null;
  private badgeDropdown: HTMLElement | null = null;
  private badgeLoadingIndicator: HTMLElement | null = null;
  private badgesList: HTMLElement | null = null;
  private addButton: HTMLButtonElement | null = null;
  private removeButton: HTMLButtonElement | null = null;

  private currentPage = 1;
  private isLoading = false;
  private hasMoreUsers = true;
  private hasMoreBadges = true;
  private currentQuery = '';
  private searchTimeout: number | null = null;
  private selectedUser: User | null = null;
  private selectedBadge: Badge | null = null;
  private i18n: I18nMessages;
  private lastUserId: string | null = null;

  constructor() {
    // Get i18n messages from data attributes
    const badgesPage = document.querySelector('.badges-page');
    this.i18n = {
      add: badgesPage?.getAttribute('data-i18n-add') ?? 'Add',
      remove: badgesPage?.getAttribute('data-i18n-remove') ?? 'Remove',
      adding: badgesPage?.getAttribute('data-i18n-adding') ?? 'Adding...',
      removing: badgesPage?.getAttribute('data-i18n-removing') ?? 'Removing...',
      added: badgesPage?.getAttribute('data-i18n-added') ?? 'Added!',
      removed: badgesPage?.getAttribute('data-i18n-removed') ?? 'Removed!',
      alreadyExists:
        badgesPage?.getAttribute('data-i18n-already-exists') ??
        'Already exists',
      notFound: badgesPage?.getAttribute('data-i18n-not-found') ?? 'Not found',
      error: badgesPage?.getAttribute('data-i18n-error') ?? 'Error!',
      badgeAddedSuccess:
        badgesPage?.getAttribute('data-i18n-badge-added-success') ??
        'Badge successfully added!',
      badgeRemovedSuccess:
        badgesPage?.getAttribute('data-i18n-badge-removed-success') ??
        'Badge successfully removed!',
      badgeAlreadyAssigned:
        badgesPage?.getAttribute('data-i18n-badge-already-assigned') ??
        'This badge has already been assigned to this user',
      badgeNotFound:
        badgesPage?.getAttribute('data-i18n-badge-not-found') ??
        'Badge not found on user!',
      errorAdding:
        badgesPage?.getAttribute('data-i18n-error-adding') ??
        'Error adding badge!',
      errorRemoving:
        badgesPage?.getAttribute('data-i18n-error-removing') ??
        'Error removing badge!',
      selectUserAndBadge:
        badgesPage?.getAttribute('data-i18n-select-user-and-badge') ??
        'Please select user and badge',
      userNotFound:
        badgesPage?.getAttribute('data-i18n-user-not-found') ??
        'User not found',
      badgeNotFoundText:
        badgesPage?.getAttribute('data-i18n-badge-not-found-text') ??
        'Badge not found',
      searchError:
        badgesPage?.getAttribute('data-i18n-search-error') ??
        'Search error occurred',
      loading: badgesPage?.getAttribute('data-i18n-loading') ?? 'Loading...',
      loadMore: badgesPage?.getAttribute('data-i18n-load-more') ?? 'Load more',
      select: badgesPage?.getAttribute('data-i18n-select') ?? 'Select',
    };

    this.initializeElements();
    this.setupEventListeners();
    this.initializePage();
  }

  private initializeElements(): void {
    this.userInput = document.getElementById('user-search') as HTMLInputElement;
    this.userIdHidden = document.getElementById(
      'user-id-hidden',
    ) as HTMLInputElement;
    this.dropdown = document.getElementById('user-dropdown');
    this.dropdownSearch = document.getElementById(
      'dropdown-search',
    ) as HTMLInputElement;
    this.loadingIndicator = this.dropdown?.querySelector(
      '.loading-indicator',
    ) as HTMLElement;
    this.usersList = this.dropdown?.querySelector('.users-list') as HTMLElement;
    this.loadMoreContainer = this.dropdown?.querySelector(
      '.load-more-container',
    ) as HTMLElement;
    this.loadMoreBtn = this.dropdown?.querySelector(
      '.load-more-btn',
    ) as HTMLButtonElement;
    this.badgeSelect = document.getElementById(
      'badge-select',
    ) as HTMLSelectElement;
    this.badgeSearch = document.getElementById(
      'badge-search',
    ) as HTMLInputElement;
    this.badgeIdHidden = document.getElementById(
      'badge-id-hidden',
    ) as HTMLInputElement;
    this.badgeDropdown = document.getElementById(
      'badge-dropdown',
    ) as HTMLElement;
    this.badgeLoadingIndicator = this.badgeDropdown?.querySelector(
      '.loading-indicator',
    ) as HTMLElement;
    this.badgesList = this.badgeDropdown?.querySelector(
      '.badges-list',
    ) as HTMLElement;
    this.addButton = document.getElementById('btn-add') as HTMLButtonElement;
    this.removeButton = document.getElementById(
      'btn-remove',
    ) as HTMLButtonElement;
  }

  private setupEventListeners(): void {
    this.setupUserInputEvents();
    this.setupDropdownEvents();
    this.setupBadgeSelectEvents();
    this.setupButtonEvents();
    this.setupOutsideClickEvents();
  }

  private setupUserInputEvents(): void {
    if (!this.userInput) return;

    const container = this.userInput.closest('.user-select-container');

    this.userInput.addEventListener('click', (e) => {
      e.preventDefault();

      if (this.dropdown && this.dropdown.style.display !== 'block') {
        this.dropdown.style.display = 'block';
        container?.classList.add('dropdown-open');

        if (this.dropdownSearch) {
          this.dropdownSearch.value = '';
          this.currentQuery = '';
        }

        if (
          this.usersList &&
          this.usersList.children.length === 0 &&
          !this.selectedUser
        ) {
          this.loadUsers('', false);
        }

        setTimeout(() => {
          this.dropdownSearch?.focus();
        }, 50);
      }
    });

    this.userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        this.selectedUser = null;
        if (this.userIdHidden) this.userIdHidden.value = '';
        this.validateForm();
      }
    });
  }

  private setupDropdownEvents(): void {
    if (this.dropdownSearch) {
      this.dropdownSearch.addEventListener('input', () => {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        const query = this.dropdownSearch!.value.trim();
        this.currentQuery = query;

        if (query === '' && this.usersList) {
          this.usersList.innerHTML = '';
          if (this.loadMoreContainer)
            this.loadMoreContainer.style.display = 'none';
        }

        this.searchTimeout = window.setTimeout(() => {
          this.hasMoreUsers = true;
          this.loadUsers(query, false);
        }, 300);
      });
    }

    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (this.hasMoreUsers && !this.isLoading) {
          this.loadUsers(this.currentQuery, true);
        }
      });
    }

    if (this.usersList) {
      this.usersList.addEventListener('scroll', () => {
        const scrollTop = this.usersList!.scrollTop;
        const clientHeight = this.usersList!.clientHeight;
        const scrollHeight = this.usersList!.scrollHeight;

        if (scrollTop + clientHeight >= scrollHeight - 5) {
          if (this.hasMoreUsers && !this.isLoading) {
            this.loadUsers(this.currentQuery, true);
          }
        }
      });
    }
  }

  private setupBadgeSelectEvents(): void {
    if (this.badgeSearch) {
      const container = this.badgeSearch.closest('.badge-select-container');

      this.badgeSearch.addEventListener('click', (e) => {
        e.preventDefault();

        if (
          this.badgeDropdown &&
          this.badgeDropdown.style.display !== 'block'
        ) {
          this.badgeDropdown.style.display = 'block';
          container?.classList.add('dropdown-open');

          if (this.badgesList && this.badgesList.children.length === 0) {
            void this.loadBadges('', 1, false);
          }
        }
      });

      this.badgeSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          this.selectedBadge = null;
          if (this.badgeIdHidden) this.badgeIdHidden.value = '';
          if (this.badgeSelect) this.badgeSelect.value = '';
          this.validateForm();
        }
      });
    }

    // Badge select dropdown event
    if (this.badgeSelect) {
      this.badgeSelect.addEventListener('change', (e) => {
        const select = e.target as HTMLSelectElement;
        const selectedOption = select.options[select.selectedIndex];

        if (selectedOption?.value) {
          // Get icon from data attribute or fallback to emoji
          const iconFromData = selectedOption.getAttribute('data-icon');
          const iconFromText = selectedOption.textContent?.split(' ')[0];

          const badge: Badge = {
            id: selectedOption.value,
            name:
              selectedOption.textContent?.replace(/^[^\s]+\s/, '') ||
              selectedOption.textContent ||
              '',
            icon: iconFromData || iconFromText || '✅',
            rank: 0,
          };

          this.selectBadge(badge);
        }
      });
    }

    // Click outside badge dropdown
    document.addEventListener('click', (e) => {
      const container = (e.target as Element)?.closest(
        '.badge-select-container',
      );
      if (
        !container &&
        this.badgeDropdown &&
        this.badgeDropdown.style.display === 'block'
      ) {
        this.badgeDropdown.style.display = 'none';
        document
          .querySelector('.badge-select-container.dropdown-open')
          ?.classList.remove('dropdown-open');
      }
    });

    if (this.badgesList) {
      this.badgesList.addEventListener('scroll', () => {
        const scrollTop = this.badgesList!.scrollTop;
        const clientHeight = this.badgesList!.clientHeight;
        const scrollHeight = this.badgesList!.scrollHeight;

        if (scrollTop + clientHeight >= scrollHeight - 5) {
          if (this.hasMoreBadges && !this.isLoading) {
            void this.loadBadges(this.currentQuery, this.currentPage + 1, true);
          }
        }
      });
    }
  }

  private setupButtonEvents(): void {
    if (this.addButton) {
      this.addButton.addEventListener('click', (e) => {
        e.preventDefault();

        const userId = this.userIdHidden?.value;
        const badgeId = this.badgeIdHidden?.value || this.badgeSelect?.value;

        if (!userId || !badgeId) {
          this.showNotification(this.i18n.selectUserAndBadge, 'warning');
          return;
        }

        void this.assignBadge(userId, badgeId);
      });
    }

    if (this.removeButton) {
      this.removeButton.addEventListener('click', (e) => {
        e.preventDefault();

        const userId = this.userIdHidden?.value;
        const badgeId = this.badgeIdHidden?.value || this.badgeSelect?.value;

        if (!userId || !badgeId) {
          this.showNotification(this.i18n.selectUserAndBadge, 'warning');
          return;
        }

        void this.removeBadge(userId, badgeId);
      });
    }
  }

  private setupOutsideClickEvents(): void {
    document.addEventListener('click', (e) => {
      const container = (e.target as Element)?.closest(
        '.user-select-container',
      );
      if (
        !container &&
        this.dropdown &&
        this.dropdown.style.display === 'block'
      ) {
        this.dropdown.style.display = 'none';
        document
          .querySelector('.user-select-container.dropdown-open')
          ?.classList.remove('dropdown-open');
      }
    });
  }

  private initializePage(): void {
    if (this.dropdown) {
      this.dropdown.style.display = 'none';
    }

    document
      .querySelectorAll('.user-select-container.dropdown-open')
      .forEach((container) => {
        container.classList.remove('dropdown-open');
      });

    this.loadBadges();
    this.validateForm();
    this.setupPageAnimation();
  }

  private setupPageAnimation(): void {
    const badgesPage = document.querySelector('.badges-page') as HTMLElement;
    if (badgesPage) {
      badgesPage.style.opacity = '0';
      badgesPage.style.transform = 'translateY(10px)';

      setTimeout(() => {
        badgesPage.style.transition = 'all 0.4s ease';
        badgesPage.style.opacity = '1';
        badgesPage.style.transform = 'translateY(0)';
      }, 50);
    }
  }

  private showNotification(
    message: string,
    type: 'success' | 'warning' | 'error' = 'success',
  ): void {
    const banner = document.getElementById('notification-banner');
    if (!banner) {
      console.error('Notification banner element not found!');
      return;
    }

    // Clear any existing timeout
    const existingTimeout = banner.getAttribute('data-timeout-id');
    if (existingTimeout) {
      clearTimeout(parseInt(existingTimeout));
      banner.removeAttribute('data-timeout-id');
    }

    // Force reset banner state
    banner.style.display = 'none';
    banner.className = '';
    banner.classList.remove('show', 'hiding');
    banner.innerHTML = '';

    // Force reflow to ensure display:none is applied
    banner.offsetHeight;

    // Now setup the notification
    banner.style.display = 'block';
    banner.className = `${type} show`;

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    banner.appendChild(messageSpan);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => {
      this.hideNotification(banner);
    });
    banner.appendChild(closeBtn);

    // Auto-hide after 5 seconds
    const timeoutId = setTimeout(() => {
      if (banner.classList.contains('show')) {
        this.hideNotification(banner);
      }
    }, 5000);

    banner.setAttribute('data-timeout-id', timeoutId.toString());
  }

  private hideNotification(banner: HTMLElement): void {
    // Add hiding class for animation
    banner.classList.add('hiding');
    banner.classList.remove('show');

    // Clear timeout if exists
    const existingTimeout = banner.getAttribute('data-timeout-id');
    if (existingTimeout) {
      clearTimeout(parseInt(existingTimeout));
      banner.removeAttribute('data-timeout-id');
    }

    // Wait for animation to complete, then hide completely
    setTimeout(() => {
      banner.className = '';
      banner.classList.remove('hiding');
      banner.style.display = 'none';
      banner.innerHTML = '';
    }, 300); // Match animation duration
  }

  private selectUser(user: User): void {
    this.selectedUser = user;
    if (this.userIdHidden) this.userIdHidden.value = user.id;

    const displayName =
      user.display_name || (user.account && user.account.display_name);
    if (this.userInput) {
      this.userInput.value = `@${user.username}${displayName ? ` (${displayName})` : ''}`;
    }

    if (this.dropdown) this.dropdown.style.display = 'none';
    this.userInput
      ?.closest('.user-select-container')
      ?.classList.remove('dropdown-open');
    this.validateForm();
  }

  private createUserElement(user: User): HTMLElement {
    const userDiv = document.createElement('div');
    userDiv.className = 'user-search-result';
    const avatarUrl = user.avatar || (user.account && user.account.avatar);
    const displayName =
      user.display_name || (user.account && user.account.display_name);

    let badgesHtml = '';
    if (user.account && (user.account as any).badges) {
      const badges = (user.account as any).badges.toJS
        ? (user.account as any).badges.toJS()
        : (user.account as any).badges;

      if (badges && badges.length > 0) {
        const rankOneBadges = badges.filter((badge: any) => badge.rank === 1);
        rankOneBadges.slice(0, 3).forEach((badge: any) => {
          const badgeId = `badge-${Math.random().toString(36).slice(2, 11)}`;
          badgesHtml += `<img id="${badgeId}" src="${badge.icon}" alt="${badge.name}" title="${badge.name}" onload="
            this.style.width = '18px';
            this.style.height = '18px';
            this.style.maxWidth = '18px';
            this.style.maxHeight = '18px';
            this.style.minWidth = '18px';
            this.style.minHeight = '18px';
            this.style.objectFit = 'contain';
            this.style.marginLeft = '4px';
            this.style.verticalAlign = 'middle';
            this.style.display = 'inline-block';
            this.style.flexShrink = '0';
            this.style.transform = 'scale(0.8)';
            this.style.transformOrigin = 'center';
          " style="width: 12px !important; height: 12px !important; object-fit: contain; margin-left: 4px; vertical-align: middle; display: inline-block;" />`;
        });

        if (rankOneBadges.length > 3) {
          badgesHtml += `<span class="more-badges" title="${rankOneBadges.length - 3} daha fazla rozet" style="font-size: 12px; margin-left: 4px; color: #666;">+${rankOneBadges.length - 3}</span>`;
        }
      }
    }

    userDiv.innerHTML = `
      <div class="user-info">
        ${avatarUrl ? `<img src="${avatarUrl}" class="user-avatar" />` : '<div class="user-avatar-placeholder">👤</div>'}
        <div class="user-details">
          <strong>@${user.username}${badgesHtml}</strong>
          ${displayName ? `<span class="display-name">${displayName}</span>` : ''}
        </div>
      </div>
      <button class="select-user-button" type="button">
        ${this.i18n.select}
      </button>
    `;

    userDiv
      .querySelector('.select-user-button')
      ?.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectUser(user);
      });

    return userDiv;
  }

  private async loadUsers(
    query: string = '',
    append: boolean = false,
  ): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    if (query.length > 0 || append) {
      if (this.loadingIndicator) this.loadingIndicator.style.display = 'block';
    }

    if (this.loadMoreBtn && append) {
      this.loadMoreBtn.disabled = true;
      this.loadMoreBtn.textContent = this.i18n.loading;
    }

    let url = `/api/v1/admin/accounts?username=${encodeURIComponent(query)}&limit=20`;
    if (append && this.lastUserId) {
      url += `&max_id=${this.lastUserId}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const data = await response.json();
      const users: User[] = Array.isArray(data) ? data : [];

      if (!append && this.usersList) {
        this.usersList.innerHTML = '';
        this.lastUserId = null;
      }

      if (users.length === 0 && !append && this.usersList) {
        this.usersList.innerHTML = `<div class="no-results">${this.i18n.userNotFound}</div>`;
        this.hasMoreUsers = false;
      } else {
        users.forEach((user) => {
          this.usersList?.appendChild(this.createUserElement(user));
        });
        this.hasMoreUsers = users.length >= 20;
        if (users.length > 0) {
          this.lastUserId = users[users.length - 1].id;
        }
      }

      if (this.hasMoreUsers && users.length > 0 && this.loadMoreContainer) {
        this.loadMoreContainer.style.display = 'block';
        if (this.loadMoreBtn) {
          this.loadMoreBtn.disabled = false;
          this.loadMoreBtn.textContent = this.i18n.loadMore;
        }
      } else if (this.loadMoreContainer) {
        this.loadMoreContainer.style.display = 'none';
      }
    } catch (error) {
      console.error('Search error:', error);
      if (!append && this.usersList) {
        this.usersList.innerHTML = `<div class="error">${this.i18n.searchError}</div>`;
      }
    } finally {
      this.isLoading = false;
      if (this.loadingIndicator) this.loadingIndicator.style.display = 'none';
      if (this.loadMoreBtn) {
        this.loadMoreBtn.disabled = false;
        if (!this.hasMoreUsers) {
          this.loadMoreBtn.textContent = this.i18n.loadMore;
        }
      }
    }
  }

  private async loadBadges(
    query = '',
    page = 1,
    append = false,
  ): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;

    if (query.length > 0 || page > 1) {
      if (this.badgeLoadingIndicator)
        this.badgeLoadingIndicator.style.display = 'block';
    }

    const url = `/api/v1/admin/badges?name=${encodeURIComponent(query)}&limit=20&page=${page}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const data = await response.json();
      const badges: Badge[] = Array.isArray(data) ? data : [];

      if (!append && this.badgesList) {
        this.badgesList.innerHTML = '';
        this.currentPage = 1;
      }

      // Clear and populate badge select if this is first page
      if (!append && this.badgeSelect) {
        // Keep first placeholder option
        while (this.badgeSelect.children.length > 1) {
          const lastChild = this.badgeSelect.lastChild;
          if (lastChild) {
            this.badgeSelect.removeChild(lastChild);
          }
        }
      }

      if (badges.length === 0 && page === 1 && this.badgesList) {
        this.badgesList.innerHTML = `<div class="no-results">${this.i18n.badgeNotFoundText}</div>`;
        this.hasMoreBadges = false;
      } else {
        badges.forEach((badge) => {
          if (this.badgesList) {
            const badgeElement = this.createBadgeElement(badge);
            this.badgesList.appendChild(badgeElement);
          }

          if (page === 1 && this.badgeSelect) {
            const option = document.createElement('option');
            option.value = badge.id;

            const isIconUrl =
              badge.icon.startsWith('http') ||
              badge.icon.startsWith('/') ||
              badge.icon.includes('.svg') ||
              badge.icon.includes('.png') ||
              badge.icon.includes('.jpg');

            if (isIconUrl) {
              // For URL icons, just show the name in select
              option.textContent = badge.name;
              // Store full icon URL in data attribute
              option.setAttribute('data-icon', badge.icon);
              option.title = `${badge.name} (${badge.icon})`; // Tooltip with icon info
            } else {
              // For emoji/text icons, show both
              option.textContent = `${badge.icon} ${badge.name}`;
            }

            this.badgeSelect.appendChild(option);
          }
        });

        this.hasMoreBadges = badges.length >= 20;
        this.currentPage = page;
      }

      if (this.hasMoreBadges && badges.length > 0 && this.badgesList) {
        this.badgesList.style.display = 'block';
      } else if (this.badgesList) {
        this.badgesList.style.display = 'none';
      }
    } catch (error) {
      console.error('Badge search error:', error);
      if (!append && this.badgesList) {
        this.badgesList.innerHTML = `<div class="error">${this.i18n.searchError}</div>`;
      }

      // Add fallback option to select
      if (!append && this.badgeSelect) {
        const option = document.createElement('option');
        option.value = '1';
        option.textContent = '✅ Veriiiify (varsayılan)';
        this.badgeSelect.appendChild(option);
      }
    } finally {
      this.isLoading = false;
      if (this.badgeLoadingIndicator)
        this.badgeLoadingIndicator.style.display = 'none';
    }
  }

  private createBadgeElement(badge: Badge): HTMLElement {
    const badgeDiv = document.createElement('div');
    badgeDiv.className = 'badge-search-result';
    const icon = badge.icon;
    const name = badge.name;

    // Debug logging

    // Check if icon is URL or emoji/text
    const isIconUrl =
      icon &&
      (icon.startsWith('http') ||
        icon.startsWith('/') ||
        icon.includes('.svg') ||
        icon.includes('.png') ||
        icon.includes('.jpg') ||
        icon.includes('.jpeg') ||
        icon.includes('.webp'));

    // Create icon HTML with better error handling
    let iconHtml = '';
    if (isIconUrl) {
      iconHtml = `<img src="${icon}"
                       class="badge-icon"
                       alt="${name}"
                       style="width: 20px; height: 20px; object-fit: contain; vertical-align: middle; margin-right: 8px; border: 1px solid #ccc;"
                       crossorigin="anonymous"
                       onload="console.log('✅ Icon loaded successfully:', '${icon}')"
                       onerror="console.error('❌ Failed to load icon:', '${icon}'); this.style.display='none'; this.nextElementSibling.style.display='inline';" />
                  <span style="display: none; margin-right: 8px;">🏷️</span>`;
    } else {
      iconHtml = `<span class="badge-icon" style="font-size: 16px; margin-right: 8px;">${icon || '🏷️'}</span>`;
    }

    badgeDiv.innerHTML = `
      <div class="badge-info">
        ${iconHtml}
        <div class="badge-details">
          <strong>${name}</strong>
          <small style="color: #666; display: block; font-size: 11px;">Icon: ${icon}</small>
        </div>
      </div>
      <button class="select-badge-button" type="button">
        ${this.i18n.select}
      </button>
    `;

    badgeDiv
      .querySelector('.select-badge-button')
      ?.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectBadge(badge);
      });

    return badgeDiv;
  }

  private selectBadge(badge: Badge): void {
    this.selectedBadge = badge;
    if (this.badgeIdHidden) this.badgeIdHidden.value = badge.id;

    const name = badge.name;
    if (this.badgeSearch) {
      this.badgeSearch.value = name;
    }

    if (this.badgeDropdown) this.badgeDropdown.style.display = 'none';
    this.badgeSearch
      ?.closest('.badge-select-container')
      ?.classList.remove('dropdown-open');
    this.validateForm();
  }

  private validateForm(): void {
    const userSelected = this.userIdHidden?.value;
    const badgeSelected = this.badgeIdHidden?.value || this.badgeSelect?.value;
    const isValid = userSelected && badgeSelected;

    if (this.addButton) {
      this.addButton.disabled = !isValid;
      if (!isValid) {
        this.addButton.innerHTML = `➕ ${this.i18n.add}`;
      }
    }

    if (this.removeButton) {
      this.removeButton.disabled = !isValid;
      if (!isValid) {
        this.removeButton.innerHTML = `🗑️ ${this.i18n.remove}`;
      }
    }
  }

  private translateApiMessage(apiMessage: string): string {
    // API'den gelen İngilizce mesajları Türkçe karşılıklarıyla değiştir
    const translations: Record<string, string> = {
      'Badge assigned successfully': this.i18n.badgeAddedSuccess,
      'Badge removed successfully': this.i18n.badgeRemovedSuccess,
      'Badge already assigned': this.i18n.badgeAlreadyAssigned,
      'Badge not found on account': this.i18n.badgeNotFound,
      'This badge has already been assigned to this user':
        this.i18n.badgeAlreadyAssigned,
      'Badge successfully added!': this.i18n.badgeAddedSuccess,
      'Badge successfully removed!': this.i18n.badgeRemovedSuccess,
    };

    return translations[apiMessage] || apiMessage;
  }

  private async assignBadge(userId: string, badgeId: string): Promise<void> {
    if (this.addButton) {
      this.addButton.innerHTML = `⏳ ${this.i18n.adding}`;
      this.addButton.disabled = true;
    }

    // Get badge ID from either hidden field or select
    const finalBadgeId = badgeId || this.badgeSelect?.value || '';

    try {
      const response = await fetch(
        `/api/v1/admin/badges/assign/${userId}/${finalBadgeId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token':
              document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.content ?? '',
          },
        },
      );

      let result: ApiResponse;
      if (response.status === 201 || response.status === 200) {
        const data = await response.json();
        result = { data, status: response.status };
      } else if (response.status === 422) {
        const data = await response.json();
        result = { data, status: 422 };
      } else if (response.ok) {
        const data = await response.json();
        result = { data, status: response.status };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

      if (result.status === 201 || result.status === 200) {
        const apiMessage = result.data.message || this.i18n.badgeAddedSuccess;
        const message = this.translateApiMessage(apiMessage);
        if (this.addButton) this.addButton.innerHTML = `✅ ${this.i18n.added}`;
        this.showNotification(message, 'success');
      } else if (result.status === 422) {
        const apiMessage =
          result.data.message || this.i18n.badgeAlreadyAssigned;
        const message = this.translateApiMessage(apiMessage);
        if (this.addButton)
          this.addButton.innerHTML = `⚠️ ${this.i18n.alreadyExists}`;
        this.showNotification(message, 'warning');
      } else {
        // Unexpected status code - show generic success message
        const apiMessage = result.data.message || this.i18n.badgeAddedSuccess;
        const message = this.translateApiMessage(apiMessage);
        if (this.addButton) this.addButton.innerHTML = `✅ ${this.i18n.added}`;
        this.showNotification(message, 'success');
      }

      this.resetForm();
    } catch (error) {
      console.error('Badge ekleme hatası:', error);
      if (this.addButton) this.addButton.innerHTML = `❌ ${this.i18n.error}`;
      this.showNotification(this.i18n.errorAdding, 'error');

      setTimeout(() => {
        if (this.addButton) {
          this.addButton.innerHTML = `➕ ${this.i18n.add}`;
          this.addButton.disabled = false;
        }
      }, 3000);
    }
  }

  private async removeBadge(userId: string, badgeId: string): Promise<void> {
    if (this.removeButton) {
      this.removeButton.innerHTML = `⏳ ${this.i18n.removing}`;
      this.removeButton.disabled = true;
    }

    // Get badge ID from either hidden field or select
    const finalBadgeId = badgeId || this.badgeSelect?.value || '';

    try {
      const response = await fetch(
        `/api/v1/admin/badges/remove/${userId}/${finalBadgeId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token':
              document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.content ?? '',
          },
        },
      );

      let result: ApiResponse;
      if (response.status === 200 || response.status === 204) {
        try {
          const data = await response.json();
          result = { data, status: response.status };
        } catch {
          result = { data: {}, status: response.status };
        }
      } else if (response.status === 404) {
        const data = await response.json();
        result = { data, status: 404 };
      } else if (response.ok) {
        const data = await response.json();
        result = { data, status: response.status };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

      if (result.status === 200 || result.status === 204) {
        const apiMessage = result.data.message || this.i18n.badgeRemovedSuccess;
        const message = this.translateApiMessage(apiMessage);
        if (this.removeButton)
          this.removeButton.innerHTML = `✅ ${this.i18n.removed}`;
        this.showNotification(message, 'success');
      } else if (result.status === 404) {
        const apiMessage = result.data.message || this.i18n.badgeNotFound;
        const message = this.translateApiMessage(apiMessage);
        if (this.removeButton)
          this.removeButton.innerHTML = `⚠️ ${this.i18n.notFound}`;
        this.showNotification(message, 'warning');
      } else {
        // Unexpected status code - show generic success message
        const apiMessage = result.data.message || this.i18n.badgeRemovedSuccess;
        const message = this.translateApiMessage(apiMessage);
        if (this.removeButton)
          this.removeButton.innerHTML = `✅ ${this.i18n.removed}`;
        this.showNotification(message, 'success');
      }

      this.resetForm();
    } catch (error) {
      console.error('Badge çıkarma hatası:', error);
      if (this.removeButton)
        this.removeButton.innerHTML = `❌ ${this.i18n.error}`;
      this.showNotification(this.i18n.errorRemoving, 'error');

      setTimeout(() => {
        if (this.removeButton) {
          this.removeButton.innerHTML = `🗑️ ${this.i18n.remove}`;
          this.removeButton.disabled = false;
        }
      }, 3000);
    }
  }

  private resetForm(): void {
    setTimeout(() => {
      if (this.userInput) this.userInput.value = '';
      if (this.userIdHidden) this.userIdHidden.value = '';
      if (this.badgeSearch) this.badgeSearch.value = '';
      if (this.badgeIdHidden) this.badgeIdHidden.value = '';
      this.selectedUser = null;
      this.selectedBadge = null;
      this.validateForm();
    }, 2000);
  }
}

// Initialize when DOM is ready
export function initializeAdminBadges(): void {
  if (document.querySelector('.badges-page')) {
    new AdminBadges();
  }
}

export default AdminBadges;
