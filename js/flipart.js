//DOM FUNCTIONS

/** displays one div from game window div, hide others */
function displayGameWindow(id) {
    $('div.gamediv').css('display', 'none');
    $('#' + id).css('display', 'block');
}

/** various game windows (welcome, play) can have different sizes 
 *  also sets other properties for resized and repositioned divs */
function resizeGameWindow(phase) {
    var gw = $("#dGameWindow");
    var go;
    switch (phase) {
        case 'welcome':
            gw.width(flipart.gwidth)
                    .height(flipart.gheight)
                    .css("top", "" + (flipart.wheight - flipart.gheight) / 2 + "px");
            break;
        case 'startsingle':
            go = flipart.gameOptions;
            if (go && !go.absolute) {
                gw.width(go.measures.w).height(go.measures.h);
            }
            break;
        default:
            console.error('no phase for resize');
    }

}

/**callback function when single game is started */
function onStartSingleDataRetrieved(gameOptions, imageUrl) {
    _populateTilesAndBlocks(gameOptions, imageUrl, 'dPictureFrame', 'dTiles', 'dBlocks');
    resizeGameWindow('startsingle');
    displayGameWindow('dGame');
    flipart.mouseMoves.init('dActions');
}

/**on flip action */
function flip(isHorizontal) {
    var rec = flipart.getRectangle(flipart.mouseMoves.start, flipart.mouseMoves.end);
    flipart.flipMatrix(rec, isHorizontal);
    flipart.updateBackground(rec);
    return false;
}

function _populateTilesAndBlocks(gameOptions, imageUrl, picframe, tiles, blocks) {
    var i, j;
    var pf = $('#' + picframe), tiles = $('#' + tiles), blocks = $('#' + blocks);
    var tem = _.template($('#ttile').html());
    var temb = _.template($('#tblock').html());
    var mes = gameOptions.measures;
    pf.width(mes.w).height(mes.h);
    for (i = 0; i < mes.n; i++) {
        for (j = 0; j < mes.m; j++) {
            tiles.append(tem({
                i: i, j: j
                , w: mes.tileWidth, h: mes.tileHeight
                , top: i * mes.tileHeight, left: j * mes.tileWidth
                , pozx: -j * mes.tileWidth, pozy: -i * mes.tileHeight
            }));
            blocks.append(temb({
                i: i, j: j
                , w: mes.tileWidth, h: mes.tileHeight
                , top: i * mes.tileHeight, left: j * mes.tileWidth
            }));
        }
    }
    //$(document.body).append('<img src="'+fa.urls.image+'" />')
    $('.tile', tiles).css('background-image', 'url(' + imageUrl + ')');

}

var flipart = {
    gwidth: null         //game width
    , gheight: null      //game height
    , wwidth: null       //window width
    , wheight: null      //window height
    , urls: {}          //server urls
    , actions: {
        'playsingle': 'playsingle'
        , 'startnew': 'startnew'
        , 'continue': 'continue'
        , 'instructions': 'inst'
    }
    , gameOptions: null     //gameOptions object retrieved from server
    , matrix: null          //transformation matrix
    , transformations: []

            /** computes game window dimensions */
    , computeSize: function (winWidth, winHeight) {
        var mf = .8;     //maximum factor how big game window can be
        var hw = .75;    //aspect ratio height/width
        var w = this.wwidth = winWidth;
        var h = this.wheight = winHeight;
        w *= mf;
        h *= mf;

        var wnew = h / hw;
        var hnew = w * hw;

        if (wnew < w) {
            this.gwidth = wnew;
            this.gheight = h;
        } else {
            this.gwidth = w;
            this.gheight = hnew;
        }

    }
    /**action on start new single game 
     * first gets game properites object, than adds all divs*/
    , playSingle: function (options, callback) {
        var fa = this;
        $.ajax(this.urls.newgame, {
            dataType: 'json'
        }).done(function (data) {
            fa.gameOptions = data.gameOptions;
            fa.matrix = data.matrix;
            if (callback) {
                callback(fa.gameOptions, fa.urls.image + '?t=' + new Date().getTime());
            }
        });
    }
    /** for two diagonal ends of rectangle returns upper left and lower right point */
    , getRectangle: function (start, end) {
        var imin, imax, jmin, jmax;
        if (start.i < end.i) {
            imin = start.i;
            imax = end.i;
        } else {
            imin = end.i;
            imax = start.i;
        }
        if (start.j < end.j) {
            jmin = start.j;
            jmax = end.j;
        } else {
            jmin = end.j;
            jmax = start.j;
        }
        return {imin: imin, imax: imax, jmin: jmin, jmax: jmax};
    }
    /**flips part of flipart.matrix
     * 
     * @param {type} rec rectangle
     */
    , flipMatrix: function (rec, isHorizontal) {
        var mat = new Array(rec.imax - rec.imin + 1);
        var i, j, f;
        for (i = 0; i <= rec.imax - rec.imin; i++) {
            mat[i] = new Array(rec.jmax - rec.jmin + 1);
            for (j = 0; j <= rec.jmax - rec.jmin; j++) {
                if (isHorizontal) {
                    f = flipart.matrix[rec.imin + i][rec.jmax - j];
                    mat[i][j] = {i: f.i, j: f.j, hflip: !f.hflip, vflip: f.vflip};
                } else {
                    f = flipart.matrix[rec.imax - i][rec.jmin + j];
                    mat[i][j] = {i: f.i, j: f.j, hflip: f.hflip, vflip: !f.vflip};
                }
            }
        }
        for (i = 0; i <= rec.imax - rec.imin; i++) {
            for (j = 0; j <= rec.jmax - rec.jmin; j++) {
                this.matrix[rec.imin + i][rec.jmin + j] = mat[i][j];
            }
        }
    }
    , updateBackground: function (rec) {
        var imin = rec.imin;
        var imax = rec.imax;
        var jmin = rec.jmin;
        var jmax = rec.jmax;
        var i, j, f, pozx, pozy;
        var mes = this.gameOptions.measures;
        var tem = _.template($('#ttile').data('tileid'));
        var id;
        for (i = imin; i <= imax; i++) {
            for (j = jmin; j <= jmax; j++) {
                f = this.matrix[i][j];
                pozx = f.hflip ? (2 * mes.w - (f.j + 1) * mes.tileWidth) : f.j * mes.tileWidth;
                pozy = f.vflip ? (2 * mes.h - (f.i + 1) * mes.tileHeight) : f.i * mes.tileHeight;
                id = tem({i: i, j: j});
                $('#' + id).css('background-position', (-pozx) + 'px ' + (-pozy) + 'px');
                //$('#'+id).css('background-position', '0px 0px');
            }
        }
    }
    , mouseMoves: {
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
            var act = $('#' + actionsDiv);
            var ofs = act.offset();
            act.mousedown(function (event) {
                flipart.mouseMoves.down(event);
            })
                    .mousemove(function (event) {
                        flipart.mouseMoves.move(event);
                    })
                    .mouseup(function (event) {
                        flipart.mouseMoves.up(event);
                    });
            this.offtop = ofs.top;
            this.offleft = ofs.left;
            this.blockTemplate = _.template($('#tblock').data('blockid'));
            this.border = $('#tblock').data('border');
            this.tileWidth = flipart.gameOptions.measures.tileWidth;
            this.tileHeight = flipart.gameOptions.measures.tileHeight;
        }
        , down: function (ev) {
            this.isdown = true;
            var blk = this._getCoordsForMouse(ev);
            var blockid;
            if (this.state == 'empty' || this.state == 'click2') {
                $('div.block').removeClass('selected').css('border', 'none');
                $('#dHorflip, #dVerflip').css('display', 'none');
            }
            switch (this.state) {
                case 'empty':
                    this.start.i = blk.i;
                    this.start.j = blk.j;
                    blockid = this.blockTemplate({i: blk.i, j: blk.j});
                    $('#' + blockid).addClass('selected');
                    this.state = 'click1';
                    break;
                case 'click2':
                    this.state = 'empty';
                    if (ev.target.id == 'horflip') {
                        flip(true);
                    } else if (ev.target.id == 'verflip') {
                        flip(false);
                    }
                    break;
            }
        }
        , move: function (ev) {
            var i, j;
            var ids = [];
            var jid;
            if (this.state != 'click1') {
                return;
            }
            this.ismove = true;
            var blk = this._getCoordsForMouse(ev);
            this.end.i = blk.i;
            this.end.j = blk.j;
            var rec = flipart.getRectangle(this.start, this.end);
            $('div.block').removeClass('selected').css('border', 'none');
            for (i = rec.imin; i <= rec.imax; i++) {
                for (j = rec.jmin; j <= rec.jmax; j++) {
                    jid = '#' + this.blockTemplate({i: i, j: j});
                    ids.push(jid);
                    if (i == rec.imin) {
                        $(jid).css('border-top', this.border);
                    }
                    if (j == rec.jmin) {
                        $(jid).css('border-left', this.border);
                    }
                    if (i == rec.imax) {
                        $(jid).css('border-bottom', this.border);
                    }
                    if (j == rec.jmax) {
                        $(jid).css('border-right', this.border);
                    }
                }
            }
            $(ids.toString()).addClass('selected');
        }
        , up: function (ev) {
            if (this.state == 'click1' && this.ismove) {
                this._rectangleSelected();
                this.state = 'click2';
            }
            this.isdown = false;
            this.ismove = false;
        }
        /** for mouse click in picture get tile coordinates */
        , _getCoordsForMouse: function (event) {
            var x = event.pageX - this.offleft;
            var y = event.pageY - this.offtop;
            var i = Math.floor(y / this.tileHeight);
            var j = Math.floor(x / this.tileWidth);
            //console.log('down at: ' + x + ', ' + y + ' >>ij: ' + i + ',' + j);
            return {i: i, j: j};
        }
        , _rectangleSelected: function () {
            var rec = flipart.getRectangle(this.start, this.end);
            var x1, x2, y1, y2;
            x1 = rec.jmin * this.tileWidth;
            x2 = (rec.jmax + 1) * this.tileWidth;
            y1 = rec.imin * this.tileHeight;
            y2 = (rec.imax + 1) * this.tileHeight;
            $('#dHorflip').css({display: 'block', top: y1 + 'px', left: x1 + 'px', width: (x2 - x1) + 'px'});
            $('#dVerflip').css({display: 'block', top: (y1 - 10 + (y2 - y1) / 2) + 'px', left: x1 + 'px'});
        }
    }

}; //namespace for game objects
