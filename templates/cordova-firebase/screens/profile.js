/* ============================================================
   Screen: Profile
   User info, edit fields, avatar
   ============================================================ */

App.registerScreen('profile', {
    render: function() {
        var user = Auth.getCurrentUser();
        var name = user ? (user.displayName || user.email || 'User') : 'User';
        var email = user ? user.email : '';
        var phone = user ? user.phoneNumber : '';
        var avatarUrl = user ? user.photoURL : '';
        var initials = name.charAt(0).toUpperCase();
        var isVerified = user ? user.emailVerified : false;

        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                '<div class="nav-bar">' +
                    '<button class="nav-back" id="profile-back">&#x2190; ' + App.t('app.back') + '</button>' +
                    '<div class="nav-title">' + App.t('profile.title') + '</div>' +
                '</div>' +

                '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;">' +
                    // Avatar section
                    '<div style="text-align:center;padding:var(--space-xl) var(--space-md);">' +
                        '<div id="profile-avatar" class="avatar" style="width:80px;height:80px;font-size:32px;margin:0 auto 12px;cursor:pointer;">' +
                            (avatarUrl ? '<img src="' + avatarUrl + '" alt="Avatar" />' : initials) +
                        '</div>' +
                        '<h2 style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + name + '</h2>' +
                        '<p style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + email + '</p>' +
                        '<div style="margin-top:8px;">' +
                            (isVerified
                                ? '<span class="badge badge-success">' + App.t('profile.verified') + '</span>'
                                : '<span class="badge" style="background:rgba(218,54,51,0.15);color:var(--color-error);">' + App.t('profile.notVerified') + '</span>') +
                        '</div>' +
                    '</div>' +

                    // Edit form
                    '<div style="padding:var(--space-md);">' +
                        '<div class="input-group">' +
                            '<label for="profile-name">' + App.t('profile.nameLabel') + '</label>' +
                            '<input type="text" id="profile-name" class="input-field" value="' + name + '" />' +
                        '</div>' +
                        '<div class="input-group">' +
                            '<label for="profile-email">' + App.t('profile.emailLabel') + '</label>' +
                            '<input type="email" id="profile-email" class="input-field" value="' + email + '" readonly style="opacity:0.7;background:var(--color-bg-input);" />' +
                        '</div>' +
                        '<div class="input-group">' +
                            '<label for="profile-phone">' + App.t('profile.phoneLabel') + '</label>' +
                            '<input type="tel" id="profile-phone" class="input-field" value="' + phone + '" placeholder="' + App.t('login.phonePlaceholder') + '" />' +
                        '</div>' +

                        '<div id="profile-error" style="display:none;padding:12px;background:rgba(218,54,51,0.1);border:1px solid rgba(218,54,51,0.3);border-radius:var(--radius-sm);margin-bottom:var(--space-md);color:var(--color-error);font-size:var(--font-size-footnote);"></div>' +

                        '<button id="profile-save" class="btn btn-primary" style="width:100%;margin-bottom:12px;">' + App.t('profile.saveButton') + '</button>' +
                        '<button id="profile-logout" class="btn btn-danger" style="width:100%;">' + App.t('profile.logoutButton') + '</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        // Back
        document.getElementById('profile-back').addEventListener('click', function() { App.goBack(); });

        // Save
        document.getElementById('profile-save').addEventListener('click', function() {
            var nameInput = document.getElementById('profile-name');
            var phoneInput = document.getElementById('profile-phone');
            var errorDiv = document.getElementById('profile-error');

            if (errorDiv) errorDiv.style.display = 'none';

            var name = nameInput ? nameInput.value.trim() : '';
            var phone = phoneInput ? phoneInput.value.trim() : '';

            if (!name) {
                if (errorDiv) { errorDiv.textContent = 'Name is required'; errorDiv.style.display = 'block'; }
                return;
            }

            var btn = document.getElementById('profile-save');
            btn.disabled = true;
            btn.textContent = 'Saving...';

            Auth.updateProfile({ displayName: name, phoneNumber: phone })
                .then(function(msg) {
                    Utils.showSuccess(App.t('profile.saveSuccess'));
                    btn.disabled = false;
                    btn.textContent = App.t('profile.saveButton');
                    // Refresh screen
                    App.showScreen('profile');
                })
                .catch(function(err) {
                    if (errorDiv) { errorDiv.textContent = err.message; errorDiv.style.display = 'block'; }
                    btn.disabled = false;
                    btn.textContent = App.t('profile.saveButton');
                });
        });

        // Logout
        document.getElementById('profile-logout').addEventListener('click', function() {
            App.showDialog(App.t('profile.logoutConfirm'), '', [
                { text: App.t('app.cancel') },
                { text: App.t('profile.logoutButton'), danger: true, onClick: function() {
                    Auth.logout().then(function() {
                        Utils.clearStorage();
                        Utils.setStorage('onboarding_done', true);
                        App.showScreen('login');
                    }).catch(function(err) {
                        Utils.showErrorToast('Logout error: ' + err.message);
                    });
                }}
            ]);
        });

        // Avatar click (change photo)
        var avatar = document.getElementById('profile-avatar');
        if (avatar) {
            avatar.addEventListener('click', function() {
                // Open camera/gallery to change avatar
                if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.camera) {
                    navigator.camera.getPicture(function(imageData) {
                        // Update avatar - would need Firebase Storage upload
                        Utils.showInfo('Avatar upload feature - implement with Firebase Storage');
                    }, function(err) {
                        Utils.showErrorToast('Camera error');
                    }, {
                        quality: 60,
                        destinationType: Camera.DestinationType.DATA_URL,
                        encodingType: Camera.EncodingType.JPEG,
                        correctOrientation: true
                    });
                } else {
                    Utils.showInfo('Camera not available in browser');
                }
            });
        }
    },
    destroy: function() {}
});
