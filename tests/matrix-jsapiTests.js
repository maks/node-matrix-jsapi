/*jshint node:true, globalstrict:true,  sub:true */

'use strict';

var log = require("mkslogger").logger(module),
    vows = require('vows'),
    assert = require('assert'),
    mapi = require('../lib/matrix-api');
    
    mapi.setApiKey('1064090338');
    mapi.setApiUrl('http://matrixdemo.squiz.net/test.js');
    
    mapi.setUsername('jsapi');
    mapi.setPassword('testjsapi');

exports.suite1 = vows.describe('Creating Assets');

exports.suite1.addBatch({
    'when creating a Standard Page': {
        topic: function() {
            var parentAssetID = 72,
                nuAssetName = 'Test Asset'+Date.now(),
                self = this;
            
            mapi.createAsset(
                parentAssetID,
                'page_standard', //asset type
                nuAssetName,
                '1', //link type
                'col', //link value
                '0', //sort_order
                '0', //is_dependant
                '0', //is_exclusive
                '0', //extra_attributes
                '',
                self.callback
            );
        },
        'returns a valid asset id' : function(err, result) {
            log.debug("result:",result);
            assert.isNotNull(result);
            assert.isNumber(+result.id);
        },
        'return a field with the correct name': function(err, result) {
            //assert.equal(nuName, result.name);
        }
    }
}); 
