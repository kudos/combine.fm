// import { style } from 'bulma/css/bulma.css';
import { sync } from 'vuex-router-sync';
import { app, store, router } from './app';

document.addEventListener('DOMContentLoaded', () => { // eslint-disable-line no-undef
  store.replaceState(window.__INITIAL_STATE__); // eslint-disable-line
  sync(store, router);
  app.$mount('#app');
});
