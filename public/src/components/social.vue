<template>
  <ul class='social'>
    <li>Share this</li>
    <li>
      <a v-bind:href="`http://twitter.com/intent/tweet/?text=${encodeURIComponent(name)} by ${ encodeURIComponent(artist)}&via=MatchAudio&url=${url}`" class='share-dialog'>
        <img src='/assets/images/twitter.png' alt='Twitter' height="20" width="20" />
      </a>
    </li>
    <li>
      <a v-bind:href="`http://www.facebook.com/sharer/sharer.php?p[url]=${url}`" class='share-dialog'>
        <img src='/assets/images/facebook.png' alt='Facebook' height="20" width="20" />
      </a>
    </li>
    <li>
      <a v-bind:href="`https://plus.google.com/share?url=${url}`" class='share-dialog'>
        <img src='/assets/images/googleplus.png' alt='Google+' height="20" width="20" />
      </a>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'social-view',
  props: ['name', 'artist', 'url'],
  mounted() {
    // Some hacks to pop open the Twitter/Facebook/Google Plus sharing dialogs without using their code.
    Array.prototype.forEach.call(document.querySelectorAll('.share-dialog'), function(dialog){
      dialog.addEventListener('click', function(e) {
        e.preventDefault();
        const w = 845;
        const h = 670;
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const left = ((width / 2) - (w / 2)) + dualScreenLeft;
        const top = ((height / 2) - (h / 2)) + dualScreenTop;
        const newWindow = window.open(dialog.href, 'Share Music', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        if (window.focus) {
          newWindow.focus();
        }
      });
    });
  },
}
</script>

<style>
.social {
  text-align: center;
  font-weight: 300;
  float: right;
}
.social li {
  display: inline;
  list-style-type: none;
  padding-right: 10px;
  float: left;
}
</style>
