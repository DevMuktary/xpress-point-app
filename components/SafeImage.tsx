"use client"; // This is a Client Component

import React from 'react';
import Image from 'next/image';

// Define the props, including all standard Image props
type SafeImageProps = React.ComponentProps<typeof Image> & {
  fallbackSrc: string;
};

export default function SafeImage({ src, alt, fallbackSrc, ...props }: SafeImageProps) {
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = fallbackSrc; // Set to the default logo on error
  };

  return (
    <Image
      src={src}
      alt={alt}
      {...props}
      onError={handleError} // This is now allowed because of "use client"
    />
  );
}
