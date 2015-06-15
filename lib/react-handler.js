import Router from 'react-router';

export default function* (routes, url) {
  let router = Router.create({
    location: url,
    routes: routes,
    onAbort(aborted) {
      let { to, params, query } = aborted;

      this.redirect(Router.makePath(to, params, query));
    }
  });

  return new Promise(function(resolve) {
    router.run((Handler) => {
      resolve(Handler);
    });
  });
}
