<template>
  <div class="container" v-if="item.name">
    <social v-bind:name="item.name" v-bind:artist="item.artist.name" v-bind:url="`https://match.audio/${item.service}/${item.type}/${item.externalId}`"></social>
    <div class="share-heading">
      <h3 class="title is-3">Matched {{ item.albumName ? 'tracks' : 'albums' }} for</h3>
      <h2 class="title is-2"><strong>{{ item.name }}</strong> - {{ item.artist.name }}</h2>
    </div>
    <ul class="columns is-multiline">
      <li v-for="match in item.matches" class="column is-2">
        <div v-if="match.externalId && match.id != 152">
          <a v-bind:href="match.streamUrl"><div v-bind:style="{ backgroundImage: `url(${match.artworkLarge})` }" class="artwork" v-bind:class="{ 'artwork-youtube': match.service === 'youtube' }">
          </div></a>
          <div class='service-link has-text-centered'>
            <a v-bind:href="match.streamUrl"><img v-bind:src="`/assets/images/${match.service}.png`" /></a>
          </div>
        </div>
        <div v-if="match.matching || match.id === 152" class="service">
          <div v-bind:style="{ backgroundImage: `url(${item.matches[0].artworkLarge})` }" class="artwork">
          </div>
          <div class='loading-wrap'>
            <img src='/assets/images/eq.svg' class='loading' />
          </div>
          <div class='service-link has-text-centered'>
            <img v-bind:src="`/assets/images/${match.service}.png`" />
          </div>
        </div>
        <div class="service" v-if="!match.externalId && !match.matching">
          <div v-bind:style="{ backgroundImage: `url(${item.matches[0].artworkLarge})` }" class="artwork not-found">
          </div>
          <div class='no-match'>
            No Match
          </div>
          <div class='service-link has-text-centered not-found'>
            <img v-bind:src="`/assets/images/${match.service}.png`" />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import social from '../components/social.vue';
import { fetchItem } from '../store/api';

export default {
  name: 'share-view',
  components: { social },
  data() {
    return {
      item: {},
    };
  },
  created () {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetch();
    this.interval = setInterval(() => {
      this.fetch();
    }, 3000);
    this.$store.state.share = true;
  },
  watch: {
    // call again the method if the route changes
    '$route': 'fetch',
  },
  methods: {
    fetch () {
      const item = this.$store.state.item;
      const id = this.$route.params.id;
      if (item && item.externalId === id && (typeof window === 'undefined' || !item.matches.some(match => match.matching))) {
        this.item = this.$store.state.item;
      } else if (id) {
        fetchItem(this.$route.params.service, this.$route.params.type, id).then((res) => {
          if(!res.body.matches.some(match => match.matching)) {
            clearInterval(this.interval);
          }
          this.item = res.body;
          document.title = `Combine.fm • ${this.item.name} by ${this.item.artist.name}`;
        });
      }
    }
  }
}
</script>

<style>
.share-heading {
  margin-bottom: 50px
}
.share-heading .title {
  color: #8396b0;
}
.share-heading .title strong {
  color: #445470;
  font-weight: 700;
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
.artwork-youtube {
  background-position: 50% 0%;
}
.service {
  position: relative;
  margin-bottom: 10px;
}
.service-link img {
  margin-top: 20px;
  margin-bottom: 20px;
  height: 40px;
}
img {
  vertical-align: middle;
}
.not-found {
  opacity: 0.2;
}
.match {
  position: relative;
}
.no-match {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #fff;
  color: #FE4365;
  padding: 3px 6px;
  border-radius: 3px;
  opacity: 0.7;
  font-weight: bold;
}
.loading-wrap {
  position: absolute;
  top: 0;left: 0;
  background: #fff;
  height: 100%;
  width: 100%;
  opacity: 0.8;
}
.loading {
  position: absolute;
  top: 35%;
  left: 40%;
  width: 20%;
}
</style>
