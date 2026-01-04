//////////////////////////
//Include scrip as "<script src="..." async>" (load script in async mode; need to set window.isDOMContentLoadedHelper=true in any "synchronous script" https://stackoverflow.com/a/31330815 https://stackoverflow.com/a/33159589 )
//////////      or "<script src="...">"       (load script in blocking mode)
//////////      don't use "defer" mode!
//Achtung! HTTPS (for .html) may prevent fast Back/Forward (prevent from "Disregarding server expiry/cache-control setting")
//////////
"use strict";

typeof{ Full_version_of_this_FILE: "See full version and comments", URI: "https://github.com/ASOIU/9bit/blob/master/theme/comments.plus.js" };


(function(){
	var _onDomLoad = window.isDOMContentLoadedHelper;
	var loc = window.location;

	// you can inline this in html (see "#more" hash check, rewrite to switch-case) to redirect as soon as possible
	if(loc.hash == "#comments-plus" || loc.hash == "#comments"){
		if(loc.protocol != "https:"){
			loc.replace("https://" + loc.hostname + loc.pathname + loc.search + loc.hash);
		}else if(loc.hash == "#comments-plus"){ // you can delete "if()", if...
			// you can clear hash (affect to page reload): loc.hash = "";

			if(!_onDomLoad) document.addEventListener("DOMContentLoaded", function H(){
				(_onDomLoad||function(){_onDomLoad = true})(); ///magic line
				document.removeEventListener("DOMContentLoaded", H, false);
			}, false);

			loadCommentsPlus();
			
			return;
		}
	}

	var _singleLoadCommentsPlus = loadCommentsPlus;

	var gH = loc.protocol != "https:" ? function(){
		document.querySelectorAll("#comments-plus_not-https_open-https")[0].onclick = function(){
			var loc = window.location;
			loc.assign("https://" + loc.hostname + loc.pathname + loc.search + "#comments-plus");
		};
		document.querySelectorAll("#comments-plus_not-https_open")[0].onclick = function(){
			this.onclick = null; // prevent multiple calls
			_singleLoadCommentsPlus(true); // true (and "return false") - save (in history [Back/Forward]) correct page snapshot
			return false;
		};
	} : function(){
		document.querySelectorAll("#comments-plus")[0].className = "https";

		document.querySelectorAll("#comments-plus_https_open")[0].onclick = function(){
			this.onclick = null; // prevent multiple calls
			// you can add hash (affect to page reload): _singleLoadCommentsPlus(true); //loc.hash = "#comments-plus"
			_singleLoadCommentsPlus();
		};
	};

	if(_onDomLoad) gH();
	else{
		_onDomLoad = true; // really not
		document.addEventListener("DOMContentLoaded", gH, false);
	}


	function loadCommentsPlus(changeHash)
	{
		_singleLoadCommentsPlus = null; // prevent multiple calls, totally

		var runAfterDomLoad = function(func){ return function(){
			if  (_onDomLoad)  func();
			else _onDomLoad = func;
		};};

		var gapiRenderAfterDomLoad = runAfterDomLoad(function(){ // slow way
			document.querySelectorAll("#comments-plus")[0].className = "comments-plus-content";

			gapi.comments.render("comments-g-plus", {
				href: decodeURI(document.querySelectorAll("#comments-plus-script")[0].getAttribute("data-canonical-uri")), //
				width: "526", // is content.width, iframe.width = content.width + 1
				first_party_property: "BLOGGER",
				view_type: "FILTERED"
			});

			if(changeHash) window.location.hash = "#comments-plus";

			_onDomLoad = null; //:-)
		});

		var fallbackRenderAfterDomLoad = runAfterDomLoad(function(){ // fastest way
			var _comments = document.createElement("iframe");
			var _heightRe = /"height":(\d+)/;

			window.addEventListener("message", function H(e){
				if(e.source === _comments.contentWindow && e.origin == "https://apis.google.com"){
					//
					var matches;
					if(typeof(e.data) == "string" && (matches = e.data.match(_heightRe))){
						_comments.style.height = ((matches[1]|0)+10) + "px";

						window.removeEventListener("message", H, false);
						_comments = _heightRe = null; //:-)
					}
				}
			}, false);


			var origin = encodeURIComponent(window.location.protocol + "//" + window.location.host);

			_comments.tabindex = 0;
			_comments.id       = "comments-g-plus";
			_comments.marginWidth  = "0"; // inside of frame (frame body margin)
			_comments.marginHeight = "0"; // inside of frame (frame body margin)
			_comments.scrolling    = "no";
			_comments.src =("https://apis.google.com/_/widget/render/comments"
			             + "?href="+encodeURIComponent(decodeURI(document.querySelectorAll("#comments-plus-script")[0].getAttribute("data-canonical-uri"))) //
			             + "&width=526" // see CSS (width+1)
			             + "&first_party_property=BLOGGER"
			             + "&view_type=FILTERED"
			             + "&origin="+origin
			             + "#parent="+origin
			);

			var _comments_g_plus_ = document.querySelectorAll("#comments-g-plus")[0];
			_comments_g_plus_.parentNode.replaceChild(_comments, _comments_g_plus_);

			document.querySelectorAll("#comments-plus")[0].className = "comments-plus-content";

			if(changeHash) window.location.hash = "#comments-plus";

			_onDomLoad = origin = _comments_g_plus_ = null; //:-)
		});

		//

		var script = document.createElement("script");
		script.onload = function(){
			gapi.load("comments",{ //
				callback:  gapiRenderAfterDomLoad,
				onerror:   fallbackRenderAfterDomLoad,
				timeout:   5000, // 5 seconds
				ontimeout: fallbackRenderAfterDomLoad
			});
			//
		};
		script.onerror = fallbackRenderAfterDomLoad;
		//
		//
		script.src = "https://apis.google.com/js/api.js"; ///////// see also https://apis.google.com/js/good.js https://apis.google.com/js/don-t-be-evil.js

		(document.head || document.querySelectorAll("head")[0]).appendChild(script);

		script = null; //:-)
	};

	loc = gH = null; //:-)
})();
/**/
/**/
