/*jslint node: true*/
"use strict";

var fs = require('fs');
var CloudController = require("cf-nodejs-client").CloudController;
var CloudFoundryUsersUAA = require("cf-nodejs-client").UsersUAA;
var CloudFoundryApps = require("cf-nodejs-client").Apps;
var CloudFoundrySpaces = require("cf-nodejs-client").Spaces;
var CloudFoundryDomains = require("cf-nodejs-client").Domains;
var CloudFoundryRoutes = require("cf-nodejs-client").Routes;
var CloudFoundryJobs = require("cf-nodejs-client").Jobs;
var CloudFoundryLogs = require("cf-nodejs-client").Logs;
var CloudFoundryServiceBindings = require("cf-nodejs-client").ServiceBindings;

CloudController = new CloudController();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();
CloudFoundryApps = new CloudFoundryApps();
CloudFoundrySpaces = new CloudFoundrySpaces();
CloudFoundryDomains = new CloudFoundryDomains();
CloudFoundryRoutes = new CloudFoundryRoutes();
CloudFoundryJobs = new CloudFoundryJobs();
CloudFoundryServiceBindings = new CloudFoundryServiceBindings();
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

AppServices.prototype.add = function (space_guid, appName, buildPack) {
    var token_endpoint = null;
    var authorization_endpoint = null;
    var app_guid = null;
    var domain_guid = null;
    var route_guid = null;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundrySpaces.setEndPoint(this.CF_API_URL);
    CloudFoundryDomains.setEndPoint(this.CF_API_URL);
    CloudFoundryRoutes.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);
    CloudFoundryLogs.setEndPoint(this.CF_API_URL);

    var self = this;

    return new Promise(function (resolve, reject) {

        try {

            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryDomains.setToken(result);
                CloudFoundrySpaces.setToken(result);
                CloudFoundryRoutes.setToken(result);
                CloudFoundryApps.setToken(result);
                return CloudFoundryDomains.getDomains().then(function (result) {
                    return new Promise(function (resolve) {
                        domain_guid = result.resources[0].metadata.guid;
                        return resolve();
                    });
                });

            //VALIDATIONS
            //1. Duplicated app
            }).then(function () {
                var filter = {
                    q: 'name:' + appName,
                    'inline-relations-depth': 1
                };
                return CloudFoundrySpaces.getSpaceApps(space_guid, filter).then(function (result) {
                    return new Promise(function (resolve, reject) {
                        if (result.total_results === 1) {
                            return reject("EXIST_APP");
                        }
                        return resolve();
                    });
                });
            //2. Duplicated route
            }).then(function () {
                var filter = {
                    q: 'host:' + appName + ';domain_guid:' + domain_guid,
                    'inline-relations-depth': 1
                };
                return CloudFoundryRoutes.getRoutes(filter).then(function (result) {
                    return new Promise(function (resolve, reject) {
                        if (result.total_results === 1) {
                            return reject("EXIST_ROUTE");
                        }
                        return resolve();
                    });
                });
            }).then(function () {
                var appOptions = {
                    name: appName,
                    space_guid: space_guid,
                    instances: 1,
                    memory: 256,
                    disk_quota: 256,
                    buildpack: buildPack
                };
                return CloudFoundryApps.add(appOptions).then(function (result) {
                    return new Promise(function (resolve) {
                        app_guid = result.metadata.guid;
                        return resolve();
                    });
                });
            }).then(function () {
                var routeOptions = {
                    domain_guid: domain_guid,
                    space_guid: space_guid,
                    host: appName
                };
                return CloudFoundryRoutes.add(routeOptions).then(function (result) {
                    return new Promise(function (resolve) {
                        route_guid = result.metadata.guid;
                        return resolve(result);
                    });
                });
            }).then(function () {
                return CloudFoundryApps.associateRoute(app_guid, route_guid);
            }).then(function (result) {
                return resolve(result);
            }).catch(function (reason) {
                console.error("Error: " + reason);
                return reject(reason);
            });

        } catch (error) {
            return reject(error);
        }

    });

};

AppServices.prototype.upload = function (app_guid, filePath) {
    var token_endpoint = null;
    var authorization_endpoint = null;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    var self = this;

    return new Promise(function (resolve, reject) {

        try {

            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryApps.setToken(result);
                return CloudFoundryApps.upload(app_guid, filePath, false);
            }).then(function (result) {
                console.log(result);
                return new Promise(function (resolve, reject) {
                    fs.unlink(filePath, function (error) {
                        if (error) {
                            return reject(error);
                        }
                        return resolve(result);
                    });
                });
            }).then(function (result) {
                return resolve(result);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });

        } catch (error) {
            return reject(error);
        }

    });
};

AppServices.prototype.stop = function (app_guid) {
    var token_endpoint = null;
    var authorization_endpoint = null;
    var self = this;
    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);
    return new Promise(function (resolve, reject) {
        try {
            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryApps.setToken(result);
                return CloudFoundryApps.stop(app_guid);
            }).then(function (result) {
                return resolve(result.entity.state);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });
        } catch (error) {
            return reject(error);
        }

    });
};

AppServices.prototype.update = function (app_guid, appOptions) {
    var token_endpoint = null;
    var authorization_endpoint = null;
    var self = this;
    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);
    return new Promise(function (resolve, reject) {
        try {
            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryApps.setToken(result);
                return CloudFoundryApps.update(app_guid, appOptions);
            }).then(function (result) {
                return resolve(result);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });
        } catch (error) {
            return reject(error);
        }
    });
};

AppServices.prototype.view = function (app_guid) {

    var token_endpoint = null;
    var authorization_endpoint = null;
    var self = this;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {
        try {

            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryApps.setToken(result);
                return CloudFoundryApps.getSummary(app_guid);
            }).then(function (result) {
                return resolve(result);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });
        } catch (error) {
            return reject(error);
        }
    });
};

AppServices.prototype.getApps = function () {
    var token_endpoint = null;
    var authorization_endpoint = null;
    var self = this;
    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);
    return new Promise(function (resolve, reject) {
        try {

            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryApps.setToken(result);
                return CloudFoundryApps.getApps();
            }).then(function (result) {
                return resolve(result);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });
        } catch (error) {
            return reject(error);
        }

    });
};

AppServices.prototype.start = function (app_guid) {
    var token_endpoint = null;
    var authorization_endpoint = null;
    var self = this;
    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);
    return new Promise(function (resolve, reject) {
        try {
            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryApps.setToken(result);
                return CloudFoundryApps.start(app_guid);
            }).then(function (result) {
                return resolve(result.entity.state);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });
        } catch (error) {
            return reject(error);
        }
    });
};

AppServices.prototype.restage = function (app_guid) {
    var token_endpoint = null;
    var authorization_endpoint = null;

    var self = this;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryApps.setToken(result);
                return CloudFoundryApps.restage(app_guid);
            }).then(function (result) {
                return resolve(result.entity.state);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });

        } catch (error) {
            return reject(error);
        }

    });
};

AppServices.prototype.remove = function (app_guid) {
    var token_endpoint = null;
    var authorization_endpoint = null;
    var route_guid = null;
    var no_route = false;
    var no_serviceBinding = false;

    var self = this;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);
    CloudFoundryRoutes.setEndPoint(this.CF_API_URL);
    CloudFoundryServiceBindings.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {
        try {
            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
               //app_guid
                var filter = {
                    'q': 'app_guid:' + app_guid
                };            
                CloudFoundryApps.setToken(result);
                CloudFoundryRoutes.setToken(result);
                CloudFoundryServiceBindings.setToken(result);
                return CloudFoundryServiceBindings.getServiceBindings(filter);
            }).then(function (result) {
                if(result.total_results === 0){
                    no_serviceBinding = true;
                } else {
                    return reject("EXIST_SERVICE_BINDING");
                }                
                return CloudFoundryApps.getAppRoutes(app_guid);
            }).then(function (result) {
                if(result.total_results === 0){
                    no_route = true;
                } else {
                    route_guid = result.resources[0].metadata.guid;
                }
                return CloudFoundryApps.remove(app_guid);
            }).then(function () {
                if(no_route) {
                    return resolve("NO_ROUTE");
                }
                return CloudFoundryRoutes.remove(route_guid);
            }).then(function (result) {
                return resolve(result);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });
        } catch (error) {
            return reject(error);
        }
    });
};

AppServices.prototype.open = function (app_guid) {
    var token_endpoint = null;
    var authorization_endpoint = null;
    var url = null;

    CloudController.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    var self = this;

    return new Promise(function (resolve, reject) {
        try {
            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                CloudFoundryApps.setToken(result);
                return CloudFoundryApps.getStats(app_guid);
            }).then(function (result) {
                if (result["0"].state === "RUNNING") {
                    url = "http://" + result["0"].stats.uris[0];
                    return resolve(url);
                }
                console.log(result);
                return reject(result);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });
        } catch (error) {
            return reject(error);
        }
    });
};

AppServices.prototype.getLogs = function (app_guid) {
    var token_endpoint = null;
    var authorization_endpoint = null;
    var logging_endpoint = null;

    var self = this;

    CloudController.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudController.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                logging_endpoint = result.logging_endpoint;

                //Process URL
                logging_endpoint = logging_endpoint.replace("wss", "https");
                logging_endpoint = logging_endpoint.replace(":4443", "");

                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                CloudFoundryLogs.setEndPoint(logging_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {                 
                 CloudFoundryLogs.setToken(result);
                return CloudFoundryLogs.getRecent(app_guid);
            }).then(function (result) {
                console.log(result);
                return resolve(result);
            }).catch(function (reason) {
                console.log(reason);
                return reject(reason);
            });

        } catch (error) {
            return reject(error);
        }

    });
};

module.exports = AppServices;