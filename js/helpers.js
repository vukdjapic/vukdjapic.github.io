
if (typeof $4 == 'undefined') {
	$4 = {};
}

/**
 * @param {type} elem	string id of element, dom element. if canvas use it, if another create canvas inside
 * @param {type} props
 * @returns {undefined}
 */

(function ($4) {
	var i,j,k,p,d;
	var defaultProps = {
		angle: 0	//max 180 
		, loColor: 0	//max hiColor
		, hiColor: 255	//max 255
		, period: 510 * Math.PI		// gt 0
		, offset: 0
	}

	$4.colorwave = function (elem, props) {
		if (typeof elem === 'string') {
			elem = document.getElementById(elem);
		}
		if (!elem) {
			throw 'no elem present';
		}
		if (typeof elem !== 'object') {
			throw 'elem - illegal argument';
		}
		if (elem.tagName === 'CANVAS') {
			applyColorWave(elem, defaultProps);
			console.log(findXcoordinate(90,1,1));
			console.log(findXcoordinate(90,0,105));
			console.log(findXcoordinate(60,1,Math.sqrt(3)));
			console.log(findXcoordinate(60,1,0));
			console.log(findXcoordinate(45,1,0));
			console.log(findXcoordinate(45,1,1));
		}
	}

	function applyColorWave(canvas, props) {
		var ctx = canvas.getContext('2d');
		var color,xcoord;
		for (i = 0; i < 150; i++) {
			//drawPixel(ctx, 10, 10 + i, 0, 0, 255);
			//console.log('sin '+i*10+': ' +getSineY(i*10, defaultProps.loColor, defaultProps.hiColor, defaultProps.period, defaultProps.offset));
		}
		/*
		for(i=0;i<1200;i++){
			for(j=0;j<800;j++){
				xcoord =findXcoordinate(props.angle,i,j);
				color =getSineY(xcoord, props.loColor, props.hiColor, props.period, props.offset);
				drawPixel(ctx,i,j,color,color,color);
			}
		}
		*/
		for(i=0;i<1200;i++){
			for(j=0;j<800;j++){
				xcoord1 =findXcoordinate(0,i,j);
				xcoord2 =findXcoordinate(120,i,j);
				xcoord3 =findXcoordinate(240,i,j);
				color1 =getSineY(xcoord1, props.loColor, props.hiColor, 101, 100);
				color2 =getSineY(xcoord2, props.loColor, props.hiColor, 370, 1000 );
				color3 =getSineY(xcoord3, props.loColor, props.hiColor, 207, 10);
				drawPixel(ctx,i,j,color1,color2,color3);
			}
		}
	   
	}

	function drawPixel(ctx, x, y, r, g, b) {
		var id = ctx.createImageData(1, 1); // only do this once per page
		var d = id.data;                        // only do this once per page
		d[0] = r;
		d[1] = g;
		d[2] = b;
		d[3] = 255;
		ctx.putImageData(id, x, y);
	}

	function findXcoordinate(angle, x0, y0){
		k =Math.tan(Math.PI*angle/180);
		p =Math.abs((k*x0-y0)/Math.sqrt(k*k+1));		//p tested OK
		d =Math.sqrt(x0*x0+y0*y0);
		return Math.sqrt(d*d-p*p);
	}
	
	function getSineY(x, loColor, hiColor, period, offset){
		var sinKoef =2*Math.PI/period;
		var midColor =(loColor+hiColor)/2;
		var halfAmpl =(hiColor-loColor)/2;
		return midColor + halfAmpl*Math.sin(x*sinKoef -offset);
	}

})($4);




