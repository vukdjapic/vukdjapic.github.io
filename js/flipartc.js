function displayGameWindow(b,a){$("div.gamediv").css("display","none");if(a){$("#"+b).css({display:"inline-block",width:"auto"})
}else{$("#"+b).css("display","block")}}function displayInitialMenu(a){$("div.menu").css({display:"none"});$("#"+a).fadeIn(1000)
}function displayGalleriesChoice(b,a){if(b){$("#dGalleries .galleryImage a").not(".disabled").attr("data-action",b)}$("#dChoice span.level").html(flipart.level);
if(a){var c=$("#dGame"),d=$("#dChoice");c.css({position:"relative",top:0,left:0});d.css({top:flipart.fheight-10,position:"absolute",display:"block"});
d.animate({top:0},{duration:1000,step:function(e,f){if(f.prop=="top"){c.css("top",e-flipart.fheight)}},complete:function(){this.style.position="static";
c.css({position:"static"});displayGameWindow("dChoice")}})}else{displayGameWindow("dChoice")}}function resizeGameWindow(a){var c=$("#dGameWindow");
var b;switch(a){case"welcome":c.width(flipart.gwidth).height(flipart.gheight).css("top",""+(flipart.wheight-flipart.gheight)/2+"px");
break;case"startsingle":b=flipart.gameOptions;if(b&&!b.absolute){}$("#dGameControls").css({"margin-left":(b.measures.w+1)+"px",height:(b.measures.h)+"px"});
$("#dPictureFrame, #dGameControls").css("top",(flipart.gheight-b.measures.h)/2+"px");$("#dPictureFrame").width(b.measures.w).height(b.measures.h);
$("#dLoading>div").css("margin-top",(b.measures.h/2-20)+"px");$("#dGame>div.logo").height((flipart.gheight-b.measures.h)/2);
$("#dSolved > div.front").width(b.measures.h*0.8).height(b.measures.h*0.8);break;default:console.error("no phase for resize")
}}function _populateTilesAndBlocks(h,l,c,m,a){var e,d;var k=$("#"+c),m=$("#"+m),a=$("#"+a);var b=_.template($("#ttile").html());
var f=_.template($("#tblock").html());var g=h.measures;m.text("");a.text("");for(e=0;e<g.n;e++){for(d=0;d<g.m;d++){m.append(b({i:e,j:d,w:g.tileWidth,h:g.tileHeight,top:e*g.tileHeight,left:d*g.tileWidth,pozx:-d*g.tileWidth,pozy:-e*g.tileHeight}));
a.append(f({i:e,j:d,w:g.tileWidth,h:g.tileHeight,top:e*g.tileHeight,left:d*g.tileWidth}))}}$(".tile",m).css("background-image","url("+l+")")
}function updateHistoryButtons(b){var a=document.getElementById("imBack");var c=document.getElementById("imForward");if(b.back){a.style.visibility="visible"
}else{a.style.visibility="hidden"}if(b.forward){c.style.visibility="visible"}else{c.style.visibility="hidden"}}function onGalleryMouse(a){flipart.selectedGallery=a.dataset.gallery;
$.ajax(flipart.urls.isSessionActive,{dataType:"json",data:{uid:flipart.sessionID}}).done(function(b){onGameAction(a.dataset.action)
}).fail(function(){$("#noActiveSession").modal({show:true})})}function puzzleSolved(){puzzleSolvedNotify();$("#dSolved").show();
flipart.audio.solve();$("#dNext").show().animate({opacity:1},2000)}function playSingle(b){$("#dSolved").hide();$("#dNext").hide();
$("#dHorflip, #dVerflip").css("display","none");$("#dLoading").show();updateHistoryButtons({back:false,forward:false});document.getElementById("dTiles").innerHTML="";
var a=flipart.urls.newgame,c={};c=flipart.newGameData(b);if(b.restart||b.next){a=flipart.urls.nextgame;if(b.restart){c.restart=true
}}else{if(b.continuegame){a=flipart.urls.continuegame}}$.ajax(a,{dataType:"json",data:c}).done(function(d){flipart.gameOptions=d.gameOptions;
flipart.matrix=d.matrix;flipart.resultMatrix=d.resultMatrix;flipart.level=d.level;flipart.score=d.score;flipart.numTransforms=d.numTransforms;
flipart.firstStart=d.firstStart}).done(function(){var e=flipart.urls.image+"?t="+new Date().getTime()+"&uid="+flipart.sessionID;
resizeGameWindow("startsingle");displayGameWindow("dGame",true);flipart.mouseMoves.init("dActions");$("<img/>").attr("src",e).load(function(){$(this).remove();
_populateTilesAndBlocks(flipart.gameOptions,e,"dPictureFrame","dTiles","dBlocks");$("#dLoading").hide();document.getElementById("dLevel").innerHTML=flipart.level;
document.getElementById("dScore").innerHTML=flipart.score;flipart.audio.startBackmusic()});var d=new Image();d.src=flipart.urls.thumbnail+"?t="+new Date().getTime()+"&uid="+flipart.sessionID;
$("#dThumbnail").html(d)}).done(function(){if(flipart.firstStart){flipart.firstStartBeggining()}flipart.integration.notify(flipart.integration.events.gameLoaded,{picwidth:flipart.gameOptions.measures.w,picheight:flipart.gameOptions.measures.h,gameheight:flipart.gheight})
})}function loadGalleries(a){$.ajax(flipart.urls.galleries,{dataType:"json",data:{uid:flipart.sessionID}}).done(function(h){var g,f;
var b=h.galleries.length;var d=_.template($("#temGalleryImage").html());var c=$("#"+a+">div");c.html("");console.log("gal: "+h.galleries);
for(g=0;g<b;g++){f=h.galleries[g];c.append(d({galleryName:f,gallerySrc:flipart.urls.base+"/galleryImage?gallery="+f}))}for(g=0;
g<h.disabledGalleries.length;g++){f=h.disabledGalleries[g];$('div[data-gallery="'+f+'"]',c).addClass("disabled");$('.galleryImage a[data-gallery="'+f+'"]',c).addClass("disabled").attr("data-action","buy")
}var e=$(".galleryImage").outerWidth(true);c.width(e*b+10);$("#"+a).mCustomScrollbar({axis:"x",theme:"rounded",scrollbarPosition:"outside",scrollButtons:{enable:true}})
})}function puzzleSolvedNotify(){$.ajax(flipart.urls.gameFinished,{method:"POST",dataType:"JSON",data:{uid:flipart.sessionID,transformations:"["+flipart.transformations+"]",isBack:flipart.isBack}}).done(function(c){var b="You earned "+c.points+" points on this level",a=$("#dNewPoints table");
a.find("tr:first-child .value").text(c.points);a.find("tr:last-child .value").text(c.bonus);if(c.isMinMoves&&c.bonus>0){a.find("tr:last-child").css("visibility","visible");
if(!c.isBack){}else{}}else{a.find("tr:last-child").css("visibility","hidden")}a.css("visibility","visible");document.getElementById("dScore").innerHTML=c.score;
flipart.level=c.level})}function userLoginNotify(d,f,a,b,e){var c={app:d,id:f,name:a};_.extend(c,b);$.ajax(flipart.urls.userLogin,{method:"POST",dataType:"JSON",data:c}).done(function(g){if(g.status=="OK"){flipart.sessionID=g.uid;
flipart.level=g.level;loadGalleries("dGalleries")}flipart.integration.notify(flipart.integration.events.userLoggedIn,g)})
}var flipart={gwidth:null,gheight:null,wwidth:null,wheight:null,fwidth:null,fheight:null,urls:{},actions:{playsingle:"playsingle",startnew:"startnew","continue":"continue",instructions:"inst"},isNewGame:null,gameOptions:null,matrix:null,resultMatrix:null,level:null,numTransforms:null,transformations:[],transIndex:0,difLevel:null,selectedGallery:null,isBack:null,levelCompleted:null,init:function(){this.matrix=null;
this.transformations=[];this.transIndex=0;this.isBack=false;this.levelCompleted=false;this.isNewGame=false;this.firstStart=false
},computeSize:function(b,c,a){var g=0.95;var i=0.75;var j=this.wwidth=b;var e=this.wheight=c;i=e/j;if(i<=0.7){i=0.7}else{if(i>=1){i=1
}}j*=g;e*=g;var f=e/i;var d=j*i;if(f<j){this.gwidth=f;this.gheight=e}else{this.gwidth=j;this.gheight=d}this.gwidth=Math.floor(this.gwidth);
this.gheight=Math.floor(this.gheight);this.fwidth=this.gwidth-a.horizontal;this.fheight=this.gheight-a.vertical},newGameData:function(a){var b={uid:flipart.sessionID,maxWidth:flipart.fwidth,maxHeight:flipart.fheight};
if(a.difLevel){flipart.difLevel=a.difLevel}if(flipart.selectedGallery!=null){b.gallery=flipart.selectedGallery}b.difLevel=flipart.difLevel;
return b},getRectangle:function(f,b){var e,c,d,a;if(f.i<b.i){e=f.i;c=b.i}else{e=b.i;c=f.i}if(f.j<b.j){d=f.j;a=b.j}else{d=b.j;
a=f.j}return{imin:e,imax:c,jmin:d,jmax:a}},flip:function(c){var b=this.getRectangle(this.mouseMoves.start,this.mouseMoves.end);
this.transformations[this.transIndex]=new transformation(b.imin,b.jmin,b.imax,b.jmax,c);this.transIndex++;this.transformations.length=this.transIndex;
this.flipMatrix(b,c);this.updateBackground(b);updateHistoryButtons({back:true,forward:false});var a=this.compareMatrices(this.matrix,this.resultMatrix,this.gameOptions.measures.n,this.gameOptions.measures.m);
return a},flipMatrix:function(g,e){var c=new Array(g.imax-g.imin+1);var b,a,d;for(b=0;b<=g.imax-g.imin;b++){c[b]=new Array(g.jmax-g.jmin+1);
for(a=0;a<=g.jmax-g.jmin;a++){if(e){d=flipart.matrix[g.imin+b][g.jmax-a];c[b][a]={i:d.i,j:d.j,hflip:!d.hflip,vflip:d.vflip}
}else{d=flipart.matrix[g.imax-b][g.jmin+a];c[b][a]={i:d.i,j:d.j,hflip:d.hflip,vflip:!d.vflip}}}}for(b=0;b<=g.imax-g.imin;
b++){for(a=0;a<=g.jmax-g.jmin;a++){this.matrix[g.imin+b][g.jmin+a]=c[b][a]}}},compareMatrices:function(b,a,d,f){var k=true;
var h,g,e,c;for(h=0;h<d;h++){for(g=0;g<f;g++){e=b[h][g];c=a[h][g];if(e.i!=c.i||e.j!=c.j||e.hflip!=c.hflip||e.vflip!=c.vflip){k=false;
break}}if(!k){break}}return k},updateBackground:function(g){var p=g.imin;var h=g.imax;var o=g.jmin;var a=g.jmax;var l,k,n,d,c;
var m=this.gameOptions.measures;var e=_.template($("#ttile").data("tileid"));var b;for(l=p;l<=h;l++){for(k=o;k<=a;k++){n=this.matrix[l][k];
d=n.hflip?(2*m.w-(n.j+1)*m.tileWidth):n.j*m.tileWidth;c=n.vflip?(2*m.h-(n.i+1)*m.tileHeight):n.i*m.tileHeight;b=e({i:l,j:k});
$("#"+b).css("background-position",(-d)+"px "+(-c)+"px")}}},moveHistory:function(a){var c,d;var b={back:true,forward:true};
if(a&&this.transIndex>0){c=this.transformations[this.transIndex-1];this.transIndex--;this.isBack=true}else{if(!a&&this.transIndex<this.transformations.length){c=this.transformations[this.transIndex];
this.transIndex++}else{return{back:this.transIndex>0,forward:this.transIndex<this.transformations.length}}}d=this.getRectangle({i:c.row1,j:c.col1},{i:c.row2,j:c.col2});
this.flipMatrix(d,c.isHorizontal);this.updateBackground(d);return{back:this.transIndex>0,forward:this.transIndex<this.transformations.length}
},animateFlip1:function(a){var b=$.Deferred();a.css({"background-color":"white",opacity:0});a.animate({opacity:0.3},300,function(){b.resolve()
});return b},firstStartBeggining:function(){$("#dFirstStart").show(600)},firstStartSelected:function(){$("#dFirstStart div.front").hide();
$("#dFirstStart div.onselected").show();$("#dFirstStart").show()},firstStartErrorMessage:function(){flipart.firstStart=false;
$("#dFirstStart div.front").hide();$("#dFirstStart div.onerror").show();$("#dHistory").addClass("denoted");$("#dFirstStart").show()
}};flipart.mouseMoves={isdown:false,ismove:false,state:"empty",offtop:null,offleft:null,start:{i:null,j:null},end:{i:null,j:null},blockTemplate:null,border:null,tileWidth:null,tileHeight:null,init:function(b){this.isdown=null;
this.ismove=null;this.state="empty";var a=$("#"+b);var c=a.offset();this.offtop=c.top;this.offleft=c.left;this.blockTemplate=_.template($("#tblock").data("blockid"));
this.border=$("#tblock").data("border");this.tileWidth=flipart.gameOptions.measures.tileWidth;this.tileHeight=flipart.gameOptions.measures.tileHeight
},down:function(d){this.isdown=true;var b=this._getCoordsForMouse(d);var a;var c=$("div.block.selected");if(this.state=="empty"||this.state=="click2"){c.removeClass("selected").css("border","none");
$("#dHorflip, #dVerflip").css("display","none")}switch(this.state){case"empty":this.start.i=b.i;this.start.j=b.j;a=this.blockTemplate({i:b.i,j:b.j});
$("#"+a).addClass("selected");this.state="click1";break;case"click2":this.state="empty";var e;if(d.target.id=="horflip"){e=true
}else{if(d.target.id=="verflip"){e=false}}if(e!==undefined){flipart.audio.flip();$.when(flipart.animateFlip1(c)).then(function(){var f=flipart.flip(e);
return f}).then(function(f){c.animate({opacity:0},700).promise().done(function(){c.css({"background-color":"",opacity:""});
if(f){if(!flipart.levelCompleted){flipart.levelCompleted=true;puzzleSolved()}f=false}else{if(flipart.firstStart){flipart.firstStartErrorMessage()
}}})})}break}},move:function(f){var d,b;var e=[];var c;if(this.state!="click1"){return}this.ismove=true;var a=this._getCoordsForMouse(f);
this.end.i=a.i;this.end.j=a.j;var g=flipart.getRectangle(this.start,this.end);$("div.block").removeClass("selected").css("border","none");
for(d=g.imin;d<=g.imax;d++){for(b=g.jmin;b<=g.jmax;b++){c="#"+this.blockTemplate({i:d,j:b});e.push(c);if(d==g.imin){$(c).css("border-top",this.border)
}if(b==g.jmin){$(c).css("border-left",this.border)}if(d==g.imax){$(c).css("border-bottom",this.border)}if(b==g.jmax){$(c).css("border-right",this.border)
}}}$(e.toString()).addClass("selected")},up:function(a){if(this.state=="click1"&&this.ismove){this._rectangleSelected();this.state="click2";
if(flipart.firstStart){flipart.firstStartSelected()}}this.isdown=false;this.ismove=false},_getCoordsForMouse:function(d){var a=d.pageX-this.offleft;
var e=d.pageY-this.offtop;var c=Math.floor(e/this.tileHeight);var b=Math.floor(a/this.tileWidth);return{i:c,j:b}},_rectangleSelected:function(){var e=flipart.getRectangle(this.start,this.end);
var b,a,d,c;b=e.jmin*this.tileWidth;a=(e.jmax+1)*this.tileWidth;d=e.imin*this.tileHeight;c=(e.imax+1)*this.tileHeight;$("#dHorflip").css({display:"block",top:d+"px",left:b+"px",width:(a-b)+"px"});
$("#dVerflip").css({display:"block",top:(d-10+(c-d)/2)+"px",left:b+"px"})}};flipart.audio={init:function(d,b,c,a){this.backmusic=d;
this.flipmusic=b;this.solvedmusic=c;this.musicImg=a;this.backmusic.volume=0.1;this.flipmusic.volume=0.3;this.solvedmusic.volume=0.3;
this.turnedOff=false},startBackmusic:function(){if(!this.turnedOff){this.backmusic.play()}},flip:function(){this.flipmusic.play()
},solve:function(){this.backmusic.pause();this.solvedmusic.play()},toogleMusic:function(){if(this.backmusic.paused){this.backmusic.play();
this.musicImg.src=flipart.urls.staticPrefix+"res/flipartB/button-music-off.png"}else{this.backmusic.pause();this.musicImg.src=flipart.urls.staticPrefix+"res/flipartB/button-music-on.png"
}this.turnedOff=!this.turnedOff},stop:function(){this.backmusic.pause();this.backmusic.currentTime=0},imageOver:function(a){if(a){if(this.backmusic.paused){this.musicImg.src=flipart.urls.staticPrefix+"res/flipartB/button-music-on-hl.png"
}else{this.musicImg.src=flipart.urls.staticPrefix+"res/flipartB/button-music-off-hl.png"}}else{if(this.backmusic.paused){this.musicImg.src=flipart.urls.staticPrefix+"res/flipartB/button-music-on.png"
}else{this.musicImg.src=flipart.urls.staticPrefix+"res/flipartB/button-music-off.png"}}}};flipart.integration={integrators:[],events:{pageLoaded:"pageLoaded",gameLoaded:"gameLoaded",inviteFriends:"inviteFriends",showHighscores:"showHighscores",userLoggedIn:"userLoggedIn",buyPressed:"buyPressed"},notify:function(b,c){var a;
for(a=0;a<this.integrators.length;a++){this.integrators[a].receive(b,c)}},add:function(a){this.integrators.push(a)},flipartAction:function(c,a,b){switch(c){case"afterBuyProcessing":flipart.buy.afterBuyProcessing(b);
break;case"afterBuyDone":flipart.buy.afterBuyDone(b);break;default:console.log("No such action: "+c)}}};flipart.buy={gallery:null,init:function(a){this.gallery=a;
$(".dbuy img.buy").each(function(){this.src=flipart.urls.base+"/galleryImage?gallery="+a});$(".dbuy div.galleryText").text(a);
$(".dbuy span.gallery").text(a);$("#dBuy div.preview img").each(function(b){this.src=flipart.urls.thumbPreview+"?gallery="+a+"&number="+b
})},buyContinue:function(){var b=document.forms.fBuy.raAmount,c,d,e,a=this;jrac=$("#dBuy form input[name=raAmount]:checked");
if(jrac.length){e=jrac.val();$.ajax(flipart.urls.isSessionActive,{dataType:"json",data:{uid:flipart.sessionID}}).done(function(f){flipart.integration.notify(flipart.integration.events.buyPressed,{server:flipart.urls.base,gallery:a.gallery,value:e,sessionId:flipart.sessionID})
}).fail(function(){$("#noActiveSession").modal({show:true})})}else{$("#buySelectSomething").modal({show:true})}},afterBuyProcessing:function(){displayGameWindow("dAfterBuy");
$("div.afterbuyProcessing, div.afterbuyDone","#dAfterBuy").hide();$("#dAfterBuy div.afterbuyProcessing").fadeIn(1000)},afterBuyDone:function(c){displayGameWindow("dAfterBuy");
$("#dAfterBuy div.afterbuyProcessing").hide();$("#dAfterBuy div.afterbuyDone").show();var a=$("#dGalleries>div");var b=c.gallery;
$('div[data-gallery="'+b+'"]',a).removeClass("disabled");$('.galleryImage a[data-gallery="'+b+'"]',a).removeClass("disabled").attr("data-action","start")
}};function transformation(c,d,a,b,e){this.row1=c;this.col1=d;this.row2=a;this.col2=b;this.isHorizontal=e}transformation.prototype.toString=function(){return JSON.stringify(this)
};