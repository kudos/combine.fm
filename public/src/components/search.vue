<template>
  <div class="search">
    <form role="form" method="post" action="/search" v-on:submit="submit">
      <p class="control has-addons">
        <input class="input is-expanded is-large" type="text" placeholder="Paste your link here" v-model="url">
        <button type="submit" class="button is-primary is-large" v-bind:class="{ 'is-loading': submitting }">
          Share Music
        </button>
      </p>
    </form>
    <div class="notification is-warning" v-if="error">
      <button class="delete" v-on:click="error = false"></button>
      {{ error }}
    </div>
  </div>
</template>

<script>
import { musicSearch } from '../store/api';

export default {
  name: 'search-view',
  data() {
    return {
      error: null,
      submitting: false,
      url: '',
    };
  },
  methods: {
    submit (event) {
      this.submitting = true;
      event.preventDefault();
      musicSearch(this.url).end((req, res) => {
        this.submitting = false;
        if (res.status == 200) {
          const item = res.body;
          this.$router.push(`/${item.service}/${item.albumName ? 'track' : 'album'}/${item.externalId}`);
        } else {
          this.error = res.body.message;
        }
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
.search {
  margin-bottom: 25vh;
}
form {
  margin-top: 25vh;
  margin-bottom: 20px;
}
</style>
