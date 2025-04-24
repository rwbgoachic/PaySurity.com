import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeTestButton: React.FC = () => {
  const { theme, setPreviewMode, previewMode } = useTheme();
  
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };
  
  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={togglePreviewMode}
        className="bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-md shadow-md transition-colors"
      >
        {previewMode ? 'Close Theme Preview' : 'Open Theme Preview'}
      </button>
      
      <div className="mt-2 p-3 bg-card rounded-md shadow-md text-sm">
        <p><strong>Current Theme:</strong></p>
        <ul className="mt-1">
          <li>Primary: {theme.primary}</li>
          <li>Variant: {theme.variant}</li>
          <li>Appearance: {theme.appearance}</li>
          <li>Radius: {theme.radius}rem</li>
        </ul>
      </div>
    </div>
  );
};

export default ThemeTestButton;