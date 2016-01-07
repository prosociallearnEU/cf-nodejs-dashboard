/*jslint node: true*/

var fs = require('fs');
var CloudFoundry = require("cf-nodejs-client").CloudFoundry;
var CloudFoundryUsersUAA = require("cf-nodejs-client").UsersUAA;
var CloudFoundryApps = require("cf-nodejs-client").Apps;
var CloudFoundrySpaces = require("cf-nodejs-client").Spaces;
var CloudFoundryDomains = require("cf-nodejs-client").Domains;
var CloudFoundryRoutes = require("cf-nodejs-client").Routes;
var CloudFoundryJobs = require("cf-nodejs-client").Jobs;
var CloudFoundryLogs = require("cf-nodejs-client").Logs;
CloudFoundry = new CloudFoundry();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();
CloudFoundryApps = new CloudFoundryApps(this.CF_API_URL);
CloudFoundrySpaces = new CloudFoundrySpaces(this.CF_API_URL);
CloudFoundryDomains = new CloudFoundryDomains(this.CF_API_URL);
CloudFoundryRoutes = new CloudFoundryRoutes(this.CF_API_URL);
CloudFoundryJobs = new CloudFoundryJobs(this.CF_API_URL);
CloudFoundryLogs = new CloudFoundryLogs();

function AppServices(_CF_API_URL, _username, _password) {
    "use strict";
    this.CF_API_URL = _CF_API_URL;
    this.username = _username;
    this.password = _password;
}

AppServices.prototype.setEndpoint = function (endpoint) {
    "use strict";
    this.CF_API_URL = endpoint;
};

AppServices.prototype.setCredential = function (username, password) {
    "use strict";
    this.username = username;
    this.password = password;
};

AppServices.prototype.add = function (space_guid, appName, buildPack) {
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;
    var app_guid = null;
    var domain_guid = null;
    var route_guid = null;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundrySpaces.setEndPoint(this.CF_API_URL);
    CloudFoundryDomains.setEndPoint(this.CF_API_URL);
    CloudFoundryRoutes.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    var self = this;

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;

                return CloudFoundryDomains.getDomains(token_type, access_token).then(function (result) {
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
                return CloudFoundrySpaces.getSpaceApps(token_type, access_token, space_guid, filter).then(function (result) {
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
                return CloudFoundryRoutes.getRoutes(token_type, access_token, filter).then(function (result) {
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
                return CloudFoundryApps.add(token_type, access_token, appOptions).then(function (result) {
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
                return CloudFoundryRoutes.add(token_type, access_token, routeOptions).then(function (result) {
                    return new Promise(function (resolve) {
                        route_guid = result.metadata.guid;
                        return resolve(result);
                    });
                });
            }).then(function () {
                return CloudFoundryApps.associateRoute(token_type, access_token, app_guid, route_guid);
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
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    var self = this;

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;
                return CloudFoundryApps.upload(token_type, access_token, app_guid, filePath, false);
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
                console.log(reason)
                return reject(reason);
            });

        } catch (error) {
            return reject(error);
        }

    });
};

AppServices.prototype.stop = function (app_guid) {
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;
                return CloudFoundryApps.stop(token_type, access_token, app_guid);
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
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;
                return CloudFoundryApps.update(token_type, access_token, app_guid, appOptions);
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
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
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

        } catch (error) {
            return reject(error);
        }

    });
};

AppServices.prototype.getApps = function () {
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
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

        } catch (error) {
            return reject(error);
        }

    });
};

AppServices.prototype.start = function (app_guid) {
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;
                return CloudFoundryApps.start(token_type, access_token, app_guid);
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
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;
                return CloudFoundryApps.restage(token_type, access_token, app_guid);
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
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;
    var route_guid = null;
    var no_route = false;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);
    CloudFoundryRoutes.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;
                return CloudFoundryApps.getAppRoutes(token_type, access_token, app_guid);
            }).then(function (result) {
                if(result.total_results === 0){
                    no_route = true;
                } else {
                    route_guid = result.resources[0].metadata.guid;
                }
                return CloudFoundryApps.remove(token_type, access_token, app_guid);
            }).then(function () {
                if(no_route) {
                    return resolve("NO_ROUTE");
                }
                return CloudFoundryRoutes.remove(token_type, access_token, route_guid);
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
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var token_type = null;
    var access_token = null;
    var url = null;

    CloudFoundry.setEndPoint(this.CF_API_URL);
    CloudFoundryApps.setEndPoint(this.CF_API_URL);

    var self = this;

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                token_type = result.token_type;
                access_token = result.access_token;
                return CloudFoundryApps.getStats(token_type, access_token, app_guid);
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
    "use strict";
    var token_endpoint = null;
    var authorization_endpoint = null;
    var logging_endpoint = null;

    var self = this;

    CloudFoundry.setEndPoint(this.CF_API_URL);

    return new Promise(function (resolve, reject) {

        try {

            CloudFoundry.getInfo().then(function (result) {
                token_endpoint = result.token_endpoint;
                authorization_endpoint = result.authorization_endpoint;
                logging_endpoint = result.logging_endpoint;

                //Process URL
                logging_endpoint = logging_endpoint.replace("wss", "https");
                logging_endpoint = logging_endpoint.replace(":4443", "");

                CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
                return CloudFoundryUsersUAA.login(self.username, self.password);
            }).then(function (result) {
                return CloudFoundryLogs.getRecent(logging_endpoint, result.token_type, result.access_token, app_guid);
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