import React from 'react';
import request from 'superagent';
import { State, Link } from 'react-router';
import Foot from './foot';

const MusicItem = React.createClass({

  render: function() {
    if (!this.props.item.matched_at) {
      return (
        <div className='col-md-3 col-xs-6'>
          <div className='service'>
            <div className='artwork' style={{backgroundImage: 'url(' + this.props.items[0].artwork.small + ')'}}>
            </div>
            <div className='loading-wrap'>
              <img src='/images/eq.svg' className='loading' />
            </div>
            <div className='service-link'>
              <img src={'/images/' + this.props.item.service + '.png'} className='img-rounded' />
            </div>
          </div>
        </div>
      );
    } else if (!this.props.item.id) {
      return (
        <div className='col-md-3 col-xs-6'>
          <div className='service'>
            <div className='artwork not-found' style={{backgroundImage: 'url(' + this.props.items[0].artwork.small + ')'}}></div>
            <div className='no-match'>
              No Match
            </div>
            <div className='service-link not-found'>
              <img src={'/images/' + this.props.item.service + '.png'} className='img-rounded' />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className='col-md-3 col-xs-6'>
          <div className={'service' + (this.props.inc === 0 ? ' source-service' : '')}>
            <div className='matching-from'>{this.props.inc === 0 ? 'Found matches using' : ''}</div>
            <a href={this.props.item.streamUrl || this.props.item.purchaseUrl}>
              <div className={this.props.item.service === 'youtube' ? 'artwork-youtube artwork' : 'artwork'} style={{backgroundImage: 'url(' + this.props.item.artwork.small + ')'}}>
              </div>
              <div className={this.props.item.service === 'youtube' && this.props.inc > 0 ? 'youtube' : ''}>
                {this.props.item.service === 'youtube' && this.props.inc > 0 ? this.props.item.name : ''}
              </div>
            </a>
          </div>
          <div className='service-link'>
            <a href={this.props.item.streamUrl || this.props.item.purchaseUrl}>
              <img src={'/images/' + this.props.item.service + '.png'} />
            </a>
          </div>
        </div>
      );
    }
  }

});

export default React.createClass({

  mixins: [ State ],

  getInitialState: function () {
    if (this.props.shares && this.props.shares[0].id === this.getParams().id) {
      return {
        name: this.props.shares[0].name,
        artist: this.props.shares[0].artist.name,
        shares: this.props.shares,
        shareUrl: 'https://match.audio/' + this.props.shares[0].service + '/' + this.props.shares[0].type + '/' + this.props.shares[0].id
      };
    }
    return {
      name: '',
      artist: '',
      shares: [],
      shareUrl: ''
    };
  },

  componentWillUnmount: function() {
    if (this.state.interval) {
      clearInterval(this.state.interval);
    }
  },

  componentDidMount: function () {
    let complete = this.state.shares.length > 0;

    this.state.shares.forEach(function(share) {
      if (typeof share.matched_at === 'undefined') {
        complete = false;
      }
    });

    const getShares = () => {
      request.get(this.getPathname() + '.json').end((err, res) => {
        const shares = res.body.shares;
        complete = true;
        shares.forEach(function(share) {
          if (typeof share.matched_at === 'undefined') {
            complete = false;
          }
        });

        if (complete) {
          clearInterval(this.state.interval);
        }

        if (shares.length) {
          this.setState({
            name: shares[0].name,
            artist: shares[0].artist.name,
            shares: shares,
            shareUrl: 'https://match.audio/' + shares[0].service + '/' + shares[0].type + '/' + shares[0].id
          });
        }
      });
    };

    if (!this.state.shares.length) {
      getShares();
    }

    // Temporary until websockets implementation
    this.state.interval = setInterval(function() {
      if (!complete) {
        getShares();
      }
    }, 2000);

    // Some hacks to pop open the Twitter/Facebook/Google Plus sharing dialogs without using their code.
    Array.prototype.forEach.call(document.querySelectorAll('.share-dialog'), function(dialog){
      dialog.addEventListener('click', function(e) {
        e.preventDefault();
        const w = 845;
        const h = 670;
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const left = ((width / 2) - (w / 2)) + dualScreenLeft;
        const top = ((height / 2) - (h / 2)) + dualScreenTop;
        const newWindow = window.open(dialog.href, 'Share Music', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        if (window.focus) {
          newWindow.focus();
        }
      });
    });
  },

  render: function() {
    return (
      <div>
        <div className='page-wrap share'>
          <header>
            <div className='container'>
              <div className='row'>
                <div className='col-md-12'>
                  <h1><Link to='home'>match<span className='audio-lighten'>.audio</span></Link></h1>
                </div>
              </div>
            </div>
          </header>
          <div className='container'>
            <div className='row'>
              <div className='col-md-9 col-sm-8 col-xs-12'>
                <h3>Matched {this.state.shares[0] ? this.state.shares[0].type + 's' : ''} for</h3>
                <h2>{this.state.name} <span className='artist-lighten'>- {this.state.artist}</span></h2>
              </div>
              <div className='col-md-3 col-sm-4 hidden-xs'>
                <ul className='list-inline share-tools'>
                  <li>Share this</li>
                  <li><a href={'http://twitter.com/intent/tweet/?text=' + encodeURIComponent(this.state.name) + ' by ' + encodeURIComponent(this.state.artist) + '&via=MatchAudio&url=' + this.state.shareUrl} className='share-dialog'><img src='/images/twitter.png' alt='Twitter' /></a></li>
                  <li><a href={'http://www.facebook.com/sharer/sharer.php?p[url]=' + this.state.shareUrl} className='share-dialog'><img src='/images/facebook.png' alt='Facebook' /></a></li>
                  <li><a href={'https://plus.google.com/share?url=' + this.state.shareUrl} className='share-dialog'><img src='/images/googleplus.png' alt='Google+' /></a></li>
                </ul>
              </div>
            </div>
            <div className='row'>
              {this.state.shares.map((item, i) => {
                return (<MusicItem items={this.state.shares} item={item} inc={i} key={i} />);
              })}
            </div>
          </div>
        </div>
        <Foot page='share' />
      </div>
    );
  }
});
