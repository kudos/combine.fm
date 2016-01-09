import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import ga, { Initializer as GAInitiailizer } from 'react-google-analytics';
import Home from './home';
import Share from './share';
import Head from './head';
import ErrorView from './error';
import NotFound from './notfound';

const App = React.createClass({
  render: function () {
    return (
      <html>
        <Head {...this.props} />
        <body className='home'>
          {this.props.children}
          <GAInitiailizer />
        </body>
      </html>
    );
  }
});

const routes = (
  <Route path='/' component={App}>
    <IndexRoute component={Home} />
    <Route path=':service/:type/:id' component={Share}/>
    <Route path='*' component={NotFound}/>
  </Route>
);

if (typeof window !== 'undefined') {
  console.info('Time since page started rendering: ' + (Date.now() - timerStart) + 'ms'); // eslint-disable-line no-undef
  ReactDOM.render(<Router history={createBrowserHistory()}>{routes}</Router>, document);
  ga('create', 'UA-66209-8', 'auto');
  ga('send', 'pageview');
}

export { routes };
