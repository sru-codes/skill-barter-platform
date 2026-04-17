import React from 'react';

const Logo = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="50" cy="50" r="48" fill="#4f46e5"/>
      <circle cx="32" cy="44" r="12" fill="white"/>
      <circle cx="68" cy="56" r="12" fill="#a78bfa"/>
      <path d="M44 40 Q50 30 56 44" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M56 60 Q50 70 44 56" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="50" cy="50" r="4" fill="#fbbf24"/>
    </svg>
  );
};

export default Logo;
