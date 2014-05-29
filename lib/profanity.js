var swearwords = require('./swearwords.json'),
    util = require('./util');

var DEFAULT_REPLACEMENTS = [ 'bunnies', 'butterfly', 'kitten', 'love', 'gingerly', 'flowers', 'puppy', 'joyful' ],
    DEFAULT_REGEX = getListRegex(swearwords);

function getListRegex (list) {
    return new RegExp(list.join('|'), 'g');
}

function check (target, swearwordsList) {
    var targets = [],
        regex = swearwordsList ? getListRegex(swearwordsList) : DEFAULT_REGEX;

    if (typeof target === 'string') {
        targets.push(target);
    } else if (typeof target === 'object') {

        util.eachRecursive(target, function (val) {
            if (typeof val === 'string') {
                targets.push(val);
            }
        });
    }

    return targets.join(' ').match(regex) || [];
}

function purifyString (str, options) {
    options = options || {};

    var matches = [],
        purified,
        swearwordsList = options.swearwordsList || null,
        replacementList = options.replacementList || DEFAULT_REPLACEMENTS,
        regex = swearwordsList ? getListRegex(swearwordsList) : DEFAULT_REGEX,
        partialReplace = options.partialReplace || false,
        replaceSymbol = options.replaceSymbol || '*';

    purified = str.replace(regex, function (val) {
        matches.push(val);

        if (partialReplace) {
            var str = val.substr(0, 1);

            for (var i = 0; i < val.length - 2; i += 1) {
                str += replaceSymbol;
            }

            return str + val.substr(-1);
        }

        return replacementList[Math.floor(Math.random() * replacementList.length)];
    });

    return [ purified, matches ];
}

function purify (target, options) {
    options = options || {};

    var matches = [],
        fields = options.fields || null,
        result;

    if (typeof target === 'string') {

        return purifyString(target, options);

    } else if (typeof target === 'object') {
        util.eachRecursive(target, function (val, key, root, depth) {
            if (fields && (depth > 1 || fields.indexOf(key) === -1)) {
                return;
            }

            if (typeof val === 'string') {
                result = purifyString(val, options);
                root[key] = result[0];
                matches = matches.concat(result[1]);
            }
        });

        return [ target, matches ];
    }
}

module.exports = {
    check: check,
    purify: purify
};