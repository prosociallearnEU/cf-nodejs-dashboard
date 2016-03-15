/*jslint node: true*/
"use strict";

var CloudController = require("cf-nodejs-client").CloudController;
var CloudFoundryApps = require("cf-nodejs-client").Apps;
var CloudFoundrySpaces = require("cf-nodejs-client").Spaces;
var CloudFoundryDomains = require("cf-nodejs-client").Domains;
var CloudFoundryRoutes = require("cf-nodejs-client").Routes;
var CloudFoundryUserProvidedServices = require("cf-nodejs-client").UserProvidedServices;
var CloudFoundryServiceBindings = require("cf-nodejs-client").ServiceBindings;

CloudController = new CloudController();
CloudFoundryApps = new CloudFoundryApps();
CloudFoundrySpaces = new CloudFoundrySpaces();
CloudFoundryDomains = new CloudFoundryDomains();
CloudFoundryRoutes = new CloudFoundryRoutes();
CloudFoundryUserProvidedServices = new CloudFoundryUserProvidedServices();
CloudFoundryServiceBindings = new CloudFoundryServiceBindings();

function ServicesService(_CF_API_URL, _username, _password) {    
    this.CF_API_URL = _CF_API_URL;
    this.username = _username;
    this.password = _password;
}

ServicesService.prototype.setEndpoint = function (endpoint) {
    this.CF_API_URL = endpoint;
};

ServicesService.prototype.setCredential = function (username, password) {
    this.username = username;
    this.password = password;
};

ServicesService.prototype.getServices = function () {
    var token_endpoint = null;

    var self = this;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryUserProvidedServices.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        CloudController.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            return CloudController.login(token_endpoint, self.username, self.password);
        }).then(function (result) {
            return CloudFoundryUserProvidedServices.getServices(result.token_type, result.access_token);
        }).then(function (result) {
            return resolve(result);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

ServicesService.prototype.getService = function (service_guid) {
    var token_endpoint = null;
    var self = this;
    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryUserProvidedServices.setEndPoint(this.CF_API_URL);
    return new Promise(function (resolve, reject) {
        CloudController.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            return CloudController.login(token_endpoint, self.username, self.password);
        }).then(function (result) {
            return CloudFoundryUserProvidedServices.getService(result.token_type, result.access_token, service_guid);
        }).then(function (result) {
            return resolve(result);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

ServicesService.prototype.removeService = function (service_guid) {
    var token_endpoint = null;

    var self = this;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryUserProvidedServices.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        CloudController.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            return CloudController.login(token_endpoint, self.username, self.password);
        }).then(function (result) {
            return CloudFoundryUserProvidedServices.delete(result.token_type, result.access_token, service_guid);
        }).then(function (result) {
            return resolve(result);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

ServicesService.prototype.addService = function (serviceName, host, port, username, password, dbname) {
    var token_endpoint = null;

    var self = this;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundrySpaces.setEndPoint(this.CF_API_URL);
    CloudFoundryUserProvidedServices.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        var token_type = null;
        var access_token = null;
        var space_guid = null;
        var credentials = {
            host: host,
            port: port,
            username: username,
            password: password,
            dbname: dbname
        };

        CloudController.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            return CloudController.login(token_endpoint, self.username, self.password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;
            return CloudFoundrySpaces.getSpaces(token_type, access_token).then(function (result) {
                return new Promise(function (resolve) {
                    space_guid = result.resources[0].metadata.guid;
                    //console.log("Space guid: ", space_guid);
                    return resolve();
                });
            });
        }).then(function () {
            return CloudFoundryUserProvidedServices.create(token_type, access_token, serviceName, space_guid, credentials);
        }).then(function (result) {
            return resolve(result);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

ServicesService.prototype.getAppsAvailableToBind = function () {
    var token_endpoint = null;

    var self = this;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        CloudController.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            return CloudController.login(token_endpoint, self.username, self.password);
        }).then(function (result) {
            return CloudFoundryApps.getApps(result.token_type, result.access_token);
        }).then(function (result) {
            return resolve(result);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

module.exports = ServicesService;