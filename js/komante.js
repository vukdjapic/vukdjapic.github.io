$4 = {
	_logs: []
	, log: function(message) {
		if (typeof console === "object" && typeof console.log === "function") {
			this._logs.push(message);
			console.log(message);
		}
	}
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

/**Eases background image while scrolling to match whole document
 *
 */
function smoothBackgroundScroll() {
	var dh, wh, ih, st, posy, bcksize;
	if (!$4._smoothScroll) {
		bcksize = $(document.body).css('background-size');
		$4._smoothScroll = {
			dh: $(document).height()
			, wh: $(window).height()
			, ih: parseInt(/\d+/.exec(bcksize)[0] || "1440")
		}
	}
	dh = $4._smoothScroll.dh;
	wh = $4._smoothScroll.wh
	ih = $4._smoothScroll.ih;
	st = $(document).scrollTop();
	posy = (dh - ih) * st / (dh - wh);
	document.body.style.backgroundPosition = 'center ' + posy + 'px';
}


function serverRequestlog(app, page) {
	$.ajax('http://api.komante.com/website/' + app + '/' + page, {
		success: function(dat, stat, jxhr) {
			$4.log('Request log: ' + dat + ", status:" + stat);
		}
		, error: function(jxhr, stat, err) {
			$4.log('ERROR in Request log: status' + stat + ' - ' + err);
		}
	});
}