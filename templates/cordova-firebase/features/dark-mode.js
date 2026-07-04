/* ============================================================
   Feature: Dark Mode / Theme Manager
   Theme toggle (light/dark), CSS variable switching, localStorage persistence
   ============================================================ */

window.ThemeManager = {
    currentTheme: 'dark',

    init: function() {
        var saved = Utils.getStorage('app_theme', 'dark');
        this.apply(saved);
    },

    apply: function(theme) {
        this.currentTheme = theme;
        Utils.setStorage('app_theme', theme);

        var link = document.getElementById('theme-link');
        if (link) {
            link.href = 'css/theme-' + theme + '.css';
        }

        // Also update meta theme-color
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        var colors = {
            'dark': '#0D1117',
            'light': '#FFFFFF',
            'line': '#FFFFFF',
            'material': '#FFFBFE',
            'ios19': '#F2F2F7'
        };
        meta.content = colors[theme] || '#0D1117';

        // Update statusbar
        if (typeof StatusBar !== 'undefined') {
            if (theme === 'dark') {
                StatusBar.styleLightContent();
            } else {
                StatusBar.styleDefault();
            }
        }

        document.documentElement.setAttribute('data-theme', theme);
        this._notify(theme);
    },

    toggle: function() {
        var newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.apply(newTheme);
    },

    getCurrent: function() {
        return this.currentTheme;
    },

    observers: [],

    observe: function(callback) {
        this.observers.push(callback);
        return function() {
            var idx = this.observers.indexOf(callback);
            if (idx > -1) this.observers.splice(idx, 1);
        }.bind(this);
    },

    _notify: function(theme) {
        this.observers.forEach(function(fn) {
            try { fn(theme); } catch (e) { console.warn('Theme observer error:', e); }
        });
    }
};

// Feature registration for standalone use
window.Feature_darkMode = {
    render: function() {
        var current = ThemeManager.getCurrent();
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;padding:var(--space-md);">' +
                '<div style="text-align:center;padding:var(--space-md) 0;">' +
                    '<div style="font-size:48px;margin-bottom:8px;">' + (current === 'dark' ? '&#x1F319;' : '&#x2600;&#xFE0F;') + '</div>' +
                    '<h3 style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + App.t('darkMode.title') + '</h3>' +
                    '<p style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('darkMode.currentTheme', {theme: current}) + '</p>' +
                '</div>' +

                // Theme buttons
                '<div style="display:flex;gap:8px;margin-bottom:var(--space-md);">' +
                    '<button class="dm-theme-btn" data-theme="light" style="flex:1;padding:16px;border-radius:var(--radius-md);border:2px solid ' + (current === 'light' ? 'var(--color-primary)' : 'var(--color-border)') + ';background:' + (current === 'light' ? 'var(--color-primary-light)' : 'var(--color-bg-input)') + ';cursor:pointer;text-align:center;">' +
                        '<div style="font-size:32px;margin-bottom:4px;">&#x2600;&#xFE0F;</div>' +
                        '<div style="font-size:var(--font-size-subhead);font-weight:500;color:var(--color-text);">' + App.t('darkMode.light') + '</div>' +
                    '</button>' +
                    '<button class="dm-theme-btn" data-theme="dark" style="flex:1;padding:16px;border-radius:var(--radius-md);border:2px solid ' + (current === 'dark' ? 'var(--color-primary)' : 'var(--color-border)') + ';background:' + (current === 'dark' ? 'var(--color-primary-light)' : 'var(--color-bg-input)') + ';cursor:pointer;text-align:center;">' +
                        '<div style="font-size:32px;margin-bottom:4px;">&#x1F319;</div>' +
                        '<div style="font-size:var(--font-size-subhead);font-weight:500;color:var(--color-text);">' + App.t('darkMode.dark') + '</div>' +
                    '</button>' +
                '</div>' +

                // System toggle
                '<div class="list-item" style="cursor:default;">' +
                    '<div class="item-content">' +
                        '<div class="item-title">' + App.t('darkMode.system') + '</div>' +
                        '<div class="item-subtitle">Follow system settings</div>' +
                    '</div>' +
                    '<div class="toggle" id="dm-system-toggle"></div>' +
                '</div>' +

                // Preview
                '<div style="margin-top:var(--space-md);">' +
                    '<h4 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:var(--space-sm);">Preview</h4>' +
                    '<div style="padding:var(--space-md);background:var(--color-bg-card);border-radius:var(--radius-md);border:1px solid var(--color-border);">' +
                        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
                            '<div class="avatar" style="width:40px;height:40px;font-size:16px;">A</div>' +
                            '<div>' +
                                '<div style="font-weight:600;color:var(--color-text);">Sample Text</div>' +
                                '<div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">Secondary text preview</div>' +
                            '</div>' +
                        '</div>' +
                        '<div style="display:flex;gap:8px;">' +
                            '<button class="btn btn-primary" style="padding:8px 16px;font-size:12px;height:auto;">Button</button>' +
                            '<button class="btn btn-secondary" style="padding:8px 16px;font-size:12px;height:auto;">Cancel</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        // Theme buttons
        document.querySelectorAll('.dm-theme-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var theme = btn.getAttribute('data-theme');
                ThemeManager.apply(theme);
                // Re-render this feature
                var container = btn.closest('[id]') || document.getElementById('app-root');
                // Just re-render the feature section
                App.loadFeature('darkMode', container);
            });
        });
    },
    destroy: function() {}
};

// Auto-init theme
ThemeManager.init();
