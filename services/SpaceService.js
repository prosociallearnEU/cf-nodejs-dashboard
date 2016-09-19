/*jslint node: true*/
"use strict";

var CloudController = require("cf-nodejs-client").CloudController;
var CloudFoundryUsersUAA = require("cf-nodejs-client").UsersUAA;
var CloudFoundrySpaces = require("cf-nodejs-client").Spaces;

CloudController = new CloudController();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();
CloudFoundrySpaces = new CloudFoundrySpaces();

function SpaceServices(_CF_API_URL, _username, _password) {
    this.CF_API_URL = _CF_API_URL;
    this.username = _username;
    this.password = _password;
}

SpaceServices.prototype.setEndpoint = function (endpoint) {
    this.CF_API_URL = endpoint;
};

SpaceServices.prototype.setCredential = function (username, password) {
    this.username = username;
    this.password = password;
};

SpaceServices.prototype.getApps = function (space_guid) {
    var token_endpoint = null;
    var authorization_endpoint = null;

    var self = this;
    var results = null;
    var apps = null;   

    return new Promise(function (resolve, reject) {
        try {
            CloudController.setEndPoint(self.CF_API_URL);
            CloudFoundrySpaces.setEndPoint(self.CF_API_URL);
            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundrySpaces.setToken(result);
                return CloudFoundrySpaces.getSpaceApps(space_guid);
            }).then(function (result) {
                apps = result;
                results = {
                    apps: apps
                };                           
                return resolve(results);
            }).catch(function (reason) {
                console.error("Error: " + reason);
                return reject(reason);
            });
        } catch (error) {
            return reject(error);
        }
    });
};

module.exports = SpaceServices;