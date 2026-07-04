/* ============================================================
   Feature: Camera
   Camera capture + gallery pick + image preview + canvas compression
   ============================================================ */

window.Feature_camera = {
    render: function() {
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;padding:var(--space-md);">' +
                '<div style="text-align:center;padding:var(--space-md) 0;">' +
                    '<div style="font-size:48px;margin-bottom:8px;">&#x1F4F7;</div>' +
                    '<h3 style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + App.t('camera.title') + '</h3>' +
                '</div>' +

                // Image preview area
                '<div id="camera-preview" style="flex:1;min-height:250px;background:var(--color-bg-input);border-radius:var(--radius-md);border:2px dashed var(--color-border);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-md);overflow:hidden;">' +
                    '<span style="color:var(--color-text-medium);font-size:var(--font-size-subhead);">' + App.t('camera.preview') + '</span>' +
                '</div>' +

                // Image info
                '<div id="camera-info" style="display:none;margin-bottom:var(--space-md);padding:var(--space-sm);background:var(--color-bg-card);border-radius:var(--radius-sm);border:1px solid var(--color-border);">' +
                    '<div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">Size: <span id="camera-size">0 KB</span></div>' +
                    '<div style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">Dimensions: <span id="camera-dims">0x0</span></div>' +
                '</div>' +

                // Action buttons
                '<div style="display:flex;gap:8px;">' +
                    '<button id="camera-capture-btn" class="btn btn-primary" style="flex:1;">' + App.t('camera.capture') + '</button>' +
                    '<button id="camera-gallery-btn" class="btn btn-secondary" style="flex:1;">' + App.t('camera.gallery') + '</button>' +
                '</div>' +
                '<div style="display:flex;gap:8px;margin-top:8px;">' +
                    '<button id="camera-compress-btn" class="btn btn-secondary" style="flex:1;">' + App.t('camera.compressing') + '</button>' +
                    '<button id="camera-save-btn" class="btn btn-primary" style="flex:1;display:none;">' + App.t('camera.save') + '</button>' +
                '</div>' +

                '<input type="file" id="camera-file-input" accept="image/*" style="display:none;" />' +
                '<input type="hidden" id="camera-image-data" />' +
            '</div>';
    },
    init: function() {
        var preview = document.getElementById('camera-preview');
        var info = document.getElementById('camera-info');
        var sizeEl = document.getElementById('camera-size');
        var dimsEl = document.getElementById('camera-dims');
        var imageData = document.getElementById('camera-image-data');
        var fileInput = document.getElementById('camera-file-input');
        var captureBtn = document.getElementById('camera-capture-btn');
        var galleryBtn = document.getElementById('camera-gallery-btn');
        var compressBtn = document.getElementById('camera-compress-btn');
        var saveBtn = document.getElementById('camera-save-btn');

        var currentImageData = null;

        function displayImage(src) {
            if (preview) {
                preview.innerHTML = '<img src="' + src + '" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:var(--radius-md);" />';
            }
            currentImageData = src;
            if (imageData) imageData.value = src;

            // Show info
            if (info) info.style.display = 'block';
            if (saveBtn) saveBtn.style.display = 'flex';

            // Estimate size from base64
            if (sizeEl) {
                var sizeKB = Math.round(src.length * 3 / 4 / 1024);
                sizeEl.textContent = sizeKB + ' KB';
            }

            // Get dimensions from a temp img
            var img = new Image();
            img.onload = function() {
                if (dimsEl) dimsEl.textContent = img.width + 'x' + img.height;
            };
            img.src = src;
        }

        // Compress image
        function compressImage(src, quality, maxWidth) {
            quality = quality || 0.7;
            maxWidth = maxWidth || 1920;
            return new Promise(function(resolve) {
                var img = new Image();
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    var width = img.width;
                    var height = img.height;

                    if (width > maxWidth) {
                        height = Math.round(height * maxWidth / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    var compressed = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressed);
                };
                img.src = src;
            });
        }

        // Capture from camera
        if (captureBtn) {
            captureBtn.addEventListener('click', function() {
                if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.camera) {
                    navigator.camera.getPicture(function(imageDataUrl) {
                        displayImage('data:image/jpeg;base64,' + imageDataUrl);
                    }, function(err) {
                        Utils.showErrorToast(App.t('camera.errorCamera') + ': ' + err);
                    }, {
                        quality: 80,
                        destinationType: Camera.DestinationType.DATA_URL,
                        encodingType: Camera.EncodingType.JPEG,
                        correctOrientation: true,
                        saveToPhotoAlbum: false
                    });
                } else {
                    // Fallback to file input
                    if (fileInput) fileInput.click();
                }
            });
        }

        // Gallery
        if (galleryBtn) {
            galleryBtn.addEventListener('click', function() {
                if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.camera) {
                    navigator.camera.getPicture(function(imageDataUrl) {
                        displayImage('data:image/jpeg;base64,' + imageDataUrl);
                    }, function(err) {
                        Utils.showErrorToast(App.t('camera.errorGallery') + ': ' + err);
                    }, {
                        quality: 80,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                        encodingType: Camera.EncodingType.JPEG
                    });
                } else {
                    if (fileInput) fileInput.click();
                }
            });
        }

        // File input fallback
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(ev) { displayImage(ev.target.result); };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Compress
        if (compressBtn) {
            compressBtn.addEventListener('click', function() {
                if (!currentImageData) {
                    Utils.showInfo('Take a photo first');
                    return;
                }
                compressBtn.disabled = true;
                compressBtn.textContent = 'Compressing...';
                compressImage(currentImageData, 0.5, 1200).then(function(compressed) {
                    displayImage(compressed);
                    compressBtn.disabled = false;
                    compressBtn.textContent = App.t('camera.compressing');
                    Utils.showSuccess('Image compressed');
                });
            });
        }

        // Save (placeholder - would upload to Firebase Storage)
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                if (!currentImageData) {
                    Utils.showInfo('No image to save');
                    return;
                }
                // Would upload to Firebase Storage here
                Utils.showSuccess('Image saved (local)');
            });
        }
    },
    destroy: function() {}
};
