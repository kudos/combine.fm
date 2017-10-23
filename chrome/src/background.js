const apiUrl = 'https://combine.fm';

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
	  chrome.declarativeContent.onPageChanged.addRules([
	    {
	      conditions: [
	        new chrome.declarativeContent.PageStateMatcher({
	          pageUrl: { hostEquals: 'www.deezer.com', pathPrefix: '/album' },
	        }),
	        new chrome.declarativeContent.PageStateMatcher({
	          pageUrl: { hostEquals: 'www.deezer.com', pathPrefix: '/track' },
	        }),
	        new chrome.declarativeContent.PageStateMatcher({
	          pageUrl: { hostEquals: 'play.google.com', pathPrefix: '/music' },
	        }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'itunes.apple.com', pathPrefix: '/music' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'rdio.com' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'spotify.com', pathPrefix: '/album' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'spotify.com', pathPrefix: '/track' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'music.microsoft.com', pathPrefix: '/track' },
          }),
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'music.microsoft.com', pathPrefix: '/album' },
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
  chrome.pageAction.setIcon({tabId: tab.id, path: 'icon-blue-128.png'}, () => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    fetch(apiUrl + '/search', {method: 'POST', mode: 'cors', headers, body: 'url=' + encodeURI(tab.url)}).then((response) => {
      response.json().then((match) => {
        chrome.pageAction.setIcon({tabId: tab.id, path: 'icon-128.png'});
        if (match.id) {
          chrome.tabs.create({ url: apiUrl + '/' + match.service + '/' + match.type + '/' + match.id});
        }
      });
    }).catch(() => {
      chrome.pageAction.setIcon({tabId: tab.id, path: 'icon-128.png'});
    });
  });
});
