import Vue from 'vue';
import App from './app.vue';
import store from './store';
import router from './router';

const app = new Vue({
  router,
  store,
  ...App,
});

export { app, router, store };
