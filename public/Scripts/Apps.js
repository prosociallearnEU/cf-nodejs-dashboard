/*global alert, window, Dropzone */
"use strict";

function Apps() {
    return undefined;
}

function stopApp(app_guid) {
    //console.log(app_guid);

    var url = "/apps/stop/" + app_guid;

    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {
        if (data.error) {
            var message = $.parseJSON(data.error);
            console.log(message);
            alert(message.description);
        } else {
            console.log(data);
            //drawAppTable();
            location.reload();
        }
    });

}

function startApp(app_guid) {

    var url = "/apps/start/" + app_guid;

    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {
        if (data.error) {
            var message = $.parseJSON(data.error);
            console.log(message);
            alert(message.description);
        } else {
            console.log(data);
            //drawAppTable();
            location.reload();
        }
    });

}

function removeApp(app_guid) {
    //console.log(app_guid);

    var url = "/apps/remove/" + app_guid;

    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {
        console.log(data);
        //drawAppTable();
        location.reload();
    });

}

function openApp(app_guid) {
    //console.log(app_guid);

    var url = "/apps/open/" + app_guid;

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json'
    }).done(function (data) {
        if (data.error) {
            var message = $.parseJSON(data.error);
            console.log(message);
            alert(message.description);
        } else {
            console.log(data);
            window.open(data, '_blank');
        }
    });

}
