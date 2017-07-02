'use strict';

let cacheManager = require('cache-manager');

// This Memory Cache module is using - https://github.com/isaacs/node-lru-cache
let memoryCache = cacheManager.caching({
    store: 'memory', // Use the memory store
    max: 500, // Max number of key before it the oldest key gets deleted.
    ttl: 59 // Time to live in seconds
});

module.exports = {
    memory: memoryCache
};