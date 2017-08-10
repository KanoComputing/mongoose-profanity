/*
Copyright (C) 2014 Kano Computing Ltd.
License: http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
*/

var mongoose = require('mongoose');

var Mockgoose = require('mockgoose').Mockgoose;

var mockgoose = new Mockgoose(mongoose);
 
var profanityPlugin = require('../lib/plugin.js');

var should = require('should');

var util = require('./util');

var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;


before( function ( done ) {
    mockgoose.prepareStorage().then( function () {
        // mongoose connection		 
        mongoose.connect( 'mongodb://localhost/mongooseprofanitytest', function ( err ) {
            console.error( 'Connection error: please check if mongodb is running on localhost' );
            done( err );
        });
    });
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
    obscureSymbol: '%'
});

var Test2 = mongoose.model('Test2', TestSchema2);

var TestSchema3 = new Schema({
    text: String
});

TestSchema3.plugin(profanityPlugin, {
    forbiddenList: [ 'foo', 'bar', 'test' ],
    replacementsList: [ 'oof', 'rab', 'tset' ],
    replace: true
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

            entry.flags.should.have.length(3);
            should(entry.flags[0].author).equal(null);
            entry.flags[0].reason.should.equal('Inappropriate language');
            entry.title.should.equal('Test c**p b**b');
            entry.description.should.equal('b****k');
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

            entry.flags.should.have.length(5);
            entry.blackListed.should.be.ok;

            done();
        });
    });

    it('works correctly with partial replace option', function (done) {
        new Test2({
            text: 'testing poop something partial replace'
        }).save(function (err, entry) {
            if (err) { throw err; }

            entry.flags.should.have.length(1);
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
                'oof|rab|tset'
            );

            done();
        });
    });

});
