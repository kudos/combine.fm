const apiUrl = 'https://combine.fm';

function contextClick(e) {
  console.log(e);
}
console.log('attach');
window.addEventListener('click', contextClick);

// document.addSelectorListener('iframe', (outerEvent) => {
//     document.addEventListener('click', contextClick);
//     outerEvent.target.contentDocument.addEventListener('click', contextClick);
//     document.removeSelectorListener('.front iframe');
//     iframes[outerEvent.target.src] = true;
// });





// document.addSelectorListener('#context-actions-area iframe', (outerEvent) => {
//   outerEvent.target.addEventListener('load', () => {
//     const ul = outerEvent.target.contentDocument.querySelector('.dropdown-interior-menu');
//
//     for (let node of ul.childNodes) {
//       console.log(node);
//     }
//
//
//     const li = document.createElement('li');
//     ul.appendChild(li);
//     const a = document.createElement('a');
//     a.innerText = 'Open in Combine.fm'
//     a.href = apiUrl;
//     a.target = '_blank';
//     a.addEventListener('click', (e) => {
//       e.preventDefault();
//       window.open(apiUrl + '/spotify/' + match[1] + '/' + match[2], '_blank');
//     });
//     li.appendChild(a);
//   });
// });
