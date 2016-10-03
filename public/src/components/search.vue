<template>
  <form role="form" method="post" action="/search" v-on:submit="submit">
    <p class="control has-addons">
      <input class="input is-expanded is-large" type="text" placeholder="Paste your link here" v-model="url">
      <button type="submit" class="button is-primary is-large">
        Share Music
      </button>
    </p>
  </form>
</template>

<script>
import { musicSearch } from '../store/api';

export default {
  name: 'search-view',
  data() {
    return {
      url: '',
    };
  },
  methods: {
    submit (event) {
      event.preventDefault();
      musicSearch(this.url).end((req, res) => {
        const item = res.body;
        this.$router.push(`/${item.service}/${item.albumName ? 'track' : 'album'}/${item.externalId}`);
      });
    },
  },
}
</script>

<style>
.button.is-primary {
  background-color: #FE4365;
}
.button.is-primary:hover {
  background-color: #E52A4C;
}
.button.is-primary:focus {
  background-color: #E52A4C;
}
.input:active {
  border-color: #FE4365;
}
.input:focus {
  border-color: #FE4365;
}
form {
  margin-bottom: 50px;
  margin-top: 200px;
}
</style>
