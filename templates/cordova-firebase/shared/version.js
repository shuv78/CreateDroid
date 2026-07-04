/**
 * MyApp - Auto-generated Version Constants
 * Generated: 2026-07-05T12:00:00.000Z
 * DO NOT EDIT MANUALLY - Use version.js generator script
 */
var APP_VERSION = '1.0.0';
var APP_BUILD = '1';
var APP_NAME = 'MyApp';
var APP_PACKAGE = 'com.shuvalpha.myapp';
var APP_AUTHOR = 'ShuvAlpha';
var APP_COPYRIGHT = 'Copyright ' + new Date().getFullYear() + ' ShuvAlpha. All rights reserved.';
var APP_DESCRIPTION = 'A full-stack Cordova Firebase application with authentication, CRUD, and real-time features.';

// Build timestamp
var APP_BUILD_TIMESTAMP = '2026-07-05T12:00:00.000Z';

// Environment
var APP_ENV = typeof cordova !== 'undefined' ? 'production' : 'development';
var APP_PLATFORM = typeof cordova !== 'undefined'
    ? (typeof device !== 'undefined' ? device.platform : 'cordova')
    : 'web';

// Feature flags
var APP_FEATURES = {
    maps: true,
    payment: true,
    camera: true,
    scanner: true,
    chat: true,
    notifications: true,
    darkMode: true,
    export: true
};

// Changelog for about screen
var APP_CHANGELOG = [
    { version: '1.0.0', date: '2026-07-05', changes: [
        'Initial release',
        'Firebase Auth integration',
        'Firestore CRUD operations',
        'Real-time chat feature',
        'Camera & scanner support',
        'Google Maps integration',
        'bKash/Nagad/Stripe payment',
        'FCM push notifications',
        'Dark mode & theming',
        'Multi-language support (EN/BN)'
    ]},
];
