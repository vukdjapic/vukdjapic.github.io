$4 = {
	_logs: []
	, log: function(message) {
		if (typeof console === "object" && typeof console.log === "function") {
			this._logs.push(message);
			console.log(message);
		}
	}
	, serverUrl: 'http://api.komante.com/website'
	, serverUrl: '/kserver/website'
};



/**positions seciond section of web page just below window
 * to appear immediatly after scroll
 *
 * @param string id1
 * @param string id2
 */
function positionSecondSection(id1, id2) {
	var jq1, jq2, oldmar, newmar;
	jq1 = $(document.getElementById(id1));
	jq2 = $(document.getElementById(id2));
	oldmar = parseInt(jq1.css('margin-bottom'));
	newmar = oldmar - (jq2.position().top - $(window).height());
	jq1.css('margin-bottom', newmar);
}

/**Adds 'active' class to entry in list which points to currently
 * visible section
 *
 * @param {type} sideListId
 */
function activateScrolledSection(sideListId) {
	if (!$4._scrollSections) {
		$4._scrollSections = {};
		$4._scrollSectionsActive = null;
		$('#' + sideListId + '>li a').each(function() {
			var atr = this.getAttribute('href');
			var el;
			if (atr && atr.indexOf('#') == 0) {
				atr = atr.substring(1);
				el = document.getElementById(atr);
				if (el) {
					$4._scrollSections[atr] = {
						'top': $(el).offset().top
						, 'navlink': this
					}
				}
			}
		});
	}

	var sec, secdiff, sel;
	var whalf = $(document).scrollTop() + $(window).height() / 3;
	var min = Number.MAX_VALUE;
	for (sec in $4._scrollSections) {
		secdiff = whalf - $4._scrollSections[sec].top;
		if (secdiff > 0 && secdiff < min) {
			min = secdiff;
			sel = sec;
		}
	}
	if (sel != $4._scrollSectionsActive) {
		$4._scrollSectionsActive = sel;
		$('#' + sideListId + '>li').removeClass('active');
		if (sel) {
			$($4._scrollSections[sel].navlink).parent().addClass('active');
		}
	}

}

/**Eases background image while scrolling to match whole document.
 * Smooth background scroll.
 * Stretch background image height.
 *
 * @param {string} imgsrc
 * src string of image
 *
 */
function smoothBackgroundScroll(imgsrc) {
	function loadImageHeight(url, width) {
		var img = new Image();
		img.src = url;
		if (width) {
			img.width = width;
		}
		return img.height;
	}

	var dh, wh, ih, st, posy, backh, backw;
	if (!this._smoothBackgroundScroll) {
		var bcksize = $(document.body).css('background-size');
		var bmatch = /(\w+)\s*(\w+)/.exec(bcksize);
		if (!bmatch || bmatch.length < 3) {
			backh = loadImageHeight(imgsrc)
		} else {
			backh = parseInt(bmatch[2]);
			if (isNaN(backh)) {
				backw = parseInt(bmatch[1]);
				backh = loadImageHeight(imgsrc, parseInt(backw));
			}
		}
		this._smoothBackgroundScroll = {
			dh: $(document).height()
			, wh: $(window).height()
			, ih: backh
		}
	}
	dh = this._smoothBackgroundScroll.dh;
	wh = this._smoothBackgroundScroll.wh
	ih = this._smoothBackgroundScroll.ih;
	st = $(document).scrollTop();
	posy = (dh - ih) * st / (dh - wh);
	document.body.style.backgroundPosition = 'center ' + posy + 'px';
}


function serverRequestlog(app, page) {
	$.ajax($4.serverUrl + app + '/' + page, {
		success: function(dat, stat, jxhr) {
			$4.log('Request log: ' + dat + ", status:" + stat);
		}
		, error: function(jxhr, stat, err) {
			$4.log('ERROR in Request log: status' + stat + ' - ' + err);
		}
	});
}

$4.submitMessage = function(form) {
	$.ajax({
		url: $4.serverUrl + '/submitMessage'
		, data: {email: form.email.value, message: form.message.value}
		, dataType: 'json'
		, success: function(res) {
			if (res.status == 'OK') {
				$('#dResponse').attr('class', 'text-success');
			} else {
				$('#dResponse').attr('class', 'text-warning');
			}
			$('#dResponse').html(res.message);
		}
	});
}