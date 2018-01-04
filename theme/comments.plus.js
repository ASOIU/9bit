---
---
//////////////////////////
//Include scrip as "<script src="..." async>" (load script in async mode; need to set window.isDOMContentLoadedHelper=true in any "synchronous script" https://stackoverflow.com/a/31330815 https://stackoverflow.com/a/33159589 )
//////////      or "<script src="...">"       (load script in blocking mode)
//////////      don't use "defer" mode!
//Achtung! HTTPS (for .html) may prevent fast Back/Forward (prevent from "Disregarding server expiry/cache-control setting")
//////////
"use strict";

typeof{ Full_version_of_this_FILE: "See full version and comments", URI: "https://github.com/ASOIU/9bit/blob/master/{{ page.path }}" };


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
				href: decodeURI(document.querySelectorAll("#comments-plus-script")[0].getAttribute("data-canonical-uri")), //{% comment %} use "https://floaternet.com/gcomments" for testing {% endcomment %}
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
					//{% comment %}
					//if iframe.src contain "usegapi" -> e.data == "!_"+a.JSON.stringify(d) (see iframe source code)

					//JSON.parse(e.data).height; // may be broken in the future

					// brokenless solution {% endcomment %}
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
			             + "?href="+encodeURIComponent(decodeURI(document.querySelectorAll("#comments-plus-script")[0].getAttribute("data-canonical-uri"))) //{% comment %} use "https://floaternet.com/gcomments" for testing {% endcomment %}
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

		//{% comment %}
		//window.___gcfg = { parsetags: "explicit" }; // https://developers.google.com/+/web/api/javascript#configuration_options
		                                              // not need for https://apis.google.com/js/api.js
		//{% endcomment %}

		var script = document.createElement("script");
		script.onload = function(){
			gapi.load("comments",{ //{% comment %}
					               // need for https://apis.google.com/js/api.js
					               // https://developers.google.com/api-client-library/javascript/reference/referencedocs
					               // https://developers.google.com/api-client-library/javascript/samples/samples
					               //{% endcomment %}
				callback:  gapiRenderAfterDomLoad,
				onerror:   fallbackRenderAfterDomLoad,
				timeout:   5000, // 5 seconds
				ontimeout: fallbackRenderAfterDomLoad
			});
			//{% comment %}
			// on "localhost:4000" RPC communication (resize on click to "Show more comments") doesn't work (open JS console): 
			// "Error in protected function: Widget on: http://localhost:4000 trying to load: https://floaternet.com/gcomments"
			// -> test on a real site, i.e. "https://floaternet.com/gcomments"
			//{% endcomment %}
		};
		script.onerror = fallbackRenderAfterDomLoad;
		//{% comment %}
		// not need
		//script.defer = true;  // ;)
		//script.async = false; // https://habrahabr.ru/post/182310
		                        // https://html.spec.whatwg.org/images/asyncdefer.svg
		                        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#Attributes
		                        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement
		                        // https://developers.google.com/web/fundamentals/performance/critical-rendering-path/analyzing-crp#css_javascript
		                        // https://calendar.perfplanet.com/2016/prefer-defer-over-async/
		//{% endcomment %}
		//{% comment %}
		//script.src = "https://apis.google.com/js/plusone.js";  // too fat JS!
		//script.src = "https://apis.google.com/js/platform.js"; // same as "plusone.js", see last line 
				                                                 // ',"platform":["additnow",...,"comments",...],...,"annotation":[...,"autocomplete",...],'
		//{% endcomment %}
		script.src = "https://apis.google.com/js/api.js"; ///////// see also https://apis.google.com/js/good.js https://apis.google.com/js/don-t-be-evil.js

		(document.head || document.querySelectorAll("head")[0]).appendChild(script);

		script = null; //:-)
	};

	loc = gH = null; //:-)
})();
/*{%- comment %}
:: ruNOTES :: ruBacklog :: ruBrainDump :: часть заметок/тудушек, которые были написаны "чтобы не забыть" :: 

== Комментарии ==
-- Можно добавить Google+ --
как здесь: https://developers.googleblog.com/2017/08/aiy-projects-update-new-maker-projects.html

только сделать, чтобы загружался после нажатия на кнопку (спойлер), и сразу переводить на https версию сайта

код https://floaternet.com/gcomments (лучшая страничка для тестирования)
    http://browsingthenet.blogspot.ru/2013/04/google-plus-comments-on-any-website.html
https://developers.google.com/+/web/share/
https://developers.google.com/+/web/api/javascript
iframe url format https://stackoverflow.com/questions/22424145/get-youtube-comments-url/34714182#34714182
Размер: {"s":"/I0_1509217946714::_renderstart","f":"I0_1509217946714","r":"I0_1509217946714","t":"58156362","a":[{"width":521,"height":3536,"title":"Comment on this"}],"g":false}
(продолжение ниже)

TODO[x]: для страниц со списком постов: в метаинформации поста заменить ссылку (на комментарии) на HTTPS
TODO[x]: по умолчанию (вместо использования пути к файлу page.path) в качестве href (при конфигурировании g-plus) использовать page.url совмещенный с canonical-domain и https:// (для лучшей линковки с постами в Google+),
         но и предусмотреть задание конкретного href через YAML поста.

Для тестов HTTPS:
- http сервер запускать как обычно: 
    bundle exec jekyll serve
- https (параллельно, в другом терминале; можно в одном терминале, но будет менее удобно): 
    bundle exec jekyll serve --skip-initial-build --no-watch --port 443 --ssl-key test.key --ssl-cert test.crt
- "test.key" и "test.crt" создать с минимальной длиной ключа:
    openssl req -newkey rsa:512 -nodes -keyout test.key -new -x509 -days 365 -subj /CN=localhost -out test.crt
  !в браузере не надо добавлять сертификат в "доверенные корневые..."!
  !просто открываем страничку по https, видим предупреждение и сохраняем исключение для этой связки (домен+порт+сертификат)!
- чтобы https сервер смог запустится на 443 порту (в директории с ruby "which ruby2.4"):
    sudo setcap CAP_NET_BIND_SERVICE=+eip ruby2.4


-- И можно использовать GitHub Issue API --
https://habrahabr.ru/post/327424/#comment_10192228
https://habrahabr.ru/post/327424/#comment_10192018
https://github.com/gitalk/gitalk

Но в нем нужно указывать номер: "GET /repos/:owner/:repo/issues/:number/comments" https://developer.github.com/v3/issues/comments/ ,
который не будет известен заранее. Поэтому хотелось бы привязать issues к "id статьи" (дата+title),
но для этого придется вначале искать его в https://developer.github.com/v3/issues/#get-a-single-issue , и от туда забирать ":number", а это уже 2 или более запроса!
или использовать поиск:
https://developer.github.com/v3/search/#search-issues
https://help.github.com/articles/searching-issues-and-pull-requests/

(ограничение https://developer.github.com/changes/2013-07-02-rate-limit-reset/ : 
60 обычных запросов в час https://developer.github.com/v3/#rate-limiting ; 
10 запросов поиска в минуту https://developer.github.com/v3/search/#rate-limit ; 
смягчить ограничения: https://github.com/ntkme/github-buttons/issues/33 
 - браузер сам добавит If-Modified-Since и If-None-Match если загружать через <script> с callback 
   (как сделано в https://ghbtns.com/github-btn.html?user=twbs&repo=bootstrap&type=star&count=true ) вместо XMLHttpRequests
   , но время кеширования всего 60 секунд...
)


Но можно попробовать GraphQL, и сделать все за 1 запрос: https://developer.github.com/v4/
https://developer.github.com/v4/guides/resource-limitations/
https://developer.github.com/v4/guides/forming-calls/#example-query
https://developer.github.com/v4/guides/migrating-from-rest/#nesting
https://developer.github.com/v4/reference/

https://developer.github.com/v4/explorer/
https://blog.codeship.com/an-introduction-to-graphql-via-the-github-api/

но он требует токен: https://platform.github.community/t/permit-access-without-oauth-token/2572

пример запроса комментария: https://platform.github.community/t/permit-access-without-oauth-token/2572/6

получение токена: https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/
включение токена в запрос: https://stackoverflow.com/questions/44610214/why-is-githubs-graphql-api-401ing-with-axios

-- Также можно использовать Firebase --
https://webref.ru/dev/building-jekyll-site/firebase-backed-commenting-system


-- Иконки --
https://octicons.github.com/icon/comment/
https://octicons.github.com/


-- WebMentions & Pingback --
https://indieweb.org/webmention.io
https://indieweb.org/webmentions
https://webmention.net/draft/
Можно, но будет тормозить + в WP его обычно отключали...

{% endcomment -%}*/
/*{%- comment %}*/
== Продолжение разбора комментариев Google+ ==
В свете этого: iframe url format https://stackoverflow.com/questions/22424145/get-youtube-comments-url/34714182#34714182
можно посмотреть на протокол общения.

Добавить в исходник https://floaternet.com/gcomments :
```
window.addEventListener("message", function(e){
	//console.dir(e.data);
	//console.log(e.origin, /*e.source == comments,*/ JSON.stringify(e.data));
	//console.log(e.origin, /*e.source == comments,*/ e.data);
	e.origin == "https://apis.google.com" && console.log(e.origin, /*e.source == comments,*/ e.data);
}, false);
```
Незабыть нажать "Apply Changes"/"Применить изменения"!
NOTE читающим эти строки: все происходит в контексте Opera Presto

Для прослушивания сообщений пришедших в iframe - добавить UserJS:
```
// ==UserScript==
// @name        test
// @include     https://apis.google.com/_/widget/render/*
// ==/UserScript==


window.opera.addEventListener("BeforeEvent.DOMContentLoaded", function(){
	
	window.addEventListener("message", function(e){
		e.origin == "https://floaternet.com" && console.log(e.origin, /*e.source == _comments_,*/ e.data);
	}, false);
	
}, true);
```

Попытка минимизировать параметны iframe, и послушать сообщения:
```
<iframe scrolling="no" marginheight="0" marginwidth="0"
style="border-top-style: none; border-right-style: none; border-left-style: none; width: 521px; height: 3444px; border-bottom-style: none;" tabindex 
src="https://apis.google.com/_/widget/render/comments?href=https%3A%2F%2Ffloaternet.com%2Fgcomments&width=520&first_party_property=BLOGGER&view_type=FILTERED_POSTMOD&origin=https%3A%2F%2Ffloaternet.com&parent=https%3A%2F%2Ffloaternet.com" 
title="Comment on this"></iframe>

================================================================

<iframe id="_comments_" scrolling="no" marginheight="0" marginwidth="0" allowtransparency="true"
style="border-top-style: none; border-right-style: none; border-left-style: none; width: 521px; height: 3444px; border-bottom-style: none;" tabindex 
src="https://apis.google.com/_/widget/render/comments?href=https%3A%2F%2Ffloaternet.com%2Fgcomments&width=520&first_party_property=BLOGGER&view_type=FILTERED&origin=https%3A%2F%2Ffloaternet.com&parent=https%3A%2F%2Ffloaternet.com" 
title="Comment on this"></iframe>
<script>
window.onmessage = function(e){
  //console.dir(e.data);
  console.log(e.origin, e.source == _comments_, JSON.stringify(e.data));
};
</script> 

================================================================

<script src="https://apis.google.com/js/plusone.js"></script>

<div id="comments"></div>

<script>

gapi.comments.render('comments', {
    href: window.location,
    width: '760',
    first_party_property: 'BLOGGER',
    view_type: 'FILTERED_POSTMOD'
});
</script> 
<!-- 
<iframe id="_comments_"
style="margin: 0; border-top-style: none; border-right-style: none; border-left-style: none; width: 521px; height: 3444px; border-bottom-style: none; overflow:visible; resize: vertical" tabindex 
src="https://apis.google.com/_/widget/render/comments?href=https%3A%2F%2Ffloaternet.com%2Fgcomments&width=520&first_party_property=BLOGGER&view_type=FILTERED&origin=https%3A%2F%2Ffloaternet.com&parent=https%3A%2F%2Ffloaternet.com">
</iframe>
-->
<!-- -->
<script>
window.addEventListener("message", function(e){
  //console.dir(e.data);
  console.log(e.origin, /*e.source == _comments_,*/ JSON.stringify(e.data));
}, false);
</script> 

================================================================

https://floaternet.com"!_{\"s\":\":/I0_1509216120867:_g_rpcReady\",\"f\":\"..\",\"r\":\"..\",\"t\":\"65550908\",\"c\":1,\"a\":[null],\"g\":false}"
https://floaternet.com"!_{\"s\":\":/I0_1509216120867:_g_connect\",\"f\":\"..\",\"r\":\"..\",\"t\":\"65550908\",\"c\":2,\"a\":[{\"role\":\"_opener\",\"selfConnect\":true}],\"g\":false}"
```

Дамп #2:
```
<iframe ng-non-bindable="" frameborder="0" hspace="0" marginheight="0" marginwidth="0" scrolling="no" 
style="..." tabindex="0" vspace="0" width="100%" id="I0_1509217946714" name="I0_1509217946714" 
src="...#_methods=onPlusOne%2C_ready%2C_close%2C_open%2C_resizeMe%2C_renderstart%2Concircled%2Cdrefresh%2Cerefresh%2Cscroll%2Copenwindow
&id=I0_1509217946714&_gfid=I0_1509217946714&parent=https%3A%2F%2Ffloaternet.com&pfname=&rpctoken=58156362" 
data-gapiattached="true"></iframe>

<!-- -->
<script>
var uu=1
window.addEventListener("message", function(e){
if(/widget-interactive-/.exec(e.data)){uu=0;
	I0_1509217946714.postMessage('!_{"s":":/I0_1509217946714:_g_rpcReady","f":"..","r":"..","t":"58156362","c":1,"a":[null],"g":false}', "https://apis.google.com");
	I0_1509217946714.postMessage('!_{"s":":/I0_1509217946714:_g_connect","f":"..","r":"..","t":"58156362","c":2,"a":[{"role":"_opener","selfConnect":true}],"g":false}', "https://apis.google.com");
}
var cc = /"c":(\d+)/.exec(e.data);
if(cc){
	I0_1509217946714.postMessage('"!_{"s":"__cb","f":"..","r":"..","t":"58156362","c":null,"a":['+ cc[1] +',[null,null]],"g":false}"', "https://apis.google.com");
}
  //console.dir(e.data);
  e.origin == "https://apis.google.com" && console.log(e.origin, /*e.source == _comments_,*/ e.data);
}, false);
</script>
```
/*{% endcomment -%}*/
