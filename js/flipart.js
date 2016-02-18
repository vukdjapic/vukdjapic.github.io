function displayGameWindow(b,a){$("div.gamediv").css("display","none");if(a){$("#"+b).css({display:"inline-block",width:"auto"})
}else{$("#"+b).css("display","block")}}function resizeGameWindow(a){var c=$("#dGameWindow");var b;switch(a){case"welcome":c.width(flipart.gwidth).height(flipart.gheight).css("top",""+(flipart.wheight-flipart.gheight)/2+"px");
break;case"startsingle":b=flipart.gameOptions;if(b&&!b.absolute){}$("#dGameControls").css({"margin-left":(b.measures.w+1)+"px",height:(b.measures.h)+"px"});
$("#dPictureFrame, #dGameControls").css("top",(flipart.gheight-b.measures.h)/2+"px");$("#dPictureFrame").width(b.measures.w).height(b.measures.h);
$("#dLoading>div").css("margin-top",(b.measures.h/2-20)+"px");break;default:console.error("no phase for resize")}}function _populateTilesAndBlocks(h,l,c,m,a){var e,d;
var k=$("#"+c),m=$("#"+m),a=$("#"+a);var b=_.template($("#ttile").html());var f=_.template($("#tblock").html());var g=h.measures;
m.text("");a.text("");for(e=0;e<g.n;e++){for(d=0;d<g.m;d++){m.append(b({i:e,j:d,w:g.tileWidth,h:g.tileHeight,top:e*g.tileHeight,left:d*g.tileWidth,pozx:-d*g.tileWidth,pozy:-e*g.tileHeight}));
a.append(f({i:e,j:d,w:g.tileWidth,h:g.tileHeight,top:e*g.tileHeight,left:d*g.tileWidth}))}}$(".tile",m).css("background-image","url("+l+")")
}function updateHistoryButtons(b){var a=document.getElementById("imBack");var c=document.getElementById("imForward");if(b.back){a.src="res/flipart/arrow_back.png"
}else{a.src="res/flipart/arrow_back_d.png"}if(b.forward){c.src="res/flipart/arrow_forward.png"}else{c.src="res/flipart/arrow_forward_d.png"
}}function onGalleryMouse(b,c){var a=$(c).data("gallery");switch(b){case"over":$("div.galleryText",c).html(a);break;case"out":if(a!=flipart.selectedGallery){$("div.galleryText",c).html("")
}break;case"click":$("#dGalleries div.galleryText").html("").closest("div.galleryImage").removeClass("selected");$("div.galleryText",c).html(a).closest("div.galleryImage").addClass("selected");
flipart.selectedGallery=a;break}}function puzzleSolved(){puzzleSolvedNotify();$("#dSolved").show();flipart.audio.solve();
$("#dNext").show().animate({opacity:1},2000)}function playSingle(b){$("#dSolved").hide();$("#dNext").hide();$("#dLoading").show();
document.getElementById("dTiles").innerHTML="";var a=flipart.urls.newgame,c={};if(b.restart||b.next){a=flipart.urls.nextgame;
if(b.restart){c.restart=true}}else{c=flipart.newGameData(b)}$.ajax(a,{dataType:"json",data:c}).done(function(d){flipart.gameOptions=d.gameOptions;
flipart.matrix=d.matrix;flipart.resultMatrix=d.resultMatrix;flipart.level=d.level;flipart.score=d.score;flipart.numTransforms=d.numTransforms
}).done(function(){var e=flipart.urls.image+"?t="+new Date().getTime();resizeGameWindow("startsingle");displayGameWindow("dGame",true);
flipart.mouseMoves.init("dActions");$("<img/>").attr("src",e).load(function(){$(this).remove();_populateTilesAndBlocks(flipart.gameOptions,e,"dPictureFrame","dTiles","dBlocks");
$("#dLoading").hide();document.getElementById("dLevel").innerHTML=flipart.level;document.getElementById("dScore").innerHTML=flipart.score;
flipart.audio.startBackmusic()});var d=new Image();d.src=flipart.urls.thumbnail+"?t="+new Date().getTime();$("#dThumbnail").html(d)
}).done(function(){flipart.integration.notify(flipart.integration.events.gameLoaded,{picwidth:flipart.gameOptions.measures.w})
})}function loadGalleries(a){$.ajax(flipart.urls.galleries,{dataType:"json"}).done(function(g){var f,e;var b=g.galleries.length;
var d=_.template($("#temGalleryImage").html());var c=$("#"+a+">div");c.html("");console.log("gal: "+g.galleries);for(f=0;
f<b;f++){e=g.galleries[f];c.append(d({galleryName:e,gallerySrc:flipart.urls.base+"/galleryImage?gallery="+e}))}})}function puzzleSolvedNotify(){$.ajax(flipart.urls.gameFinished,{method:"POST",dataType:"JSON",data:{transformations:"["+flipart.transformations+"]",isBack:flipart.isBack}}).done(function(c){var b="You earned "+c.points+" points on this level",a=$("#dNewPoints table");
a.find("tr:first-child .value").text(c.points);a.find("tr:last-child .value").text(c.bonus);if(c.isMinMoves&&c.bonus>0){a.find("tr:last-child").css("visibility","visible");
if(!c.isBack){}else{}}else{a.find("tr:last-child").css("visibility","hidden")}a.css("visibility","visible");document.getElementById("dScore").innerHTML=c.score
})}function userLoginNotify(f,e,a,b,d){var c={method:f,id:e,name:a};_.extend(c,b);$.ajax(flipart.urls.userLogin,{method:"POST",dataType:"JSON",data:c}).done(function(g){if(d){d(g)
}})}var flipart={gwidth:null,gheight:null,wwidth:null,wheight:null,fwidth:null,fheight:null,urls:{},actions:{playsingle:"playsingle",startnew:"startnew","continue":"continue",instructions:"inst"},gameOptions:null,matrix:null,resultMatrix:null,level:null,numTransforms:null,transformations:[],transIndex:0,difLevel:null,selectedGallery:null,isBack:null,levelCompleted:null,init:function(){this.matrix=null;
this.transformations=[];this.transIndex=0;this.isBack=false;this.levelCompleted=false},computeSize:function(b,c,a){var g=0.95;
var i=0.75;var j=this.wwidth=b;var e=this.wheight=c;i=e/j;if(i<=0.7){i=0.7}else{if(i>=1){i=1}}j*=g;e*=g;var f=e/i;var d=j*i;
if(f<j){this.gwidth=f;this.gheight=e}else{this.gwidth=j;this.gheight=d}this.gwidth=Math.floor(this.gwidth);this.gheight=Math.floor(this.gheight);
this.fwidth=this.gwidth-a.horizontal;this.fheight=this.gheight-a.vertical},newGameData:function(a){var b={maxWidth:flipart.fwidth,maxHeight:flipart.fheight};
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
});return b}};flipart.mouseMoves={isdown:false,ismove:false,state:"empty",offtop:null,offleft:null,start:{i:null,j:null},end:{i:null,j:null},blockTemplate:null,border:null,tileWidth:null,tileHeight:null,init:function(b){this.isdown=null;
this.ismove=null;this.state="empty";var a=$("#"+b);var c=a.offset();this.offtop=c.top;this.offleft=c.left;this.blockTemplate=_.template($("#tblock").data("blockid"));
this.border=$("#tblock").data("border");this.tileWidth=flipart.gameOptions.measures.tileWidth;this.tileHeight=flipart.gameOptions.measures.tileHeight
},down:function(d){this.isdown=true;var b=this._getCoordsForMouse(d);var a;var c=$("div.block.selected");if(this.state=="empty"||this.state=="click2"){c.removeClass("selected").css("border","none");
$("#dHorflip, #dVerflip").css("display","none")}switch(this.state){case"empty":this.start.i=b.i;this.start.j=b.j;a=this.blockTemplate({i:b.i,j:b.j});
$("#"+a).addClass("selected");this.state="click1";break;case"click2":this.state="empty";var e;if(d.target.id=="horflip"){e=true
}else{if(d.target.id=="verflip"){e=false}}if(e!==undefined){flipart.audio.flip();$.when(flipart.animateFlip1(c)).then(function(){var f=flipart.flip(e);
return f}).then(function(f){c.animate({opacity:0},700,function(){c.css({"background-color":"",opacity:""});if(f){if(!flipart.levelCompleted){flipart.levelCompleted=true;
puzzleSolved()}f=false}})})}break}},move:function(f){var d,b;var e=[];var c;if(this.state!="click1"){return}this.ismove=true;
var a=this._getCoordsForMouse(f);this.end.i=a.i;this.end.j=a.j;var g=flipart.getRectangle(this.start,this.end);$("div.block").removeClass("selected").css("border","none");
for(d=g.imin;d<=g.imax;d++){for(b=g.jmin;b<=g.jmax;b++){c="#"+this.blockTemplate({i:d,j:b});e.push(c);if(d==g.imin){$(c).css("border-top",this.border)
}if(b==g.jmin){$(c).css("border-left",this.border)}if(d==g.imax){$(c).css("border-bottom",this.border)}if(b==g.jmax){$(c).css("border-right",this.border)
}}}$(e.toString()).addClass("selected")},up:function(a){if(this.state=="click1"&&this.ismove){this._rectangleSelected();this.state="click2"
}this.isdown=false;this.ismove=false},_getCoordsForMouse:function(d){var a=d.pageX-this.offleft;var e=d.pageY-this.offtop;
var c=Math.floor(e/this.tileHeight);var b=Math.floor(a/this.tileWidth);return{i:c,j:b}},_rectangleSelected:function(){var e=flipart.getRectangle(this.start,this.end);
var b,a,d,c;b=e.jmin*this.tileWidth;a=(e.jmax+1)*this.tileWidth;d=e.imin*this.tileHeight;c=(e.imax+1)*this.tileHeight;$("#dHorflip").css({display:"block",top:d+"px",left:b+"px",width:(a-b)+"px"});
$("#dVerflip").css({display:"block",top:(d-10+(c-d)/2)+"px",left:b+"px"})}};flipart.audio={init:function(c,a,b){this.backmusic=c;
this.flipmusic=a;this.solvedmusic=b;this.backmusic.volume=0.1;this.flipmusic.volume=0.3;this.solvedmusic.volume=0.3},startBackmusic:function(){this.backmusic.play()
},flip:function(){this.flipmusic.play()},solve:function(){this.backmusic.pause();this.solvedmusic.play()},toogleMusic:function(){if(this.backmusic.paused){this.backmusic.play()
}else{this.backmusic.pause()}},stop:function(){this.backmusic.pause();this.backmusic.currentTime=0}};flipart.integration={integrators:[],events:{pageLoaded:"pageLoaded",gameLoaded:"gameLoaded",inviteFriends:"inviteFriends",showHighscores:"showHighscores"},notify:function(b,c){var a;
for(a=0;a<this.integrators.length;a++){this.integrators[a].receive(b,c)}},add:function(a){this.integrators.push(a)},flipartAction:function(c,a,b){}};
function transformation(c,d,a,b,e){this.row1=c;this.col1=d;this.row2=a;this.col2=b;this.isHorizontal=e}transformation.prototype.toString=function(){return JSON.stringify(this)
};