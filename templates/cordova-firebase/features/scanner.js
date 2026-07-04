/* ============================================================
   Feature: Scanner
   QR/barcode scanner using html5-qrcode library
   ============================================================ */

window.Feature_scanner = {
    render: function() {
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;padding:var(--space-md);">' +
                '<div style="text-align:center;padding:var(--space-md) 0;">' +
                    '<div style="font-size:48px;margin-bottom:8px;">&#x1F50D;</div>' +
                    '<h3 style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + App.t('scanner.title') + '</h3>' +
                '</div>' +

                // Scanner viewfinder area
                '<div id="scanner-viewfinder" style="width:100%;max-width:400px;height:300px;margin:0 auto var(--space-md);border-radius:var(--radius-md);overflow:hidden;border:2px solid var(--color-border);background:var(--color-bg-input);position:relative;">' +
                    '<div id="scanner-placeholder" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--color-text-medium);">' +
                        '<div style="font-size:40px;margin-bottom:8px;">&#x1F4F1;</div>' +
                        '<div style="font-size:var(--font-size-subhead);">' + App.t('scanner.startScanning') + '</div>' +
                    '</div>' +
                    '<div id="scanner-reader" style="width:100%;height:100%;display:none;"></div>' +
                    '<div id="scanner-overlay" style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;border:3px solid var(--color-primary);border-radius:var(--radius-md);box-shadow:0 0 0 9999px rgba(0,0,0,0.3);display:none;"></div>' +
                '</div>' +

                // Result display
                '<div id="scanner-result" style="display:none;margin-bottom:var(--space-md);padding:var(--space-md);background:var(--color-bg-card);border-radius:var(--radius-sm);border:1px solid var(--color-border);">' +
                    '<div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);margin-bottom:4px;">' + App.t('scanner.result') + '</div>' +
                    '<div id="scanner-result-text" style="font-size:var(--font-size-body);color:var(--color-text);font-weight:500;word-break:break-all;"></div>' +
                '</div>' +

                // Controls
                '<div style="display:flex;gap:8px;">' +
                    '<button id="scanner-start-btn" class="btn btn-primary" style="flex:1;">' + App.t('scanner.startScanning') + '</button>' +
                    '<button id="scanner-stop-btn" class="btn btn-secondary" style="flex:1;display:none;">' + App.t('scanner.stopScanning') + '</button>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        var startBtn = document.getElementById('scanner-start-btn');
        var stopBtn = document.getElementById('scanner-stop-btn');
        var placeholder = document.getElementById('scanner-placeholder');
        var readerEl = document.getElementById('scanner-reader');
        var overlay = document.getElementById('scanner-overlay');
        var resultDiv = document.getElementById('scanner-result');
        var resultText = document.getElementById('scanner-result-text');
        var html5QrCode = null;

        function onScanSuccess(decodedText, decodedResult) {
            // Vibrate on scan
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(100);
            } else if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.vibration) {
                navigator.notification.vibrate(100);
            }

            // Show result
            if (resultText) resultText.textContent = decodedText;
            if (resultDiv) resultDiv.style.display = 'block';

            Utils.showSuccess('Scanned: ' + decodedText);

            // Auto-stop after successful scan
            if (html5QrCode) {
                html5QrCode.stop().then(function() {
                    if (placeholder) placeholder.style.display = 'flex';
                    if (readerEl) readerEl.style.display = 'none';
                    if (overlay) overlay.style.display = 'none';
                    if (startBtn) startBtn.style.display = 'flex';
                    if (stopBtn) stopBtn.style.display = 'none';
                }).catch(function(err) {
                    console.warn('Error stopping scanner:', err);
                });
            }
        }

        function startScanner() {
            // Try html5-qrcode first
            if (typeof Html5Qrcode !== 'undefined') {
                try {
                    html5QrCode = new Html5Qrcode('scanner-reader');

                    if (placeholder) placeholder.style.display = 'none';
                    if (readerEl) readerEl.style.display = 'block';
                    if (overlay) overlay.style.display = 'block';
                    if (startBtn) startBtn.style.display = 'none';
                    if (stopBtn) stopBtn.style.display = 'flex';

                    html5QrCode.start(
                        { facingMode: 'environment' },
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        onScanSuccess,
                        function(error) {
                            // Scanning in progress - ignore qr code errors
                        }
                    ).catch(function(err) {
                        Utils.showErrorToast(App.t('scanner.permissionDenied') + ': ' + err);
                        if (placeholder) placeholder.style.display = 'flex';
                        if (readerEl) readerEl.style.display = 'none';
                        if (startBtn) startBtn.style.display = 'flex';
                        if (stopBtn) stopBtn.style.display = 'none';
                    });
                } catch (e) {
                    // Fallback: try Cordova barcode scanner plugin
                    _tryCordovaScanner();
                }
            } else if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.barcodeScanner) {
                _tryCordovaScanner();
            } else {
                Utils.showInfo('Scanner library not loaded. Install html5-qrcode or phonegap-plugin-barcodescanner');
                if (startBtn) startBtn.style.display = 'flex';
                if (stopBtn) stopBtn.style.display = 'none';
            }
        }

        function _tryCordovaScanner() {
            if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.barcodeScanner) {
                cordova.plugins.barcodeScanner.scan(
                    function(result) {
                        if (!result.cancelled) {
                            if (resultText) resultText.textContent = result.text;
                            if (resultDiv) resultDiv.style.display = 'block';
                            Utils.showSuccess('Scanned: ' + result.text);
                        }
                        if (startBtn) startBtn.style.display = 'flex';
                        if (stopBtn) stopBtn.style.display = 'none';
                    },
                    function(error) {
                        Utils.showErrorToast('Scanner error: ' + error);
                        if (startBtn) startBtn.style.display = 'flex';
                        if (stopBtn) stopBtn.style.display = 'none';
                    }
                );
            } else {
                Utils.showInfo('No scanner plugin available');
                if (startBtn) startBtn.style.display = 'flex';
                if (stopBtn) stopBtn.style.display = 'none';
            }
        }

        function stopScanner() {
            if (html5QrCode) {
                html5QrCode.stop().then(function() {
                    if (placeholder) placeholder.style.display = 'flex';
                    if (readerEl) readerEl.style.display = 'none';
                    if (overlay) overlay.style.display = 'none';
                    if (startBtn) startBtn.style.display = 'flex';
                    if (stopBtn) stopBtn.style.display = 'none';
                }).catch(function(err) {
                    console.warn('Stop error:', err);
                });
            } else {
                if (startBtn) startBtn.style.display = 'flex';
                if (stopBtn) stopBtn.style.display = 'none';
            }
        }

        if (startBtn) startBtn.addEventListener('click', startScanner);
        if (stopBtn) stopBtn.addEventListener('click', stopScanner);
    },
    destroy: function() {
        // Cleanup scanner if running
        if (window.html5QrCodeInstance) {
            try { window.html5QrCodeInstance.stop(); } catch(e) {}
        }
    }
};
