"use strict";

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
	  chrome.declarativeContent.onPageChanged.addRules([
	    {
	      conditions: [
	        new chrome.declarativeContent.PageStateMatcher({
	          pageUrl: { hostEquals: 'play.google.com', pathPrefix: "/music" },
	        }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'itunes.apple.com', pathPrefix: "/music" },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'spotify.com' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'beatsmusic.com' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'deezer.com' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'rdio.com' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'rd.io' },
          }),
	      ],

	      actions: [ new chrome.declarativeContent.ShowPageAction() ]
	     }
    ]);
  });
});

chrome.pageAction.onClicked.addListener(function(tab) {
  var params = "url=" + encodeURI(tab.url);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://match.audio/search", true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var parser = document.createElement('a');
      parser.href = xhr.responseURL;
      if (!parser.pathname.match(/^(\/search|\/)$/)) {
        chrome.tabs.create({ url: xhr.responseURL});
      }
    }
  }
  xhr.send(params);
});
