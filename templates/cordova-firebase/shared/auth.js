/**
 * MyApp - Authentication Module
 * Login/logout/session management with Firebase Auth and localStorage persistence.
 */

var Auth = (function() {
    'use strict';

    // ==================== State ====================

    var _currentUser = null;
    var _listeners = [];
    var _isInitialized = false;
    var _authProvider = null; // 'firebase' or 'custom'

    // Session expiry in days
    var SESSION_EXPIRY_DAYS = 30;

    // ==================== Firebase Configuration ====================

    var FIREBASE_CONFIG = {
        apiKey: 'YOUR_API_KEY',
        authDomain: 'YOUR_PROJECT.firebaseapp.com',
        projectId: 'YOUR_PROJECT',
        storageBucket: 'YOUR_PROJECT.appspot.com',
        messagingSenderId: 'YOUR_SENDER_ID',
        appId: 'YOUR_APP_ID',
        measurementId: 'YOUR_MEASUREMENT_ID'
    };

    // ==================== Initialization ====================

    /**
     * Initialize Firebase Auth
     * @param {object} customConfig - Optional custom Firebase config
     * @returns {Promise}
     */
    function init(customConfig) {
        return new Promise(function(resolve, reject) {
            if (_isInitialized) {
                resolve(_currentUser);
                return;
            }

            var config = customConfig || FIREBASE_CONFIG;

            try {
                // Check if Firebase app already exists
                if (firebase.apps.length === 0) {
                    firebase.initializeApp(config);
                }

                // Check for existing session
                var savedSession = Utils.getStorage('auth_session');
                if (savedSession && savedSession.user && savedSession.expiry) {
                    var expiryDate = new Date(savedSession.expiry);
                    if (expiryDate > new Date()) {
                        _currentUser = savedSession.user;
                    } else {
                        Utils.removeStorage('auth_session');
                    }
                }

                _isInitialized = true;

                // Listen for auth state changes
                firebase.auth().onAuthStateChanged(function(user) {
                    if (user) {
                        // Convert Firebase user to our format
                        _currentUser = {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || user.email || '',
                            phoneNumber: user.phoneNumber || '',
                            photoURL: user.photoURL || '',
                            emailVerified: user.emailVerified || false,
                            isAnonymous: user.isAnonymous || false,
                            providerId: user.providerData && user.providerData.length > 0
                                ? user.providerData[0].providerId
                                : 'password',
                            createdAt: user.metadata ? user.metadata.creationTime : null,
                            lastLoginAt: user.metadata ? user.metadata.lastSignInTime : null
                        };
                        _saveSession(_currentUser);
                        _notifyListeners('login', _currentUser);
                    } else {
                        _currentUser = null;
                        Utils.removeStorage('auth_session');
                        _notifyListeners('logout', null);
                    }
                    resolve(_currentUser);
                });

            } catch (e) {
                console.error('Auth init error:', e);
                reject(e);
            }
        });
    }

    // ==================== Session Management ====================

    function _saveSession(user) {
        var expiry = new Date();
        expiry.setDate(expiry.getDate() + SESSION_EXPIRY_DAYS);
        Utils.setStorage('auth_session', {
            user: user,
            expiry: expiry.toISOString()
        });
    }

    /**
     * Get current user
     * @returns {object|null}
     */
    function getCurrentUser() {
        return _currentUser;
    }

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    function isLoggedIn() {
        return _currentUser !== null;
    }

    // ==================== Authentication Methods ====================

    /**
     * Login with email + password
     * @param {string} email
     * @param {string} password
     * @returns {Promise}
     */
    function loginWithEmail(email, password) {
        return new Promise(function(resolve, reject) {
            if (!firebase || !firebase.auth) {
                reject(new Error('Firebase Auth not available'));
                return;
            }
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function(result) {
                    resolve(result.user);
                })
                .catch(function(error) {
                    var msg = _getFirebaseErrorMessage(error.code);
                    reject(new Error(msg));
                });
        });
    }

    /**
     * Login with phone number + password (custom auth via Firestore verification)
     * @param {string} phone
     * @param {string} password
     * @returns {Promise}
     */
    function loginWithPhone(phone, password) {
        return new Promise(function(resolve, reject) {
            // Normalize phone number
            var cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
            if (!cleanPhone.startsWith('+')) {
                cleanPhone = '+880' + cleanPhone.replace(/^0?880?/, '');
            }

            if (!firebase || !firebase.auth) {
                reject(new Error('Firebase Auth not available'));
                return;
            }

            // Try to sign in with phone-linked email or direct phone auth
            // We use Firestore to find user by phone, then email login
            firebase.firestore().collection('users')
                .where('phoneNumber', '==', cleanPhone)
                .limit(1)
                .get()
                .then(function(snapshot) {
                    if (snapshot.empty) {
                        throw new Error('No account found with this phone number');
                    }
                    var userData = snapshot.docs[0].data();
                    if (!userData.email) {
                        throw new Error('This phone number is not linked to an email account');
                    }
                    return firebase.auth().signInWithEmailAndPassword(userData.email, password);
                })
                .then(function(result) {
                    resolve(result.user);
                })
                .catch(function(error) {
                    var msg = _getFirebaseErrorMessage(error.code) || error.message;
                    reject(new Error(msg));
                });
        });
    }

    /**
     * Register with email + password
     * @param {string} email
     * @param {string} password
     * @param {object} profile - { displayName, phoneNumber, photoURL }
     * @returns {Promise}
     */
    function register(email, password, profile) {
        return new Promise(function(resolve, reject) {
            if (!firebase || !firebase.auth) {
                reject(new Error('Firebase Auth not available'));
                return;
            }
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(function(result) {
                    var user = result.user;
                    var updates = {};
                    if (profile && profile.displayName) {
                        updates.displayName = profile.displayName;
                    }
                    if (profile && profile.phoneNumber) {
                        updates.phoneNumber = profile.phoneNumber;
                    }
                    if (profile && profile.photoURL) {
                        updates.photoURL = profile.photoURL;
                    }
                    if (Object.keys(updates).length > 0) {
                        return user.updateProfile(updates).then(function() {
                            return user;
                        });
                    }
                    return user;
                })
                .then(function(user) {
                    // Create user document in Firestore
                    var userData = {
                        uid: user.uid,
                        email: user.email,
                        displayName: profile && profile.displayName ? profile.displayName : user.email,
                        phoneNumber: profile && profile.phoneNumber ? profile.phoneNumber : '',
                        photoURL: profile && profile.photoURL ? profile.photoURL : '',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        role: 'user',
                        isActive: true
                    };
                    return firebase.firestore().collection('users').doc(user.uid).set(userData)
                        .then(function() { return user; });
                })
                .then(function(user) {
                    resolve(user);
                })
                .catch(function(error) {
                    var msg = _getFirebaseErrorMessage(error.code);
                    reject(new Error(msg));
                });
        });
    }

    /**
     * Send password reset email
     * @param {string} email
     * @returns {Promise}
     */
    function resetPassword(email) {
        return new Promise(function(resolve, reject) {
            if (!firebase || !firebase.auth) {
                reject(new Error('Firebase Auth not available'));
                return;
            }
            firebase.auth().sendPasswordResetEmail(email)
                .then(function() {
                    resolve('Password reset email sent to ' + email);
                })
                .catch(function(error) {
                    var msg = _getFirebaseErrorMessage(error.code);
                    reject(new Error(msg));
                });
        });
    }

    /**
     * Send email verification
     * @returns {Promise}
     */
    function sendEmailVerification() {
        return new Promise(function(resolve, reject) {
            var user = firebase.auth().currentUser;
            if (!user) {
                reject(new Error('No user logged in'));
                return;
            }
            user.sendEmailVerification()
                .then(function() { resolve('Verification email sent'); })
                .catch(function(error) { reject(error); });
        });
    }

    // ==================== Logout ====================

    /**
     * Logout current user
     * @returns {Promise}
     */
    function logout() {
        return new Promise(function(resolve, reject) {
            try {
                if (firebase && firebase.auth) {
                    firebase.auth().signOut().then(function() {
                        _currentUser = null;
                        Utils.removeStorage('auth_session');
                        _notifyListeners('logout', null);
                        resolve();
                    }).catch(function(e) {
                        // Force logout even if Firebase fails
                        _currentUser = null;
                        Utils.removeStorage('auth_session');
                        _notifyListeners('logout', null);
                        resolve();
                    });
                } else {
                    _currentUser = null;
                    Utils.removeStorage('auth_session');
                    _notifyListeners('logout', null);
                    resolve();
                }
            } catch (e) {
                _currentUser = null;
                Utils.removeStorage('auth_session');
                _notifyListeners('logout', null);
                resolve();
            }
        });
    }

    // ==================== Event Listeners ====================

    /**
     * Subscribe to auth state changes
     * @param {function} callback - fn(eventType, user)
     * @returns {function} unsubscribe function
     */
    function onAuthStateChanged(callback) {
        _listeners.push(callback);
        // Return unsubscribe function
        return function() {
            var idx = _listeners.indexOf(callback);
            if (idx > -1) _listeners.splice(idx, 1);
        };
    }

    function _notifyListeners(eventType, user) {
        _listeners.forEach(function(fn) {
            try { fn(eventType, user); } catch (e) { console.warn('Auth listener error:', e); }
        });
    }

    // ==================== Helpers ====================

    function _getFirebaseErrorMessage(code) {
        var messages = {
            'auth/user-not-found': 'No account found with this email/phone',
            'auth/wrong-password': 'Incorrect password. Please try again',
            'auth/invalid-email': 'Invalid email address',
            'auth/invalid-credential': 'Invalid login credentials',
            'auth/user-disabled': 'This account has been disabled',
            'auth/email-already-in-use': 'An account with this email already exists',
            'auth/weak-password': 'Password is too weak (minimum 6 characters)',
            'auth/operation-not-allowed': 'This login method is not enabled',
            'auth/too-many-requests': 'Too many attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/invalid-phone-number': 'Invalid phone number format',
            'auth/invalid-verification-code': 'Invalid verification code',
            'auth/session-expired': 'Session expired. Please sign in again',
            'auth/requires-recent-login': 'Please log in again to perform this action',
            'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method'
        };
        return messages[code] || 'Authentication error: ' + (code || 'unknown');
    }

    /**
     * Update user profile
     * @param {object} updates - { displayName, photoURL, phoneNumber }
     * @returns {Promise}
     */
    function updateProfile(updates) {
        return new Promise(function(resolve, reject) {
            var user = firebase.auth().currentUser;
            if (!user) {
                reject(new Error('No user logged in'));
                return;
            }
            var firebaseUpdates = {};
            if (updates.displayName !== undefined) firebaseUpdates.displayName = updates.displayName;
            if (updates.photoURL !== undefined) firebaseUpdates.photoURL = updates.photoURL;
            if (updates.phoneNumber !== undefined) firebaseUpdates.phoneNumber = updates.phoneNumber;

            user.updateProfile(firebaseUpdates)
                .then(function() {
                    // Also update Firestore user doc
                    var dbUpdates = {};
                    if (updates.displayName) dbUpdates.displayName = updates.displayName;
                    if (updates.photoURL) dbUpdates.photoURL = updates.photoURL;
                    if (updates.phoneNumber) dbUpdates.phoneNumber = updates.phoneNumber;
                    if (Object.keys(dbUpdates).length > 0) {
                        return firebase.firestore().collection('users').doc(user.uid).update(dbUpdates);
                    }
                })
                .then(function() {
                    resolve('Profile updated');
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    }

    // ==================== Public API ====================

    return {
        init: init,
        getCurrentUser: getCurrentUser,
        isLoggedIn: isLoggedIn,
        loginWithEmail: loginWithEmail,
        loginWithPhone: loginWithPhone,
        register: register,
        resetPassword: resetPassword,
        sendEmailVerification: sendEmailVerification,
        logout: logout,
        updateProfile: updateProfile,
        onAuthStateChanged: onAuthStateChanged
    };
})();
