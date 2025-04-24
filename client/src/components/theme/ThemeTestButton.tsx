import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// A simple component to toggle theme preview mode
const ThemeTestButton: React.FC = () => {
  const { previewMode, setPreviewMode } = useTheme();
  
  return (
    <div className="fixed top-4 right-4 z-50 flex space-x-4">
      <button
        onClick={() => setPreviewMode(!previewMode)}
        className="bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        {previewMode ? 'Close Theme Preview' : 'Open Theme Preview'}
      </button>
    </div>
  );
};

export default ThemeTestButton;