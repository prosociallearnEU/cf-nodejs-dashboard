
var username = null;
var password = null;

$( document ).ready(function() {

	function initApp(){
		$("#pageLogin").show();
		$("#pageHome").hide();
		$("#pageApps").hide();
		$("#pageDeployApps").hide();
	}

	initApp();

	$("#pageLogin").find("#btnLoginSubmit").click(function(event) {
		event.preventDefault();

		var url = "/api/auth/login";
		username = $("#username").val();
		password = $("#password").val();

		//Form validation
		if ((!username.trim()) && (!password.trim())) {
    		console.log("Form validation problem");
    		return false;
		}

		var data = {
			username: username, 
			password: password
		}

		$.ajax({
		    url: url, 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify(data)}
		).done(function( data ) {
		  	console.log(data);
		  	$("#pageLogin").hide();
		  	$("#pageHome").show();
		});
	});

	$("#main").on("click","#btnLogout", function(event) {
		event.preventDefault();

		$("#pageLogin").show();
		$("#pageHome").hide();
		$("#pageApps").hide();
		$("#pageDeployApps").hide();
	});

	$("#main").on("click","#btnHome", function(event) {
		event.preventDefault();

		$("#pageLogin").hide();
		$("#pageHome").show();
		$("#pageApps").hide();
		$("#pageDeployApps").hide();
	});

	$("#main").on("click","#btnApps", function(event) {
		event.preventDefault();

		var url = "/api/apps";
		$.ajax({
		    url: url, 
		    type: 'GET', 
		    contentType: 'application/json'
		}).done(function( data ) {
		  	console.log(data);
		  	//Process
		  	$("#pageApps").find("#result").text(JSON.stringify(data));

		  	$("#pageLogin").hide();
			$("#pageHome").hide();
			$("#pageApps").show();
			$("#pageDeployApps").hide();			
		});

	});

	$("#pageDeployApps").find("#btCreateApp").click(function(event) {
		event.preventDefault();

		$('#btCreateApp').attr('disabled','disabled');

		var url = "/api/apps/create";
		var appname = $("#appname").val();

		//Form validation
		if (!appname.trim()) {
    		console.log("Form validation problem");
    		return false;
		}

		var data = {
			appname: appname
		}

		$.ajax({
		    url: url, 
		    type: 'POST', 
		    contentType: 'application/json', 
		    data: JSON.stringify(data)}
		).done(function( data ) {
		  	console.log(data);
		  	//$("#pageLogin").hide();
		  	//$("#pageHome").show();
		});
	});

	$("#btnDeployApp").on("click", function(event) {
		event.preventDefault();

		$("#pageLogin").hide();
		$("#pageHome").hide();
		$("#pageApps").hide();
		$("#pageDeployApps").show();		
	});

});