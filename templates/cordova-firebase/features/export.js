/* ============================================================
   Feature: Export
   Generate CSV/JSON from data arrays, download as file
   ============================================================ */

window.Feature_export = {
    render: function() {
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;padding:var(--space-md);">' +
                '<div style="text-align:center;padding:var(--space-md) 0;">' +
                    '<div style="font-size:48px;margin-bottom:8px;">&#x1F4E4;</div>' +
                    '<h3 style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + App.t('export.title') + '</h3>' +
                '</div>' +

                // Data source select
                '<div class="input-group">' +
                    '<label for="export-source">Data Source</label>' +
                    '<select id="export-source" class="input-field">' +
                        '<option value="users">Users</option>' +
                        '<option value="items">Items</option>' +
                        '<option value="messages">Messages</option>' +
                        '<option value="tasks">Tasks</option>' +
                    '</select>' +
                '</div>' +

                // Format selection
                '<div class="input-group">' +
                    '<label>' + App.t('export.selectFormat') + '</label>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<button class="export-format-btn active" data-format="csv" style="flex:1;padding:12px;border-radius:var(--radius-sm);border:2px solid var(--color-primary);background:var(--color-primary-light);color:var(--color-primary);font-weight:600;cursor:pointer;">' + App.t('export.csv') + '</button>' +
                        '<button class="export-format-btn" data-format="json" style="flex:1;padding:12px;border-radius:var(--radius-sm);border:1px solid var(--color-border);background:var(--color-bg-input);color:var(--color-text-secondary);cursor:pointer;font-weight:500;">' + App.t('export.json') + '</button>' +
                    '</div>' +
                '</div>' +

                // File name
                '<div class="input-group">' +
                    '<label for="export-filename">' + App.t('export.fileName') + '</label>' +
                    '<input type="text" id="export-filename" class="input-field" value="myapp_export" placeholder="myapp_export" />' +
                '</div>' +

                // Data count preview
                '<div id="export-count" style="padding:var(--space-sm);margin-bottom:var(--space-md);font-size:var(--font-size-footnote);color:var(--color-text-secondary);text-align:center;">' +
                    'Loading data count...' +
                '</div>' +

                // Error
                '<div id="export-error" style="display:none;padding:12px;background:rgba(218,54,51,0.1);border:1px solid rgba(218,54,51,0.3);border-radius:var(--radius-sm);margin-bottom:var(--space-md);color:var(--color-error);font-size:var(--font-size-footnote);"></div>' +

                // Export button
                '<button id="export-btn" class="btn btn-primary" style="width:100%;">' + App.t('export.exportButton') + '</button>' +

                // Result
                '<div id="export-result" style="display:none;margin-top:var(--space-md);padding:var(--space-md);background:var(--color-bg-card);border-radius:var(--radius-md);border:1px solid var(--color-border);">' +
                    '<div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);margin-bottom:4px;">' + App.t('export.downloadReady') + '</div>' +
                    '<div id="export-filename-result" style="font-weight:600;color:var(--color-primary);margin-bottom:8px;word-break:break-all;"></div>' +
                    '<pre id="export-preview" style="max-height:200px;overflow:auto;font-size:11px;background:var(--color-bg-input);padding:8px;border-radius:var(--radius-sm);color:var(--color-text-medium);font-family:monospace;white-space:pre-wrap;"></pre>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        var sourceSelect = document.getElementById('export-source');
        var format = 'csv';
        var exportBtn = document.getElementById('export-btn');
        var countDiv = document.getElementById('export-count');
        var errorDiv = document.getElementById('export-error');
        var resultDiv = document.getElementById('export-result');
        var fileNameResult = document.getElementById('export-filename-result');
        var preview = document.getElementById('export-preview');

        // Format selection
        document.querySelectorAll('.export-format-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.export-format-btn').forEach(function(b) {
                    b.style.border = '1px solid var(--color-border)';
                    b.style.background = 'var(--color-bg-input)';
                    b.style.color = 'var(--color-text-secondary)';
                    b.style.fontWeight = '500';
                });
                btn.style.border = '2px solid var(--color-primary)';
                btn.style.background = 'var(--color-primary-light)';
                btn.style.color = 'var(--color-primary)';
                btn.style.fontWeight = '600';
                format = btn.getAttribute('data-format');
            });
        });

        // Update count when source changes
        function updateCount() {
            var source = sourceSelect ? sourceSelect.value : 'items';
            if (countDiv) countDiv.textContent = 'Loading ' + source + ' count...';

            if (typeof DB !== 'undefined') {
                DB.getCount(source).then(function(count) {
                    if (countDiv) countDiv.textContent = count + ' ' + source + ' found';
                }).catch(function() {
                    if (countDiv) countDiv.textContent = 'Using demo data';
                });
            } else {
                if (countDiv) countDiv.textContent = 'Database not available - using demo data';
            }
        }

        if (sourceSelect) {
            sourceSelect.addEventListener('change', updateCount);
        }
        updateCount();

        // Export action
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                if (errorDiv) errorDiv.style.display = 'none';
                if (resultDiv) resultDiv.style.display = 'none';

                var source = sourceSelect ? sourceSelect.value : 'items';
                var fileNameInput = document.getElementById('export-filename');
                var fileName = fileNameInput ? fileNameInput.value.trim() : 'myapp_export';
                if (!fileName) fileName = 'myapp_export';

                exportBtn.disabled = true;
                exportBtn.textContent = App.t('export.exporting');

                // Get data
                var dataPromise;
                if (typeof DB !== 'undefined') {
                    dataPromise = DB.getDocs(source);
                } else {
                    // Demo data
                    dataPromise = Promise.resolve({
                        items: [
                            { id: '1', name: 'John Doe', email: 'john@example.com', description: 'Sample user' },
                            { id: '2', name: 'Jane Smith', email: 'jane@example.com', description: 'Another user' },
                            { id: '3', name: 'Bob Johnson', email: 'bob@example.com', description: 'Test user' }
                        ]
                    });
                }

                dataPromise.then(function(result) {
                    var data = result.items || result || [];

                    if (data.length === 0) {
                        showError(App.t('export.noData'));
                        exportBtn.disabled = false;
                        exportBtn.textContent = App.t('export.exportButton');
                        return;
                    }

                    var output, mimeType, extension;

                    if (format === 'csv') {
                        output = jsonToCsv(data);
                        mimeType = 'text/csv;charset=utf-8;';
                        extension = '.csv';
                    } else {
                        output = JSON.stringify(data, null, 2);
                        mimeType = 'application/json;charset=utf-8;';
                        extension = '.json';
                    }

                    var fullFileName = fileName + extension;

                    // Show preview
                    if (fileNameResult) fileNameResult.textContent = fullFileName;
                    if (preview) preview.textContent = output.substring(0, 500) + (output.length > 500 ? '\n... (truncated)' : '');
                    if (resultDiv) resultDiv.style.display = 'block';

                    // Download
                    downloadFile(output, fullFileName, mimeType);

                    Utils.showSuccess(App.t('export.success') + ' (' + data.length + ' records)');
                    exportBtn.disabled = false;
                    exportBtn.textContent = App.t('export.exportButton');

                }).catch(function(err) {
                    showError(err.message || App.t('export.error'));
                    exportBtn.disabled = false;
                    exportBtn.textContent = App.t('export.exportButton');
                });
            });
        }

        function showError(msg) {
            if (errorDiv) {
                errorDiv.textContent = msg;
                errorDiv.style.display = 'block';
            } else {
                Utils.showErrorToast(msg);
            }
        }

        function jsonToCsv(jsonData) {
            if (!jsonData || jsonData.length === 0) return '';

            var keys = Object.keys(jsonData[0]);
            var csv = keys.join(',') + '\n';

            jsonData.forEach(function(row) {
                var values = keys.map(function(key) {
                    var val = row[key];
                    if (val === null || val === undefined) return '';
                    val = val.toString();
                    // Escape quotes and wrap in quotes if needed
                    if (val.indexOf(',') > -1 || val.indexOf('"') > -1 || val.indexOf('\n') > -1) {
                        val = '"' + val.replace(/"/g, '""') + '"';
                    }
                    return val;
                });
                csv += values.join(',') + '\n';
            });

            return csv;
        }

        function downloadFile(content, fileName, mimeType) {
            var blob = new Blob([content], { type: mimeType });

            // Try Cordova file plugin first
            if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.file) {
                var filePath = cordova.file.externalDataDirectory + fileName;
                var fileWriter = new FileWriter(filePath);
                fileWriter.write(blob);
                Utils.showSuccess('Saved to: ' + filePath);
                return;
            }

            // Web download
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    },
    destroy: function() {}
};
