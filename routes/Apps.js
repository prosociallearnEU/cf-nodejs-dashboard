/*jslint node: true*/
"use strict";

var config = require('../config.json');
var AppServices = require("../Services/AppServices");
AppServices = new AppServices(config.CF_API_URL, config.username, config.password);

exports.getApps = function (req, res) {

    console.log("GET Apps");

    return AppServices.getApps().then(function (result) {
        res.json(result);
    }).catch(function (reason) {
        res.json({"error": reason});
    });

};

exports.view = function (req, res) {

    console.log("GET View App");

    var app_guid = req.params.guid;
    console.log(app_guid);

    return AppServices.view(app_guid).then(function (result) {
        res.json(result);
    }).catch(function (reason) {
        res.json({"error": reason});
    });

};

exports.create = function (req, res) {

    console.log("POST Create App");

    var appName = req.body.appname;
    var staticBuildPack = "https://github.com/cloudfoundry/staticfile-buildpack";
    var app_guid = null;

    console.log(appName);

    return AppServices.createApp(appName, staticBuildPack).then(function (result) {
        app_guid = result.metadata.guid;
        res.json(app_guid);
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

    return AppServices.uploadApp(appName, app_guid, zipPath).then(function (result) {
        console.log(result);
        res.json(result);
    }).catch(function (reason) {
        console.log(reason);
        res.json({"error": reason});
    });

};

exports.stop = function (req, res) {

    console.log("POST Stop App");

    var app_guid = req.body.guid;
    console.log(app_guid);

    return AppServices.stop(app_guid).then(function (result) {
        console.log(result);
        res.json(result);
    }).catch(function (reason) {
        console.log(reason);
        res.json({"error": reason});
    });

};

exports.startApp = function (req, res) {

    console.log("POST Start App");

    var app_guid = req.body.guid;
    console.log(app_guid);

    return AppServices.start(app_guid).then(function (result) {
        console.log(result);
        res.json(result);
    }).catch(function (reason) {
        console.log(reason);
        res.json({"error": reason});
    });

};

exports.removeApp = function (req, res) {

    console.log("POST Remove App");

    var app_guid = req.body.guid;
    console.log(app_guid);

    return AppServices.remove(app_guid).then(function (result) {
        console.log(result);
        res.json(result);
    }).catch(function (reason) {
        console.log(reason);
        res.json({"error": reason});
    });

};

exports.open = function (req, res) {

    console.log("GET Open App");

    var app_guid = req.body.guid;
    console.log(app_guid);

    return AppServices.open(app_guid).then(function (result) {
        console.log(result);
        res.json(result);
    }).catch(function (reason) {
        console.log(reason);
        res.json({"error": reason});
    });

};

exports.upload = function (req, res) {

    console.log("POST Upload");

    console.log(req.file);

    res.sendStatus(200);
};
