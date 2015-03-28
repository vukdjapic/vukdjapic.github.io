var flipart = {
    gwidth: null         //game width
    , gheight: null      //game height
    , wwidth: null       //window width
    , wheight: null      //window height
    , actions: {
        'playsingle': 'playsingle'
        , 'startnew': 'startnew'
        , 'continue': 'continue'
        , 'instructions': 'inst'
    }
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

}; //namespace for game objects
