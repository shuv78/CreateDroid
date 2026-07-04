/* ============================================================
   Screen: Privacy Policy
   Privacy policy template with editable sections
   ============================================================ */

App.registerScreen('privacy', {
    render: function() {
        var lastUpdated = 'July 5, 2026';

        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                '<div class="nav-bar">' +
                    '<button class="nav-back" id="privacy-back">&#x2190; ' + App.t('app.back') + '</button>' +
                    '<div class="nav-title">' + App.t('privacy.title') + '</div>' +
                '</div>' +

                '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:var(--space-md);">' +
                    '<div style="padding:var(--space-md) 0;">' +
                        '<h1 style="font-size:var(--font-size-title1);font-weight:700;color:var(--color-text);margin-bottom:4px;">' + App.t('privacy.title') + '</h1>' +
                        '<p style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('privacy.lastUpdated', {date: lastUpdated}) + '</p>' +
                    '</div>' +

                    // Section 1
                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">1. ' + App.t('privacy.section1Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('privacy.section1Body') + '</p>' +
                    '</div>' +

                    // Section 2
                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">2. ' + App.t('privacy.section2Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('privacy.section2Body') + '</p>' +
                    '</div>' +

                    // Section 3
                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">3. ' + App.t('privacy.section3Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('privacy.section3Body') + '</p>' +
                    '</div>' +

                    // Section 4
                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">4. ' + App.t('privacy.section4Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('privacy.section4Body') + '</p>' +
                    '</div>' +

                    // Section 5
                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">5. ' + App.t('privacy.section5Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('privacy.section5Body') + '</p>' +
                    '</div>' +

                    // Section 6
                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">6. ' + App.t('privacy.section6Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('privacy.section6Body') + '</p>' +
                    '</div>' +

                    '<div style="height:var(--space-xl);"></div>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        document.getElementById('privacy-back').addEventListener('click', function() { App.goBack(); });
    },
    destroy: function() {}
});
