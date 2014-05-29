## Mongoose Profanity Plugin

A plugin to auto-moderate profanity in your content.

Replaces offensive words with random inoffensive replacement words on save, incrementing a `flags` field counter and turning a `blackListed` field to `true` when `count` reaches a limit.

It can be customised to simply obscure bad words with a symbol and configured with custom list of forbidden words and replacements.

It adds the following fields to your schema:

The list of swearwords used by default was taken from [here](https://gist.github.com/jamiew/1112488).

### Install

To install, run:

`npm install mongoose-profanity`

### Simple usage

Setup a 'self-moderating' model:

```javascript
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    profanityPlugin = require('mongoose-profanity');

var TestSchema = new Schema({
    message: String
});

TestSchema.plugin(profanityPlugin);

var Test = mongoose.model('Test', TestSchema);

var test = new Test({
    message: 'What a bloody damn horrible weather, crap!'
}).save(function (err, entry) {
    console.log(entry.message, entry.flags, entry.blackListed);
    // 'What a unicorn joyful horrible day, gingerly!', 3, true
});
```

Only query entries which have not been blacklisted:

```javascript
Test.find({ blackListed: false }, function (err, entries) {
	console.log(entries.length);
	// 0
})
```

### Advanced examples

```javascript
// Obscure a custom list of forbidden words with a given symbol, blacklist if 1 more are found

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    profanityPlugin = require('mongoose-profanity');

var TestSchema = new Schema({
    message: String,
    uncheckedMessage: String
});

TestSchema.plugin(profanityPlugin, {
    maxFlags: 1,
    forbiddenList: [ 'politics', 'business' ],
    obscure: true,
    obscureSymbol: '%',
    fields: [ 'message' ]
});

var Test = mongoose.model('Test', TestSchema);

var test = new Test({
    message: 'We are not allowed to talk politics or business',
    uncheckedMessage: 'We can totally talk business here'
}).save(function (err, entry) {
    console.log(entry.message, entry.flags, entry.blackListed);
    // 'We are not allowed to talk p%%%%%%s or b%%%%%%s', 2, true

	console.log(uncheckedMessage);
	// We can totally talk business here
});
```

### Advanced examples

```javascript
// Replace a custom list of forbidden words with a custom list of replacement words, never blacklist

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    profanityPlugin = require('mongoose-profanity');

var TestSchema = new Schema({
    message: String
});

TestSchema.plugin(profanityPlugin, {
    maxFlags: 0,
    forbiddenList: [ 'google', 'bing' ],
    replacementsList: [ 'some search engine' ],
    fields: [ 'message' ]
});

var Test = mongoose.model('Test', TestSchema);

var test = new Test({
    message: 'I'd rather use Google instead of Bing'
}).save(function (err, entry) {
    console.log(entry.message, entry.flags, entry.blackListed);
    // 'I'd rather use some search engine instead than some search engine', 2, true
});
```

### Plugin options

* `fields` - Array of schema fields to be checked by the plugin
* `forbiddenList` - Array of forbidden terms to replace or obscure
* `replacementsList` - Array of replacement words (To pick randomly from)
* `maxFlags` - Max flags before blacklisting (Prevents addition of custom fields, flagging and blacklisting if falsy)
* `obscure`- If set to true it will obscure forbidden words (E.g. a*****b) instead of replacing them
* `obscureSymbol` - Symbol used to obscure words if `obscured` is set to true

### Added schema fields

* `flags`: `Number` - Incremented every time a forbidden word is used
* `blackListed`: `Boolean` - Turns to true when flags counter is greater than configured limit (3 by default)

### Test

Run unit-tests with `npm test`. Make sure a local mongo server is running in order for the tests to run.

### Contribute

All contributions are welcome as long as tests are written.

### Licence

Copyright (C) 2014 Kano Computing Ltd. License: [http://www.gnu.org/licenses/gpl-2.0.txt](http://www.gnu.org/licenses/gpl-2.0.txt) GNU General Public License v2