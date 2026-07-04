/* ============================================================
   Screen: About
   Version, changelog (latest 5 entries), developer ShuvAlpha,
   check for update button
   ============================================================ */

App.registerScreen('about', {
    render: function() {
        var changelog = (typeof APP_CHANGELOG !== 'undefined') ? APP_CHANGELOG : [];
        var latestChanges = changelog.slice(0, 5);

        var changelogHtml = '';
        if (latestChanges.length > 0) {
            latestChanges.forEach(function(entry) {
                var changesHtml = '';
                if (entry.changes && entry.changes.length > 0) {
                    entry.changes.forEach(function(change) {
                        changesHtml += '<div style="display:flex;align-items:flex-start;gap:8px;padding:4px 0;">' +
                            '<span style="color:var(--color-success);font-size:14px;">&#x2713;</span>' +
                            '<span style="font-size:var(--font-size-subhead);color:var(--color-text);">' + change + '</span>' +
                        '</div>';
                    });
                }
                changelogHtml += '' +
                    '<div class="card" style="margin-bottom:var(--space-sm);">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                            '<span style="font-weight:600;color:var(--color-primary);">v' + (entry.version || '?') + '</span>' +
                            '<span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + (entry.date || '') + '</span>' +
                        '</div>' +
                        changesHtml +
                    '</div>';
            });
        } else {
            changelogHtml = '<div style="padding:var(--space-lg);text-align:center;color:var(--color-text-medium);">' + App.t('about.changelog') + '</div>';
        }

        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                '<div class="nav-bar">' +
                    '<button class="nav-back" id="about-back">&#x2190; ' + App.t('app.back') + '</button>' +
                    '<div class="nav-title">' + App.t('about.title') + '</div>' +
                '</div>' +

                '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;">' +
                    // App info
                    '<div style="text-align:center;padding:var(--space-xl) var(--space-md);">' +
                        '<div style="width:80px;height:80px;border-radius:20px;background:var(--color-primary);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:40px;color:var(--color-text-inverse);">&#x1F310;</div>' +
                        '<h2 style="font-size:var(--font-size-title1);font-weight:700;color:var(--color-text);">' + App.t('about.appName') + '</h2>' +
                        '<p style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);margin:4px 0 16px;">' + App.t('about.description') + '</p>' +
                        '<div style="display:inline-flex;gap:var(--space-lg);padding:var(--space-md);background:var(--color-bg-card);border-radius:var(--radius-md);border:1px solid var(--color-border);">' +
                            '<div style="text-align:center;">' +
                                '<div style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0.0') + '</div>' +
                                '<div style="font-size:var(--font-size-caption);color:var(--color-text-secondary);">' + App.t('about.version') + '</div>' +
                            '</div>' +
                            '<div style="width:1px;background:var(--color-border);"></div>' +
                            '<div style="text-align:center;">' +
                                '<div style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + (typeof APP_BUILD !== 'undefined' ? APP_BUILD : '1') + '</div>' +
                                '<div style="font-size:var(--font-size-caption);color:var(--color-text-secondary);">' + App.t('about.build') + '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    // Developer
                    '<div style="padding:var(--space-md) var(--space-lg);">' +
                        '<div class="card" style="display:flex;align-items:center;gap:12px;">' +
                            '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#58A6FF,#1F6FEB);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px;">SA</div>' +
                            '<div>' +
                                '<div style="font-size:var(--font-size-body);font-weight:600;color:var(--color-text);">' + App.t('about.developer') + '</div>' +
                                '<div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('about.developerName') + '</div>' +
                            '</div>' +
                            '<a href="https://github.com/ShuvAlpha" style="margin-left:auto;font-size:var(--font-size-footnote);color:var(--color-text-link);text-decoration:none;">GitHub</a>' +
                        '</div>' +
                    '</div>' +

                    // Changelog
                    '<div style="padding:var(--space-sm) var(--space-lg);">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:var(--space-sm);">' + App.t('about.changelog') + '</h3>' +
                        changelogHtml +
                    '</div>' +

                    // Check update
                    '<div style="padding:var(--space-md) var(--space-lg);">' +
                        '<button id="about-check-update" class="btn btn-secondary" style="width:100%;">' + App.t('about.checkUpdate') + '</button>' +
                    '</div>' +

                    // Copyright
                    '<div style="text-align:center;padding:var(--space-md);padding-bottom:calc(var(--space-md) + env(safe-area-inset-bottom, 0));">' +
                        '<p style="font-size:var(--font-size-caption);color:var(--color-text-medium);">' +
                            App.t('about.copyright', {year: new Date().getFullYear()}) +
                        '</p>' +
                    '</div>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        // Back
        document.getElementById('about-back').addEventListener('click', function() { App.goBack(); });

        // Check for update
        document.getElementById('about-check-update').addEventListener('click', function() {
            var btn = document.getElementById('about-check-update');
            btn.disabled = true;
            btn.textContent = App.t('about.checking');

            // Simulate update check
            setTimeout(function() {
                Utils.showInfo(App.t('about.upToDate'));
                btn.disabled = false;
                btn.textContent = App.t('about.checkUpdate');
            }, 1500);
        });
    },
    destroy: function() {}
});
