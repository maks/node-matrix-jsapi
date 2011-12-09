/**
* +--------------------------------------------------------------------+
* | This MySource Matrix CMS file is Copyright (c) Squiz Pty Ltd       |
* | ACN 084 670 600                                                    |
* +--------------------------------------------------------------------+
* | IMPORTANT: Your use of this Software is subject to the terms of    |
* | the Licence provided in the file licence.txt. If you cannot find   |
* | this file please contact Squiz (www.squiz.net) so we may provide   |
* | you a copy.                                                        |
* +--------------------------------------------------------------------+
*
* Modified for Node.js by Maksim Lin <maks@manichord.com>
*/

module.exports.setUsername = setUsername;
module.exports.setPassword = setPassword;
module.exports.setApiKey = setApiKey;
module.exports.setApiUrl = setApiUrl;
module.exports.getGeneral = getGeneral;
module.exports.getAttributes = getAttributes;
module.exports.setAttribute = setAttribute;
module.exports.setMultipleAttributes = setMultipleAttributes;
module.exports.getMetadata = getMetadata;
module.exports.setMetadata = setMetadata;
module.exports.setMetadataAllFields = setMetadataAllFields;
module.exports.trashAsset = trashAsset;
module.exports.getChildren = getChildren;
module.exports.getParents = getParents;
module.exports.getPermissions = getPermissions;
module.exports.createAsset = createAsset;
module.exports.getAssetTypes = getAssetTypes;
module.exports.getLocksInfo = getLocksInfo;
module.exports.acquireLock = acquireLock;
module.exports.releaseLock = releaseLock;
module.exports.createLink = createLink;
module.exports.removeLink = removeLink;
module.exports.removeMultipleLinks = removeMultipleLinks;
module.exports.moveLink = moveLink;
module.exports.updateLink = updateLink;
module.exports.updateMultipleLinks = updateMultipleLinks;
module.exports.getLinkId = getLinkId;
module.exports.getAssetTree = getAssetTree;
module.exports.getKeywordsReplacements = getKeywordsReplacements;
module.exports.setAssetStatus = setAssetStatus;
module.exports.getChildCount = getChildCount;
module.exports.getWebPath = getWebPath;
module.exports.setWebPath = setWebPath;
module.exports.getWorkflowSchema = getWorkflowSchema;
module.exports.createFileAsset = createFileAsset;
module.exports.setContentOfEditableFileAsset = setContentOfEditableFileAsset;


var log = require("mkslogger").logger(module),
    request = require('request'),
    _api_key,
    _api_url,
    _username,
    _password;


function setUsername(username) {
    _username = username;
}

function setPassword(password) {
    _password = password;
}

/**
* Checks to see if a variable is set
*
* @param string     obj     The variable we check
*
* @version $Revision: 0.1
*/
function isset(obj)
{
    // Check to see if a variable or array item is set
    if (typeof(obj) == 'undefined' || obj == null) {
        return false;
    } else {
        return true;
    }

}//end isset


/**
* Turns JSON into a javascript object
*
* @param string     json            The JSON string to convert
*
* @version $Revision: 0.1
*/
function jsonToObj(json)
{
    // Make the conversion
    // Don't worry, even the creator of JSON says eval is ok here
    var jsonObj = eval('(' + json + ')');

    return jsonObj;

}//end jsonToObj


/**
* Our default callback
*
* @param string     ajaxRequest     The ajax function
* @param string     dataCallback    Callback that happens after success
*
* @version $Revision: 0.1
*/
function success(body, dataCallback, error)
{
   if (error) {
     // Custom callback
     body.error = error;
     dataCallback(body);
    } else {
        if (body !== '' || body !== 'undefined' || body !== null) {
            try {
                var response = JSON.parse(body);
            } catch(err) {
                log.debug("Error with parsing JSON returned by Matrix:", err);
                log.debug("Bad JSON:"+body);
            }
            // Custom callback
            dataCallback(response);
        }
    }
}//end success


/**
* This will set our api key
*
* @param string     api_key     The api key of our Javascript API Asset
*
* @version $Revision: 0.1
*/
function setApiKey(api_key)
{
    // Make this into a global variable
    _api_key = api_key;

}//end setApiKey

/**
* This will set our api url
*
* @param string     api_url     The api key of our Javascript API Asset
*
* @version $Revision: 0.1
*/
function setApiUrl(api_url)
{
    // Make this into a global variable
    _api_url = api_url;
}

/**
* Make our ajax request
*
* @param string     url             The url to send to the server
* @param boolean    receive         Should we even use a callback
* @param function   dataCallback    Custom callback function
*
* @version $Revision: 0.1
*/
function makeRequest(url, receive, dataCallback)
{

    var auth = 'Basic ' + new Buffer(_username + ':' + _password).toString('base64');

    //split url to url and parameters
    var urlarray = url.split("?");

    var httpOptions = {
       uri: encodeURI(urlarray[0]),
       method: 'POST',
       headers: {
           "Content-type": "application/x-www-form-urlencoded",
           "Authorization": auth
       },
       body: encodeURI(urlarray[1])
    };

    request(httpOptions, function(error, response, body) {
        if (!error && response.statusCode == 200) {
        } else {
            log.error("Error while attempting HTTP POST to Matrix JSAPI ("+response.statusCode+")"+ error);
        }
        success(body, dataCallback, error);
    });
}//end makeRequest


/**
 * Recursive helper function to write out all properties of an object
 *
 * @param object     obj             The JSON object
 * @param object     parent          Parent JSON object
 *
 * @version $Revision: 0.2
 */
function dumpObj(obj, parent) {
    // Go through all the properties of the passed-in object
    for (var i in obj) {
        if (parent) {
            var msg = parent + '.' + i + ' => ' + obj[i] + '<br />';
        } else {
            var msg = i + " => " + obj[i] + "<br>";
        }
        // Write it out
        document.write(msg);
        // Check if we need to go deeper
        if (typeof obj[i] == 'object') {
            // Write opening
            document.write('<div style="padding-left:20px;">');
            if (parent) {
                dumpObj(obj[i], parent + '.' + i);
            } else {
                dumpObj(obj[i], i);
            }
            // Write closing
            document.write('</div>');
        }//end if

    }//end for

}//end dumpObj


/**
 * This will return general information about the asset
 *
 * @param string     asset_id        Id of the asset we are getting info for
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.1
 */
function getGeneral(asset_id, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Build our string
    var url = _api_url + '?key=' + __api_key + '&type=getGeneral&id=' + asset_id;
    // Make our request
    makeRequest(url, true, dataCallback);

}//end getGeneral


/**
 * This will return attributes of the specific asset
 *
 * @param string     asset_id        Id of the asset we are getting info for
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.1
 */
function getAttributes(asset_id, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getAttributes&id=' + asset_id;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getAttributes


/**
 * This will set an attribute value
 *
 * @param string     asset_id        Id of the asset we are getting info for
 * @param string     attr_name       Name of the attribute to change
 * @param string     attr_val        Value to change the attribute to
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.1
 */
function setAttribute(asset_id, attr_name, attr_val, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=setAttribute&id=' + asset_id + '&attr_name=' + attr_name + '&attr_val=' + attr_val.replace(/#/g , "%23").replace(/&/g , "%26").replace(/\?/g , "%3F").replace(/\+/g , "%2B");

    // Make our request
    makeRequest(url, true, dataCallback);

}//end setAttribute


/**
 * This will set an multiple attributes value for an Asset
 *
 * @param string     asset_id        Id of the asset we are getting info for
 * @param array      field_info      Attribute name and their respective values to be changed to
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.1
 */
function setMultipleAttributes(asset_id, field_info, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    var field_names = '';
    var field_vals = '';
    for (var field_name in field_info) {
        // construct our query strings to be passed
        if (field_name == '') continue;
        field_names = field_names + field_name + '\\,';
        field_vals = field_vals + field_info[field_name].replace(/&/g , "%26").replace(/#/g , "%23").replace(/\?/g , "%3F").replace(/\+/g , "%2B") + '\\,' ;
    }

    // remove the trailing "\,"
    field_names = field_names.substring(0, field_names.length-2);
    field_vals = field_vals.substring(0,field_vals.length-2);

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=setMultipleAttributes&id=' + asset_id + '&attr_name=' + field_names + '&attr_val=' + field_vals;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end setMultipleAttributes


/**
 * This will return a metadata value for the passed metadata name
 *
 * @param string     asset_id        Id of the asset we are getting info for
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.1
 */
function getMetadata(asset_id, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getMetadata&id=' + asset_id;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getMetadata


/**
 * This will set a metadata value
 *
 * @param string     asset_id        Id of the asset we are getting info for
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.1
 */
function setMetadata(asset_id, field_id, field_val, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=setMetadata&id=' + asset_id + '&field_id=' + field_id + '&field_val=' + field_val.replace(/#/g , "%23").replace(/&/g , "%26").replace(/\?/g , "%3F").replace(/\+/g , "%2B");

    // Make our request
    makeRequest(url, true, dataCallback);

}//end setMetadata


/**
 * Set metadata values of multiple fields for an asset
 *
 * @param string     asset_id        Id of asset to set metadata for
 * @param array      field_info      Field Ids and their values
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.1
 */
function setMetadataAllFields(asset_id, field_info, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    var field_ids = '';
    var field_vals = '';
    for (var field_id in field_info) {
        // construct our query strings to be passed
        field_ids = field_ids + field_id + '\\,';
        field_vals = field_vals + field_info[field_id].replace(/&/g , "%26").replace(/#/g , "%23").replace(/\?/g , "%3F").replace(/\+/g , "%2B") + '\\,' ;
    }

    // remove the trailing "\,"
    field_ids = field_ids.substring(0, field_ids.length-2);
    field_vals = field_vals.substring(0,field_vals.length-2);

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=setMetadata&id=' + asset_id + '&field_id=' + field_ids + '&field_val=' + field_vals;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end setMetadataAllFields()


/**
 * This will send an asset to the trash
 *
 * @param array | string     asset_ids       Id of the asset(s) to delete
 * @param function           dataCallback    Custom callback function
 *
 * @version $Revision: 0.1
 */
function trashAsset(asset_ids, dataCallback)
{
    if (typeof(asset_ids) != 'string') {
        // Create blank function
        var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};
        var ids = '';

        for (var index in asset_ids) {
            // construct our query strings to be passed
            ids = ids + asset_ids[index] + '\\,';
        }

        // remove the trailing "\,"
        ids = ids.substring(0, ids.length-2);
    } else {
        ids = asset_ids;
    }

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=trashAsset&assetid=' + ids;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end trashAsset


/**
 * This will return child asset ids of the passed asset
 *
 * @param string     asset_id        Id of the asset to get children of
 * @param number     levels          Number of levels to return
 * @param function   dataCallback    Custom callback function
 *
 *
 */
function getChildren(asset_id, levels, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Check to see if we have set any levels
    var levels = typeof(levels) != 'undefined' ? levels : 0;

    // Build our string
    var url = _api_url +
        '?key=' + _api_key +
        '&type=getChildren&id=' + asset_id +
        '&depth=' + levels;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getChildren


/**
 * This return parents of the passed id
 *
 * @param string     asset_id        Id of the asset to get parents of
 * @param number     levels          Number of levels to return
 * @param function   dataCallback    Custom callback function
 *
 */
function getParents(asset_id, levels, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Check to see if we have set any levels
    var levels = typeof(levels) != 'undefined' ? levels : 0;

    // Build our string
    var url = _api_url + '?key=' + _api_key +
        '&type=getParents&id=' + asset_id +
        '&depth=' + levels;


    // Make our request
    makeRequest(url, true, dataCallback);

}//end getParents


/**
 * This returns permissions for an asset
 *
 * @param string     asset_id        Id of the asset to get permissions for
 * @param string     level           1=READ 2=WRITE 3=ADMIN
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.2
 */
function getPermissions(asset_id, level, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getPermissions&id=' + asset_id + '&level=' + level;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getPermissions


/**
 * Creates an asset
 *
 * @param integer    parent_id           Parentid of the new parent
 * @param string     type_code           Type code of new asset
 * @param string     asset_name          Name for new asset
 * @param integer    link_type           Type of link to create
 * @param string     link_value          Value of the link
 * @param integer    sort_order          Order in the tree
 * @param integer    is_dependant        Dependant to parent
 * @param integer    is_exclusive        Exclusive to parent
 * @param integer    extra_attributes    Allows additional attributes
 * @param string     attributes          String of additional query string containing key/pair values
 *
 * @version $Revision: 0.2
 */
function createAsset(parent_id, type_code, asset_name, link_type, link_value, sort_order, is_dependant, is_exclusive, extra_attributes, attributes, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Check to see if we have set values
    if (!isset(link_type)) link_type = '';
    if (!isset(link_value)) link_value = '';
    if (!isset(sort_order)) sort_order = '';
    if (!isset(is_dependant)) is_dependant = '';
    if (!isset(is_exclusive)) is_exclusive = '';
    if (!isset(extra_attributes)) extra_attributes = '';
    if (!isset(attributes)) attributes = '';

    // Build our string
    var url =   _api_url + '?key=' + _api_key + '&type=createAsset' +
        '&id=' + parent_id +
        '&type_code=' + type_code +
        '&asset_name=' + asset_name.replace(/&/g , "%26").replace(/#/g , "%23").replace(/\?/g , "%3F").replace(/\+/g , "%2B") +
        '&link_type=' + link_type +
        '&link_value=' + link_value.replace(/&/g , "%26").replace(/#/g , "%23").replace(/\?/g , "%3F").replace(/\+/g , "%2B") +
        '&sort_order=' + sort_order +
        '&is_dependant=' + is_dependant +
        '&is_exclusive=' + is_exclusive +
        '&extra_attributes=' + extra_attributes +
        '&' + attributes;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end createAsset


/**
 * Returns asset type codes
 *
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.2
 */
function getAssetTypes(dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getAssetTypes&id=1';

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getAssetTypes


/**
 * Gets information for lock type passed
 *
 * @param string     asset_id        Id of the asset to get locks for
 * @param string     screen_name     The screen to get locks for
 * @param function   dataCallback    Custom callback function
 *
 *
 */
function getLocksInfo(asset_id, screen_name, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // If the user does not set it, we get all locks
    if (!isset(screen_name) || screen_name == '') screen_name = 'all';

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getLocksInfo&id=' + asset_id + '&screen=' + screen_name;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getLocksInfo()


/**
 * Acquires a lock
 *
 * @param string     asset_id        Id of the asset to get locks for
 * @param string     screen_name     The screen to get locks for
 * @param boolean    dependants_only whether dependants only or all children, defaults to true
 * @param boolean    force_acquire   whether to attempt to forceably acquire the lock or not,  defaults to false
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.2
 */
function acquireLock(asset_id, screen_name, dependants_only, force_acquire, dataCallback)
{
    var dependants_only = isset(dependants_only) && ( dependants_only.toString().toLowerCase() != 'null' && dependants_only != '' ) ? dependants_only : 1;
    var force_acquire = isset(force_acquire) && ( force_acquire.toString().toLowerCase() != 'null' && force_acquire != '' ) ? force_acquire : 0;

    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // we cannot pass TRUE or FALSE as string so lets do our conversion
    // but try conversion only if its a string still
    if (typeof(dependants_only) == 'string') {
        if (dependants_only.toLowerCase() == 'false') {
            dependants_only = 0;
        } else if (dependants_only.toLowerCase() == 'true') {
            dependants_only = 1;
        }
    }

    if (typeof(force_acquire) == 'string') {
        if (force_acquire.toLowerCase() == 'false') {
            force_acquire = 0;
        } else if (force_acquire.toLowerCase() == 'true') {
            force_acquire = 1;
        }
    }

    // If the user does not set it, we get all locks
    if (!isset(screen_name) || screen_name == '') screen_name = 'all';

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=acquireLock&id=' + asset_id + '&screen=' + screen_name + '&dependants_only=' + dependants_only + '&force_acquire=' + force_acquire;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end acquireLock


/**
 * Releases a lock
 *
 * @param string     asset_id        Id of the asset to release locks for
 * @param string     screen_name     The screen to release locks for
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.2
 */
function releaseLock(asset_id, screen_name, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // If the user does not set it, we get all locks
    if (!isset(screen_name) || screen_name == '') screen_name = 'all';

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=releaseLock&id=' + asset_id + '&screen=' + screen_name;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end releaseLock


/**
 * Creates a link between two assets
 *
 * @param integer    parent_id       Major asset id we are linking from
 * @param integer    child_id        Minor asset id we are linking to
 * @param integer    link_type       Type of link to create
 * @param string     link_value      Value of the link
 * @param integer    sort_order      Order in the tree
 * @param integer    is_dependant    Dependant to parent
 * @param integer    is_exclusive    Exclusive to parent
 *
 * @version $Revision: 0.2
 */
function createLink(parent_id, child_id, link_type, link_value, sort_order, is_dependant, is_exclusive, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Check to see if we have set values
    if (!isset(link_type)) link_type = '1';
    if (!isset(link_value)) link_value = '';
    if (!isset(sort_order)) sort_order = '';
    if (!isset(is_dependant)) is_dependant = '';
    if (!isset(is_exclusive)) is_exclusive = '';

    // Build our string
    var url =   _api_url + '?key=' + _api_key + '&type=createLink' +
        '&id=' + child_id +
        '&parent_id=' + parent_id +
        '&link_type=' + link_type +
        '&link_value=' + link_value +
        '&sort_order=' + sort_order +
        '&is_dependant=' + is_dependant +
        '&is_exclusive=' + is_exclusive;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end createLink


/**
 * Removes a link between a parent and child
 *
 * @param string     parent_id       Id of the parent
 * @param string     child_id        Id of the child
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.2
 */
function removeLink(parent_id, child_id, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=removeLink&id=' + child_id + '&parent_id=' + parent_id;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end removeLink


/**
 * Removes multiple links between parent and child pairs
 *
 * @param json object    link_info       array of link_info
 * example :
 *       var link_info = {
 *           "links":[
 *               {
 *                   "parent": parent,
 *                   "child": child,
 *                   "link_type": link_type,
 *                   "link_value": link_value,
 *               },
 *               {
 *                   "parent": parent_2,
 *                   "child": child_2,
 *                   "link_type": link_type_2,
 *                   "link_value": link_value,
 *               },
 *               {
 *                   "parent": parent_3,
 *                   "child": child_3,
 *                   "link_type": link_type_3,
 *                   "link_value": link_value,
 *               },
 *           ]
 *        };
 * @param function       dataCallback    Custom callback function
 *
 */
function removeMultipleLinks(link_info, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};
    var parentid = '';
    var childid = '';
    var link_type = '';
    var link_value = '';

    for (var x = 0; x < link_info.links.length; x++) {
        link_typ = isset(link_info.links[x].link_type) ?  link_info.links[x].link_type : '' ;
        link_val = isset(link_info.links[x].link_value) ?  link_info.links[x].link_value : '' ;

        parentid = parentid + link_info.links[x].parent + '\\,';
        childid = childid + link_info.links[x].child + '\\,';
        link_type = link_type + link_typ + '\\,';
        link_value = link_value + link_val.replace(/&/g , "%26").replace(/#/g , "%23").replace(/\?/g , "%3F").replace(/\+/g , "%2B") + '\\,';
    }

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=removeMultipleLinks&parent_id=' + parentid.substring(0, parentid.length-2) +
        '&child_id=' + childid.substring(0, childid.length-2) +
        '&link_type=' + link_type.substring(0, link_type.length-2) +
        '&link_value=' + link_value.substring(0, link_value.length-2)

        // Make our request
        makeRequest(url, true, dataCallback);

}//end removeMultipleLinks


/**
 * Moves a link from one parent to another
 *
 * @param string     old_parent_id           Id of the old parent
 * @param string     child_id                Id of the child
 * @param string     new_parent_id           Id of the new parent
 * @param string     link_type               Type of link to use
 * @param string     new_position            The new position
 * @param function   dataCallback            Custom callback function
 *
 * @version $Revision: 0.2
 */
function moveLink(old_parent_id, child_id, new_parent_id, link_type, new_position, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Check to see if we have set values
    if (!isset(link_type)) link_type = '1';
    if (!isset(new_position)) new_position = '0';

    // Build our string
    var url =   _api_url + '?key=' + _api_key + '&type=moveLink' +
        '&id=' + child_id +
        '&old_parent_id=' + old_parent_id +
        '&new_parent_id=' + new_parent_id +
        '&link_type=' + link_type +
        '&new_position=' + new_position;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end moveLink


/**
 * Updates a link
 *
 * @param string     parent_id               id of the parent
 * @param string     child_id                id of the child
 * @param string     link_type               type of link to use
 * @param string     link_value              value to set the link to
 * @param string     new_position            the new position
 * @param string     locked                  the asset's link lock status
 * @param function   dataCallback            custom callback function
 *
 * @version $Revision: 0.2
 */
function updateLink(parent_id, child_id, link_type, link_value, sort_order, locked, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Check to see if we have set values
    if (!isset(link_type)) link_type = '';
    if (!isset(link_value)) link_value = '';
    if (!isset(sort_order)) sort_order = '';
    if (!isset(locked)) locked = '';

    // Build our string
    var url =   _api_url + '?key=' + _api_key + '&type=updateLink' +
        '&id=' + child_id +
        '&parent_id=' + parent_id +
        '&link_type=' + link_type +
        '&link_value=' + link_value.replace(/&/g , "%26").replace(/#/g , "%23").replace(/\?/g , "%3F").replace(/\+/g , "%2B") +
        '&sort_order=' + sort_order +
        '&locked=' + locked;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end updateLink


/**
 * Updates multiple links
 *
 * @param json object    link_info       Array of all the link information
 * example :
 *       var link_info = {
 *           "links":[
 *               {
 *                   "parent": parent,
 *                   "child": child,
 *                   "link_type": link_type,
 *                   "link_value": link_value,
 *                   "sort_order": sort_order,
 *                   "link_lock": link_lock,
 *               },
 *               {
 *                   "parent": parent_2,
 *                   "child": child_2,
 *                   "link_type": link_type_2,
 *                   "link_value": link_value_2,
 *                   "sort_order": sort_order_2,
 *                   "link_lock": link_lock_2,
 *               },
 *               {
 *                   "parent": parent_3,
 *                   "child": child_3,
 *                   "link_type": link_type_3,
 *                   "link_value": link_value_3,
 *                   "sort_order": sort_order_3,
 *                   "link_lock": link_lock_3,
 *               },
 *           ]
 *        };
 * @param function       dataCallback    Custom callback function
 *
 * @version $Revision: 0.2
 */
function updateMultipleLinks(link_info, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};
    var parentid = '';
    var childid = '';
    var link_type = '';
    var link_value = '';
    var sort_order = '';
    var locked = '';

    for (var x = 0; x < link_info.links.length; x++) {
        link_typ = isset(link_info.links[x].link_type) ?  link_info.links[x].link_type : '' ;
        link_val = isset(link_info.links[x].link_value) ?  link_info.links[x].link_value : '' ;
        sort_ord = isset(link_info.links[x].sort_order) ?  link_info.links[x].sort_order : '' ;
        lock     = isset(link_info.links[x].link_lock) ?  link_info.links[x].link_lock : '' ;

        parentid = parentid + link_info.links[x].parent + '\\,';
        childid = childid + link_info.links[x].child + '\\,';
        link_type = link_type + link_typ + '\\,';
        link_value = link_value + link_val.replace(/&/g , "%26").replace(/#/g , "%23").replace(/\?/g , "%3F").replace(/\+/g , "%2B") + '\\,';
        sort_order = sort_order + sort_ord + '\\,';
        locked = locked + lock + '\\,';
    }

    // Build our string
    var url =   _api_url + '?key=' + _api_key + '&type=updateMultipleLinks' +
        '&parent_id=' + parentid.substring(0, parentid.length-2) +
        '&child_id=' + childid.substring(0, childid.length-2) +
        '&link_type=' + link_type.substring(0, link_type.length-2) +
        '&link_value=' + link_value.substring(0, link_value.length-2) +
        '&sort_order=' + sort_order.substring(0, sort_order.length-2) +
        '&locked=' + locked.substring(0, locked.length-2);

    // Make our request
    makeRequest(url, true, dataCallback);

}//end updateMultipleLinks()



/**
 * Returns the link id between a parent and child
 *
 * @param string     parent_id       Id of the parent
 * @param string     child_id        Id of the child
 * @param function   all_info        if we want all the link information or just linkid
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.2
 */
function getLinkId(parent_id, child_id, all_info, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};
    var all_info = isset(all_info) ? all_info : 0;

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getLinkId&id=' + child_id + '&parent_id=' + parent_id + '&all_info=' + all_info;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getLinkId


/**
 * This will return tree information for children
 *
 * @param string     asset_id        Id of the asset to get children of
 * @param number     levels          Number of levels to return
 * @param function   dataCallback    Custom callback function
 *
 * @version $Revision: 0.2
 */
function getAssetTree(asset_id, levels, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Check to see if we have set any levels
    var levels = typeof(levels) != 'undefined' ? levels : 0;

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getAssetTree&id=' + asset_id + '&depth=' + levels;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getAssetTree


/**
 * This will get replacements for the passed in keywords
 *
 * @param string     asset_id        Id of the asset to get children of
 * @param array      keywords        Array of keywords to get replacements for
 * @param function   dataCallback    Custom callback function
 *
 */
function getKeywordsReplacements(asset_id, keywords_array, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    var keywords = '';
    for (var keyword in keywords_array) {
        // construct our query strings to be passed
        if (keywords_array[keyword] == '') continue;
        keywords = keywords + keywords_array[keyword] + '\\,';
    }

    // remove the trailing "\,"
    keywords = keywords.substring(0, keywords.length-2);

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getKeywordsReplacements&id=' + asset_id + '&keywords=' + keywords;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getKeywordsReplacements()


/**
 * This will set Asset to the status that is passed in
 *
 * @param string     asset_id        id of the asset to get children of
 * @param int        status          status tha asset is to be set to
 * @param boolean    cascade         if to cascade the status to non-dependant children(false by default)
 * @param string     workflow_stream workflow stream to be passed in
 * @param function   dataCallback    custom callback function
 *
 *
 */
function setAssetStatus(asset_id, status, cascade, workflow_stream, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};
    var workflow_stream  = isset(workflow_stream) ? workflow_stream : '';
    var cascade = isset(cascade) && ( cascade.toString().toLowerCase() != 'null' && cascade != '' ) ?  cascade : 0;

    // we cannot pass TRUE or FALSE as string so lets do our conversion
    // but try conversion only if its a string still
    if (typeof(cascade) == 'string') {
        if (cascade.toLowerCase() == 'false') {
            cascade = 0;
        } else if (cascade.toLowerCase() == 'true') {
            cascade = 1;
        }
    }

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=setAssetStatus&id=' + asset_id + '&status=' + status + '&cascade=' + cascade + '&workflow_stream=' + workflow_stream.replace(/&/g , "%26").replace(/#/g , "%23").replace(/\?/g , "%3F").replace(/\+/g , "%2B");

    // Make our request
    makeRequest(url, true, dataCallback);

}//end setAssetStatus()


/**
 * This will get the Child count for the passed in asset
 *
 * @param string     asset_id        Id of the asset to get children of
 * @param number     level           Number of levels to return, default all
 * @param function   dataCallback    Custom callback function
 *
 *
 */
function getChildCount(asset_id, level, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};
    // Check to see if we have set any levels
    var level = isset(level) ? level : 0;

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getChildCount&asset_id=' + asset_id + '&depth=' + level;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getChildCount()


/**
 * This will get webpath(s) of the assetid supplied
 *
 * @param string     asset_id        Id of the asset to get webpaths for
 * @param function   dataCallback    Custom callback function
 *
 *
 */
function getWebPath(asset_id, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getWebPath&id=' + asset_id;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getWebPath()


/**
 * This will set webpath(s) of the assetid supplied
 *
 * @param string     asset_id        Id of the asset to get webpaths for
 * @param array      paths           new web paths to be assigned to asset
 * @param boolean    auto_remap      if we auto remaping(default to TRUE)
 * @param function   dataCallback    Custom callback function
 *
 *
 */
function setWebPath(asset_id, paths, auto_remap ,dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};
    var auto_remap = isset(auto_remap) && ( auto_remap.toString().toLowerCase() != 'null' && auto_remap != '' ) ?  auto_remap : 1;

    // we cannot pass TRUE or FALSE as string so lets do our conversion
    // but try conversion only if its a string still
    if (typeof(auto_remap) == 'string') {
        if (auto_remap.toLowerCase() == 'false') {
            auto_remap = 0;
        } else if (auto_remap.toLowerCase() == 'true') {
            auto_remap = 1;
        }
    }

    var webpath = '';
    for (var path in paths) {
        // construct our query strings to be passed
        webpath = webpath + paths[path].replace(/&/g , "%26").replace(/#/g , "%23").replace(/\?/g , "%3F").replace(/\+/g , "%2B") + '\\,';
    }

    // remove the trailing "\,"
    webpath = webpath.substring(0, webpath.length-2);


    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=setWebPath&id=' + asset_id + '&webpath=' + webpath + '&auto_remap=' + auto_remap ;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end setWebPath()


/**
 * This function will tell us if we have a runnig workflow on the passed assetid
 *
 * @param string     asset_id        Id of the asset to get webpaths for
 * @param boolean    granted         what is the status of workflow we are trying to get (default to NULL)
 *                                   TRUE => granted, FALSE => denied, NULLL => get all
 * @param boolean    running         if we only are getting wokflows that are running (default to FALSE)
 * @param function   dataCallback    Custom callback function
 *
 *
 */
function getWorkflowSchema(asset_id, granted, running, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};
    var granted = isset(granted) && ( granted.toString().toLowerCase() != 'null' && granted != '' ) ? granted : '';
    var running = isset(running) && ( running.toString().toLowerCase() != 'null' && running != '' ) ? running : 0;

    // we cannot pass TRUE or FALSE as string so lets do our conversion
    // but try conversion only if its a string still
    // but try conversion only if its a string still
    if (typeof(granted) == 'string') {
        if (granted.toLowerCase() == 'false') {
            granted = 0;
        } else if (granted.toLowerCase() == 'true') {
            granted = 1;
        }
    }
    if (typeof(running) == 'string') {
        if (running.toLowerCase() == 'false') {
            running = 0;
        } else if (running.toLowerCase() == 'true') {
            running = 1;
        }
    }

    // Build our string
    var url = _api_url + '?key=' + _api_key + '&type=getWorkflowSchema&id=' + asset_id + '&granted=' + granted + '&running=' + running;

    // Make our request
    makeRequest(url, true, dataCallback);

}//end getWorkflowSchema()


/**
 * This function will create file type asset of the type_code provided
 *
 * @param    string      parentID        asset ID of parent where the new asset will be linked to
 * @param    string      type_code       type_code of the new asset(default to 'file')
 * @param    string      friendly_name   friendly name of the new asset to be created
 * @param    string      link_type       type of link to create to the parent for this new asset(SQ_LINK_TYPE_1 link by default)
 *                                       Valid Values - SQ_LINK_TYPE_1, SQ_LINK_TYPE_2, SQ_LINK_TYPE_3, SQ_LINK_NOTICE
 * @param    string      link_value      value of link to create to the parent for this new asset('' by default)
 * @param    function    dataCallback    Custom callback function
 *
 *
 */
function createFileAsset(parentID, type_code, friendly_name, link_type, link_value, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};
    var type_code = (isset(type_code) && type_code != '' ) ? type_code : 'file';
    var friendly_name  = isset(friendly_name) ? friendly_name : '';
    var link_type = (isset(link_type) && link_type != '') ? link_type : SQ_LINK_TYPE_1;
    var link_value = isset(link_value) ? link_value : '';

    var url = _api_url +
        '?key=' + _api_key +
        '&type=createFileAsset&id=' + parentID +
        '&type_code=' + type_code +
        '&friendly_name=' + friendly_name +
        '&link_type=' + link_type +
        '&link_value=' + link_value;

    // Make our request
    makeRequest(url, true, dataCallback);


}//end createFileAsset()


/**
 * This function will let user edit content of Editable File type assets
 * File type that can be edited - css_file, xml_file, css_file, text_file, xsl_file, js_file
 * User needs to acquire locks before being able to edit the file
 *
 *
 * @param    string      assetID         Id of the asset to update content for
 * @param    string      content         new content of the asset
 * @param    function    dataCallback    Custom callback function
 *
 */
function setContentOfEditableFileAsset(assetID, content, dataCallback)
{
    // Create blank function
    var dataCallback = typeof(dataCallback) != 'undefined' ? dataCallback : function() {};

    var content = isset(content) ? escape(content) : 'no_value_provided';

    var url = _api_url +
        '?key=' + _api_key +
        '&type=setContentOfEditableFileAsset&id=' + assetID +
        '&content=' + content ;

    // Make our request
    makeRequest(url, true, dataCallback);


}// end setContentOfEditableFileAsset()



