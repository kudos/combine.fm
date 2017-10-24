<template>
  <div class="home container">
    <search></search>
    <div class="blurb">
      <p>
        Combine.fm makes sharing from music services better. What happens when you share your favourite song on Spotify with a friend, but they don't use Spotify?
      </p>
      <p>
        We match album and track links from Youtube, Spotify, Google Music, Apple Musicm, Groove Music and Deezer and give you back one link with matches we find on all of them.
      </p>
    </div>
    <div class="recently-shared">
      <h2 class="title is-2">Recently Shared</h2>
      <ul class="columns is-multiline">
        <li v-for="(item, index) in recents" class="column is-one-third ">
          <router-link :to="{ name: 'share', params: { service: item.service, type: item.albumName ? 'track' : 'album', id: item.externalId }}"><div v-bind:style="{ backgroundImage: `url(${item.matches.find(function(el) { return el.service == item.service }).artworkLarge })` }" class="artwork">
          </div></router-link>
        </li>
      </ul>
    </div>
    <div class="faq">
      <h2 class="title is-2">Questions?</h2>

      <h3 class="title is-3">Why would I want to use this?</h3>
      <p>Sometimes when people want to share music they don't know what service their friends are using. Combine.fm let's you take a link from one service and expand it into a link that supports all services.</p>

      <h3 class="title is-3">I still don't get it.</h3>
      <p>That's not actually a question, but that's ok. Here's an example: I'm listening to a cool new album I found on Google Play Music. So I go to the address bar (the box that sometimes says https://www.google.com in it) and copy the link to share with my friend. But my friend uses Spotify. So first I go to Combine.fm and paste the link there, then grab the Combine.fm link from the address bar and send them that link instead.</p>

      <h3 class="title is-3">Where do I find a link to paste in the box?</h3>
      <p>Most music services have a 'share' dialog for albums and tracks in their interface. If you have them open in a web browser instead of an app, you can simply copy and paste the address bar and we'll work out the rest.</p>

      <h3 class="title is-3">Can I share playlists?</h3>
      <p>Unfortunately not. Playlists would add a huge amount of complexity and would almost certainly cause the site to break the API limits imposed by some of the services we support.</p>

      <h3 class="title is-3">Why don't you guys support Bandcamp, Amazon Music, Sony Music Unlimited… ?</h3>
      <p>Let me stop you there. Combine.fm is open source, that means any capable programmer who wants to add other music services can look at our code and submit changes. If you're not a programmer, you can always submit a request and maybe we'll do it for you.</p>
    </div>
    <div>
      <h2 class="title is-2">Tools</h2>
      <div class="columns">
        <p class="column is-half">
          Download the Chrome Extension and get Combine.fm links right from your address bar.
        </p>
        <p class="column is-half">
          <a href="https://chrome.google.com/webstore/detail/kjfpkmfgcflggjaldcfnoppjlpnidolk"><img src="/assets/images/chrome-web-store.png" alt="Download the Chrome Extension" /></a>
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import { fetchRecents } from '../store/api';
import search from '../components/search.vue';

export default {
  name: 'index-view',
  components: { search },
  created () {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetch();
    this.$store.state.share = false;
  },
  data() {
    return {
      recents: {},
    };
  },
  watch: {
    '$route': 'fetch',
    recents: function () {
      if (typeof document !== 'undefined') {
        const recents = this.$store.state.recents;
        document.title = `Combine.fm • Share Music`;
      }
    },
  },
  methods: {
    fetch () {
      if (!this.$store.state.recents) {
        fetchRecents().then((res) => {
          this.recents = res.body.recents;
        });
      } else {
        this.recents = this.$store.state.recents;
      }
    },
  },
}

</script>
<style>
.blurb {
  margin-bottom: 50px;
}
.recently-shared {
  margin-bottom: 50px;
}
.faq {
  margin-bottom: 50px;
}
.faq p {
  margin-bottom: 30px;
}
.home {
  max-width: 600px;
  margin-top: 40px;
}
p {
  margin-bottom: 10px;
}
.recent .artwork {
    margin-bottom: 30px;
}
.artwork {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 5px;
}
</style>
