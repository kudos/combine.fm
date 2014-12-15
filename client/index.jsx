/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react');
var Router = require('react-router');
var request = require('superagent');
var ga = require('react-google-analytics');
var GAInitiailizer = ga.Initializer;

var Head = React.createClass({

  render: function() {
    return (
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>Match Audio</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@MatchAudio" />
        <meta name="twitter:title" property="og:title" content="" />
        <meta name="twitter:description" property="og:description" content="We've matched this music on Rdio, Spotify, Deezer, Beats Music, Google Music and iTunes so you can open it in the service you use." />
        <meta name="twitter:image:src" property="og:image" content="" />
        <meta property="og:url" content="" />
        <link rel="shortcut icon" href="/images/favicon.png" />
        <link href='//fonts.googleapis.com/css?family=Open+Sans:400,300,700' rel='stylesheet' type='text/css' />
        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/stylesheets/style.css" />
      </head>
    );
  }
});

var Foot = React.createClass({

  render: function() {
    return (
      <footer>
        <div className="container">
          <div className="row">
            <div className={this.props.page == "home" ? "col-md-6 col-md-offset-3" : "col-md-12"}>
              <a href="https://twitter.com/MatchAudio">Tweet</a> or <a href="https://github.com/kudos/match.audio">Fork</a>. A work in progress by <a href="http://crem.in">this guy</a>.
            </div>
          </div>
        </div>
      </footer>
    );
  }
});


var Recent = React.createClass({

  render: function() {
    return (<div className="row">
      <div className="col-md-6 col-md-offset-3">
        <h2>Recently Shared</h2>
        <div className="row recent">
        {this.props.items.map(function(item, i){
          return (<RecentItem item={item} key={i} />);
        })}
        </div>
      </div>
    </div>);
  }

});

var RecentItem = React.createClass({

  render: function() {
    return (
      <div className="col-sm-4 col-xs-6">
        <a href={"/" + this.props.item.service + "/" + this.props.item.type + "/" + this.props.item.id}><img src={this.props.item.artwork.small} width="100%" /></a>
      </div>
    );
  }

});

var SearchForm = React.createClass({

  handleSubmit: function(e) {
    e.preventDefault();
    var url = this.refs.url.getDOMNode().value.trim();
    if (!url) {
      return;
    }
    request.post('/search').send({url:url}).end(function(res) {
      window.location = "/" + res.body.service + "/" + res.body.type + "/" + res.body.id
    });
  },

  render: function() {
    return (
      <form role="form" method="post" action="/search" onSubmit={this.handleSubmit}>
        <div className="input-group input-group-lg">
          <input type="text" name="url" placeholder="Paste link here" className="form-control" autofocus ref="url" />
          <span className="input-group-btn">
            <input type="submit" className="btn btn-lg btn-custom" value="Share Music" />
          </span>
        </div>
      </form>
    );
  }
});

var Home = React.createClass({

  render: function() {
    return (
      <html>
      <Head />
      <body className="home">
        <div className="page-wrap">
          <header>
            <h1><a href="/">match<span className="audio-lighten">.audio</span></a></h1>
          </header>
          <div className="container">
            <div className="row share-form">
              <div className="col-md-6 col-md-offset-3">
                <SearchForm />
              </div>
            </div>
            <div className="row blurb">
              <div className="col-md-6 col-md-offset-3">
                <p>Make sharing from music services better.
                We match album and track links from Rdio, Spotify, Deezer, Beats Music, Google Music and iTunes and give you back a link with all of them.
                </p>
              </div>
            </div>
            <Recent items={this.props.recent} />
          </div>
        </div>
        <Foot page="home" />
        <GAInitiailizer />
        <script src="/javascript/bundle.js" />
      </body>
      </html>
    );
  }
});

module.exports.Home = Home;

if (typeof window !== 'undefined') {
  window.onload = function() {
    React.render(<Home recent={recent} />, document);
    ga('create', 'UA-66209-8', 'auto');
    ga('send', 'pageview');
  }
}