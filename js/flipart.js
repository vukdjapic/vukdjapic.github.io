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

function onStartSingleDataRetrieved() {
    resizeGameWindow('startsingle');
    displayGameWindow('dGame');
    flipart.mouseMoves.init('dActions');
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
    , playSingle: function (picframe, tiles, blocks, callback) {
        var fa = this;
        var i, j;
        var pf = $('#' + picframe), tiles = $('#' + tiles), blocks = $('#' + blocks);
        var tem = _.template($('#ttile').html());
        var temb = _.template($('#tblock').html());
        $.ajax(this.urls.newgame, {
            dataType: 'json'
        }).done(function (data) {
            fa.gameOptions = data.gameOptions;
            var mes = data.gameOptions.measures;
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
            $('.tile', tiles).css('background-image', 'url(' + fa.urls.image + ')');
            if (callback) {
                callback();
            }
        });
    }

    , mouseMoves: {
        isdown: false
        , ismove: false
        , state: 'empty'       //states: empty, click1, click2
        , offtop: null      //dActions offset to document top left corner
        , offleft: null
        , start: {i: null, j: null}    //start position of selection
        , end: {i: null, j: null}
        , blockTemplate :null           //underscore template for block id
        , border :null                  //border for whole selected area
        , tileWidth: null               //from gameOptions.measures
        , tileHeight: null
        , init: function (actionsDiv) {
            var act =$('#'+actionsDiv);
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
            this.blockTemplate =_.template($('#tblock').data('blockid'));
            this.border =$('#tblock').data('border');
            this.tileWidth =flipart.gameOptions.measures.tileWidth;
            this.tileHeight =flipart.gameOptions.measures.tileHeight;
        }
        , down: function (ev) {
            this.isdown = true;
            var blk =this._getCoordsForMouse(ev);
            var blockid = _;
            switch (this.state) {
                case 'empty':
                    this.start.i = blk.i;
                    this.start.j = blk.j;
                    blockid =this.blockTemplate({i:blk.i,j:blk.j});
                    $('#'+blockid).addClass('selected');        
                    this.state ='click1';
                    break;
            }
        }
        , move: function (ev) {
            var i,j;
            var ids =[];
            var jid;
            if(this.state!='click1'){
                return;
            }
            this.ismove = true;
            var blk =this._getCoordsForMouse(ev);
            var imin, imax, jmin, jmax;
            if(this.start.i < blk.i ){
                imin =this.start.i;
                imax =blk.i;
            } else {
                imin =blk.i;
                imax =this.start.i;
            }
            if(this.start.j < blk.j ){
                jmin =this.start.j;
                jmax =blk.j;
            } else {
                jmin =blk.j;
                jmax =this.start.j;
            }
            $('div.block').removeClass('selected').css('border','none');
            for(i=imin;i<=imax;i++){
                for(j=jmin;j<=jmax;j++){
                    jid ='#' + this.blockTemplate({i:i, j:j});
                    ids.push( jid );
                    if(i==imin){
                        $(jid).css('border-top',this.border);
                    }
                    if(j==jmin){
                        $(jid).css('border-left',this.border);
                    }
                    if(i==imax){
                        $(jid).css('border-bottom',this.border);
                    }
                    if(j==jmax){
                        $(jid).css('border-right',this.border);
                    }
                }
            }
            $(ids.toString()).addClass('selected');
            //console.log('move at: ' + ids);
        }
        , up: function (ev) {
            if(this.state=='click1' && this.ismove){
                this.state ='click2';
            }
            this.isdown = false;
            this.ismove = false;
        }
        , _getCoordsForMouse: function(event){
            var x = event.pageX - this.offleft;
            var y = event.pageY - this.offtop;
            var i = Math.floor(y / this.tileHeight);
            var j = Math.floor(x / this.tileWidth);
            //console.log('down at: ' + x + ', ' + y + ' >>ij: ' + i + ',' + j);
            return {i:i, j:j};
        }
    }

}; //namespace for game objects
