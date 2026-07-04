/* ============================================================
   Feature: Maps
   Google Maps with marker, GPS getCurrentPosition
   ============================================================ */

window.Feature_maps = {
    render: function() {
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;">' +
                '<div style="text-align:center;padding:var(--space-md);">' +
                    '<h3 style="font-size:var(--font-size-headline);font-weight:600;color:var(--color-text);margin-bottom:4px;">' + App.t('maps.title') + '</h3>' +
                    '<p style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);" id="maps-coords">' + App.t('maps.currentLocation') + '</p>' +
                '</div>' +
                '<div id="map-container" style="flex:1;min-height:300px;margin:var(--space-sm) var(--space-md);border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--color-border);">' +
                    '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-medium);font-size:var(--font-size-subhead);background:var(--color-bg-input);">' +
                        '<div style="text-align:center;">' +
                            '<div style="font-size:40px;margin-bottom:8px;">&#x1F5FA;</div>' +
                            '<div>Map will appear here</div>' +
                            '<div style="font-size:var(--font-size-footnote);">(Google Maps API key required)</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div style="padding:var(--space-md);display:flex;gap:8px;">' +
                    '<button id="maps-current-loc" class="btn btn-primary" style="flex:1;">' + App.t('maps.currentLocation') + '</button>' +
                    '<button id="maps-get-dir" class="btn btn-secondary" style="flex:1;">' + App.t('maps.getDirections') + '</button>' +
                '</div>' +
                '<div style="padding:0 var(--space-md) var(--space-md);">' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:var(--space-sm);background:var(--color-bg-card);border-radius:var(--radius-sm);border:1px solid var(--color-border);">' +
                        '<div><span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('maps.latitude') + '</span><br/><span id="maps-lat" style="font-size:var(--font-size-body);color:var(--color-text);font-weight:500;">--</span></div>' +
                        '<div><span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);">' + App.t('maps.longitude') + '</span><br/><span id="maps-lng" style="font-size:var(--font-size-body);color:var(--color-text);font-weight:500;">--</span></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        var latEl = document.getElementById('maps-lat');
        var lngEl = document.getElementById('maps-lng');
        var coordsEl = document.getElementById('maps-coords');
        var currentLocBtn = document.getElementById('maps-current-loc');

        function updateLocation(lat, lng) {
            if (latEl) latEl.textContent = lat.toFixed(6);
            if (lngEl) lngEl.textContent = lng.toFixed(6);
            if (coordsEl) coordsEl.textContent = lat.toFixed(4) + ', ' + lng.toFixed(4);
        }

        // Get current position
        function getCurrentPosition() {
            if (typeof navigator !== 'undefined' && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(pos) {
                        var lat = pos.coords.latitude;
                        var lng = pos.coords.longitude;
                        updateLocation(lat, lng);
                        Utils.showSuccess('Location updated');
                    },
                    function(err) {
                        Utils.showErrorToast(App.t('maps.locationError') + ' (' + err.message + ')');
                        // Use default Dhaka coordinates
                        updateLocation(23.8103, 90.4125);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
                );
            } else {
                Utils.showInfo('Geolocation not available');
                updateLocation(23.8103, 90.4125);
            }
        }

        if (currentLocBtn) {
            currentLocBtn.addEventListener('click', getCurrentPosition);
        }

        // Try Cordova geolocation plugin
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            // Check if we have a cached position
            var cachedPos = Utils.getStorage('last_location');
            if (cachedPos) {
                updateLocation(cachedPos.lat, cachedPos.lng);
            } else {
                getCurrentPosition();
            }

            // Save position on successful retrieval
            navigator.geolocation.getCurrentPosition(function(pos) {
                Utils.setStorage('last_location', {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            }, function() {}, { timeout: 5000 });
        } else {
            updateLocation(23.8103, 90.4125);
        }

        // Directions button
        var dirBtn = document.getElementById('maps-get-dir');
        if (dirBtn) {
            dirBtn.addEventListener('click', function() {
                var lat = latEl ? latEl.textContent : '23.8103';
                var lng = lngEl ? lngEl.textContent : '90.4125';
                if (lat !== '--' && lng !== '--') {
                    var url = 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng;
                    if (typeof cordova !== 'undefined' && cordova.InAppBrowser) {
                        cordova.InAppBrowser.open(url, '_system');
                    } else {
                        window.open(url, '_blank');
                    }
                }
            });
        }
    },
    destroy: function() {
        // Cleanup
    }
};
