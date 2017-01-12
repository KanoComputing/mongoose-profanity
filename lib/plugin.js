/*
Copyright (C) 2014 Kano Computing Ltd.
License: http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
*/

var profanity = require('profanity-util'),
    mongoose = require('mongoose');

var flagSchema = new mongoose.Schema({

    author: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },

    reason: String

});


function profanityPlugin (schema, options) {
    options = options || {};

    var flagsToBlacklist = typeof options.maxFlags !== 'undefined' ? options.maxFlags : 3;

    if (flagsToBlacklist) {
        schema.add({
            flags: {
                type: [ flagSchema ]
            },
            blackListed: {
                type: Boolean,
                default: false
            }
        });
    }

    schema.pre('save', function (next) {
        var entry = this,
            result = profanity.purify(entry._doc, options),
            matched = result[1];

        matched.forEach(function () {
            entry.flags.push({ author: null, reason: 'Inappropriate language' });
        });

        if (flagsToBlacklist && entry.flags.length >= flagsToBlacklist) {
            entry.blackListed = true;
        }

        next();
    });
}

module.exports = profanityPlugin;
