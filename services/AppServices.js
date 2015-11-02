/*jslint node: true*/
/*globals Promise:true*/
"use strict";

var CloudFoundry = require("cf-nodejs-client").CloudFoundry;
var CloudFoundryApps = require("cf-nodejs-client").Apps;
var CloudFoundrySpaces = require("cf-nodejs-client").Spaces;
var CloudFoundryDomains = require("cf-nodejs-client").Domains;
var CloudFoundryRoutes = require("cf-nodejs-client").Routes;
var CloudFoundryJobs = require("cf-nodejs-client").Jobs;
var CloudFoundryLogs = require("cf-nodejs-client").Logs;
CloudFoundry = new CloudFoundry();
CloudFoundryApps = new CloudFoundryApps(this.CF_API_URL);
CloudFoundrySpaces = new CloudFoundrySpaces(this.CF_API_URL);
CloudFoundryDomains = new CloudFoundryDomains(this.CF_API_URL);
CloudFoundryRoutes = new CloudFoundryRoutes(this.CF_API_URL);
CloudFoundryJobs = new CloudFoundryJobs(this.CF_API_URL);
CloudFoundryLogs = new CloudFoundryLogs();

function AppServices(_CF_API_URL, _username, _password) {
    this.CF_API_URL = _CF_API_URL;
    this.username = _username;
    this.password = _password;
}

AppServices.prototype.setEndpoint = function (endpoint) {
    this.CF_API_URL = endpoint;
};

AppServices.prototype.setCredential = function (username, password) {
    this.username = username;
    this.password = password;
};

AppServices.prototype.createApp = function (appName, buildPack) {

    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;
    var app_guid = null;
    var space_guid = null;
    var domain_guid = null;
    var routeName = null;
    var route_guid = null;
    var route_create_flag = false;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundrySpaces.setEndPoint(this.CF_API_URL);
    CloudFoundryDomains.setEndPoint(this.CF_API_URL);
    CloudFoundryRoutes.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    var self = this;

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            authorization_endpoint = result.authorization_endpoint;

            return CloudFoundry.login(authorization_endpoint, self.username, self.password);
        }).then(function () {
            token_type = result.token_type;
            access_token = result.access_token;
            return CloudFoundrySpaces.getSpaces(token_type, access_token).then(function (result) {
                return new Promise(function (resolve) {
                    space_guid = result.resources[0].metadata.guid;
                    //console.log("Space guid: ", space_guid);
                    return resolve();
                });
            });
        //Does exist the application?   
        }).then(function () {
            var filter = {
                'q': 'name:' + appName,
                'inline-relations-depth': 1
            };
            return CloudFoundrySpaces.getSpaceApps(token_type, access_token, space_guid, filter);           
        }).then(function (result) {

            //If exist the application, Reject
            if (result.total_results === 1) {
                return new Promise(function (resolve, reject) {
                    return reject("EXIST_APP");
                });               
            } else {

                var appOptions = {
                    "name": appName,
                    "space_guid": space_guid,
                    "buildpack" : buildPack
                };

                return CloudFoundryApps.create(token_type, access_token, appOptions).then(function (result) {
                    return new Promise(function (resolve) {
                        app_guid = result.metadata.guid;
                        return resolve();
                    });
                });
            }
        }).then(function () {
            //TODO: How to make the inference?
            return CloudFoundryDomains.getSharedDomains(token_type, access_token);
        }).then(function () {
            return CloudFoundryDomains.getDomains(token_type, access_token).then(function (result) {
                return new Promise(function (resolve) {
                    domain_guid = result.resources[0].metadata.guid;
                    //console.log("Domain guid: " , domain_guid);
                    return resolve();
                });
            });
        }).then(function () {
            return CloudFoundryRoutes.checkRoute(token_type, access_token, appName, domain_guid).then(function (result) {
                return new Promise(function (resolve) {
                    if (result.total_results === 1) {
                        console.log("Exist a Route");
                        //console.log(result.resources);
                        route_guid = result.resources[0].metadata.guid;
                        console.log("Route guid: ", route_guid);
                        return resolve(result);
                    } else {
                        //Add Route
                        route_create_flag = true; //Workaround
                        return resolve();
                    }

                });
            });
        }).then(function () {
            //TODO: Refactor syntax to code in the right place
            if (route_create_flag) {
                //Add Route
                //console.log("Create a Route");
                routeName = appName;
                return CloudFoundryRoutes.addRoute(token_type, access_token, domain_guid, space_guid, routeName).then(function (result) {
                    return new Promise(function (resolve) {
                        //console.log(result);
                        route_guid = result.metadata.guid;
                        return resolve(result);
                    });
                });
            } else {
                return new Promise(function (resolve) {
                    return resolve();
                });
            }
        }).then(function () {
            return CloudFoundryApps.associateRoute(token_type, access_token, appName, app_guid, domain_guid, space_guid, route_guid);
        }).then(function (result) {
            //console.log(result);
            return resolve(result);
        }).catch(function (reason) {
            console.error("Error: " + reason);
            return reject(reason);
        });

    });

};

AppServices.prototype.uploadApp = function (app_guid, filePath) {

    console.log("upload");

    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    var self = this;

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            authorization_endpoint = result.authorization_endpoint;
            return CloudFoundry.login(token_endpoint, self.username, self.password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;
            return CloudFoundryApps.uploadApp(token_typetoken_type, access_token.access_token, app_guid, filePath, false);
        }).then(function (result) {
            console.log(result);
            return resolve(result);
        }).catch(function (reason) {
            return reject(reason);
        });

    });
};

AppServices.prototype.stop = function (app_guid) {

    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            authorization_endpoint = result.authorization_endpoint;            
            return CloudFoundry.login(authorization_endpoint, self.username, self.password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;            
            return CloudFoundryApps.stopApp(token_type, access_token, app_guid);
        }).then(function (result) {
            return resolve(result.entity.state);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

AppServices.prototype.view = function (app_guid) {

    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            authorization_endpoint = result.authorization_endpoint;
            return CloudFoundry.login(authorization_endpoint, self.username, self.password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;              
            return CloudFoundryApps.getSummary(token_type, access_token, app_guid);
        }).then(function (result) {
            return resolve(result);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

AppServices.prototype.getApps = function () {

    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            authorization_endpoint = result.authorization_endpoint;
            return CloudFoundry.login(authorization_endpoint, self.username, self.password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;             
            return CloudFoundryApps.getApps(token_type, access_token);
        }).then(function (result) {
            return resolve(result);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

AppServices.prototype.start = function (app_guid) {

    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            authorization_endpoint = result.authorization_endpoint;
            return CloudFoundry.login(token_endpoint, self.username, self.password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;             
            return CloudFoundryApps.startApp(token_type, access_token, app_guid);
        }).then(function (result) {
            console.log(result.entity.state);
            return resolve(result.entity.state);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

AppServices.prototype.remove = function (app_guid) {

    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;
    var route_guid = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            authorization_endpoint = result.authorization_endpoint;
            return CloudFoundry.login(authorization_endpoint, self.username, self.password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;    
            return CloudFoundryApps.getAppRoutes(token_type, access_token, app_guid);
        }).then(function (result) {
            route_guid = result.resources[0].metadata.guid;                      
            return CloudFoundryApps.deleteApp(token_type, access_token, app_guid);
        }).then(function (result) {
            return CloudFoundryRoutes.deleteRoute(token_type, access_token, route_guid);            
        }).then(function (result) {            
            console.log(result);
            return resolve(result);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

AppServices.prototype.open = function (app_guid) {

    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;
    var url = null;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    var self = this;

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            authorization_endpoint = result.authorization_endpoint;
            return CloudFoundry.login(authorization_endpoint, self.username, self.password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;              
            return CloudFoundryApps.getStats(token_type, access_token, app_guid);
        }).then(function (result) {
            if (result["0"].state === "RUNNING") {
                url = "http://" + result["0"].stats.uris[0];
                return resolve(url);
            }

            console.log("result");
            return reject("App is not OK");

        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

AppServices.prototype.getLogs = function (app_guid) {

    var token_endpoint = null;
    var logging_endpoint = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            logging_endpoint = result.logging_endpoint;

            //Process URL
            logging_endpoint = logging_endpoint.replace("wss", "https");
            logging_endpoint = logging_endpoint.replace(":4443", "");
            CloudFoundryLogs.setEndpoint(logging_endpoint);

            return CloudFoundry.login(token_endpoint, self.username, self.password);
        }).then(function (result) {
            return CloudFoundryLogs.getRecent(result.token_type, result.access_token, app_guid);
        }).then(function (result) {
            console.log(result);
            return resolve(result);
        }).catch(function (reason) {
            console.log(reason);
            return reject(reason);
        });

    });
};

module.exports = AppServices;