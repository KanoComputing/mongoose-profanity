var profanity = require('./profanity');

function profanityPlugin (schema, options) {
    options = options || {};

    var flagsToBlacklist = options.maxFlags || 3;

    schema.add({
        flags: {
            type: Number,
            default: 0
        },
        blackListed: {
            type: Boolean,
            default: false
        }
    });

    schema.pre('save', function (next) {
        var entry = this,
            result = profanity.purify(entry, options),
            matched = result[1];

        entry.flags += matched.length;

        if (entry.flags >= flagsToBlacklist) {
            entry.blackListed = true;
        }

        next();
    });
}

module.exports = profanityPlugin;