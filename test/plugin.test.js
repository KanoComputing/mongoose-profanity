/*
Copyright (C) 2014 Kano Computing Ltd.
License: http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
*/

var mongoose = require('mongoose'),
    profanityPlugin = require('../lib/plugin.js'),
    should = require('should'),
    util = require('./util'),
    Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/mongooseprofanitytest');

var db = mongoose.connection;

db.on('error', function (err) {
    console.error('Connection error: please check if mongodb is running on localhost');
    throw err;
});

var TestSchema = new Schema({
    title: String,
    description: String,
    immune: String
});

TestSchema.plugin(profanityPlugin, {
    fields: [ 'title', 'description' ],
    maxFlags: 5
});

var Test = mongoose.model('Test', TestSchema);

var TestSchema2 = new Schema({
    text: String
});

TestSchema2.plugin(profanityPlugin, {
    partialReplace: true,
    replaceSymbol: '%'
});

var Test2 = mongoose.model('Test2', TestSchema2);

var TestSchema3 = new Schema({
    text: String
});

TestSchema3.plugin(profanityPlugin, {
    swearwordsList: [ 'foo', 'bar', 'test' ],
    replacementsList: [ 'oof', 'rab', 'tset' ]
});

var Test3 = mongoose.model('Test3', TestSchema3);

describe('Profanity plugin', function() {

    it('adds a flag for each bad word used, only in configured schema fields', function (done) {
        true.should.be.ok;

        var test = new Test({
            title: 'Test crap boob',
            description: 'bollok',
            immune: 'butt damn'
        });

        test.save(function (err, entry) {
            if (err) { throw err; }

            should(entry.flags).equal(3);
            util.testPurified(entry.title, 'Test [ placeholder ] [ placeholder ]');
            util.testPurified(entry.description, '[ placeholder ]');
            entry.immune.should.equal('butt damn');
            should(entry.blackListed).equal(false);

            done();
        });
    });

    it('blacklists object correctly when finds more swearwords', function (done) {
        new Test({
            title: 'testing poo foo crap bar damn somthing butt bar fanny'
        }).save(function (err, entry) {
            if (err) { throw err; }

            entry.flags.should.equal(5);
            entry.blackListed.should.be.ok;

            done();
        });
    });

    it('works correctly with partial replace option', function (done) {
        new Test2({
            text: 'testing poop something partial replace'
        }).save(function (err, entry) {
            if (err) { throw err; }

            entry.flags.should.equal(1);
            entry.text.should.equal('testing p%%p something partial replace');
            entry.blackListed.should.not.be.ok;

            done();
        });
    });

    it('correctly uses custom matches list and replacements list and blaclists with 3 flags by default', function (done) {
        new Test3({
            text: 'foo unchanged bar unchanged test unchanged'
        }).save(function (err, entry) {
            if (err) { throw err; }

            entry.blackListed.should.be.ok;

            util.testPurified(
                entry.text,
                '[ placeholder ] unchanged [ placeholder ] unchanged [ placeholder ] unchanged',
                'oof|rab|test'
            );

            done();
        });
    });

});