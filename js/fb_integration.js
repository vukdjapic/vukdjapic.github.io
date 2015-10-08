$(function () {

	FB.init({
		appId: 1647382195498657,
		frictionlessRequests: true,
		status: true,
		version: 'v2.3'
	});
	FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
	FB.Event.subscribe('auth.statusChange', onStatusChange);


});


var friendCache={};


function login(callback) {
	FB.login(callback);
}
function loginCallback(response) {
	console.log('loginCallback', response);
	if (response.status!='connected') {
		top.location.href='https://www.facebook.com/appcenter/flipico';
	}
}
function onStatusChange(response) {
	if (response.status!='connected') {
		login(loginCallback);
	} else {
		getMe(function () {
			renderWelcome();
		});
	}
}
function onAuthResponseChange(response) {
	console.log('onAuthResponseChange', response);
}


function getMe(callback) {
	FB.api('/me', {fields: 'id,name,first_name,picture.width(120).height(120)'}, function (response) {
		if (!response.error) {
			friendCache.me=response;
			callback();
		} else {
			console.error('/me', response);
		}
	});
}

function renderWelcome() {
	var welcome=$('#dFBInfo');
	welcome.find('.first_name').html(friendCache.me.first_name);
	//welcome.find('.profile').attr('src', friendCache.me.picture.data.url);
}


function sendChallenge(to, message, callback) {
  var options = {
    method: 'apprequests'
  };
  if(to) options.to = to;
  if(message) options.message = message;
  FB.ui(options, function(response) {
    if(callback) callback(response);
  });
}

function onChallenge() {
  sendChallenge(null,'Friend Smash is great fun! Come and check it out!', function(response) {
    console.log('sendChallenge',response);
  });
}

