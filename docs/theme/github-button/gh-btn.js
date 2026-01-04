/******:Alt to:*********************************************************\
 * http://buttons.github.io ~~ https://github.com/ntkme/github-buttons *
 * http://ghbtns.com ~~~~~~~~~ https://github.com/mdo/github-buttons   *
\***********************************************************************/
"use strict";

var GhBtn = (function(){
	var request = (function(){
		var XHR = (XMLHttpRequest && ("onload" in new XMLHttpRequest()) && XMLHttpRequest) || XDomainRequest;
	
		if(XHR) return function(url, callback){
			var xhr = new XHR();

			xhr.open("GET", url, true);
			xhr.setRequestHeader("Accept", "application/vnd.github.v3+json"); // https://developer.github.com/v3/media/#request-specific-version
			xhr.onload = callback;
			xhr.send();
		}
	})();

	return {
		init: function(){
			request('https://api.github.com/repos/' + "ASOIU" + '/' + "9bit", function(){
				if(this.status == 200){
					document.querySelectorAll("#gh-btn-count")[0].firstChild.data = (JSON.parse(this.responseText).stargazers_count|0);
				}
			});

			GhBtn = null; //:-)
		}
	};
})();
