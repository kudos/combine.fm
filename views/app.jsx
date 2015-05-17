"use strict";

var React = require("react");
var Router = require("react-router");
var Route = require("react-router").Route;
var DefaultRoute = require("react-router").DefaultRoute;
var NotFoundRoute = require("react-router").NotFoundRoute;
var RouteHandler = require("react-router").RouteHandler;
var Home = require("./home.jsx");
var Share = require("./share.jsx");
var Head = require("./head.jsx");
var ga = require("react-google-analytics");
var GAInitiailizer = ga.Initializer;

var App = React.createClass({
  render: function () {
    return (
      <html>
        <Head {...this.props} />
        <body className="home">
          <RouteHandler {...this.props} />
          <GAInitiailizer />
          <script src="/javascript/bundle.js" />
        </body>
      </html>
    );
  }
});

var NotFound = React.createClass({
  render: function () {
    return <h2>Not found</h2>;
  }
});

var routes = (
  <Route name="home" handler={App} path="/">
    <DefaultRoute handler={Home} />
    <Route name="share" path=":service/:type/:id" handler={Share}/>
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

module.exports.routes = routes;

if (typeof window !== "undefined") {
  window.onload = function() {
    Router.run(routes, Router.HistoryLocation, function (Handler) {
      if (typeof window.recents !== "undefined") {
        React.render(<Handler recents={window.recents} />, document);
      } else if (typeof shares !== "undefined") {
        React.render(<Handler shares={window.shares} />, document);
      }
    });
    ga("create", "UA-66209-8", "auto");
    ga("send", "pageview");
  };
}
