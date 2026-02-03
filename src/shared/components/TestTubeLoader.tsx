import React from 'react';
import './TestTubeLoader.css';

interface TestTubeLoaderProps {
  size?: number;
}

export const TestTubeLoader: React.FC<TestTubeLoaderProps> = ({ size = 75 }) => {
  const scale = size / 75;

  return (
    <div
      className="test-tube-loader"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div className="test-tube-container">
        <div className="test-tube-glass">
          <div className="test-tube-cap-left" />
          <div className="test-tube-cap-right" />
          <div className="test-tube-fill">
            <div className="test-tube-bubble test-tube-bubble-1" />
            <div className="test-tube-bubble test-tube-bubble-2" />
            <div className="test-tube-bubble test-tube-bubble-3" />
            <div className="test-tube-bubble test-tube-bubble-4" />
            <div className="test-tube-bubble test-tube-bubble-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
