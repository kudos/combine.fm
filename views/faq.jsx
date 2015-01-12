'use strict';

var React = require('react');

module.exports = React.createClass({

  render: function() {
    return (
      <div className="row faq">
        <div className="col-md-6 col-md-offset-3">
          <h2>Questions?</h2>
          <ul>
            <li>
              <h3>Why would I want to use this?</h3>
              <p>Sometimes when people want to share music they don't know what service their friends are using. Match Audio let's you take a link from one service and expand it into a link that supports all services.</p>
            </li>
            <li>
              <h3>I still don't get it.</h3>
              <p>That's not actually a question, but that's ok. Here's an example: I'm listening to a cool new album I found on Google Play Music. So I go to the address bar (the box that sometimes says https://www.google.com in it) and copy the link to share with my friend. But my friend uses Spotify. So first I go to Match Audio and paste the link there, then grab the Match Audio link from the address bar and send them that link instead.</p>
            </li>
            <li>
              <h3>Where do I find a link to paste in the box?</h3>
              <p>Most music services have a "share" dialog for albums and tracks in their interface. If you have them open in a web browser instead of an app, you can simply copy and paste the address bar and we'll work out the rest.</p>
            </li>
            <li>
              <h3>Why don't you guys support Bandcamp, Amazon Music, Sony Music Unlimited&hellip; ?</h3>
              <p>Let me stop you there. <a href="https://github.com/kudos/match.audio">Match Audio is open source</a>, that means any capable programmer who wants to add other music services can look at our code and submit changes. If you're not a programmer, you can always <a href="https://github.com/kudos/match.audio/issues">submit a request</a> and maybe we'll do it for you.</p>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});
