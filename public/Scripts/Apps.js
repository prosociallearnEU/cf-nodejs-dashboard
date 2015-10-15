/*global alert, window, Dropzone */
"use strict";

function Apps() {
    return undefined;
}

Apps.prototype.drawAppTable = function () {
    var url = "/apps/getApps";
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {

        var htmlcode = "";
        var app_guid = null;
        var state = null;
        $.each(data.resources, function (index) {

            app_guid = data.resources[index].metadata.guid;
            state = data.resources[index].entity.state;

            //console.log(data.resources[index]);
            htmlcode += "<tr>";
            htmlcode += "<td>" + (index + 1) + "</td>";
            htmlcode += "<td><a href='#' onclick='openApp(\"" + app_guid + "\"); return false;'>" + data.resources[index].entity.name + "</a></td>";
            htmlcode += "<td>" + data.resources[index].entity.package_state + "</td>";
            htmlcode += "<td>" + state + "</td>";
            htmlcode += "<td>" + data.resources[index].metadata.updated_at + "</td>";
            htmlcode += "<td>";
            htmlcode += "<a class='btn btn-default' href='/apps/view?app_guid=" + app_guid + "'>View</a>&nbsp;";
            htmlcode += "<a class='btn btn-default' href='/apps/upload?app_guid=" + app_guid + "'>Upload</a>&nbsp;";

            if (state === "STARTED") {
                htmlcode += "<a class='btn btn-default' href='#' onclick='stopApp(\"" + app_guid + "\"); return false;'>Stop</a>&nbsp;";
            } else {
                htmlcode += "<a class='btn btn-default' href='#' onclick='startApp(\"" + app_guid + "\"); return false;'>Start</a>&nbsp;";
            }

            htmlcode += "<a class='btn btn-default' href='#' onclick='removeApp(\"" + app_guid + "\"); return false;'>Remove</a>&nbsp;";
            htmlcode += "<a class='btn btn-default' href='/apps/log?app_guid=" + app_guid + "'>Log</a>&nbsp;";
            htmlcode += "</td>";
            htmlcode += "<tr>";
        });

        console.log("OK");

        $("#pageApps").find("#result").html(htmlcode);
    });
};

Apps.prototype.viewApp = function (app_guid) {
    //console.log(app_guid);

    var url = "/apps/view/" + app_guid;
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json'
    }).done(function (data) {
        $("#pageApps").hide();
        $("#pageAppView").show();
        //console.log(data);

        var htmlcode = "";
        $.each(data, function (index) {
            htmlcode += "<tr>";
            htmlcode += "<td>" + index + "</td>";
            htmlcode += "<td>" + data[index]  + "</td>";
            htmlcode += "<tr>";
        });

        $("#pageAppView").find("#result").html(htmlcode);
    });

}

Apps.prototype.logApp = function (app_guid) {

    var url = "/apps/log/" + app_guid;
    var data = {
        guid: app_guid
    };

    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).done(function (data) {
        if (data.error) {
            var message = $.parseJSON(data.error);
            console.log(message);
            alert(message.description);
        } else {
            console.log(data);
            $("#pageAppView").find("#result").html(data);
        }
    });

};

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
