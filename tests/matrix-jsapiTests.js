/*jshint node:true, globalstrict:true,  sub:true */

'use strict';

var log = require("mkslogger").logger(module),
    vows = require('vows'),
    assert = require('assert'),
    mapi = require('../lib/matrix-api'),
    
    API_USER = 'jsapi',
    API_PASSWORD = 'testjsapi',
    API_KEY = '1064090338',
    API_URL = 'http://matrixdemo.squiz.net/test.js';


exports.suite1 = vows.describe('Create Asset');

exports.suite1.addBatch({
    'New Standard Page': {
        topic: function() {
            var parentAssetID = 72,
                nuAssetName = 'Test Asset'+Date.now(),
                self = this;
        
            mapi.setApiKey(API_KEY);
            mapi.setApiUrl(API_URL);
            
            mapi.setUsername(API_USER);
            mapi.setPassword(API_PASSWORD);
            
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
                function(data) {
                        self.callback(data.error, data);    
                }
            );
             
        },
        'results in ID of new asset': function(result) {
            log.debug("result:"+result);
            assert.isNotNull(result);
            assert.isNumber(+result.id);
        }
    }
}); 
