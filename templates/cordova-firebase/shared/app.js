/**
 * MyApp - Application Core
 * Screen manager/router with showScreen(), loadFeature(), state management, and i18n.
 */

var App = (function() {
    'use strict';

    // ==================== State ====================

    var _state = {
        currentScreen: null,
        previousScreen: null,
        currentLanguage: 'en',
        theme: 'dark',
        user: null,
        isInitialized: false,
        cachedData: {},
        screenHistory: []
    };

    var _listeners = {};

    // Navigation stack (max 10)
    var MAX_HISTORY = 10;

    // ==================== Initialization ====================

    function init() {
        if (_state.isInitialized) return;

        console.log('MyApp v' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '?') + ' initializing...');

        // Hide splash screen
        var splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('hidden');
            setTimeout(function() {
                if (splash.parentNode) splash.parentNode.removeChild(splash);
            }, 500);
        }

        // Load saved settings
        _state.currentLanguage = Utils.getStorage('app_language', 'en');
        _state.theme = Utils.getStorage('app_theme', 'dark');

        // Initialize modules
        if (typeof DB !== 'undefined') DB.init();
        if (typeof Auth !== 'undefined') {
            Auth.init().then(function(user) {
                _state.user = user;
                _startApp();
            }).catch(function() {
                _startApp();
            });
        } else {
            _startApp();
        }

        _state.isInitialized = true;
    }

    function _startApp() {
        // Apply saved theme
        if (typeof ThemeManager !== 'undefined') {
            ThemeManager.apply(_state.theme);
        }

        // Check onboarding
        var onboardingDone = Utils.getStorage('onboarding_done', false);
        if (!onboardingDone) {
            showScreen('onboarding');
        } else if (!Auth.isLoggedIn()) {
            showScreen('login');
        } else {
            showScreen('dashboard');
        }
    }

    // ==================== Screen Router ====================

    var _screens = {};

    /**
     * Register a screen
     * @param {string} name
     * @param {object} handlers - { render, init, destroy }
     */
    function registerScreen(name, handlers) {
        _screens[name] = handlers;
    }

    /**
     * Show a screen
     * @param {string} name
     * @param {object} params - Optional params to pass to the screen
     */
    function showScreen(name, params) {
        var appRoot = document.getElementById('app-root');
        if (!appRoot) return;

        // Check if screen exists
        if (!_screens[name]) {
            console.error('Screen not registered:', name);
            Utils.showErrorToast('Screen not found: ' + name);
            return;
        }

        // Destroy current screen
        if (_state.currentScreen && _screens[_state.currentScreen] && _screens[_state.currentScreen].destroy) {
            try {
                _screens[_state.currentScreen].destroy();
            } catch (e) {
                console.warn('Screen destroy error for', _state.currentScreen, e);
            }
        }

        // Track history
        if (_state.currentScreen) {
            _state.previousScreen = _state.currentScreen;
            _state.screenHistory.push(_state.currentScreen);
            if (_state.screenHistory.length > MAX_HISTORY) {
                _state.screenHistory.shift();
            }
        }

        _state.currentScreen = name;
        _state.currentParams = params || {};

        // Render new screen
        try {
            appRoot.innerHTML = '';
            var result = _screens[name].render(params);
            if (typeof result === 'string') {
                appRoot.innerHTML = result;
            } else if (result instanceof HTMLElement) {
                appRoot.appendChild(result);
            }

            // Init the screen
            if (_screens[name].init) {
                _screens[name].init(params);
            }

            // Scroll to top
            appRoot.scrollTop = 0;

        } catch (e) {
            console.error('Screen render error for', name, e);
            appRoot.innerHTML = '<div style="padding:40px;text-align:center;color:#DA3633;">' +
                '<h3>Error Loading Screen</h3>' +
                '<p>' + e.message + '</p>' +
                '<button onclick="App.goBack()" style="margin-top:16px;padding:8px 24px;background:#21262D;color:#E6EDF3;border:1px solid #30363D;border-radius:8px;cursor:pointer;">Go Back</button>' +
                '</div>';
        }

        // Notify listeners
        _emit('screenChange', { screen: name, params: params });
    }

    /**
     * Go back to previous screen
     */
    function goBack() {
        if (_state.screenHistory.length > 0) {
            var prev = _state.screenHistory.pop();
            showScreen(prev);
        } else if (_state.previousScreen) {
            showScreen(_state.previousScreen);
        } else if (Auth.isLoggedIn()) {
            showScreen('dashboard');
        } else {
            showScreen('login');
        }
    }

    /**
     * Get current screen name
     */
    function getCurrentScreen() {
        return _state.currentScreen;
    }

    /**
     * Load a feature module into a container
     * @param {string} featureName
     * @param {HTMLElement|string} container
     */
    function loadFeature(featureName, container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        if (!container) {
            console.error('loadFeature: container not found for', featureName);
            return;
        }

        // Check if feature script exists
        if (typeof window['Feature_' + featureName] !== 'undefined') {
            var feature = window['Feature_' + featureName];
            if (feature.render) {
                container.innerHTML = feature.render();
                if (feature.init) feature.init();
            }
        } else {
            container.innerHTML = '<div style="padding:20px;text-align:center;color:#8B949E;">' +
                'Feature "' + featureName + '" not available' +
                '</div>';
        }
    }

    // ==================== State Management ====================

    function getState(key) {
        if (key) return _state[key];
        return _state;
    }

    function setState(key, value) {
        _state[key] = value;
        _emit('stateChange', { key: key, value: value });
    }

    // ==================== Event System ====================

    function on(event, callback) {
        if (!_listeners[event]) _listeners[event] = [];
        _listeners[event].push(callback);
        return function() {
            var idx = _listeners[event].indexOf(callback);
            if (idx > -1) _listeners[event].splice(idx, 1);
        };
    }

    function _emit(event, data) {
        if (_listeners[event]) {
            _listeners[event].forEach(function(fn) {
                try { fn(data); } catch (e) { console.warn('Event listener error:', e); }
            });
        }
    }

    // ==================== Language / i18n ====================

    var _translations = {};

    /**
     * Set translations and language
     * @param {object} translations - { en: {...}, bn: {...} }
     */
    function setTranslations(translations) {
        _translations = translations;
    }

    /**
     * Set active language
     * @param {string} lang - 'en' | 'bn'
     */
    function setLanguage(lang) {
        _state.currentLanguage = lang;
        Utils.setStorage('app_language', lang);
        _emit('languageChange', lang);

        // Re-render current screen if it has translation keys
        if (_state.currentScreen && _screens[_state.currentScreen]) {
            // Don't auto-re-render to avoid loops, just notify
        }
    }

    /**
     * Get current language
     */
    function getLanguage() {
        return _state.currentLanguage;
    }

    /**
     * Translate a key
     * @param {string} key - Dot-notation key like 'login.title'
     * @param {object} params - Optional interpolation params
     * @returns {string}
     */
    function t(key, params) {
        var lang = _translations[_state.currentLanguage];
        if (!lang) return key;

        var keys = key.split('.');
        var val = lang;
        for (var i = 0; i < keys.length; i++) {
            if (val && val[keys[i]] !== undefined) {
                val = val[keys[i]];
            } else {
                // Fall back to English
                var engVal = _translations['en'];
                if (engVal) {
                    var engResult = engVal;
                    for (var j = 0; j < keys.length; j++) {
                        if (engResult && engResult[keys[j]] !== undefined) {
                            engResult = engResult[keys[j]];
                        } else {
                            return key;
                        }
                    }
                    val = engResult;
                } else {
                    return key;
                }
                break;
            }
        }

        if (typeof val === 'string' && params) {
            // Interpolate {{param}}
            for (var p in params) {
                val = val.replace(new RegExp('\\{\\{' + p + '\\}\\}', 'g'), params[p]);
            }
        }

        return typeof val === 'string' ? val : key;
    }

    // ==================== Dialog Helpers ====================

    function showDialog(title, message, buttons) {
        // Create a modal dialog
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:99990;display:flex;align-items:center;justify-content:center;';

        var dialog = document.createElement('div');
        dialog.style.cssText = 'background:#161B22;border:1px solid #30363D;border-radius:16px;padding:24px;max-width:340px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.4);';

        var titleEl = document.createElement('h3');
        titleEl.style.cssText = 'font-size:18px;font-weight:600;color:#E6EDF3;margin-bottom:12px;';
        titleEl.textContent = title;
        dialog.appendChild(titleEl);

        if (message) {
            var msgEl = document.createElement('p');
            msgEl.style.cssText = 'font-size:14px;color:#8B949E;margin-bottom:20px;line-height:1.5;';
            msgEl.textContent = message;
            dialog.appendChild(msgEl);
        }

        if (buttons && buttons.length > 0) {
            var btnContainer = document.createElement('div');
            btnContainer.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';

            buttons.forEach(function(btn) {
                var button = document.createElement('button');
                button.textContent = btn.text || 'OK';
                button.style.cssText = 'padding:10px 20px;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;' +
                    (btn.primary ? 'background:#238636;color:#fff;' : 'background:#21262D;color:#E6EDF3;border:1px solid #30363D;');
                if (btn.danger) button.style.background = '#DA3633';
                button.onclick = function() {
                    document.body.removeChild(overlay);
                    if (btn.onClick) btn.onClick();
                };
                btnContainer.appendChild(button);
            });
            dialog.appendChild(btnContainer);
        }

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        return overlay; // Return so caller can close programmatically
    }

    // ==================== Public API ====================

    return {
        init: init,
        registerScreen: registerScreen,
        showScreen: showScreen,
        goBack: goBack,
        getCurrentScreen: getCurrentScreen,
        loadFeature: loadFeature,
        getState: getState,
        setState: setState,
        on: on,
        setTranslations: setTranslations,
        setLanguage: setLanguage,
        getLanguage: getLanguage,
        t: t,
        showDialog: showDialog
    };
})();

// Alias
var Trans = App.t;
