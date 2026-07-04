/**
 * MyApp - Utility Functions
 * Shared helpers for date, number, validation, localStorage, and toast notifications.
 */

var Utils = (function() {
    'use strict';

    // ==================== Date & Time (BD Timezone) ====================

    /**
     * Get current date/time in Bangladesh Time (UTC+6)
     * @param {string} format - 'iso' | 'date' | 'datetime' | 'time' | 'relative'
     * @returns {string}
     */
    function getBDTime(format) {
        var now = new Date();
        var bdOffset = 6 * 60; // UTC+6 in minutes
        var localOffset = now.getTimezoneOffset();
        var bdTime = new Date(now.getTime() + (bdOffset + localOffset) * 60000);
        return formatDate(bdTime, format || 'datetime');
    }

    /**
     * Format a date object
     * @param {Date} date
     * @param {string} format
     * @returns {string}
     */
    function formatDate(date, format) {
        if (!date) return '';
        var d = new Date(date);
        var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
        var year = d.getFullYear();
        var month = pad(d.getMonth() + 1);
        var day = pad(d.getDate());
        var hours = pad(d.getHours());
        var minutes = pad(d.getMinutes());
        var seconds = pad(d.getSeconds());

        switch (format) {
            case 'iso': return d.toISOString();
            case 'date': return year + '-' + month + '-' + day;
            case 'datetime': return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
            case 'time': return hours + ':' + minutes + ':' + seconds;
            case 'relative': return getRelativeTime(d);
            case 'short': return day + '/' + month + '/' + year;
            default: return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
        }
    }

    /**
     * Get relative time string (e.g., "2 minutes ago")
     * @param {Date} date
     * @returns {string}
     */
    function getRelativeTime(date) {
        var now = new Date();
        var diff = Math.floor((now - date) / 1000);
        if (diff < 0) return 'just now';
        if (diff < 60) return diff + ' seconds ago';
        if (diff < 3600) return Math.floor(diff / 60) + ' minutes ago';
        if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
        if (diff < 2592000) return Math.floor(diff / 86400) + ' days ago';
        return formatDate(date, 'date');
    }

    // ==================== Number Formatting ====================

    /**
     * Format number with commas (BD/Indian style)
     * @param {number} num
     * @returns {string}
     */
    function formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Format currency in BDT
     * @param {number} amount
     * @returns {string}
     */
    function formatBDT(amount) {
        if (amount === null || amount === undefined) return '৳0';
        return '৳' + formatNumber(Math.round(amount));
    }

    /**
     * Format USD
     * @param {number} amount
     * @returns {string}
     */
    function formatUSD(amount) {
        if (amount === null || amount === undefined) return '$0.00';
        return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // ==================== Validation ====================

    /**
     * Validate email format
     * @param {string} email
     * @returns {boolean}
     */
    function isValidEmail(email) {
        if (!email) return false;
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.trim());
    }

    /**
     * Validate Bangladeshi phone number
     * @param {string} phone
     * @returns {boolean}
     */
    function isValidBDPhone(phone) {
        if (!phone) return false;
        var clean = phone.replace(/[\s\-\(\)]/g, '');
        // 01XXXXXXXXX or +8801XXXXXXXXX
        var re = /^(?:\+?880)?1[3-9]\d{8}$/;
        return re.test(clean);
    }

    /**
     * Validate that a string is non-empty
     * @param {string} val
     * @returns {boolean}
     */
    function isNotEmpty(val) {
        return val !== null && val !== undefined && val.toString().trim().length > 0;
    }

    /**
     * Validate password strength (min 6 chars)
     * @param {string} password
     * @returns {object} { valid: boolean, message: string }
     */
    function validatePassword(password) {
        if (!password || password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters' };
        }
        return { valid: true, message: '' };
    }

    /**
     * Validate a number
     * @param {*} val
     * @param {object} opts - { min, max }
     * @returns {boolean}
     */
    function isValidNumber(val, opts) {
        var num = parseFloat(val);
        if (isNaN(num)) return false;
        opts = opts || {};
        if (opts.min !== undefined && num < opts.min) return false;
        if (opts.max !== undefined && num > opts.max) return false;
        return true;
    }

    // ==================== LocalStorage Wrapper ====================

    /**
     * Safe localStorage get
     * @param {string} key
     * @param {*} defaultVal
     * @returns {*}
     */
    function getStorage(key, defaultVal) {
        try {
            var val = localStorage.getItem(key);
            if (val === null) return defaultVal !== undefined ? defaultVal : null;
            return JSON.parse(val);
        } catch (e) {
            console.warn('Storage read error for key:', key, e);
            return defaultVal !== undefined ? defaultVal : null;
        }
    }

    /**
     * Safe localStorage set
     * @param {string} key
     * @param {*} val
     * @returns {boolean}
     */
    function setStorage(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
            return true;
        } catch (e) {
            console.warn('Storage write error for key:', key, e);
            return false;
        }
    }

    /**
     * Safe localStorage remove
     * @param {string} key
     */
    function removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Storage remove error for key:', key, e);
        }
    }

    /**
     * Clear all app storage
     */
    function clearStorage() {
        try {
            var keysToKeep = ['onboarding_done'];
            var keys = Object.keys(localStorage);
            keys.forEach(function(k) {
                if (keysToKeep.indexOf(k) === -1) {
                    localStorage.removeItem(k);
                }
            });
        } catch (e) {
            console.warn('Storage clear error:', e);
        }
    }

    // ==================== Toast Notifications ====================

    /**
     * Show a toast notification
     * @param {string} message
     * @param {string} type - 'success' | 'error' | 'info' | 'warning'
     * @param {number} duration - ms
     */
    function showToast(message, type, duration) {
        type = type || 'info';
        duration = duration || 3000;
        var container = document.getElementById('toast-container');
        if (!container) return;

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration);
    }

    /**
     * Show success toast
     */
    function showSuccess(msg) { showToast(msg, 'success'); }

    /**
     * Show error toast
     */
    function showErrorToast(msg) { showToast(msg, 'error', 5000); }

    /**
     * Show info toast
     */
    function showInfo(msg) { showToast(msg, 'info'); }

    // ==================== DOM Helpers ====================

    /**
     * Create HTML element from string
     * @param {string} html
     * @returns {HTMLElement}
     */
    function createElement(html) {
        var div = document.createElement('div');
        div.innerHTML = html.trim();
        return div.firstChild;
    }

    /**
     * Empty an element's children
     * @param {HTMLElement} el
     */
    function emptyElement(el) {
        while (el.firstChild) { el.removeChild(el.firstChild); }
    }

    /**
     * Debounce function
     */
    function debounce(fn, delay) {
        var timer;
        return function() {
            var args = arguments;
            var ctx = this;
            clearTimeout(timer);
            timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
        };
    }

    /**
     * Throttle function
     */
    function throttle(fn, limit) {
        var inThrottle = false;
        return function() {
            var args = arguments;
            var ctx = this;
            if (!inThrottle) {
                fn.apply(ctx, args);
                inThrottle = true;
                setTimeout(function() { inThrottle = false; }, limit);
            }
        };
    }

    // ==================== Network Check ====================

    /**
     * Check internet connectivity
     * @returns {boolean}
     */
    function isOnline() {
        if (typeof navigator !== 'undefined' && navigator.onLine !== undefined) {
            return navigator.onLine;
        }
        return true; // Assume online if not available
    }

    // ==================== Platform Detection ====================

    function isAndroid() {
        return navigator.userAgent && /android/i.test(navigator.userAgent);
    }

    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    function isCordova() {
        return typeof cordova !== 'undefined';
    }

    // ==================== Copy to Clipboard ====================

    function copyToClipboard(text) {
        if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.clipboard) {
            cordova.plugins.clipboard.copy(text);
            return true;
        }
        // Fallback
        try {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (e) {
            return false;
        }
    }

    // ==================== Public API ====================

    return {
        getBDTime: getBDTime,
        formatDate: formatDate,
        getRelativeTime: getRelativeTime,
        formatNumber: formatNumber,
        formatBDT: formatBDT,
        formatUSD: formatUSD,
        isValidEmail: isValidEmail,
        isValidBDPhone: isValidBDPhone,
        isNotEmpty: isNotEmpty,
        validatePassword: validatePassword,
        isValidNumber: isValidNumber,
        getStorage: getStorage,
        setStorage: setStorage,
        removeStorage: removeStorage,
        clearStorage: clearStorage,
        showToast: showToast,
        showSuccess: showSuccess,
        showErrorToast: showErrorToast,
        showInfo: showInfo,
        createElement: createElement,
        emptyElement: emptyElement,
        debounce: debounce,
        throttle: throttle,
        isOnline: isOnline,
        isAndroid: isAndroid,
        isIOS: isIOS,
        isCordova: isCordova,
        copyToClipboard: copyToClipboard
    };
})();

// Alias for convenience
var BDTime = Utils.getBDTime;
var T = Utils.showToast;
