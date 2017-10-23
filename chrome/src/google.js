const apiUrl = 'https://combine.fm';

var button = document.createElement('button');
button.className = 'share-button';
button.setAttribute('aria-label', 'Share to Combine.fm');

var buttonContent = document.createElement('div');
buttonContent.className = 'button-content';
button.appendChild(buttonContent);

var paperRipple = document.createElement('paper-ripple');
paperRipple.class = 'circle';
buttonContent.appendChild(paperRipple);

var background = document.createElement('div');
background.id = 'background';
background.className = 'style-scope paper-ripple';
paperRipple.appendChild(background);

var waves = document.createElement('div');
waves.id = 'waves';
waves.className = 'style-scope paper-ripple';
paperRipple.appendChild(waves);

var img = document.createElement('img');
img.src = 'https://combine.fm/images/logo-128.png';
img.height = 48;
buttonContent.appendChild(img)

var buttonLabel = document.createElement('div');
buttonLabel.className = 'button-label';
buttonLabel.setAttribute('aria-hidden', true);
buttonLabel.innerText = 'Combine.fm';
buttonContent.appendChild(buttonLabel);

// select the target node
document.addSelectorListener('.share-buttons', (event) => {
  var input = event.target.parentElement.querySelector('paper-input input');
  // Check that it's an album or track, and not a playlist
  const match = input.value.match(/https:\/\/play\.google\.com\/music\/m\/([a-zA-Z0-9]+)/);
  if (match) {
    event.target.insertBefore(button, event.target.firstChild);
    button.addEventListener('click', (event) => {
      if (match[1].startsWith('T')) { // Track
        window.open(apiUrl + '/google/track/' + match[1], '_blank');
      } else if (match[1].startsWith('B')) { // Album
        window.open(apiUrl + '/google/album/' + match[1], '_blank');
      }
  	});
  }
});
