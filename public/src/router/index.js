import Vue from 'vue';
import Router from 'vue-router';
import index from '../views/index.vue';
import share from '../views/share.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', component: index },
    { path: '/:service/:type/:id', name: 'share', component: share },
  ],
});

router.afterEach((to) => {
  if (typeof window !== 'undefined') {
    ga('send', { // eslint-disable-line no-undef
      hitType: 'pageview',
      page: to.fullPath,
    });
  }
});

export default router;
