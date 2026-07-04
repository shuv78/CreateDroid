/**
 * MyApp - Firebase Firestore Database Module
 * CRUD operations with real-time listeners, pagination, and error handling.
 */

var DB = (function() {
    'use strict';

    // ==================== Configuration ====================

    var _db = null;
    var _isInitialized = false;

    // Cache for active snapshot listeners
    var _activeListeners = {};

    // ==================== Initialization ====================

    function init() {
        if (_isInitialized) return;
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            _db = firebase.firestore();
            // Enable offline persistence
            _db.enablePersistence({ synchronizeTabs: true })
                .catch(function(err) {
                    if (err.code === 'failed-precondition') {
                        console.warn('Firestore: Multiple tabs open, persistence only works in one tab');
                    } else if (err.code === 'unimplemented') {
                        console.warn('Firestore: Browser does not support persistence');
                    }
                });
            _isInitialized = true;
        } else {
            console.error('Firebase Firestore not available');
        }
    }

    function getDb() {
        if (!_isInitialized) init();
        return _db;
    }

    // ==================== Generic CRUD ====================

    /**
     * Get all documents from a collection (with optional filters)
     * @param {string} collectionName
     * @param {object} opts - { where, orderBy, limit, startAfter }
     * @returns {Promise<Array>}
     */
    function getDocs(collectionName, opts) {
        return new Promise(function(resolve, reject) {
            try {
                var db = getDb();
                if (!db) { reject(new Error('Database not initialized')); return; }

                var query = db.collection(collectionName);
                opts = opts || {};

                // Apply where filters
                if (opts.where && Array.isArray(opts.where)) {
                    opts.where.forEach(function(w) {
                        query = query.where(w.field, w.op || '==', w.value);
                    });
                }

                // Apply orderBy
                if (opts.orderBy) {
                    var dir = opts.orderByDesc ? 'desc' : 'asc';
                    query = query.orderBy(opts.orderBy, dir);
                }

                // Apply limit
                if (opts.limit) {
                    query = query.limit(opts.limit);
                }

                // Apply pagination cursor
                if (opts.startAfter) {
                    query = query.startAfter(opts.startAfter);
                }

                query.get().then(function(snapshot) {
                    var results = [];
                    snapshot.forEach(function(doc) {
                        results.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    resolve({
                        items: results,
                        size: results.length,
                        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
                    });
                }).catch(function(error) {
                    reject(_handleError(error));
                });
            } catch (e) {
                reject(_handleError(e));
            }
        });
    }

    /**
     * Get a single document by ID
     * @param {string} collectionName
     * @param {string} docId
     * @returns {Promise<object|null>}
     */
    function getDoc(collectionName, docId) {
        return new Promise(function(resolve, reject) {
            try {
                var db = getDb();
                if (!db) { reject(new Error('Database not initialized')); return; }

                db.collection(collectionName).doc(docId).get()
                    .then(function(doc) {
                        if (doc.exists) {
                            resolve({ id: doc.id, ...doc.data() });
                        } else {
                            resolve(null);
                        }
                    })
                    .catch(function(error) {
                        reject(_handleError(error));
                    });
            } catch (e) {
                reject(_handleError(e));
            }
        });
    }

    /**
     * Add a new document
     * @param {string} collectionName
     * @param {object} data
     * @returns {Promise<object>} - { id, ...data }
     */
    function addDoc(collectionName, data) {
        return new Promise(function(resolve, reject) {
            try {
                var db = getDb();
                if (!db) { reject(new Error('Database not initialized')); return; }

                // Add timestamps
                data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

                // Add author info if logged in
                if (Auth && Auth.getCurrentUser) {
                    var user = Auth.getCurrentUser();
                    if (user) {
                        data.createdBy = user.uid;
                        data.authorName = user.displayName || user.email;
                    }
                }

                db.collection(collectionName).add(data)
                    .then(function(docRef) {
                        resolve({ id: docRef.id, ...data });
                    })
                    .catch(function(error) {
                        reject(_handleError(error));
                    });
            } catch (e) {
                reject(_handleError(e));
            }
        });
    }

    /**
     * Add a document with a custom ID
     * @param {string} collectionName
     * @param {string} docId
     * @param {object} data
     * @returns {Promise<object>}
     */
    function setDoc(collectionName, docId, data) {
        return new Promise(function(resolve, reject) {
            try {
                var db = getDb();
                if (!db) { reject(new Error('Database not initialized')); return; }

                data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

                db.collection(collectionName).doc(docId).set(data, { merge: true })
                    .then(function() {
                        resolve({ id: docId, ...data });
                    })
                    .catch(function(error) {
                        reject(_handleError(error));
                    });
            } catch (e) {
                reject(_handleError(e));
            }
        });
    }

    /**
     * Update a document
     * @param {string} collectionName
     * @param {string} docId
     * @param {object} data - Fields to update
     * @returns {Promise}
     */
    function updateDoc(collectionName, docId, data) {
        return new Promise(function(resolve, reject) {
            try {
                var db = getDb();
                if (!db) { reject(new Error('Database not initialized')); return; }

                data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

                db.collection(collectionName).doc(docId).update(data)
                    .then(function() {
                        resolve({ id: docId, ...data });
                    })
                    .catch(function(error) {
                        reject(_handleError(error));
                    });
            } catch (e) {
                reject(_handleError(e));
            }
        });
    }

    /**
     * Delete a document
     * @param {string} collectionName
     * @param {string} docId
     * @returns {Promise}
     */
    function deleteDoc(collectionName, docId) {
        return new Promise(function(resolve, reject) {
            try {
                var db = getDb();
                if (!db) { reject(new Error('Database not initialized')); return; }

                db.collection(collectionName).doc(docId).delete()
                    .then(function() {
                        resolve({ id: docId, deleted: true });
                    })
                    .catch(function(error) {
                        reject(_handleError(error));
                    });
            } catch (e) {
                reject(_handleError(e));
            }
        });
    }

    // ==================== Real-time Listeners ====================

    /**
     * Subscribe to real-time updates on a collection
     * @param {string} collectionName
     * @param {function} callback - fn(items[])
     * @param {object} opts - { where, orderBy, limit }
     * @returns {string} listenerId - Pass to unsubscribe()
     */
    function onSnapshot(collectionName, callback, opts) {
        var listenerId = collectionName + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        try {
            var db = getDb();
            if (!db) { callback([]); return listenerId; }

            var query = db.collection(collectionName);
            opts = opts || {};

            if (opts.where && Array.isArray(opts.where)) {
                opts.where.forEach(function(w) {
                    query = query.where(w.field, w.op || '==', w.value);
                });
            }
            if (opts.orderBy) {
                var dir = opts.orderByDesc ? 'desc' : 'asc';
                query = query.orderBy(opts.orderBy, dir);
            }
            if (opts.limit) {
                query = query.limit(opts.limit);
            }

            var unsubscribe = query.onSnapshot(function(snapshot) {
                var results = [];
                snapshot.forEach(function(doc) {
                    results.push({ id: doc.id, ...doc.data() });
                });
                callback(results);
            }, function(error) {
                console.error('Snapshot error for', collectionName, error);
                callback([]);
            });

            _activeListeners[listenerId] = unsubscribe;
        } catch (e) {
            console.error('onSnapshot setup error:', e);
            callback([]);
        }
        return listenerId;
    }

    /**
     * Subscribe to a single document
     * @param {string} collectionName
     * @param {string} docId
     * @param {function} callback - fn(item|null)
     * @returns {string} listenerId
     */
    function onDocSnapshot(collectionName, docId, callback) {
        var listenerId = 'doc_' + collectionName + '_' + docId;
        try {
            var db = getDb();
            if (!db) { callback(null); return listenerId; }

            var unsubscribe = db.collection(collectionName).doc(docId)
                .onSnapshot(function(doc) {
                    if (doc.exists) {
                        callback({ id: doc.id, ...doc.data() });
                    } else {
                        callback(null);
                    }
                }, function(error) {
                    console.error('Doc snapshot error:', error);
                    callback(null);
                });

            _activeListeners[listenerId] = unsubscribe;
        } catch (e) {
            console.error('onDocSnapshot error:', e);
            callback(null);
        }
        return listenerId;
    }

    /**
     * Unsubscribe from a snapshot listener
     * @param {string} listenerId
     */
    function unsubscribe(listenerId) {
        if (_activeListeners[listenerId]) {
            _activeListeners[listenerId]();
            delete _activeListeners[listenerId];
        }
    }

    /**
     * Remove all active listeners
     */
    function unsubscribeAll() {
        Object.keys(_activeListeners).forEach(function(id) {
            _activeListeners[id]();
            delete _activeListeners[id];
        });
    }

    // ==================== Utility ====================

    /**
     * Get count of documents in a collection
     * @param {string} collectionName
     * @returns {Promise<number>}
     */
    function getCount(collectionName) {
        return new Promise(function(resolve, reject) {
            try {
                var db = getDb();
                if (!db) { resolve(0); return; }
                db.collection(collectionName).get().then(function(snapshot) {
                    resolve(snapshot.size);
                }).catch(function(error) {
                    reject(_handleError(error));
                });
            } catch (e) {
                reject(_handleError(e));
            }
        });
    }

    /**
     * Search documents by field value (client-side)
     * @param {Array} items - Array of items to search
     * @param {string} query - Search query
     * @param {Array} fields - Fields to search in
     * @returns {Array}
     */
    function searchItems(items, query, fields) {
        if (!query || !query.trim()) return items;
        var q = query.toLowerCase().trim();
        fields = fields || ['name', 'title', 'email', 'description'];
        return items.filter(function(item) {
            for (var i = 0; i < fields.length; i++) {
                var val = item[fields[i]];
                if (val && val.toString().toLowerCase().indexOf(q) > -1) {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * Paginate items client-side
     * @param {Array} items
     * @param {number} page
     * @param {number} perPage
     * @returns {object} { items, total, page, totalPages }
     */
    function paginate(items, page, perPage) {
        page = page || 1;
        perPage = perPage || 10;
        var total = items.length;
        var totalPages = Math.ceil(total / perPage);
        var start = (page - 1) * perPage;
        var end = start + perPage;
        return {
            items: items.slice(start, end),
            total: total,
            page: page,
            totalPages: totalPages
        };
    }

    // ==================== Error Handler ====================

    function _handleError(error) {
        var msg = error.message || error.code || 'Unknown database error';
        console.error('DB Error:', msg);
        return new Error(msg);
    }

    // ==================== Public API ====================

    return {
        init: init,
        getDb: getDb,
        getDocs: getDocs,
        getDoc: getDoc,
        addDoc: addDoc,
        setDoc: setDoc,
        updateDoc: updateDoc,
        deleteDoc: deleteDoc,
        onSnapshot: onSnapshot,
        onDocSnapshot: onDocSnapshot,
        unsubscribe: unsubscribe,
        unsubscribeAll: unsubscribeAll,
        getCount: getCount,
        searchItems: searchItems,
        paginate: paginate
    };
})();
