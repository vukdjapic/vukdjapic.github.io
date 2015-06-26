//DOM FUNCTIONS

/** displays one div from game window div, hide others */
function displayGameWindow(id, isinline) {
	$('div.gamediv').css('display', 'none');
	if (isinline) {
		$('#'+id).css({display: 'inline-block', width: 'auto'});
	} else {
		$('#'+id).css('display', 'block');
	}
}

/** various game windows (welcome, play) can have different sizes 
 *  also sets other properties for resized and repositioned divs */
function resizeGameWindow(phase) {
	var gw=$("#dGameWindow");
	var go;
	switch (phase) {
		case 'welcome':
			gw.width(flipart.gwidth)
					.height(flipart.gheight)
					.css("top", ""+(flipart.wheight-flipart.gheight)/2+"px");
			break;
		case 'startsingle':
			go=flipart.gameOptions;
			if (go&&!go.absolute) {
				//gw.width(go.measures.w).height(go.measures.h);
			}
			$('#dGameControls').css({
				'margin-left': (go.measures.w+10)+'px'
				, 'height': (go.measures.h-5)+'px'
			});
			$('#dPictureFrame, #dGameControls').css('top', (flipart.gheight-go.measures.h)/2+'px');
			$('#dPictureFrame').width(go.measures.w).height(go.measures.h);
			$('#dLoading>div').css('margin-top', (go.measures.h/2-20)+'px');
			break;
		default:
			console.error('no phase for resize');
	}

}

/**callback function when single game is started */
function onStartSingleDataRetrieved(gameOptions, imageUrl) {
	//firt wait to load image, then put it in css background and remove loader
	$('<img/>').attr('src', imageUrl).load(function () {
		$(this).remove();
		_populateTilesAndBlocks(gameOptions, imageUrl, 'dPictureFrame', 'dTiles', 'dBlocks');
		$('#dLoading').hide();
		flipart.audio.startBackmusic();
	});
	resizeGameWindow('startsingle');
	displayGameWindow('dGame', true);
	flipart.mouseMoves.init('dActions');
}



function _populateTilesAndBlocks(gameOptions, imageUrl, picframe, tiles, blocks) {
	var i, j;
	var pf=$('#'+picframe), tiles=$('#'+tiles), blocks=$('#'+blocks);
	var tem=_.template($('#ttile').html());
	var temb=_.template($('#tblock').html());
	var mes=gameOptions.measures;
	tiles.text('');
	blocks.text('');
	for (i=0; i<mes.n; i++) {
		for (j=0; j<mes.m; j++) {
			tiles.append(tem({
				i: i, j: j
				, w: mes.tileWidth, h: mes.tileHeight
				, top: i*mes.tileHeight, left: j*mes.tileWidth
				, pozx: -j*mes.tileWidth, pozy: -i*mes.tileHeight
			}));
			blocks.append(temb({
				i: i, j: j
				, w: mes.tileWidth, h: mes.tileHeight
				, top: i*mes.tileHeight, left: j*mes.tileWidth
			}));
		}
	}
	//$(document.body).append('<img src="'+fa.urls.image+'" />')
	$('.tile', tiles).css('background-image', 'url('+imageUrl+')');

}

function updateHistoryButtons(bfEnabled) {
	var imBack=document.getElementById('imBack');
	var imForward=document.getElementById('imForward');
	if (bfEnabled.back) {
		imBack.src='res/flipart/arrow_back.png';
	} else {
		imBack.src='res/flipart/arrow_back_d.png';
	}
	if (bfEnabled.forward) {
		imForward.src='res/flipart/arrow_forward.png';
	} else {
		imForward.src='res/flipart/arrow_forward_d.png';
	}
}

/** Mouse events on images in gallery */
function onGalleryMouse(type, div) {
	var gallery=$(div).data('gallery');
	switch (type) {
		case 'over':
			$('div.galleryText', div).html(gallery);
			break;
		case 'out':
			if (gallery!=flipart.selectedGallery) {
				$('div.galleryText', div).html('');
			}
			break;
		case 'click':
			$('#dGalleries div.galleryText').html('').closest('div.galleryImage').removeClass('selected');
			$('div.galleryText', div).html(gallery).closest('div.galleryImage').addClass('selected');
			flipart.selectedGallery=gallery;
			break;
	}
}

//AJAX

function loadGalleries(divGalleriesId) {
	$.ajax(flipart.urls.galleries, {
		dataType: 'json'
	}).done(function (data) {
		var i, gal;
		var nogal=data.galleries.length;
		var tem=_.template($('#temGalleryImage').html());
		var jDivGal=$('#'+divGalleriesId+'>div');
		jDivGal.html('')//.width(150*nogal);
		console.log('gal: '+data.galleries);
		for (i=0; i<nogal; i++) {
			gal=data.galleries[i];
			jDivGal.append(tem({
				galleryName: gal
				, gallerySrc: flipart.urls.base+'/galleryImage?gallery='+gal
			}));
		}
	});
}


var flipart={
	gwidth: null         //game window width
	, gheight: null      //game window height 
	, wwidth: null       //window width
	, wheight: null      //window height
	, fwidth: null      //frame width (for picture)
	, fheight: null     //frame height
	, urls: {}          //server urls
	, actions: {
		'playsingle': 'playsingle'
		, 'startnew': 'startnew'
		, 'continue': 'continue'
		, 'instructions': 'inst'
	}
	, gameOptions: null     //gameOptions object retrieved from server
	, matrix: null          //transformation matrix
	, resultMatrix: null    //result matrix
	, transformations: []
	, transIndex: 0         //index in transformations array history
	, difLevel: null          // 'easy', normal, hard
	, selectedGallery: null
	, init: function () {
		this.matrix=null;
		this.transformations=[];
		this.transIndex =0;
	}
	/** computes game window dimensions */
	, computeSize: function (winWidth, winHeight) {
		var mf=.95;     //maximum factor how big game window can be
		var hw=.75;    //aspect ratio height/width
		var w=this.wwidth=winWidth;
		var h=this.wheight=winHeight;

		hw=h/w;
		if (hw<=0.7) {
			hw=.7;
		} else if (hw>=1) {
			hw=1;
		}

		w*=mf;
		h*=mf;

		var wnew=h/hw;
		var hnew=w*hw;

		if (wnew<w) {
			this.gwidth=wnew;
			this.gheight=h;
		} else {
			this.gwidth=w;
			this.gheight=hnew;
		}

		this.gwidth=Math.floor(this.gwidth);
		this.gheight=Math.floor(this.gheight);

		this.fwidth=this.gwidth-140;
		this.fheight=this.gheight-30;

	}
	/**action on start new single game 
	 * first gets game properites object, than adds all divs*/
	, playSingle: function (options, callback) {
		var fa=this;
		var data={
			maxWidth: this.fwidth
			, maxHeight: this.fheight
		};
		if (options.difLevel) {
			this.difLevel=options.difLevel;
		}
		if (options.restart) {
			data.restart=true;
		}
		if (flipart.selectedGallery!=null) {
			data.gallery=flipart.selectedGallery;
		}
		data.difLevel=this.difLevel;
		$.ajax(this.urls.newgame, {
			dataType: 'json'
			, data: data
		}).done(function (data) {
			fa.gameOptions=data.gameOptions;
			fa.matrix=data.matrix;
			fa.resultMatrix=data.resultMatrix;
			if (callback) {
				callback(fa.gameOptions, fa.urls.image+'?t='+new Date().getTime());
			}
		});
	}
	/** for two diagonal ends of rectangle returns upper left and lower right point */
	, getRectangle: function (start, end) {
		var imin, imax, jmin, jmax;
		if (start.i<end.i) {
			imin=start.i;
			imax=end.i;
		} else {
			imin=end.i;
			imax=start.i;
		}
		if (start.j<end.j) {
			jmin=start.j;
			jmax=end.j;
		} else {
			jmin=end.j;
			jmax=start.j;
		}
		return {imin: imin, imax: imax, jmin: jmin, jmax: jmax};
	}
	/**on flip action */
	, flip: function (isHorizontal) {
		var rec=this.getRectangle(this.mouseMoves.start, this.mouseMoves.end);
		this.transformations[this.transIndex]=new transformation(rec.imin, rec.jmin, rec.imax, rec.jmax, isHorizontal);
		this.transIndex++;
		this.transformations.length=this.transIndex;
		this.flipMatrix(rec, isHorizontal);
		this.updateBackground(rec);
		updateHistoryButtons({back: true, forward: false});
		var solved=this.compareMatrices(this.matrix, this.resultMatrix, this.gameOptions.measures.n, this.gameOptions.measures.m);
		return solved;
	}

	/**flips part of flipart.matrix
	 * 
	 * @param {type} rec rectangle
	 */
	, flipMatrix: function (rec, isHorizontal) {
		var mat=new Array(rec.imax-rec.imin+1);
		var i, j, f;
		for (i=0; i<=rec.imax-rec.imin; i++) {
			mat[i]=new Array(rec.jmax-rec.jmin+1);
			for (j=0; j<=rec.jmax-rec.jmin; j++) {
				if (isHorizontal) {
					f=flipart.matrix[rec.imin+i][rec.jmax-j];
					mat[i][j]={i: f.i, j: f.j, hflip: !f.hflip, vflip: f.vflip};
				} else {
					f=flipart.matrix[rec.imax-i][rec.jmin+j];
					mat[i][j]={i: f.i, j: f.j, hflip: f.hflip, vflip: !f.vflip};
				}
			}
		}
		for (i=0; i<=rec.imax-rec.imin; i++) {
			for (j=0; j<=rec.jmax-rec.jmin; j++) {
				this.matrix[rec.imin+i][rec.jmin+j]=mat[i][j];
			}
		}
	}
	/**
	 * @param {type} mat1 matrix{i,j,hflip,vflip}
	 * @param {type} mat2 matrix{i,j,hflip,vflip}
	 * @param {int} n,m mat dimensions
	 * @returns {Boolean} equal
	 */
	, compareMatrices: function (mat1, mat2, n, m) {
		var equal=true;
		var i, j, el1, el2;
		for (i=0; i<n; i++) {
			for (j=0; j<m; j++) {
				el1=mat1[i][j];
				el2=mat2[i][j];
				if (el1.i!=el2.i||el1.j!=el2.j||el1.hflip!=el2.hflip||el1.vflip!=el2.vflip) {
					equal=false;
					break;
				}
			}
			if (!equal) {
				break;
			}
		}
		return equal;
	}

	, updateBackground: function (rec) {
		var imin=rec.imin;
		var imax=rec.imax;
		var jmin=rec.jmin;
		var jmax=rec.jmax;
		var i, j, f, pozx, pozy;
		var mes=this.gameOptions.measures;
		var tem=_.template($('#ttile').data('tileid'));
		var id;
		for (i=imin; i<=imax; i++) {
			for (j=jmin; j<=jmax; j++) {
				f=this.matrix[i][j];
				pozx=f.hflip ? (2*mes.w-(f.j+1)*mes.tileWidth) : f.j*mes.tileWidth;
				pozy=f.vflip ? (2*mes.h-(f.i+1)*mes.tileHeight) : f.i*mes.tileHeight;
				id=tem({i: i, j: j});
				$('#'+id).css('background-position', (-pozx)+'px '+(-pozy)+'px');
				//$('#'+id).css('background-position', '0px 0px');
			}
		}
	}
	, moveHistory: function (isBack) {
		var tr, rec;
		var res={back: true, forward: true};
		if (isBack&&this.transIndex>0) {
			tr=this.transformations[this.transIndex-1];
			this.transIndex--;
		} else if (!isBack&&this.transIndex<this.transformations.length) {
			tr=this.transformations[this.transIndex];
			this.transIndex++;
		} else {
			return {back: this.transIndex>0, forward: this.transIndex<this.transformations.length};
		}
		rec=this.getRectangle({i: tr.row1, j: tr.col1}, {i: tr.row2, j: tr.col2});
		this.flipMatrix(rec, tr.isHorizontal);
		this.updateBackground(rec);
		return {back: this.transIndex>0, forward: this.transIndex<this.transformations.length};
	}
	, puzzleSolved: function () {
		$('#dSolved').show();
		flipart.audio.solve();
		$('#dNext').show().animate({
			opacity: 1
		}, 2000);
	}
	, animateFlip1: function (jSelectedBlocks) {
		var def=$.Deferred();
		jSelectedBlocks.css({'background-color': 'white', opacity: 0});
		jSelectedBlocks.animate({opacity: 0.3}, 300, function () {
			def.resolve();
		});
		return def;
	}

};

flipart.mouseMoves={
	isdown: false
	, ismove: false
	, state: 'empty'       //states: empty, click1, click2
	, offtop: null      //dActions offset to document top left corner
	, offleft: null
	, start: {i: null, j: null}    //start position of selection
	, end: {i: null, j: null}
	, blockTemplate: null           //underscore template for block id (function)
	, border: null                  //border for whole selected area
	, tileWidth: null               //from gameOptions.measures
	, tileHeight: null
	, init: function (actionsDiv) {
		this.isdown=null;
		this.ismove=null;
		this.state='empty';

		var act=$('#'+actionsDiv);
		var ofs=act.offset();
		this.offtop=ofs.top;
		this.offleft=ofs.left;
		this.blockTemplate=_.template($('#tblock').data('blockid'));
		this.border=$('#tblock').data('border');
		this.tileWidth=flipart.gameOptions.measures.tileWidth;
		this.tileHeight=flipart.gameOptions.measures.tileHeight;
	}
	, down: function (ev) {
		this.isdown=true;
		var blk=this._getCoordsForMouse(ev);
		var blockid;
		var jSelectedBlocks=$('div.block.selected');
		if (this.state=='empty'||this.state=='click2') {
			jSelectedBlocks.removeClass('selected').css('border', 'none');
			$('#dHorflip, #dVerflip').css('display', 'none');
		}
		switch (this.state) {
			case 'empty':
				this.start.i=blk.i;
				this.start.j=blk.j;
				blockid=this.blockTemplate({i: blk.i, j: blk.j});
				$('#'+blockid).addClass('selected');
				this.state='click1';
				break;
			case 'click2':
				this.state='empty';
				var horflip;
				if (ev.target.id=='horflip') {
					horflip=true;
//                        flipart.animateFlip1(jSelectedBlocks).done(function(){
//                            jSelectedBlocks.css({ 'background-color':'transparent' });
//                            flipart.flip(true);
//                        });                        
				} else if (ev.target.id=='verflip') {
					horflip=false;
				}
				if (horflip!==undefined) {
					flipart.audio.flip();
					$.when(flipart.animateFlip1(jSelectedBlocks))
							.then(function () {
								var solved=flipart.flip(horflip);
								return solved;
							})
							.then(function (solved) {   
								jSelectedBlocks.animate({opacity: 0}, 700, function () {
									jSelectedBlocks.css({'background-color': '', opacity: ''});
									if (solved) {
										flipart.puzzleSolved();
										solved =false;
									}
								});
							});
				}
				break;
		}
	}
	, move: function (ev) {
		var i, j;
		var ids=[];
		var jid;
		if (this.state!='click1') {
			return;
		}
		this.ismove=true;
		var blk=this._getCoordsForMouse(ev);
		this.end.i=blk.i;
		this.end.j=blk.j;
		var rec=flipart.getRectangle(this.start, this.end);
		$('div.block').removeClass('selected').css('border', 'none');
		for (i=rec.imin; i<=rec.imax; i++) {
			for (j=rec.jmin; j<=rec.jmax; j++) {
				jid='#'+this.blockTemplate({i: i, j: j});
				ids.push(jid);
				if (i==rec.imin) {
					$(jid).css('border-top', this.border);
				}
				if (j==rec.jmin) {
					$(jid).css('border-left', this.border);
				}
				if (i==rec.imax) {
					$(jid).css('border-bottom', this.border);
				}
				if (j==rec.jmax) {
					$(jid).css('border-right', this.border);
				}
			}
		}
		$(ids.toString()).addClass('selected');
	}
	, up: function (ev) {
		if (this.state=='click1'&&this.ismove) {
			this._rectangleSelected();
			this.state='click2';
		}
		this.isdown=false;
		this.ismove=false;
	}
	/** for mouse click in picture get tile coordinates */
	, _getCoordsForMouse: function (event) {
		var x=event.pageX-this.offleft;
		var y=event.pageY-this.offtop;
		var i=Math.floor(y/this.tileHeight);
		var j=Math.floor(x/this.tileWidth);
		//console.log('down at: ' + x + ', ' + y + ' >>ij: ' + i + ',' + j);
		return {i: i, j: j};
	}
	, _rectangleSelected: function () {
		var rec=flipart.getRectangle(this.start, this.end);
		var x1, x2, y1, y2;
		x1=rec.jmin*this.tileWidth;
		x2=(rec.jmax+1)*this.tileWidth;
		y1=rec.imin*this.tileHeight;
		y2=(rec.imax+1)*this.tileHeight;
		$('#dHorflip').css({display: 'block', top: y1+'px', left: x1+'px', width: (x2-x1)+'px'});
		$('#dVerflip').css({display: 'block', top: (y1-10+(y2-y1)/2)+'px', left: x1+'px'});
	}
}


flipart.audio={
	init: function (nodeBackmusic, nodeFlip, nodeSolved) {
		this.backmusic=nodeBackmusic;
		this.flipmusic=nodeFlip;
		this.solvedmusic=nodeSolved;

		this.backmusic.volume=0.05;
		this.flipmusic.volume=0.1;
	}
	, startBackmusic: function () {
		this.backmusic.play();
	}
	, flip: function () {
		this.flipmusic.play();
	}
	, solve: function () {
		this.backmusic.pause();
		this.solvedmusic.play();
	}
}

/**matches server transformation */
function transformation(row1, col1, row2, col2, isHorizontal) {
	this.row1=row1;
	this.col1=col1;
	this.row2=row2;
	this.col2=col2;
	this.isHorizontal=isHorizontal;
}
