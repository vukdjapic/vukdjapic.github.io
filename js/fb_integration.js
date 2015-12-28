var FBcache={ facebook:true };

$(function () {

	FB.init({
		appId: 1647382195498657,
		frictionlessRequests: true,
		status: true,
		version: 'v2.3'
	});
	FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
	FB.Event.subscribe('auth.statusChange', onStatusChange);

	/* when fb api is not available, set dummy user for test purposes */
	setTimeout(function(){
		if(!FBcache.me){
			console.log('No FB user. Using dummy local.');
			FBcache.me ={
				id:4
				, first_name: 'Laza'
				, name: 'Laki Lazarevic'
				, accessToken: 'AAA1234'
			};
			renderWelcome();
			if(flipart){
				userLoginNotify('facebook', FBcache.me.id, FBcache.me.first_name, {
					fullname: FBcache.me.name
					, accessToken: FBcache.accessToken
				}, renderPlayerData );
			}
		}
	}, 4000);
});




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
		FBcache.accessToken =response.authResponse.accessToken;
		FBcache.userID =response.authResponse.userID;
		getMe();
	}
}
function onAuthResponseChange(response) {
	console.log('onAuthResponseChange', response);
}


function getMe() {
	FB.api('/me', {fields: 'id,name,first_name,picture.width(120).height(120)'}, function (response) {
		if (!response.error) {
			FBcache.me=response;
			renderWelcome();
			if(flipart){
				userLoginNotify('facebook', FBcache.me.id, FBcache.me.first_name, {
					fullname: FBcache.me.name
					, accessToken: FBcache.accessToken
				}, renderPlayerData );
			}
		} else {
			console.error('/me', response);
		}
	});
}

function renderWelcome() {
	var fbdiv=$('#dFBInfo');
	fbdiv.find('.first_name').html(FBcache.me.first_name);
	//welcome.find('.profile').attr('src', FBcache.me.picture.data.url);
}

function renderPlayerData(data){
	var fbdiv=$('#dFBInfo');
	if(data.bestScore){
		fbdiv.find('.score').html(data.bestScore);
		fbdiv.find('.scoreInfo').show();
	}
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
  sendChallenge(null,'Dive into magic world of picture puzzles. Turn scramble image into masterpiece', function(response) {
    console.log('sendChallenge',response);
  });
}

