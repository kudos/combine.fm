"use strict";

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
	  chrome.declarativeContent.onPageChanged.addRules([
	    {
	      conditions: [
	        new chrome.declarativeContent.PageStateMatcher({
	          pageUrl: { hostSuffix: 'beatsmusic.com', pathPrefix: "/album" },
	        }),
	        new chrome.declarativeContent.PageStateMatcher({
	          pageUrl: { hostSuffix: 'beatsmusic.com', pathPrefix: "/track" },
	        }),
	        new chrome.declarativeContent.PageStateMatcher({
	          pageUrl: { hostSuffix: 'deezer.com', pathPrefix: "/album" },
	        }),
	        new chrome.declarativeContent.PageStateMatcher({
	          pageUrl: { hostSuffix: 'deezer.com', pathPrefix: "/track" },
	        }),
	        new chrome.declarativeContent.PageStateMatcher({
	          pageUrl: { hostEquals: 'play.google.com', pathPrefix: "/music" },
	        }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'itunes.apple.com', pathPrefix: "/music" },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'rdio.com' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'rd.io' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'spotify.com', pathPrefix: "/album" },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'spotify.com', pathPrefix: "/track" },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'music.xbox.com', pathPrefix: "/track" },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'music.xbox.com', pathPrefix: "/album" },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'youtube.com' },
          }, [])
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
      var match = JSON.parse(xhr.response);
      if (match.id) {
        chrome.tabs.create({ url: "https://match.audio/" + match.service + "/" + match.type + "/" + match.id});
      }
    }
  }
  xhr.send(params);
});
