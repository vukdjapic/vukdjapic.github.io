var FBcache = {facebook: true};

if (typeof flipart == 'undefined' || !flipart.integration) {
    throw "Flipart missing for FB integration";
}

(function (FI) {
    FBcache.receive = function (event, obj) {
        console.log('setting ' + obj + ' ' + event == FI.events.gameLoaded)
        if (event == FI.events.pageLoaded) {
            FBinit();
        } else if (event == FI.events.gameLoaded) {
            $('#dFBInfo').width(obj.picwidth - 10);
        } else if (event == FI.events.inviteFriends) {
             onChallenge();
        } else if(event == FI.events.showHighscores){
            loadHighScores(obj);
        } else if(event == FI.events.userLoggedIn) {
			if(obj.canContinue){
				$('#dMenu a.play').css('visibility','visible');
			}
			displayInitialMenu('dMenu');
			renderPlayerData(obj);
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
			if(flipart.profile !='dev'){		//be sure to use it only in dev env
				return;
			}
            if (!FBcache.me) {
                console.log('No FB user. Using dummy local.');
                FBcache.me = {
                    id: 4
                    , first_name: 'Вук'
                    , name: 'Вук Ђапић'
                    , accessToken: 'AAA1234'
                };
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
        if (response.status != 'connected') {
            top.location.href = 'https://www.facebook.com/appcenter/flipico';
        }
    }
    function onStatusChange(response) {
        if (response.status != 'connected') {
            login(loginCallback);
        } else {
            FBcache.accessToken = response.authResponse.accessToken;
            FBcache.userID = response.authResponse.userID;
            getMe();
        }
    }
    function onAuthResponseChange(response) {
        console.log('onAuthResponseChange', response);
    }


    function getMe() {
        FB.api('/me', {fields: 'id,name,first_name,picture'}, function (response) {
            if (!response.error) {
                FBcache.me = response;
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
        var fbdiv = $('#dFBInfo');
        fbdiv.find('.first_name').html(FBcache.me.first_name);
        //welcome.find('.profile').attr('src', FBcache.me.picture.data.url);
    }

    function renderPlayerData(data) {
        var fbdiv = $('#dFBInfo');
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
        var options = {
            method: 'apprequests'
            , title: 'Invite friends to join Flipico'
        };
        if (to)
            options.to = to;
        if (message)
            options.message = message;
        FB.ui(options, function (response) {
            if (callback)
                callback(response);
        });
    }

    function loadHighScores(jdiv){
        $.ajax(flipart.urls.highScores, {dataType: 'json'}).done(function(data){
            FBcache.highscores =data;
            var tem=_.template($('#temHighscores').html());
            jdiv.html('');
            for(i=0;i<data.length;i++){
                jdiv.append(tem({name:data[i].name, picture:data[i].picture, points:data[i].points, level:data[i].level}));
            }
        });
    }

})(flipart.integration);


