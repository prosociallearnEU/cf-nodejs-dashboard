/*jslint node: true*/
"use strict";

//CF
var config = require('../config.json');
var CloudFoundry = require("cf-nodejs-client").CloudFoundry;
var CloudFoundryApps = require("cf-nodejs-client").Apps;
CloudFoundry = new CloudFoundry(config.CF_API_URL);
CloudFoundryApps = new CloudFoundryApps(config.CF_API_URL);

var AppMacros = require("./AppMacros");
AppMacros = new AppMacros(config.CF_API_URL, config.username, config.password);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

exports.getApps = function (req, res) {

    console.log("GET Apps");

    var token_endpoint = null;

    CloudFoundry.getInfo().then(function (result) {
        token_endpoint = result.token_endpoint;
        return CloudFoundry.login(token_endpoint, config.username, config.password);
    }).then(function (result) {
        return CloudFoundryApps.getApps(result.token_type, result.access_token);
    }).then(function (result) {
        res.json(result);
    }).catch(function (reason) {
        res.json({"error": reason});
    });

};

exports.view = function (req, res) {

    console.log("GET View App");

    var app_guid = req.params.guid;
    console.log(app_guid);
    var token_endpoint = null;

    CloudFoundry.getInfo().then(function (result) {
        token_endpoint = result.token_endpoint;
        return CloudFoundry.login(token_endpoint, config.username, config.password);
    }).then(function (result) {
        return CloudFoundryApps.getSummary(result.token_type, result.access_token, app_guid);    
    }).then(function (result) {
        res.json(result);
    }).catch(function (reason) {
        res.json({"error": reason});
    });

};

exports.create = function (req, res) {

    console.log("POST Create App");

    var appName = req.body.appname;
    var staticBuildPack = "https://github.com/cloudfoundry/staticfile-buildpack";

    console.log(appName);

    return AppMacros.createApp(appName,staticBuildPack).then(function (result) {
        var app_guid = result.metadata.guid;
        res.json(result); 
    }).catch(function (reason) {
        res.json({"error": reason});
    });

};

exports.upgrade = function (req, res) {

    console.log("POST Upgrade App");

    var app_guid = req.body.guid;
    var appName = "demo";
    var zipPath = "./staticApp.zip";

    console.log(app_guid);
    console.log(appName);
    console.log(zipPath);

    var token_endpoint = null;

    CloudFoundry.getInfo().then(function (result) {
        token_endpoint = result.token_endpoint;
        return CloudFoundry.login(token_endpoint, config.username, config.password);
    }).then(function (result) { 
        return CloudFoundryApps.uploadApp(result.token_type, result.access_token, appName, app_guid, zipPath);       
    }).then(function (result) {         
        console.log(result);
        res.json("result" + "demo");
    }).catch(function (reason) {
        res.json({"error": reason});
    });
 

};

exports.stop = function (req, res) {

    console.log("POST Stop App");

    var app_guid = req.body.guid;
    console.log(app_guid);


    var token_endpoint = null;

/*
    CloudFoundry.getInfo().then(function (result) {
        token_endpoint = result.token_endpoint;
        return CloudFoundry.login(token_endpoint, config.username, config.password);
    }).then(function (result) { 
        return CloudFoundryApps.uploadApp(result.token_type, result.access_token, appName, app_guid, zipPath);       
    }).then(function (result) {         
        console.log(result);
        res.json("result" + "demo");
    }).catch(function (reason) {
        res.json({"error": reason});
    });

            return CloudFoundry.login(token_endpoint, username, password).then(function (result) {
                return CloudFoundryApps.stopApp(result.token_type, result.access_token, app_guid);
            });    
*/
    res.json("result" + "demo");
 

};

exports.startApp = function (req, res) {

    console.log("POST Start App");

    var app_guid = req.body.guid;
    console.log(app_guid);


    var token_endpoint = null;

/*
    CloudFoundry.getInfo().then(function (result) {
        token_endpoint = result.token_endpoint;
        return CloudFoundry.login(token_endpoint, config.username, config.password);
    }).then(function (result) { 
        return CloudFoundryApps.uploadApp(result.token_type, result.access_token, appName, app_guid, zipPath);       
    }).then(function (result) {         
        console.log(result);
        res.json("result" + "demo");
    }).catch(function (reason) {
        res.json({"error": reason});
    });
*/

/*
                return CloudFoundry.login(token_endpoint, username, password).then(function (result) {
                    return CloudFoundryApps.startApp(result.token_type, result.access_token, app_guid);
                });
 */

    res.json("result" + "demo");
 

};
