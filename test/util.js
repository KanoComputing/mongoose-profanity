var defaultExp = '(bunnies|butterfly|kitten|love|gingerly|flowers|puppy|joyful)';

function testPurified (str, format, exp) {
    exp = exp || defaultExp;

    var regex = new RegExp('^' + format.replace(/(\[ placeholder \])/g, exp) + '$');
    if (!regex.test(str)) {
        throw new Error('\'' + str + '\'' + ' doesn\'t match the format \'' + format + '\'');
    }
}

module.exports = {
    testPurified: testPurified
};