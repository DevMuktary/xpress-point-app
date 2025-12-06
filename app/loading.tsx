import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="global-loader">
      <div className="logo-container">
        <Image 
          src="/logos/logo.png" 
          alt="Loading..." 
          width={100} 
          height={100} 
          className="logo-animate"
          priority
        />
      </div>
    </div>
  );
}
