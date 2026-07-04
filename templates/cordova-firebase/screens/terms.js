/* ============================================================
   Screen: Terms of Service
   Terms of service template
   ============================================================ */

App.registerScreen('terms', {
    render: function() {
        var lastUpdated = 'July 5, 2026';

        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                '<div class="nav-bar">' +
                    '<button class="nav-back" id="terms-back">&#x2190; ' + App.t('app.back') + '</button>' +
                    '<div class="nav-title">' + App.t('terms.title') + '</div>' +
                '</div>' +

                '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:var(--space-md);">' +
                    '<div style="padding:var(--space-md) 0;">' +
                        '<h1 style="font-size:var(--font-size-title1);font-weight:700;color:var(--color-text);margin-bottom:4px;">' + App.t('terms.title') + '</h1>' +
                        '<p style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('terms.lastUpdated', {date: lastUpdated}) + '</p>' +
                    '</div>' +

                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">1. ' + App.t('terms.section1Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('terms.section1Body') + '</p>' +
                    '</div>' +

                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">2. ' + App.t('terms.section2Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('terms.section2Body') + '</p>' +
                    '</div>' +

                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">3. ' + App.t('terms.section3Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('terms.section3Body') + '</p>' +
                    '</div>' +

                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">4. ' + App.t('terms.section4Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('terms.section4Body') + '</p>' +
                    '</div>' +

                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">5. ' + App.t('terms.section5Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('terms.section5Body') + '</p>' +
                    '</div>' +

                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">6. ' + App.t('terms.section6Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('terms.section6Body') + '</p>' +
                    '</div>' +

                    '<div class="card">' +
                        '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:8px;">7. ' + App.t('terms.section7Title') + '</h3>' +
                        '<p style="font-size:var(--font-size-subhead);color:var(--color-text-secondary);line-height:1.6;">' + App.t('terms.section7Body') + '</p>' +
                    '</div>' +

                    '<div style="height:var(--space-xl);"></div>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        document.getElementById('terms-back').addEventListener('click', function() { App.goBack(); });
    },
    destroy: function() {}
});
