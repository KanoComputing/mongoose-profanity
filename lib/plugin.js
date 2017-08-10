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

function getValidation( options ){
    return function profanityCheck( value ) {
        return (
            typeof value === 'string' &&
            ( profanity.check( value, options ).length === 0 )
        );
    };
}

function profanityPluginReject2(schema, options) {
    schema.pre('validate', function ( next ) {
        var optf = options.fields; //For brevity

        if( optf && Array.isArray( optf ) && optf.length ){
            var len = optf.length;
            for( var i = 0; i < len; i++ ){
                if( !!profanity.check( this[optf[i]], options ).length ){
                    this.invalidate( optf[i], "Naughy Boi" );
                    break;
                }
            }
        }
        next();
    });
}

function profanityPluginReject( schema, options ){
    var optf = options.fields; //For brevity

    if( optf && Array.isArray( optf ) && optf.length ){
        var len = optf.length;
        for( var i = 0; i < len; i++ ){
            var validators = [];
            var v = schema.paths[optf[i]].validate; //Check if there is already a validation on this field.
            if ( v ){ //Mongoose allows for a validation function array on a field.
                if( Array.isArray( v ) ){
                    validators =  v;
                } else {
                    validators.push( v );
                }
                validators.push( getValidation( options ) );
            } else {
                validators = getValidation( options );
            }
            schema.paths[optf[i]].validate = validators;
        }
    } else {
        console.warn( "mongoose-profanity reject option requires a list of schema fields. No profanity filters added!" );
        return;
    }

}

function profanityPlugin ( schema, options ) {
    options = options || {};

    if( options.reject ){
        return profanityPluginReject2( schema, options );
    }

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
