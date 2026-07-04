/* ============================================================
   Screen: Form
   Input fields, validation, submit, image upload preview
   ============================================================ */

App.registerScreen('form', {
    render: function(params) {
        var isEdit = params && params.id;
        var title = isEdit ? App.t('form.editTitle') : App.t('form.createTitle');

        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                '<div class="nav-bar">' +
                    '<button class="nav-back" id="form-back">&#x2190; ' + App.t('app.back') + '</button>' +
                    '<div class="nav-title">' + title + '</div>' +
                    (isEdit ? '<span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">#' + params.id.substr(0,8) + '</span>' : '') +
                '</div>' +

                '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:var(--space-md);">' +
                    '<form id="item-form" onsubmit="return false;">' +
                        '<div class="input-group">' +
                            '<label for="form-name">Name <span style="color:var(--color-error);">*</span></label>' +
                            '<input type="text" id="form-name" class="input-field" placeholder="Enter name" required />' +
                        '</div>' +
                        '<div class="input-group">' +
                            '<label for="form-email">Email</label>' +
                            '<input type="email" id="form-email" class="input-field" placeholder="email@example.com" />' +
                        '</div>' +
                        '<div class="input-group">' +
                            '<label for="form-phone">Phone</label>' +
                            '<input type="tel" id="form-phone" class="input-field" placeholder="01XXXXXXXXX" />' +
                        '</div>' +
                        '<div class="input-group">' +
                            '<label for="form-description">Description</label>' +
                            '<textarea id="form-description" class="input-field textarea" placeholder="Enter description..."></textarea>' +
                        '</div>' +
                        '<div class="input-group">' +
                            '<label>' + App.t('form.imageUpload') + '</label>' +
                            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                                '<button type="button" id="form-take-photo" class="btn btn-secondary" style="flex:1;">' + App.t('form.takePhoto') + '</button>' +
                                '<button type="button" id="form-choose-gallery" class="btn btn-secondary" style="flex:1;">' + App.t('form.chooseGallery') + '</button>' +
                            '</div>' +
                            '<div id="form-image-preview" style="display:none;margin-top:8px;position:relative;">' +
                                '<img id="form-image-preview-img" style="width:100%;max-height:200px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--color-border);" />' +
                                '<button type="button" id="form-remove-image" style="position:absolute;top:4px;right:4px;width:28px;height:28px;border-radius:50%;border:none;background:rgba(218,54,51,0.9);color:#fff;cursor:pointer;font-size:14px;">&times;</button>' +
                            '</div>' +
                            '<input type="file" id="form-file-input" accept="image/*" style="display:none;" />' +
                            '<input type="hidden" id="form-image-data" />' +
                        '</div>' +

                        '<div id="form-error" style="display:none;padding:12px;background:rgba(218,54,51,0.1);border:1px solid rgba(218,54,51,0.3);border-radius:var(--radius-sm);margin-bottom:var(--space-md);color:var(--color-error);font-size:var(--font-size-footnote);"></div>' +

                        '<button type="submit" id="form-submit" class="btn btn-primary" style="width:100%;">' + (isEdit ? App.t('form.update') : App.t('form.submit')) + '</button>' +
                    '</form>' +
                '</div>' +
            '</div>';
    },
    init: function(params) {
        var isEdit = params && params.id;
        var editId = isEdit ? params.id : null;

        var form = document.getElementById('item-form');
        var nameInput = document.getElementById('form-name');
        var emailInput = document.getElementById('form-email');
        var phoneInput = document.getElementById('form-phone');
        var descInput = document.getElementById('form-description');
        var imagePreview = document.getElementById('form-image-preview');
        var imagePreviewImg = document.getElementById('form-image-preview-img');
        var imageData = document.getElementById('form-image-data');
        var fileInput = document.getElementById('form-file-input');
        var errorDiv = document.getElementById('form-error');
        var submitBtn = document.getElementById('form-submit');

        // Back
        document.getElementById('form-back').addEventListener('click', function() { App.goBack(); });

        // If editing, load existing data
        if (isEdit && editId) {
            if (typeof DB !== 'undefined') {
                DB.getDoc('items', editId).then(function(item) {
                    if (item) {
                        if (nameInput) nameInput.value = item.name || '';
                        if (emailInput) emailInput.value = item.email || '';
                        if (phoneInput) phoneInput.value = item.phone || '';
                        if (descInput) descInput.value = item.description || '';
                        if (item.imageUrl && imagePreview && imagePreviewImg) {
                            imagePreviewImg.src = item.imageUrl;
                            imagePreview.style.display = 'block';
                            if (imageData) imageData.value = item.imageUrl;
                        }
                    }
                }).catch(function(err) {
                    showError('Error loading item: ' + err.message);
                });
            }
        }

        // Image handling
        function handleImage(src) {
            if (imagePreviewImg) imagePreviewImg.src = src;
            if (imagePreview) imagePreview.style.display = 'block';
            if (imageData) imageData.value = src;
        }

        document.getElementById('form-take-photo').addEventListener('click', function() {
            if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.camera) {
                navigator.camera.getPicture(handleImage, function(err) {
                    Utils.showErrorToast('Camera error: ' + err);
                }, {
                    quality: 70,
                    destinationType: Camera.DestinationType.DATA_URL,
                    encodingType: Camera.EncodingType.JPEG,
                    correctOrientation: true
                });
            } else {
                fileInput.click();
            }
        });

        document.getElementById('form-choose-gallery').addEventListener('click', function() {
            if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.camera) {
                navigator.camera.getPicture(handleImage, function(err) {
                    Utils.showErrorToast('Gallery error: ' + err);
                }, {
                    quality: 70,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType: Camera.EncodingType.JPEG
                });
            } else {
                fileInput.click();
            }
        });

        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(ev) { handleImage(ev.target.result); };
                    reader.readAsDataURL(file);
                }
            });
        }

        document.getElementById('form-remove-image').addEventListener('click', function() {
            if (imagePreview) imagePreview.style.display = 'none';
            if (imageData) imageData.value = '';
            if (fileInput) fileInput.value = '';
        });

        // Submit
        function showError(msg) {
            if (errorDiv) {
                errorDiv.textContent = msg;
                errorDiv.style.display = 'block';
            } else {
                Utils.showErrorToast(msg);
            }
        }

        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();

            var name = nameInput ? nameInput.value.trim() : '';
            var email = emailInput ? emailInput.value.trim() : '';
            var phone = phoneInput ? phoneInput.value.trim() : '';
            var description = descInput ? descInput.value.trim() : '';
            var img = imageData ? imageData.value : '';

            // Validation
            if (!name) {
                showError('Name is required');
                if (nameInput) nameInput.focus();
                return;
            }
            if (email && !Utils.isValidEmail(email)) {
                showError('Invalid email format');
                if (emailInput) emailInput.focus();
                return;
            }
            if (errorDiv) errorDiv.style.display = 'none';

            submitBtn.disabled = true;
            submitBtn.textContent = isEdit ? 'Updating...' : 'Saving...';

            var data = {
                name: name,
                email: email,
                phone: phone,
                description: description,
                imageUrl: img
            };

            var promise;
            if (isEdit && editId) {
                promise = DB.updateDoc('items', editId, data);
            } else {
                promise = DB.addDoc('items', data);
            }

            promise
                .then(function(result) {
                    Utils.showSuccess(isEdit ? App.t('form.successUpdate') : App.t('form.successCreate'));
                    App.showScreen('detail', { id: result.id });
                })
                .catch(function(err) {
                    showError(err.message || App.t('form.errorSubmit'));
                    submitBtn.disabled = false;
                    submitBtn.textContent = isEdit ? App.t('form.update') : App.t('form.submit');
                });
        });
    },
    destroy: function() {}
});
