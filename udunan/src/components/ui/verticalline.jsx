import React from 'react';

const VerticalDashedLine = ({ 
  height = '100%', 
  color = '#000', 
  dashLength = 5, 
  gapLength = 5, 
  width = 2,
  className = ''
}) => {
  const svgStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: `${width}px`
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox={`0 0 ${width} 100`} 
      className={`vertical-dashed-line ${className}`}
      style={svgStyle}
    >
      <defs>
        <pattern 
          id="dashPattern" 
          patternUnits="userSpaceOnUse" 
          width={width} 
          height={dashLength + gapLength}
        >
          <line 
            x1={width/2} 
            y1="0" 
            x2={width/2} 
            y2={dashLength} 
            stroke={color} 
            strokeWidth={width}
          />
        </pattern>
      </defs>
      
      <rect 
        width={width} 
        height="100%" 
        fill="url(#dashPattern)"
      />
    </svg>
  );
};

export default VerticalDashedLine;