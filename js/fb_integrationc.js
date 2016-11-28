if (typeof flipart=='undefined'||!flipart.integration) {
	throw "Flipart missing for FB integration";
}

var FBcache={
	facebook: true
	, urls: {
		flipicoCoin: 'http://komante.com/res/flipart/facebook/flipico_coin.html'
		, paymentCallback: 'fbflipico_callback'
	}
};

(function (FI) {
	FBcache.receive=function (event, obj) {
		console.log('setting '+obj+' '+event==FI.events.gameLoaded)
		if (event==FI.events.pageLoaded) {
			FBinit();
		} else if (event==FI.events.gameLoaded) {
			$('#dFBInfo').width(obj.picwidth-10).css('top',(obj.gameheight + obj.picheight)/2);
		} else if (event==FI.events.inviteFriends) {
			onChallenge();
		} else if (event==FI.events.showHighscores) {
			loadHighScores(obj);
		} else if (event==FI.events.userLoggedIn) {
			if (obj.canContinue) {
				$('#dMenu a.play').css('visibility', 'visible');
			}
			displayInitialMenu('dMenu');
			renderPlayerData(obj);
		} else if (event==FI.events.buyPressed) {
			displayFacebookBuy(obj);
		}
	}

	FI.add(FBcache);
	var i;

	function FBinit() {
		FB.init({
			appId: 1647382195498657,
			frictionlessRequests: true,
			status: true,
			version: 'v2.3'
		});
		FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
		FB.Event.subscribe('auth.statusChange', onStatusChange);

		/* when fb api is not available, set dummy user for test purposes */
		setTimeout(function () {
			if (flipart.profile!='dev') {		//be sure to use it only in dev env
				return;
			}
			if (!FBcache.me) {
				console.log('No FB user. Using dummy local.');
				FBcache.me={
					id: 4
					, first_name: 'Вук'
					, name: 'Вук Ђапић'
					, accessToken: 'AAA1234'
				};
				FBcache.dummy=true;
				FBcache.userID=4;
				renderWelcome();
				if (flipart) {
					userLoginNotify('facebook', FBcache.me.id, FBcache.me.first_name, {
						fullname: FBcache.me.name
						, accessToken: FBcache.accessToken
						, picture: "https://scontent.xx.fbcdn.net/hprofile-xft1/v/t1.0-1/c212.6.558.558/s50x50/10459920_10152580986564742_930615651060976411_n.jpg?oh=53c69234fcc1eb384e7dd176649229fb&oe=5763A48D"
					});
				}
			}
		}, 1000);
	}

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
			FBcache.accessToken=response.authResponse.accessToken;
			FBcache.userID=response.authResponse.userID;
			getMe();
		}
	}
	function onAuthResponseChange(response) {
		console.log('onAuthResponseChange', response);
	}


	function getMe() {
		FB.api('/me', {fields: 'id,name,first_name,picture'}, function (response) {
			if (!response.error) {
				FBcache.me=response;
				renderWelcome();
				if (flipart) {
					userLoginNotify('facebook', FBcache.me.id, FBcache.me.first_name, {
						fullname: FBcache.me.name
						, accessToken: FBcache.accessToken
						, picture: FBcache.me.picture.data.url
					}, renderPlayerData);
				}
			} else {
				console.error('/me', response);
			}
		});
	}

	function renderWelcome() {
		/*
		var fbdiv=$('#dFBInfo');
		fbdiv.find('.first_name').html(FBcache.me.first_name);
		*/
		$('span.first_name').html(FBcache.me.first_name);
		//welcome.find('.profile').attr('src', FBcache.me.picture.data.url);
	}

	function renderPlayerData(data) {
		var fbdiv=$('#dFBInfo');
		if (data.bestScore) {
			fbdiv.find('.score').html(data.bestScore);
			fbdiv.find('.scoreInfo').show();
		}
	}

	function onChallenge() {
		sendChallenge(null, 'Play Flipico puzzles and reveal beutiful pictures', function (response) {
			console.log('sendChallenge', response);
		});
	}

	function sendChallenge(to, message, callback) {
		var options={
			method: 'apprequests'
			, title: 'Invite friends to join Flipico'
		};
		if (to){
			options.to=to;
		}
		if (message){
			options.message=message;
			options.new_style_message=true;
		}
		FB.ui(options, function (response) {
			if (callback)
				callback(response);
		});
	}

	function loadHighScores(jdiv) {
		$.ajax(flipart.urls.highScores, {dataType: 'json'}).done(function (data) {
			FBcache.highscores=data;
			var tem=_.template($('#temHighscores').html());
			jdiv.html('');
			for (i=0; i<data.length; i++) {
				jdiv.append(tem({name: data[i].name, picture: data[i].picture, points: data[i].points, level: data[i].level}));
			}
		});
	}

	/**when 'continue' on bying options is pressed, displays fb buy dialog */
	function displayFacebookBuy(options) {
		//var requestId=options.sessionId+'__'+options.gallery+'__'+FBcache.userID+'__'+options.value+'__'+new Date().getTime();
		var requestId={
			uid: options.sessionId
			, gallery: options.gallery
			, fbuserId: FBcache.userID
			, quantity: options.value
			, time: new Date().getTime()
		}
		if (flipart.profile=='dev'&&FBcache.dummy) {		//be sure to use it only in dev env
			
			 facebookBuyCallback(options)({
			 "payment_id": 814634455333516,
			 "amount": "1.00",
			 "currency": "USD",
			 "quantity": "2",
			 "request_id": "{\"uid\":\"9d671d75-c4c9-49bf-8ac4-faeb5cfe9702\",\"gallery\":\"Nasa\",\"fbuserId\":\"10153595706859742\",\"quantity\":\"2\",\"time\":1470071268712}",
			 "status": "completed",
			 "signed_request": "ddDIN-KkjuEeHnGMKP0ma89UHQ9TlOGf75dn9dodAxY.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImFtb3VudCI6IjEuMDAiLCJjdXJyZW5jeSI6IlVTRCIsImlzc3VlZF9hdCI6MTQ3MDA3MTI3NCwicGF5bWVudF9pZCI6ODE0NjM0NDU1MzMzNTE2LCJxdWFudGl0eSI6IjIiLCJyZXF1ZXN0X2lkIjoie1widWlkXCI6XCI5ZDY3MWQ3NS1jNGM5LTQ5YmYtOGFjNC1mYWViNWNmZTk3MDJcIixcImdhbGxlcnlcIjpcIk5hc2FcIixcImZidXNlcklkXCI6XCIxMDE1MzU5NTcwNjg1OTc0MlwiLFwicXVhbnRpdHlcIjpcIjJcIixcInRpbWVcIjoxNDcwMDcxMjY4NzEyfSIsInN0YXR1cyI6ImNvbXBsZXRlZCJ9"
			 });
			//afterBuyDialog({processingDone: true});
			return;
		}
		FB.ui({
			method: 'pay',
			action: 'purchaseitem',
			//product: options.server+'/servercallback/fbflipico_coin',
			product: FBcache.urls.flipicoCoin,
			quantity: options.value, // optional, defaults to 1
			request_id: JSON.stringify(requestId) // optional, must be unique for each payment
		},
		facebookBuyCallback(options)
				);
	}

	/**invoked from fb api, after buy is completed */
	function facebookBuyCallback(options) {
		return function (response) {
			if(response.error_code){
				console.log("Failed transaction. Code:"+ response.error_code+" "+response.error_message);
				return;
			}
			FI.flipartAction('afterBuyProcessing', FBcache);
			console.log('PAYMENTS RESPONSE FOR '+FBcache.userID+', gallery '+options.gallery+', RES: '+response);
			$.ajax(options.server+'/'+FBcache.urls.paymentCallback, {
				dataType: 'json'
				, method: 'POST'
				, data: {
					sreq: response.signed_request
					, gallery: options.gallery
					, fbuserid: FBcache.userID
					, uid: options.sessionId
				}
			}).done(function (data) {	//TODO check status from data
				if(data.status==='OK'){
					FI.flipartAction('afterBuyDone', FBcache, options);					
				} else {
					alert('An error occured in processing. Please wait for a minute and reload.'
						+' If you purchase isn\'t visible please contact suppport with error info: '
						+JSON.stringify(data, null, 2));
				}
			}).fail( function(qXHR, textStatus, errorThrown){
				alert('An error occured in processing. Please wait for a minute and reload.'
						+' If you purchase isn\'t visible please contact suppport with error info: '
						+textStatus+', '+errorThrown);
			});
		}
	}

})(flipart.integration);


