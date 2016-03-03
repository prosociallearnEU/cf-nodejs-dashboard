# cf-nodejs-dashboard

This application has been developed to interact with some components of the <a href="https://docs.cloudfoundry.org/concepts/architecture/" target="_blank">Cloud foundry Architecture</a>: <a href="https://docs.cloudfoundry.org/concepts/architecture/cloud-controller.html" target="_blank">Cloud Controller</a>, <a href="https://docs.cloudfoundry.org/concepts/architecture/uaa.html" target="_blank">UAA</a> & <a href="https://docs.pivotal.io/pivotalcf/devguide/deploy-apps/streaming-logs.html" target="_blank">Metrics</a> services installed in a <a href="https://www.cloudfoundry.org/" target="_blank">Cloud Foundry</a> Instance. Cloud Foundry offers a <a href="https://github.com/cloudfoundry/cli" target="_blank">CLI</a> to manage a app life cycle in combination with the Web apps provided by the commercial Cloud Foundry platforms as <a href="https://run.pivotal.io/" target="_blank">PWS</a> or <a href="https://console.ng.bluemix.net/" target="_blank">Bluemix</a>. This Web App allows the user create the app, uploads the code and execute the typical actions (Start, Stop, Restage, Remove, Scale)

## Getting Started.

The application is able to run in localhost or hosted. To test in local, the steps are:

``` bash
git clone https://github.com/prosociallearnEU/cf-nodejs-dashboard.git
npm install
node index.js
```

and later, open a webbrowser and type:

``` bash
open http://localhost:5000/
```

### User Interface

**Login**

The app will redirect to login area:

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/login.png)

Once, you have authenticated in the previous step, you will be redirected to home:

**Home**

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/home.png)

This view, will be used to show:

* List of Organization
* List of Spaces from the first Organization
* Memory used in the First Organization
* Organization Quota associated with the first Organization

If you click in the space:

**Space / Apps**

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/spaceApps.png)

The page will show the list of apps created in the space and some interesting aspects of every app:

* Stage status
* App status
* Instances

The page has a button to go to the detail of every app. The page has other actions:

* Add a new application to current space
* Refresh window

**Space / Apps / Add**

If you click in button *"Create a new application"* the previous page, you will se the following page:

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/createApp.png)

In this page, the user has to type a short name of the new app to add to the space and the buildpack. The app will create a new app with the associated buildpack. By default, a new app will be created with this configuration:

``` json
var appOptions = {
    name: appName,
    space_guid: space_guid,
    instances: 1,
    memory: 256,
    disk_quota: 256,
    buildpack: buildPack
};
```

The page will create a new application and this action will associate a new route with the name of the app.

**App**

This page will help the developer in the whole life cycle.

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/app.png)

The possible actions provided in the page are:

* *Open:* This method checks if the application is running and open in a new tab the application.
* *View:* This method shows details about the app's configuration. 
* *Upload:* This method is used to upload source code to the app.
* *Start/Stop:* This method is used to Start/Stop an app.
* *Restage:* This method is used to Restage the Droplet.
* *Remove:* This method is used to remove an application.
* *Log:* This method is used to get logs from the application.
* *Scale:* This method is used to update some parameters in the application.

The operations: Open, Start/Stop, Restage & Remove will be handled in this page.

**App / View**

This page will show information about the app:

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/appView.png)

**App / Upload**

This page will help you in the process to upload your app to the platform. To upload your app, it is necessary to zip your app. Check that you don't create a zip and inside of zip you have another folder, it a common error. If your zip is Ok, drag and drop to the UI in order to upload the source code.

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/appUpload.png)

If the process goes well, the page will be redirected to previous page.

**App / Logs**

This page will show information about logs registered in Cloud Foundry.

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/appLogs.png)

**App / Scale**

This page give the opportunity to scale/update application parameters to run on CF.

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-nodejs-dashboard/master/docs/screenshots/appScale.png)

