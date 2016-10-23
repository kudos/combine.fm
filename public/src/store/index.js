import Vue from 'vue';
import Vuex from 'vuex';
import { fetchItem, fetchRecents } from './api';

Vue.use(Vuex);

const store = new Vuex.Store({
  debug: true,
  state: {
    recents: [],
    item: {},
    services: [],
    share: true,
  },

  actions: {
    // ensure data for rendering given list type
    FETCH_RECENTS: ({ commit }) => fetchRecents()
        .then(res => commit('SET_RECENTS', { recents: res.body.recents })),

    FETCH_ITEM: ({ commit, state }, { service, type, id }) => fetchItem(service, type, id)
        .then(item => {
          return commit('SET_ITEM', { item })
        }),
  },

  mutations: {
    SET_RECENTS: (state, { recents }) => {
      state.recents = recents; // eslint-disable-line no-param-reassign
    },

    SET_ITEM: (state, { item }) => {
      state.item = item.body;
    },
  },
});

export default store;
