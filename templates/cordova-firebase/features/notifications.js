/* ============================================================
   Feature: Notifications
   FCM notification handler, permission request, token display
   ============================================================ */

window.Feature_notifications = {
    render: function() {
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;padding:var(--space-md);">' +
                '<div style="text-align:center;padding:var(--space-md) 0;">' +
                    '<div style="font-size:48px;margin-bottom:8px;">&#x1F514;</div>' +
                    '<h3 style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + App.t('notifications.title') + '</h3>' +
                '</div>' +

                // Permission request
                '<div class="card" style="display:flex;align-items:center;gap:12px;margin-bottom:var(--space-md);">' +
                    '<div style="flex:1;">' +
                        '<div style="font-size:var(--font-size-body);font-weight:500;color:var(--color-text);">' + App.t('notifications.enablePush') + '</div>' +
                        '<div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('notifications.permissionRequired') + '</div>' +
                    '</div>' +
                    '<button id="notif-request-btn" class="btn btn-primary" style="white-space:nowrap;">' + App.t('notifications.requestPermission') + '</button>' +
                '</div>' +

                // FCM Token
                '<div class="card" style="margin-bottom:var(--space-md);">' +
                    '<div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);margin-bottom:4px;">' + App.t('notifications.fcmToken') + '</div>' +
                    '<div id="notif-token" style="font-size:11px;color:var(--color-text-medium);word-break:break-all;font-family:monospace;padding:8px;background:var(--color-bg-input);border-radius:var(--radius-sm);margin-bottom:8px;">' +
                        'Not available. Request permission first.' +
                    '</div>' +
                    '<button id="notif-copy-token" class="btn btn-secondary" style="width:100%;">' + App.t('notifications.copyToken') + '</button>' +
                '</div>' +

                // Notification list
                '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:var(--space-sm);">' + App.t('notifications.title') + '</h3>' +
                '<div id="notif-list" style="flex:1;">' +
                    '<div style="padding:var(--space-lg);text-align:center;color:var(--color-text-medium);font-size:var(--font-size-footnote);">' + App.t('notifications.noNotifications') + '</div>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        var tokenDisplay = document.getElementById('notif-token');
        var requestBtn = document.getElementById('notif-request-btn');
        var copyBtn = document.getElementById('notif-copy-token');
        var notifList = document.getElementById('notif-list');

        // Request notification permission
        if (requestBtn) {
            requestBtn.addEventListener('click', function() {
                requestBtn.disabled = true;
                requestBtn.textContent = 'Requesting...';

                // Try FCM first
                if (typeof firebase !== 'undefined' && firebase.messaging) {
                    var messaging = firebase.messaging();

                    // Request permission (browser)
                    if (typeof Notification !== 'undefined') {
                        Notification.requestPermission().then(function(permission) {
                            if (permission === 'granted') {
                                // Get FCM token
                                messaging.getToken({ vapidKey: 'YOUR_VAPID_KEY' }).then(function(token) {
                                    if (tokenDisplay) tokenDisplay.textContent = token;
                                    Utils.setStorage('fcm_token', token);
                                    Utils.showSuccess('Notifications enabled! Token obtained.');
                                    requestBtn.textContent = 'Enabled';
                                }).catch(function(err) {
                                    Utils.showErrorToast('Token error: ' + err.message);
                                    requestBtn.disabled = false;
                                    requestBtn.textContent = 'Request Permission';
                                });

                                // Listen for messages
                                messaging.onMessage(function(payload) {
                                    var notification = payload.notification || {};
                                    var title = notification.title || 'New Notification';
                                    var body = notification.body || '';
                                    Utils.showInfo(title + ': ' + body);
                                    addNotificationToList(title, body);
                                });
                            } else {
                                Utils.showErrorToast('Permission denied');
                                requestBtn.disabled = false;
                                requestBtn.textContent = 'Request Permission';
                            }
                        });
                    } else {
                        // Cordova FCM plugin
                        if (typeof FCMPlugin !== 'undefined') {
                            FCMPlugin.getToken(function(token) {
                                if (tokenDisplay) tokenDisplay.textContent = token;
                                Utils.setStorage('fcm_token', token);
                                Utils.showSuccess('FCM token obtained');
                                requestBtn.textContent = 'Enabled';
                            }, function(err) {
                                Utils.showErrorToast('FCM error: ' + err);
                                requestBtn.disabled = false;
                                requestBtn.textContent = 'Request Permission';
                            });

                            FCMPlugin.onNotification(function(data) {
                                if (data.wasTapped) {
                                    // Notification tapped from background
                                } else {
                                    Utils.showInfo(data.title || 'Notification: ' + (data.body || ''));
                                    addNotificationToList(data.title || 'Notification', data.body || '');
                                }
                            });
                        } else {
                            Utils.showInfo('FCM plugin not available');
                            requestBtn.disabled = false;
                            requestBtn.textContent = 'Not Available';
                        }
                    }
                } else {
                    Utils.showInfo('Firebase Messaging not loaded');
                    requestBtn.disabled = false;
                    requestBtn.textContent = 'Not Available';
                }
            });
        }

        // Copy token
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                if (tokenDisplay && tokenDisplay.textContent && tokenDisplay.textContent.indexOf('Not available') === -1) {
                    Utils.copyToClipboard(tokenDisplay.textContent);
                    Utils.showSuccess(App.t('notifications.tokenCopied'));
                } else {
                    Utils.showInfo('No token available to copy');
                }
            });
        }

        function addNotificationToList(title, body) {
            if (!notifList) return;
            // Remove empty state
            var emptyState = notifList.querySelector('div[style*="padding:var(--space-lg)"]');
            if (emptyState) notifList.innerHTML = '';

            var item = document.createElement('div');
            item.className = 'list-item';
            item.style.cursor = 'default';
            item.innerHTML = '' +
                '<div style="width:40px;height:40px;border-radius:50%;background:var(--color-primary-light);display:flex;align-items:center;justify-content:center;margin-right:12px;color:var(--color-primary);font-size:18px;">&#x1F514;</div>' +
                '<div class="item-content">' +
                    '<div class="item-title">' + title + '</div>' +
                    '<div class="item-subtitle">' + body + '</div>' +
                '</div>';
            notifList.insertBefore(item, notifList.firstChild);
        }
    },
    destroy: function() {}
};
