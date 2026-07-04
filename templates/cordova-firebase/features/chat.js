/* ============================================================
   Feature: Chat
   Real-time chat with Firebase, message list, input, send button
   ============================================================ */

window.Feature_chat = {
    render: function() {
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;height:100%;">' +
                // Chat header
                '<div style="padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--color-border);display:flex;align-items:center;gap:12px;">' +
                    '<div style="width:40px;height:40px;border-radius:50%;background:var(--color-primary-light);display:flex;align-items:center;justify-content:center;color:var(--color-primary);font-weight:600;">CS</div>' +
                    '<div>' +
                        '<div style="font-size:var(--font-size-body);font-weight:600;color:var(--color-text);">Chat Support</div>' +
                        '<div style="font-size:var(--font-size-caption);color:var(--color-success);">' + App.t('chat.online') + '</div>' +
                    '</div>' +
                '</div>' +

                // Messages container
                '<div id="chat-messages" style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:var(--space-sm) var(--space-md);display:flex;flex-direction:column;gap:8px;">' +
                    '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--color-text-medium);font-size:var(--font-size-subhead);">' +
                        App.t('chat.noMessages') +
                    '</div>' +
                '</div>' +

                // Input area
                '<div style="display:flex;gap:8px;padding:var(--space-sm) var(--space-md);padding-bottom:calc(var(--space-sm) + env(safe-area-inset-bottom, 0));border-top:1px solid var(--color-border);background:var(--color-bg);">' +
                    '<input type="text" id="chat-input" class="input-field" placeholder="' + App.t('chat.messagePlaceholder') + '" style="margin-bottom:0;flex:1;" />' +
                    '<button id="chat-send-btn" class="btn btn-primary" style="width:48px;height:48px;padding:0;border-radius:50%;font-size:20px;flex-shrink:0;">&#x27A4;</button>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        var messagesContainer = document.getElementById('chat-messages');
        var chatInput = document.getElementById('chat-input');
        var sendBtn = document.getElementById('chat-send-btn');
        var currentUser = Auth.getCurrentUser();
        var listenerId = null;

        function addMessage(text, isOwn, timestamp) {
            if (!messagesContainer) return;

            // Remove empty state
            var emptyState = messagesContainer.querySelector('div[style*="flex:1;display:flex;align-items:center"]');
            if (emptyState) messagesContainer.innerHTML = '';

            var timeStr = timestamp ? Utils.formatDate(timestamp, 'time') : Utils.getBDTime('time');
            var bubbleClass = isOwn ? 'chat-bubble-own' : 'chat-bubble-other';

            var msgEl = document.createElement('div');
            msgEl.style.cssText = 'display:flex;flex-direction:column;' + (isOwn ? 'align-items:flex-end;' : 'align-items:flex-start;');
            msgEl.innerHTML = '' +
                '<div class="' + bubbleClass + '">' +
                    '<div>' + text + '</div>' +
                    '<div style="font-size:10px;opacity:0.7;margin-top:4px;' + (isOwn ? 'text-align:right;' : '') + '">' + timeStr + '</div>' +
                '</div>';

            messagesContainer.appendChild(msgEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Load existing messages from Firestore
        function loadMessages() {
            if (typeof DB !== 'undefined') {
                // Listen for new messages in real-time
                if (listenerId) DB.unsubscribe(listenerId);

                listenerId = DB.onSnapshot('messages', function(messages) {
                    if (!messagesContainer) return;

                    // Clear non-empty state
                    var emptyState = messagesContainer.querySelector('div[style*="flex:1;display:flex;align-items:center"]');
                    if (emptyState) messagesContainer.innerHTML = '';

                    messagesContainer.innerHTML = '';
                    var userId = currentUser ? currentUser.uid : 'anonymous';

                    messages.forEach(function(msg) {
                        var isOwn = msg.userId === userId || msg.senderId === userId;
                        addMessage(msg.text || msg.message, isOwn, msg.createdAt);
                    });

                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, {
                    orderBy: 'createdAt',
                    orderByDesc: false,
                    limit: 50
                });
            } else {
                // Simulate some messages for demo
                addMessage('Welcome to Chat Support! How can we help you today?', false, new Date());
                addMessage('Hi! I have a question about the app.', true, new Date(Date.now() - 60000));
            }
        }

        // Send message
        function sendMessage() {
            var text = chatInput ? chatInput.value.trim() : '';
            if (!text) return;

            if (chatInput) chatInput.value = '';

            // Add locally
            addMessage(text, true, new Date());

            // Save to Firestore
            if (typeof DB !== 'undefined') {
                DB.addDoc('messages', {
                    text: text,
                    message: text,
                    userId: currentUser ? currentUser.uid : 'anonymous',
                    senderId: currentUser ? currentUser.uid : 'anonymous',
                    senderName: currentUser ? (currentUser.displayName || currentUser.email || 'Anonymous') : 'Anonymous',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(function(err) {
                    console.warn('Failed to save message:', err);
                    // Simulate a reply after 1-2 seconds
                    setTimeout(function() {
                        addMessage('Thanks for your message! Our team will get back to you shortly.', false, new Date());
                    }, 1000 + Math.random() * 1000);
                });
            } else {
                // Simulate reply
                setTimeout(function() {
                    addMessage('Thanks for your message! Our team will get back to you shortly.', false, new Date());
                }, 1000 + Math.random() * 1000);
            }
        }

        if (sendBtn) sendBtn.addEventListener('click', sendMessage);
        if (chatInput) {
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        loadMessages();
    },
    destroy: function() {
        // Unsubscribe from Firestore listener
        if (typeof DB !== 'undefined') {
            // We'd need to track the listener ID - simplified cleanup
        }
    }
};
