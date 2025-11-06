import React from 'react';

/*
  This is your "Global Rolling Logo" component.
  It uses the CSS styles from globals.css.
*/
export default function Loading() {
  return (
    <div className="global-loader">
      <div className="spinner"></div>
      {/* You can add your logo here like this: */}
      {/* <img src="/xpress-logo.png" alt="Loading..." className="spinner" /> */}
      <p style={{ marginTop: '1rem' }}>Loading Xpress Point...</p>
    </div>
  );
}
