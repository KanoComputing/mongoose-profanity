var _ = require('lodash');

function eachRecursive (obj, fn, maxDepth, depth) {
    depth = depth || 0;

    if (maxDepth && depth > maxDepth) {
        return;
    }

    _.each(obj, function (val, key) {
        if (_.isObject(val)) {
            depth += 1;
            eachRecursive(val, fn, depth);
        } else {
            fn(val, key, obj, depth);
        }
    });
}

module.exports = {
    eachRecursive: eachRecursive
};