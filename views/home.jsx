'use strict';

var React = require('react');
var request = require('superagent');
var Router = require('react-router');
var Link = require('react-router').Link;
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
    return (
      <div className="col-sm-4 col-xs-6">
        <Link to="share" params={this.props.item}><img src={this.props.item.artwork.small} width="100%" /></Link>
      </div>
    );
  }

});

var SearchForm = React.createClass({

  mixins: [ Router.Navigation, Router.State ],

  handleSubmit: function(e) {
    var that = this;
    e.preventDefault();
    var url = this.refs.url.getDOMNode().value.trim();
    if (!url) {
      return;
    }
    request.post('/search').send({url:url}).end(function(res) {
      that.transitionTo("share", res.body);
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
          </div>
        </div>
        <Foot page="home" />
      </div>
    );
  }
});
