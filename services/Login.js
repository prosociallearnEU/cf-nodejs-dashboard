/*jslint node: true*/
"use strict";

var CloudController = require("cf-nodejs-client").CloudController;
var CloudFoundryUsersUAA = require("cf-nodejs-client").UsersUAA;
var Client = require('node-rest-client').Client; 
var client = new Client();


CloudController = new CloudController();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();

function Login() {
    return undefined;
}

Login.prototype.auth = function (endpoint, username, password) {
    CloudController.setEndPoint(endpoint);
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;
    return new Promise(function (resolve, reject) {
        try {
            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(username, password);
            }).then(function (result) {
                console.log(result);
                token_type = result.token_type;
                access_token = result.access_token;
                return resolve("{ \"auth_token\" :" + token_type + "\" " + access_token + "}");
            }).catch(function (reason) {
                return reject(reason);
            });
        } catch (error) {
            console.log(error);
            return reject(error);
        }
    });
};



Login.prototype.validateToken = function (userToken, adminToken) {
    return new Promise(function (fulfill, reject) {
        var argsAuthenticate = {
            headers: {
                "iPlanetDirectoryPro": adminToken, 
                "Content-Type": "application/json"
            },
            data: {
                "application":"game_deployer",
                "resources":["openam-psl.atosresearch.eu:5000"],
                "subject": {"ssoToken": userToken}
            }    
        };
        client.post("http://openam-psl.atosresearch.eu:8080/openam/json/policies?_action=evaluate", argsAuthenticate, function (data, response) {
            var hasAccess = false;
            if (data[0]!=null && data[0].actions!=null && data[0].actions.GET!=null) {
                hasAccess = data[0].actions.GET;
            }
            return fulfill (hasAccess);
        });
    });
}

Login.prototype.requestAdminToken = function () {
    var args = {
        data: { },
        headers: { 
            "X-OpenAM-Username": "amAdmin",
            "X-OpenAM-Password": "password",      
            "Content-Type": "application/json" 
        }
    };
   return new Promise(function (fulfill, reject) {
        client.post("http://openam-psl.atosresearch.eu:8080/openam/json/authenticate", args, function (data, response) {
            return fulfill(data.tokenId);
        });
    });
};

module.exports = Login;