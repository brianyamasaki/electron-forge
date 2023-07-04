import React from 'react';
import { Link } from 'react-router-dom'
import './Landing.css'

function Landing() {
  return (
  <div className='page-container'>
    <h1>Vacation Photo Curator</h1>
    <p>
      This helps you choose which photos you'd like to upload to your website.{' '}
    </p>
    <div>
      <Link className="button" to="/choose">Choose photos to view</Link>
      <Link className="button" to="/metadata">See photo metadata</Link>
    </div>
  </div>
  );
}

export default Landing;
