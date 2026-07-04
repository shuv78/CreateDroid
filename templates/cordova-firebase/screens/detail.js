/* ============================================================
   Screen: Detail
   Full item view with edit/delete buttons
   ============================================================ */

App.registerScreen('detail', {
    render: function(params) {
        var id = params && params.id ? params.id : '';

        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                '<div class="nav-bar">' +
                    '<button class="nav-back" id="detail-back">&#x2190; ' + App.t('app.back') + '</button>' +
                    '<div class="nav-title">' + App.t('detail.title') + '</div>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<button id="detail-edit-btn" class="btn btn-secondary" style="padding:6px 12px;font-size:var(--font-size-footnote);height:auto;">' + App.t('detail.editButton') + '</button>' +
                        '<button id="detail-delete-btn" class="btn btn-danger" style="padding:6px 12px;font-size:var(--font-size-footnote);height:auto;">' + App.t('detail.deleteButton') + '</button>' +
                    '</div>' +
                '</div>' +

                '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;" id="detail-content">' +
                    '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-medium);">' + App.t('app.loading') + '</div>' +
                '</div>' +
            '</div>';
    },
    init: function(params) {
        var id = params && params.id ? params.id : null;
        var feature = params && params.feature ? params.feature : null;
        var content = document.getElementById('detail-content');

        // Back
        document.getElementById('detail-back').addEventListener('click', function() { App.goBack(); });

        // If this is a feature load (chat, etc.), handle separately
        if (feature) {
            document.getElementById('detail-edit-btn').style.display = 'none';
            document.getElementById('detail-delete-btn').style.display = 'none';
            if (content) {
                App.loadFeature(feature, content);
            }
            return;
        }

        if (!id) {
            if (content) content.innerHTML = '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-medium);">' + App.t('detail.notFound') + '</div>';
            return;
        }

        // Load item
        function loadItem() {
            if (typeof DB !== 'undefined') {
                DB.getDoc('items', id).then(function(item) {
                    if (!item) {
                        if (content) content.innerHTML = '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-medium);">' + App.t('detail.notFound') + '</div>';
                        return;
                    }
                    renderItem(item);
                }).catch(function(err) {
                    if (content) content.innerHTML = '<div style="padding:var(--space-xl);text-align:center;color:var(--color-error);">Error: ' + err.message + '</div>';
                });
            } else {
                if (content) content.innerHTML = '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-medium);">Database not available</div>';
            }
        }

        function renderItem(item) {
            if (!content) return;

            var title = item.name || item.title || 'Item';
            var createdDate = item.createdAt ? Utils.formatDate(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt, 'datetime') : 'Unknown';
            var updatedDate = item.updatedAt ? Utils.formatDate(item.updatedAt.toDate ? item.updatedAt.toDate() : item.updatedAt, 'datetime') : 'Unknown';

            var imgHtml = item.imageUrl ? '<img src="' + item.imageUrl + '" style="width:100%;max-height:250px;object-fit:cover;border-radius:var(--radius-md);margin-bottom:var(--space-md);" />' : '';

            content.innerHTML = '' +
                '<div style="padding:var(--space-md);">' +
                    imgHtml +
                    '<h2 style="font-size:var(--font-size-title1);font-weight:700;color:var(--color-text);margin-bottom:var(--space-sm);">' + title + '</h2>' +

                    (item.email ? '<div class="card" style="display:flex;align-items:center;gap:12px;"><span style="font-size:20px;">&#x2709;</span><div><div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">Email</div><div style="font-size:var(--font-size-body);color:var(--color-text);">' + item.email + '</div></div></div>' : '') +
                    (item.phone ? '<div class="card" style="display:flex;align-items:center;gap:12px;"><span style="font-size:20px;">&#x1F4DE;</span><div><div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">Phone</div><div style="font-size:var(--font-size-body);color:var(--color-text);">' + item.phone + '</div></div></div>' : '') +
                    (item.description ? '<div class="card"><div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);margin-bottom:4px;">Description</div><div style="font-size:var(--font-size-body);color:var(--color-text);line-height:1.6;">' + item.description + '</div></div>' : '') +

                    '<div class="card">' +
                        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
                            '<div><div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('detail.createdAt') + '</div><div style="font-size:var(--font-size-subhead);color:var(--color-text);">' + createdDate + '</div></div>' +
                            '<div><div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('detail.updatedAt') + '</div><div style="font-size:var(--font-size-subhead);color:var(--color-text);">' + updatedDate + '</div></div>' +
                            (item.authorName ? '<div><div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('detail.createdBy') + '</div><div style="font-size:var(--font-size-subhead);color:var(--color-text);">' + item.authorName + '</div></div>' : '') +
                            '<div><div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">ID</div><div style="font-size:var(--font-size-footnote);color:var(--color-text-medium);font-family:monospace;">' + (item.id ? item.id.substr(0,12) + '...' : '') + '</div></div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }

        // Edit button
        document.getElementById('detail-edit-btn').addEventListener('click', function() {
            App.showScreen('form', { id: id });
        });

        // Delete button
        document.getElementById('detail-delete-btn').addEventListener('click', function() {
            App.showDialog(App.t('detail.deleteConfirmTitle'), App.t('detail.deleteConfirmMessage'), [
                { text: App.t('app.cancel'), onClick: function() {} },
                { text: App.t('detail.deleteButton'), danger: true, onClick: function() {
                    if (typeof DB !== 'undefined') {
                        DB.deleteDoc('items', id).then(function() {
                            Utils.showSuccess(App.t('detail.deleteSuccess'));
                            App.showScreen('list');
                        }).catch(function(err) {
                            Utils.showErrorToast(App.t('detail.deleteError') + ': ' + err.message);
                        });
                    }
                }}
            ]);
        });

        loadItem();
    },
    destroy: function() {}
});
