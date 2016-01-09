import React from 'react';
import { State } from 'react-router';

export default React.createClass({

  mixins: [ State ],
  render: function() {
    const image = this.props.shares ? this.props.shares[0].artwork.large : 'https://match.audio/images/logo-512.png';
    const title = this.props.shares ? this.props.shares[0].name + ' by ' + this.props.shares[0].artist.name : 'Match Audio';
    const shareUrl = 'https://match.audio/' + this.props.params.service + '/' + this.props.params.type + '/' + this.props.params.id;
    return (
      <head>
        <script dangerouslySetInnerHTML={{__html: 'var timerStart = Date.now();'}}></script>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <title>{this.props.shares ? 'Listen to ' + this.props.shares[0].name + ' by ' + this.props.shares[0].artist.name + ' on Match Audio' : 'Match Audio'}</title>
        <meta name='description' content='Match Audio matches album and track links from Youtube, Rdio, Spotify, Deezer, Google Music, Xbox Music, Beats Music, and iTunes and give you back one link with matches we find on all of them.' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='theme-color' content='#FE4365' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@MatchAudio' />
        <meta name='twitter:title' property='og:title' content={title} />
        <meta name='twitter:description' property='og:description' content='Match Audio matches album and track links from Youtube, Rdio, Spotify, Deezer, Google Music, Xbox Music, Beats Music, and iTunes and give you back one link with matches we find on all of them.' />
        <meta name='twitter:image:src' property='og:image' content={image} />
        <meta property='og:url' content={shareUrl} />
        <link rel='shortcut icon' href='/images/favicon.png' />
        <link rel='icon' sizes='512x512' href='/images/logo-128.png' />
        <link href='//fonts.googleapis.com/css?family=Open+Sans:400,300,700' rel='stylesheet' type='text/css' />
        <link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css' />
        <link rel='stylesheet' href='/stylesheets/style.css' />
      </head>
    );
  }
});
