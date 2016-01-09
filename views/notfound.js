import React from 'react';
import { Link } from 'react-router';
import Head from './head';
import Foot from './foot';

export default React.createClass({

  render: function() {
    return (
      <div className='error'>
        <div className='container main'>
          <div className='row'>
            <div className='col-md-12'>
              <div className='error-logo'>
                <Link to='/'><img src='/images/logo-full-300.png' width='50' /></Link>
              </div>
            </div>
          </div>
          <div className='row vertical-center'>
            <div className='col-md-12'>
              <h2>404</h2>
              <h1>Sorry, it looks like the page you asked for is gone.</h1>
              <Link to='/'>Take Me Home</Link> or <a href='https://www.youtube.com/watch?v=gnnIrTLlLyA' target='_blank'>Take Me to the Wubs</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
