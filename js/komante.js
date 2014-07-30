/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$4 = {};

/**positions seciond section of web page just below window
 * to appear immediatly after scroll
 *
 * @param string id1
 * @param string id2
 * @returns {undefined}
 */
function positionSecondSection(id1, id2) {
	var jq1, jq2, oldmar, newmar;
	jq1 = $(document.getElementById(id1));
	jq2 = $(document.getElementById(id2));
	oldmar = parseInt(jq1.css('margin-bottom'));
	newmar = oldmar - (jq2.position().top - $(window).height());
	jq1.css('margin-bottom', newmar);
}


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
	var whalf = $(document).scrollTop() + $(window).height() / 2;
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
