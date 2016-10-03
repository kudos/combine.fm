import { app, router, store } from './app';

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default (context) => {
  // set router's location
  router.push(context.url);

  store.replaceState(context.initialState);

  return app;
};
