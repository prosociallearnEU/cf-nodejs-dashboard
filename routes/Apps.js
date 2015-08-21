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
