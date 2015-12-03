/*jslint node: true*/

var CloudFoundry = require("cf-nodejs-client").CloudFoundry;
var CloudFoundryUsersUAA = require("cf-nodejs-client").UsersUAA;
var CloudFoundrySpaces = require("cf-nodejs-client").Spaces;
CloudFoundry = new CloudFoundry();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();
CloudFoundrySpaces = new CloudFoundrySpaces();

function SpaceServices(_CF_API_URL, _username, _password) {
    "use strict";
    this.CF_API_URL = _CF_API_URL;
    this.username = _username;
    this.password = _password;
}

SpaceServices.prototype.setEndpoint = function (endpoint) {
    "use strict";
    this.CF_API_URL = endpoint;
};

SpaceServices.prototype.setCredential = function (username, password) {
    "use strict";
    this.username = username;
    this.password = password;
};

SpaceServices.prototype.getApps = function (space_guid) {
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;
    var results = null;
    var apps = null;   

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.setEndPoint(self.CF_API_URL);
            CloudFoundrySpaces.setEndPoint(self.CF_API_URL);

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;             
                return CloudFoundrySpaces.getSpaceApps(token_type, access_token, space_guid);
            }).then(function (result) {
                apps = result;

                results = {
                    apps: apps
                }                              
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