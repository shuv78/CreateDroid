/* ============================================================
   Screen: Dashboard
   Stats grid, recent activity, quick action buttons
   ============================================================ */

App.registerScreen('dashboard', {
    render: function() {
        var user = Auth.getCurrentUser();
        var userName = user ? (user.displayName || user.email || 'User') : 'User';

        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                // Header
                '<div class="nav-bar">' +
                    '<div class="nav-title">' + App.t('dashboard.title') + '</div>' +
                    '<button id="dashboard-profile-btn" style="width:36px;height:36px;border-radius:50%;background:var(--color-primary-light);border:1px solid var(--color-border);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--color-primary);">&#x1F464;</button>' +
                '</div>' +

                '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:var(--space-md);">' +
                    // Welcome
                    '<div style="padding:var(--space-md) var(--space-lg) 0;">' +
                        '<h2 style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + App.t('dashboard.welcome') + ', ' + userName + '</h2>' +
                    '</div>' +

                    // Stats grid
                    '<div class="stats-grid" id="dashboard-stats">' +
                        '<div class="stat-card"><div class="stat-value" id="stat-users">-</div><div class="stat-label">' + App.t('dashboard.totalUsers') + '</div></div>' +
                        '<div class="stat-card"><div class="stat-value" id="stat-items">-</div><div class="stat-label">' + App.t('dashboard.totalItems') + '</div></div>' +
                        '<div class="stat-card"><div class="stat-value" id="stat-active">-</div><div class="stat-label">' + App.t('dashboard.activeNow') + '</div></div>' +
                        '<div class="stat-card"><div class="stat-value" id="stat-pending">-</div><div class="stat-label">' + App.t('dashboard.pendingTasks') + '</div></div>' +
                    '</div>' +

                    // Quick Actions
                    '<div style="padding:var(--space-sm) var(--space-lg);">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:var(--space-sm);">' + App.t('dashboard.quickActions') + '</h3>' +
                        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm);">' +
                            '<button class="card quick-action" data-action="add" style="text-align:center;cursor:pointer;border:none;font-size:var(--font-size-body);font-weight:500;color:var(--color-text);background:var(--color-bg-card);">&#x2795;<br/><span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('dashboard.addNew') + '</span></button>' +
                            '<button class="card quick-action" data-action="list" style="text-align:center;cursor:pointer;border:none;font-size:var(--font-size-body);font-weight:500;color:var(--color-text);background:var(--color-bg-card);">&#x1F4CB;<br/><span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('dashboard.viewList') + '</span></button>' +
                            '<button class="card quick-action" data-action="chat" style="text-align:center;cursor:pointer;border:none;font-size:var(--font-size-body);font-weight:500;color:var(--color-text);background:var(--color-bg-card);">&#x1F4AC;<br/><span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('dashboard.openChat') + '</span></button>' +
                            '<button class="card quick-action" data-action="profile" style="text-align:center;cursor:pointer;border:none;font-size:var(--font-size-body);font-weight:500;color:var(--color-text);background:var(--color-bg-card);">&#x1F464;<br/><span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('dashboard.viewProfile') + '</span></button>' +
                        '</div>' +
                    '</div>' +

                    // Recent Activity
                    '<div style="padding:var(--space-sm) var(--space-lg);">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:var(--space-sm);">' + App.t('dashboard.recentActivity') + ' <a href="#" id="dashboard-view-all" style="font-size:var(--font-size-footnote);color:var(--color-text-link);text-decoration:none;float:right;">' + App.t('dashboard.viewAll') + '</a></h3>' +
                        '<div id="dashboard-activity">' +
                            '<div style="padding:var(--space-lg);text-align:center;color:var(--color-text-medium);font-size:var(--font-size-footnote);">' + App.t('dashboard.noActivity') + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                // Bottom Tab Bar
                '<div class="tab-bar">' +
                    '<div class="tab-item active" data-tab="dashboard">&#x1F3E0;<span>Home</span></div>' +
                    '<div class="tab-item" data-tab="list">&#x1F4CB;<span>List</span></div>' +
                    '<div class="tab-item" data-tab="chat">&#x1F4AC;<span>Chat</span></div>' +
                    '<div class="tab-item" data-tab="settings">&#x2699;&#xFE0F;<span>Settings</span></div>' +
                '</div>' +
            '</div>';
    },
    init: function(params) {
        // Load stats from Firestore
        _loadStats();

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action = btn.getAttribute('data-action');
                switch (action) {
                    case 'add': App.showScreen('form'); break;
                    case 'list': App.showScreen('list'); break;
                    case 'chat': App.showScreen('detail', { feature: 'chat' }); break;
                    case 'profile': App.showScreen('profile'); break;
                }
            });
        });

        // Profile button
        var profileBtn = document.getElementById('dashboard-profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function() {
                App.showScreen('profile');
            });
        }

        // View all
        var viewAll = document.getElementById('dashboard-view-all');
        if (viewAll) {
            viewAll.addEventListener('click', function(e) {
                e.preventDefault();
                App.showScreen('list');
            });
        }

        // Tab bar navigation
        document.querySelectorAll('.tab-item').forEach(function(tab) {
            tab.addEventListener('click', function() {
                var t = tab.getAttribute('data-tab');
                switch (t) {
                    case 'dashboard': break;
                    case 'list': App.showScreen('list'); break;
                    case 'chat': App.showScreen('detail', { feature: 'chat' }); break;
                    case 'settings': App.showScreen('settings'); break;
                }
            });
        });
    },
    destroy: function() {}
});

function _loadStats() {
    // Load counts from Firestore
    if (typeof DB !== 'undefined') {
        DB.getCount('users').then(function(count) {
            var el = document.getElementById('stat-users');
            if (el) el.textContent = count;
        }).catch(function() {});

        DB.getCount('items').then(function(count) {
            var el = document.getElementById('stat-items');
            if (el) el.textContent = count;
        }).catch(function() {});

        DB.getCount('sessions').then(function(count) {
            var el = document.getElementById('stat-active');
            if (el) el.textContent = count;
        }).catch(function() {
            var el = document.getElementById('stat-active');
            if (el) el.textContent = '0';
        });

        DB.getCount('tasks').then(function(count) {
            var el = document.getElementById('stat-pending');
            if (el) el.textContent = count;
        }).catch(function() {
            var el = document.getElementById('stat-pending');
            if (el) el.textContent = '0';
        });
    }
}
