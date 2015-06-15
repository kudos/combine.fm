import React from 'react';

export default React.createClass({

  render: function() {
    return (
      <footer>
        <div className='container'>
          <div className='row'>
            <div className={this.props.page === 'home' || this.props.page === 'error' ? 'col-md-6 col-md-offset-3' : 'col-md-12'}>
              <a href='https://twitter.com/MatchAudio'>Tweet</a> or <a href='https://github.com/kudos/match.audio'>Fork</a>. A work in progress by <a href='http://crem.in'>this guy</a>.
            </div>
          </div>
        </div>
      </footer>
    );
  }
});
