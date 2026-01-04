//NOTE: to use outside of Jekyll - remove two lines of "---" (above) and all "" (below)

/******:History:*****************\
 * 2013 http://coinwidget.com   *
 * 2013 http://scotty.cc        *
 * 2014 http://www.alvinhkh.com *
 * 2017 https:/9b.asoiu.com     *
\********************************/
"use strict";


/* == Define ==
 * crdon - Crypto(currency) Donate
 * cc    - CryptoCurrency
 * btn   - Button
 * mpo   - Modal PopOver:
 **         http://getbootstrap.com/2.3.2/javascript#popovers
 **         http://scruffles.github.io/BootstrapModalPopover/
 **         https://web.archive.org/web/20170711101113/https://developer.apple.com/ios/human-interface-guidelines/ui-views/popovers/
 **        Alignment:
 ***        bc = Bottom Center
 ***        bl = Bottom Left
 ***        br = Bottom Right
 ***        tc =    Top Center
 ***        tl =    Top Left
 ***        tr =    Top Right
/*/

typeof{ Full_version_of_this_FILE: "See full version and comments", URI: "https://github.com/ASOIU/9bit/blob/master/theme/crypto-currency/crdon.js" };


var CrDon = (function(){
	var request = (function(){
		var XHR = (XMLHttpRequest && ("onload" in new XMLHttpRequest()) && XMLHttpRequest) || XDomainRequest;
		
		if(XHR) return function(url, callback){
			var xhr = new XHR();
	
			xhr.open("GET", url, true);
			xhr.onload = callback;
			xhr.send();
		}
	})();
	
	var getElementText = (function(){
		return ("textContent" in document.documentElement ? 
			function(element){ return element.textContent; } : 
			function(element){ return element.innerText;   }
		);
	})();
	var setElementText = (function(){
		return ("textContent" in document.documentElement ? 
			function(element, text){ return element.textContent = text; } : 
			function(element, text){ return element.innerText   = text; }
		);
	})();
	
	var domRemoveNode = function(node){
		return node.parentNode.removeChild(node);
	};
	
	
	var _T_mpo_;
	
	var _T_mpo_label_;
	var _T_mpo_wallet_address__input_;
	var _T_mpo_wallet_address__a_;
	var _T_mpo_wallet_n_tx_;
	var _T_mpo_wallet_total_received_;
	var _T_mpo_qr_code_;
	
	var _classAlignRe    = /(^|\s)crdon_mpo-a-/;
	var _classBtnOffTRRe = /(^|\s)crdon_btn-off-total-received(\s|$)/;
	
	
	var Handlers = (function(){
		//current state
		var _mpoControlButton = null; // current mpo control button
		var _mpoIsOpen        = false;
		
		var mpoUpdateStat = function(btn){
			btn.crdonWalletStat_total_received && (_T_mpo_wallet_total_received_.firstChild.data = btn.crdonWalletStat_total_received);
			btn.crdonWalletStat_n_tx           && (_T_mpo_wallet_n_tx_.          firstChild.data = btn.crdonWalletStat_n_tx);
		};
		
		var mpoIndirectClose = function(){
			// Accessible Circles of Hell (Up)
			_mpoControlButton && _mpoControlButton.setAttribute("aria-expanded", "false");
			_T_mpo_.setAttribute("aria-hidden", "true");
			_mpoIsOpen = false;
			_mpoControlButton && _mpoControlButton.setAttribute("aria-pressed", "false");
		};
		
		var inputTextSelectAll = function(inputElement){
			//inputElement.select();
			// https://stackoverflow.com/a/13761214
			// https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange#Browser_compatibility
			inputElement.selectionStart = 0;
			inputElement.selectionEnd = inputElement.value.length;
		};
		var mpoInputSelectAll = function(){ // for mpoInputSelectAllDelayed
			inputTextSelectAll(_T_mpo_wallet_address__input_);
		};
		
		return {
			btnClick: function(){ //attach handler by using 'querySelectorAll(".crdon-here > .crdon_holder > button")' for safe use '.parentNode' in handler
				var holder = this.parentNode;
				var btn    = holder.parentNode;
				
				if(this !== _mpoControlButton){
					if(_mpoIsOpen) mpoIndirectClose();
					_mpoControlButton && _mpoControlButton.setAttribute("aria-controls", "");
					_mpoControlButton = null;
					
					
					_T_mpo_wallet_address__a_.setAttribute("href", btn.crdonWalletURI);
					_T_mpo_wallet_address__input_.value = btn.crdonWalletAddress;
					setElementText(_T_mpo_label_, btn.crdonLabel);
					_T_mpo_qr_code_.src = "/theme/crypto-currency/qr/" + btn.crdonWalletAddress + ".png"; // or "https://blockchain.info/qr?data="+btn.crdonWalletAddress+"&size=111"
					
					mpoUpdateStat(btn);
					
					holder.appendChild(_T_mpo_); // move _T_mpo_ from previous parent to new parent (this holder)
					                             // https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild#Notes
					
					
					// Accessible Circles of Hell (Down)
					this.setAttribute("aria-pressed", "true");
					this.setAttribute("aria-controls", "_crdon__mpo_");
					_mpoControlButton = this;
					_T_mpo_.setAttribute("aria-hidden", "false");
					_mpoIsOpen = true;
					this.setAttribute("aria-expanded", "true");
				} else {
					if(!_mpoIsOpen){
						// Accessible Circles of Hell (Down)
						this.setAttribute("aria-pressed", "true");
						_T_mpo_.setAttribute("aria-hidden", "false");
						_mpoIsOpen = true;
						this.setAttribute("aria-expanded", "true");
					}else{
						// Accessible Circles of Hell (Up)
						this.setAttribute("aria-expanded", "false");
						_T_mpo_.setAttribute("aria-hidden", "true");
						_mpoIsOpen = false;
						this.setAttribute("aria-pressed", "false");
					}	
				}
			},
			mpoCloseClick: mpoIndirectClose,
			mpoUpdateStat: function(){
				if(_mpoControlButton) mpoUpdateStat(_mpoControlButton.parentNode.parentNode);
			},
			mpoInputSelectAll: function(){
				inputTextSelectAll(this);
			},
			mpoInputSelectAllDelayed: function(){
				// https://stackoverflow.com/a/19498477
				setTimeout(mpoInputSelectAll);
			}
		};
	})();
	
	var WalletsStatistics = (function(){
		var _wallets = {};
		
		// https://blockchain.info/api/blockchain_api
		var _balanceQueryAddresses = ""; //or Object.keys(_wallets).join("|")
		
		return {
			addWalletBtn: function(walletAddress, btn){
				if(_wallets[walletAddress]){
					_wallets[walletAddress].push(btn);
				}else{
					_wallets[walletAddress]  =  [btn];
					_balanceQueryAddresses += walletAddress + "|";
				}
			},
			get: function(){ // load + fill + garbage collection
				request("https://blockchain.info/balance?cors=true&active=" + _balanceQueryAddresses.slice(0,-1), function(){
					if(this.status == 200){
						var walletsBalance = JSON.parse(this.responseText);
						
						var balance;
						var btns;
						var i = 0;
						
						for(var addr in _wallets){
							balance = walletsBalance[addr];
							if(balance){
								btns = _wallets[addr];
								for(i=btns.length;i--;){
									if(btns[i].className.search(_classBtnOffTRRe) == -1){
										setElementText(btns[i].querySelectorAll(".crdon_btn-total-received")[0], 
										                    (balance["total_received"]/1e8).toFixed(4) + " BTC");
									}
									
									btns[i].crdonWalletStat_total_received = (balance["total_received"]/1e8).toFixed(4);
									btns[i].crdonWalletStat_n_tx           = balance["n_tx"];
								}
							}
						}
						
						Handlers.mpoUpdateStat();
					}
					
					WalletsStatistics = _wallets = null; //:-)
				});
				
				_balanceQueryAddresses = null; //:-)
			}
		};
	})();
	
	var parseURI = (function(){
		// URL --[http://www.ietf.org/rfc/rfc3305 | 2.2 Contemporary View]--> URI
		
		var _schemeValidatorRe = /^\s*([a-z][a-z0-9+\-.]*)$/i; //validate and "trim left"
		
		//Almost all crypto-currency's use Base58:
		// Bitcoin: https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki#abnf-grammar
		//          http://rosettacode.org/wiki/Bitcoin/address_validation
		//          https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses
		// DASH: https://www.reddit.com/r/dashpay/comments/565a7l/regex_for_address_validation/
		// but not Ethereum (use Base36, 0xHex): https://github.com/ethereum/wiki/wiki/ICAP:-Inter-exchange-Client-Address-Protocol
		//                                       https://steemit.com/cryptocurrency/@alexpr/blockchain-address-explained-what-are-addresses-on-blockchains
		// All (lib): http://cryptocoinjs.com/modules/currency/coinstring/
		//            https://github.com/ryanralph/altcoin-address
		//            https://github.com/MichaelMure/WalletGenerator.net
		//(Base58+'l') + Base36 + 0xHex = /[a-z0-9]+/i
		var _addressHalfCheckerRe = /^([a-z0-9]+)\s*$/i; //check and "trim right"
		
		
		var checker = function(str, regexp, fragmentIndex, htmlElement, debugAttrSuffix){
			var validFragments = null;
			
			if(!(validFragments = str.match(regexp))){
				htmlElement.setAttribute("crdon-not-valid-uri-" + debugAttrSuffix, str); //for debug
				return null;
			}
			return validFragments[fragmentIndex]
		};
		
		
		return function(uri, htmlElement){
			// Get: uri.original -- https://bitcoin.org/en/developer-guide#bitcoin-uri
			//                      https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki
			// Set: uri.scheme
			//      uri.address
			uri.scheme  = "";
			uri.address = "";
			
			var delimiterPos = 0;
			
			// https://jsperf.com/slice-vs-substr-vs-substring-vs-split-vs-regexp/2  ;-)
			var scheme  = uri.original.substring(0, delimiterPos = uri.original.indexOf(":"));
			var address = uri.original.substring(delimiterPos+1,  (uri.original.indexOf("?", delimiterPos+1)+1 || uri.original.length+1)-1 );
			
			//! and don't use HTMLAnchorElement (<a>) properties ( https://stackoverflow.com/a/12470263 ): protocol, path.
			//! Not all browsers validate the scheme (protocol) part.
			//!  Try: "bitcoin:" (Ok), "bitZ.o+6i-n:" (Ok), "9bitZ.o+6i-n:" (not scheme).
			//! All browsers parse "9bit^Z.o+6i-n:13GCXbWHU8byXo3cHmQkKkB8Kw3KrY9y9A" as relative file/dir name (and protocol=="https:") ...
			// Validate by hand:
			//  http://jmrware.com/articles/2009/uri_regexp/URI_regex.html (scheme)
			//  https://i.stack.imgur.com/xieJV.png  https://stackoverflow.com/a/45690571
			//  https://stackoverflow.com/a/17813893
			//  https://habrahabr.ru/post/232385 (+ see comments)
			if(!(scheme  = checker(scheme,  _schemeValidatorRe,    1, htmlElement, "scheme" ))) return false; //"trim left"
			if(!(address = checker(address, _addressHalfCheckerRe, 1, htmlElement, "address"))) return false; //"trim right"
			
			uri.scheme  = scheme;
			uri.address = address;
			return true;
		}
	})();
	
	
	return {
		init: function(){ // init + garbage collection
			var _T_btn_;
			
			_T_btn_ = document.querySelectorAll("#_template_crdon_btn_")[0];
			_T_mpo_ = document.querySelectorAll("#_template_crdon_mpo_")[0];
			
			domRemoveNode(_T_btn_);
			domRemoveNode(_T_mpo_);
			
			_T_btn_.removeAttribute("id");
			_T_mpo_.removeAttribute("id");
			
			_T_mpo_label_                 = _T_mpo_.querySelectorAll("label")[0];
			_T_mpo_wallet_address__input_ = _T_mpo_.querySelectorAll("#_crdon__mpo_wallet_address_")[0];
			_T_mpo_wallet_address__a_     = _T_mpo_.querySelectorAll("#_crdon__mpo_line_wallet_address_ > a")[0];
			_T_mpo_wallet_n_tx_           = _T_mpo_.querySelectorAll("#_crdon__mpo_wallet_n_tx_")[0];
			_T_mpo_wallet_total_received_ = _T_mpo_.querySelectorAll("#_crdon__mpo_wallet_total_received_")[0];
			_T_mpo_qr_code_               = _T_mpo_.querySelectorAll("#_crdon__mpo_qr_code_ > img")[0];
			
			//old school (w/o addEventListener) https://stackoverflow.com/a/6348597
			_T_mpo_.querySelectorAll("#_crdon__mpo_close_")[0].onclick = Handlers.mpoCloseClick;
			// https://stackoverflow.com/a/24589806 + onmousedown="return false" turn off drag-and-drop (bad)
			_T_mpo_wallet_address__input_.onfocus     = Handlers.mpoInputSelectAll;
			_T_mpo_wallet_address__input_.onmousedown = Handlers.mpoInputSelectAll;
			_T_mpo_wallet_address__input_.onmouseup   = Handlers.mpoInputSelectAllDelayed;
			
			var places = document.querySelectorAll(".crdon-here");
			
			var uri = { original:"", scheme:"", address:"" };
			var currBtn;
			var i = 0;
			
			for(i=places.length;i--;){
				// https://learn.javascript.ru/attributes-and-custom-properties#ссылка-как-есть-из-атрибута-href
				// https://javascript.info/dom-attributes-and-properties#dom-properties-are-typed
				uri.original = places[i].getAttribute("href");
				if(!parseURI(uri, places[i])) continue;


				currBtn = _T_btn_.cloneNode(true);
				
				currBtn.crdonWalletURI     = uri.original;
				currBtn.crdonWalletAddress = uri.address;
				currBtn.crdonLabel         = getElementText(places[i]);
				
				currBtn.setAttribute("data-cc-uri-scheme", uri.scheme); // for access from CSS
				
				// copy all user-defined classes + add missing
				currBtn.className = places[i].className + //NOTE: save space before class name:
				                    //" crdon-cc-" + uri.scheme + // don't do that! 
									                              // User can set "crdon-cc-dash" (in "places[i].className") 
									                              // and set href="bitcoin:..." ->
									                              //  -> uri.scheme=="bitcoin" ->
									                              //  -> currBtn.className == "... crdon-cc-dash crdon-cc-bitcoin ..." ->
									                              //  -> bug
				                    (places[i].className.search(_classAlignRe) != -1 ? "" : " crdon_mpo-a-bc");
		
				if(places[i].className.search(_classBtnOffTRRe) != -1){
					domRemoveNode(currBtn.querySelectorAll(".crdon_btn-total-received")[0]);
				}
				
				currBtn.querySelectorAll("button > img")[0].src = "/theme/crypto-currency/icons_cc/-" + uri.scheme + ".png";
				
				//old school (w/o addEventListener) https://stackoverflow.com/a/6348597
				//auto-check node hierarchy/layout (for safe use ".parentNode" in handler), if layout is changed then script Fail Here!
				currBtn.querySelectorAll(".crdon-here > .crdon_holder > button")[0].onclick = Handlers.btnClick;
				
				places[i].parentNode.replaceChild(currBtn, places[i]);
				
				WalletsStatistics.addWalletBtn(uri.address, currBtn);
			}
			
			WalletsStatistics.get();
			
			CrDon = parseURI = null; //:-)
		}
	};
})();

