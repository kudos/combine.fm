import React from 'react';
import { renderToString } from 'react-dom/server';
import { RoutingContext, match } from 'react-router';
import createLocation from 'history/lib/createLocation';

export function matchRoute(routes, url) {
  const location = createLocation(url);
  return new Promise((resolve, reject) => {
    match({ routes, location }, (error, redirectLocation, renderProps) => {
      resolve({error, redirectLocation, renderProps});
    });
  });
}

export function* renderPage(routes, url, state) {
  const { error, redirectLocation, renderProps } = yield matchRoute(routes, url);

  if (error) {
    throw new Error(error.message);
  } else if (redirectLocation) {
    return redirectLocation.pathname + redirectLocation.search;
  } else if (renderProps === null) {
    return false;
  }

  renderProps.params.shares = state.shares;
  const content = renderToString(<RoutingContext {...renderProps} />);
  
  return '<!doctype html>\n' + content.replace('</body></html>', `<script>window.STATE = ${JSON.stringify(state)}</script>
  <script src='/jspm_packages/system.js'></script>
  <script src='/config.js'></script>
  <script>System.import('babel/external-helpers')</script>
  <script>System.import('views/app')</script>
</body></html>`);
}
