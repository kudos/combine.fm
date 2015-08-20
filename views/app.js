import React from 'react';
import Router, { Route, DefaultRoute, NotFoundRoute, RouteHandler } from 'react-router';
import ga, { Initializer as GAInitiailizer } from 'react-google-analytics';
import Home from './home';
import Share from './share';
import Head from './head';
import ErrorView from './error';

const App = React.createClass({
  render: function () {
    return (
      <html>
        <Head {...this.props} />
        <body className='home'>
          <RouteHandler {...this.props} />
          <GAInitiailizer />
          <script src='/jspm_packages/system-polyfills.src.js'></script>
          <script src='/jspm_packages/system.src.js'></script>
          <script src='/config.js'></script>
          <script dangerouslySetInnerHTML={{__html: 'System.import(\'views/app\');'}}></script>
        </body>
      </html>
    );
  }
});

const routes = (
  <Route name='home' handler={App} path='/'>
    <DefaultRoute handler={Home} />
    <Route name='share' path=':service/:type/:id' handler={Share}/>
    <NotFoundRoute handler={ErrorView}/>
  </Route>
);

if (typeof window !== 'undefined') {
  console.info('Time since page started rendering: ' + (Date.now() - timerStart) + 'ms'); // eslint-disable-line no-undef
  Router.run(routes, Router.HistoryLocation, function (Handler) {
    if (typeof window.recents !== 'undefined') {
      React.render(<Handler recents={window.recents} />, document);
    } else if (typeof shares !== 'undefined') {
      React.render(<Handler shares={window.shares} />, document);
    }
  });
  ga('create', 'UA-66209-8', 'auto');
  ga('send', 'pageview');
}

export { routes };
