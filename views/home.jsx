'use strict';

var React = require('react');
var request = require('superagent');
var Router = require('react-router');
var Link = require('react-router').Link;
var Faq = require('./faq.jsx');
var Foot = require('./foot.jsx');

var Recent = React.createClass({

  render: function() {
    return (<div className="row">
      <div className="col-md-6 col-md-offset-3">
        <h2>Recently Shared</h2>
        <div className="row recent">
        {this.props.recents.map(function(item, i){
          return (<RecentItem item={item} key={i} />);
        })}
        </div>
      </div>
    </div>);
  }

});

var RecentItem = React.createClass({

  render: function() {
    if (!this.props.item.artwork) {
      return false;
    }
    return (
      <div className="col-sm-4 col-xs-6">
        <Link to="share" params={this.props.item}>
          <div className={this.props.item.service == "youtube" ? "artwork-youtube artwork" : "artwork"} style={{backgroundImage: "url("+this.props.item.artwork.small+")"}}></div>
        </Link>
      </div>
    );
  }

});

var SearchForm = React.createClass({

  mixins: [ Router.Navigation, Router.State ],

  getInitialState: function () {
    return {
      submitting: true,
      error: false
    };
  },

  handleSubmit: function(e) {
    this.setState({
      submitting: true
    });
    var that = this;
    e.preventDefault();
    var url = this.refs.url.getDOMNode().value.trim();
    if (!url) {
      that.setState({
        submitting: false
      });
      return;
    }
    request.post('/search').send({url:url}).end(function(res) {
      that.setState({
        submitting: false
      });
      if (res.body.error) {
        that.setState({error: res.body.error.message});
      }
      that.transitionTo("share", res.body);
    });
  },

  componentDidMount: function () {
    this.setState({
      submitting: false,
      error: false
    });
  },

  render: function() {
    return (
      <form role="form" method="post" action="/search" onSubmit={this.handleSubmit}>
        <div className="input-group input-group-lg">
          <input type="text" name="url" placeholder="Paste link here" className="form-control" autofocus ref="url" />
          <span className="input-group-btn">
            <input type="submit" className="btn btn-lg btn-custom" value="Share Music" disabled={this.state.submitting} />
          </span>
        </div>
        <div className={this.state.error ? "alert alert-warning" : ""} role="alert">
          {this.state.error}
        </div>
      </form>
    );
  }
});

module.exports = React.createClass({

  getInitialState: function () {
    // Use this only on first page load, refresh whenever we navigate back.
    if (this.props.recents) {
      var recents = this.props.recents;
      delete this.props.recents;
      return {
        recents: recents
      };
    }
    return {
      recents: []
    };
  },
  
  componentDidMount: function () {
    if (!this.props.recents) {
      request.get('/recent').set('Accept', 'application/json').end(function(res) {
        this.setState({
          recents: res.body.recents
        });
      }.bind(this));
    }
  },

  render: function() {
    return (
      <div>
        <div className="page-wrap">
          <header>
            <h1><Link to="home">match<span className="audio-lighten">.audio</span></Link></h1>
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
            <Recent recents={this.state.recents} />
            <Faq />
            <div className="row">
              <div className="col-md-6 col-md-offset-3">
                <h2>Tools</h2>
                <div className="row">
                  <div className="col-md-6">
                    <p>Download the Chrome Extension and get Match Audio links right from your address bar.</p>
                  </div>
                  <div className="col-md-6">
                    <p><a href="https://chrome.google.com/webstore/detail/kjfpkmfgcflggjaldcfnoppjlpnidolk"><img src="/images/chrome-web-store.png" alt="Download the Chrome Extension" height="75" /></a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Foot page="home" />
      </div>
    );
  }
});
