import React from 'react';
import Head from './head';
import Foot from './foot';

export default React.createClass({

  render: function() {
    return (
      <html>
      <Head {...this.props} />
      <body>
      <div className='error vertical-center'>
        <div className='container main'>
          <div className='row'>
            <div className='col-md-12'>
              <h2>404</h2>
              <h1>Sorry, it looks like the page you asked for is gone.</h1>
              <a href='/'>Take Me Home</a> or <a href='https://www.youtube.com/watch?v=gnnIrTLlLyA' target='_blank'>Show Me the Wubs</a>
            </div>
          </div>
        </div>
      </div>
      </body>
      </html>
    );
  }
});
