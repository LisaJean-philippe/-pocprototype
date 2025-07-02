import React, { useState, useEffect } from 'react';

// Custom hook to simulate controller value
function useIQController() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Change value every 2 seconds
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 100));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { value };
}

// Fan component
const Fan = () => {
  const { value } = useIQController();
  const isDynamic = value > 50;
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{
          animation: isDynamic ? 'spin 1s linear infinite' : 'none',
        }}
      >
        <circle cx="100" cy="100" r="20" fill="#888" />
        <g>
          <path d="M100,30 Q120,100 100,100 Q80,100 100,30" fill="#4FC3F7" />
          <path d="M170,100 Q100,120 100,100 Q100,80 170,100" fill="#4FC3F7" />
          <path d="M100,170 Q80,100 100,100 Q120,100 100,170" fill="#4FC3F7" />
          <path d="M30,100 Q100,80 100,100 Q100,120 30,100" fill="#4FC3F7" />
        </g>
      </svg>
      <div style={{ marginTop: '20px' }}>
        <strong>Controller Value:</strong> {value}
        <br />
        <strong>Status:</strong> {isDynamic ? 'Dynamic (Spinning)' : 'Static'}
      </div>
      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
          svg {
            transform-origin: 100px 100px;
          }
        `}
      </style>
    </div>
  );
};

export default Fan;
