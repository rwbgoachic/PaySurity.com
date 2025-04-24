import React, { useState, useEffect } from 'react';
import { useTheme, ThemeSettings } from '../../contexts/ThemeContext';

interface ThemePreviewPanelProps {
  onSendPreview?: () => void;
  onBroadcastSave?: () => void;
  onBroadcastReset?: () => void;
}

// Color conversion utility
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Parse HSL color string to components
const parseHsl = (hslString: string): { h: number, s: number, l: number } => {
  const match = hslString.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
  if (match) {
    return {
      h: parseInt(match[1], 10),
      s: parseInt(match[2], 10),
      l: parseInt(match[3], 10)
    };
  }
  return { h: 222, s: 72, l: 59 }; // Default if parsing fails
};

// Generate HSL string
const toHslString = (h: number, s: number, l: number): string => {
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const ThemePreviewPanel: React.FC<ThemePreviewPanelProps> = ({
  onSendPreview,
  onBroadcastSave,
  onBroadcastReset
}) => {
  const { 
    theme, 
    previewTheme, 
    setPreviewTheme, 
    previewMode, 
    setPreviewMode,
    saveTheme,
    resetPreview
  } = useTheme();
  
  // Local state for color picker
  const [hslValues, setHslValues] = useState(() => {
    const currentTheme = previewTheme || theme;
    return parseHsl(currentTheme.primary);
  });
  
  // Update local state when theme changes
  useEffect(() => {
    const currentTheme = previewTheme || theme;
    setHslValues(parseHsl(currentTheme.primary));
  }, [theme, previewTheme]);
  
  // Handle changes to theme properties
  const handleColorChange = (type: 'h' | 's' | 'l', value: number) => {
    const newHslValues = { ...hslValues, [type]: value };
    setHslValues(newHslValues);
    
    // Create new theme with updated primary color
    const newPrimary = toHslString(newHslValues.h, newHslValues.s, newHslValues.l);
    const baseTheme = previewTheme || theme;
    
    const newTheme: ThemeSettings = {
      ...baseTheme,
      primary: newPrimary
    };
    
    // Update preview theme
    setPreviewTheme(newTheme);
    
    // Ensure preview mode is on
    if (!previewMode) {
      setPreviewMode(true);
    }
    
    // Broadcast to other clients
    onSendPreview?.();
  };
  
  const handleVariantChange = (variant: 'professional' | 'tint' | 'vibrant') => {
    const baseTheme = previewTheme || theme;
    const newTheme: ThemeSettings = {
      ...baseTheme,
      variant
    };
    setPreviewTheme(newTheme);
    
    if (!previewMode) {
      setPreviewMode(true);
    }
    
    // Broadcast to other clients
    onSendPreview?.();
  };
  
  const handleAppearanceChange = (appearance: 'light' | 'dark' | 'system') => {
    const baseTheme = previewTheme || theme;
    const newTheme: ThemeSettings = {
      ...baseTheme,
      appearance
    };
    setPreviewTheme(newTheme);
    
    if (!previewMode) {
      setPreviewMode(true);
    }
    
    // Broadcast to other clients
    onSendPreview?.();
  };
  
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const radius = parseFloat(e.target.value);
    const baseTheme = previewTheme || theme;
    const newTheme: ThemeSettings = {
      ...baseTheme,
      radius
    };
    setPreviewTheme(newTheme);
    
    if (!previewMode) {
      setPreviewMode(true);
    }
    
    // Broadcast to other clients
    onSendPreview?.();
  };
  
  const handleSave = () => {
    saveTheme();
    onBroadcastSave?.();
  };
  
  const handleReset = () => {
    resetPreview();
    onBroadcastReset?.();
  };
  
  // For the hex color preview
  const hexColor = hslToHex(hslValues.h, hslValues.s, hslValues.l);
  
  const activeTheme = previewTheme || theme;
  
  // If panel is closed, just show a minimal toggler
  if (!previewMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-4">
        <button 
          onClick={() => setPreviewMode(true)}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary-hover transition-colors"
          title="Open Theme Preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        </button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 right-0 z-50 bg-card border shadow-lg rounded-tl-lg p-4 w-80 text-card-foreground transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Theme Preview</h3>
        <button 
          onClick={() => setPreviewMode(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Primary Color */}
        <div>
          <label className="text-sm font-medium block mb-1">Primary Color</label>
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-8 h-8 rounded-full border"
              style={{ backgroundColor: hexColor }}
            />
            <div className="text-xs text-muted-foreground">
              <div>{hexColor}</div>
              <div>{activeTheme.primary}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Hue: {hslValues.h}</span>
                <span className="text-xs text-muted-foreground">360</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hslValues.h}
                onChange={(e) => handleColorChange('h', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Saturation: {hslValues.s}%</span>
                <span className="text-xs text-muted-foreground">100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hslValues.s}
                onChange={(e) => handleColorChange('s', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Lightness: {hslValues.l}%</span>
                <span className="text-xs text-muted-foreground">100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hslValues.l}
                onChange={(e) => handleColorChange('l', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Variant */}
        <div>
          <label className="text-sm font-medium block mb-2">Variant</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleVariantChange('professional')}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                activeTheme.variant === 'professional' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Professional
            </button>
            <button
              onClick={() => handleVariantChange('tint')}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                activeTheme.variant === 'tint' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Tint
            </button>
            <button
              onClick={() => handleVariantChange('vibrant')}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                activeTheme.variant === 'vibrant' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Vibrant
            </button>
          </div>
        </div>
        
        {/* Appearance */}
        <div>
          <label className="text-sm font-medium block mb-2">Appearance</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleAppearanceChange('light')}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                activeTheme.appearance === 'light' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => handleAppearanceChange('dark')}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                activeTheme.appearance === 'dark' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => handleAppearanceChange('system')}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                activeTheme.appearance === 'system' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-muted'
              }`}
            >
              System
            </button>
          </div>
        </div>
        
        {/* Border Radius */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">Border Radius: {activeTheme.radius}rem</label>
            <span className="text-xs text-muted-foreground">1.5rem</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={activeTheme.radius}
            onChange={handleRadiusChange}
            className="w-full"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors py-2 rounded-md text-sm font-medium"
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary-hover transition-colors py-2 rounded-md text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemePreviewPanel;