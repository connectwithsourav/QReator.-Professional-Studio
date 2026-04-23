import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  label: string;
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

// --- Types ---
type HSV = { h: number; s: number; v: number };
type RGB = { r: number; g: number; b: number };
type DragType = 'sv' | 'hue' | null;

// --- Color Math Utilities ---
// Convert HSV (Hue, Saturation, Value) to RGB
const hsvToRgb = (h: number, s: number, v: number): RGB => {
  let f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return {
    r: Math.round(f(5) * 255),
    g: Math.round(f(3) * 255),
    b: Math.round(f(1) * 255)
  };
};

// Convert RGB to HEX string
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// Convert HEX string to RGB
const hexToRgb = (hex: string): RGB => {
  let r = 0, g = 0, b = 0;
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return { r, g, b };
};

// Convert RGB to HSV
const rgbToHsv = (r: number, g: number, b: number): HSV => {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
};

export const ColorPicker: React.FC<Props> = ({ label, color, onChange, className }) => {
  // Initialize internal state robustly
  const [hsv, setHsv] = useState<HSV>(() => {
    const initialRgb = hexToRgb(color || '#000000');
    return rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b);
  });
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Derived colors
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  const svAreaRef = useRef<HTMLDivElement>(null);
  const hueAreaRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<DragType>(null);
  
  // We keep a text box state
  const [hexInput, setHexInput] = useState<string>((color || '').replace('#', ''));

  // Sync from props carefully without retriggering onChange
  useEffect(() => {
    const cleanExternalHex = (color || '').replace('#', '').toUpperCase();
    if (cleanExternalHex && cleanExternalHex !== hex.toUpperCase()) {
      // Validate
      if (/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleanExternalHex)) {
          const rgbForm = hexToRgb(cleanExternalHex);
          setHsv(rgbToHsv(rgbForm.r, rgbForm.g, rgbForm.b));
          setHexInput(cleanExternalHex);
      }
    }
  }, [color]);

  // Handle clicking outside to close the picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Update color based on pointer coordinates
  const updateColor = useCallback((e: React.PointerEvent | PointerEvent, type: 'sv' | 'hue') => {
    // Current hsv from state logic block without setHsv coupling 
    let newH = hsv.h;
    let newS = hsv.s;
    let newV = hsv.v;

    if (type === 'sv' && svAreaRef.current) {
        const rect = svAreaRef.current.getBoundingClientRect();
        let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
        newS = x / rect.width;
        newV = 1 - (y / rect.height);
    } else if (type === 'hue' && hueAreaRef.current) {
        const rect = hueAreaRef.current.getBoundingClientRect();
        let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        newH = (x / rect.width) * 360;
    }

    const newRgb = hsvToRgb(newH, newS, newV);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    
    // Now call all setState functions safely outside of any other set state callback
    setHsv({ h: newH, s: newS, v: newV });
    setHexInput(newHex);
    onChange(`#${newHex}`);
    
  }, [hsv, onChange]);

  // Handle typing inside the popover HEX input field
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Extract only valid hex characters
    val = val.replace(/[^0-9a-fA-F]/g, '');
    // Take exactly up to 6
    val = val.substring(0, 6);
    
    setHexInput(val);
    
    if (/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      const newRgb = hexToRgb(val);
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHsv(newHsv);
      onChange(`#${val}`);
    }
  };

  // Handle typing in the main simplified input view
  const handleExternalHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    if (val.length === 0) {
      onChange(''); // Allow clearing out
      return;
    }
    
    // Support pasting #FF0000 by extracting all hex characters
    const clean = val.replace(/[^0-9a-fA-F]/g, '').substring(0, 6);
    // Don't format with # if they just wiped out the first char
    if (clean.length > 0 || val.includes('#')) {
       onChange('#' + clean);
    } else {
       onChange(clean);
    }
  };

  // Begin dragging sliders
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, type: 'sv' | 'hue') => {
    setDragging(type);
    updateColor(e, type);
    e.preventDefault(); // Prevent text selection/scrolling while dragging
  };

  // Global pointer events for dragging outside the element boundaries
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (dragging) updateColor(e, dragging);
    };
    const handlePointerUp = () => {
      setDragging(null);
    };

    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging, updateColor]);

  // Calculate thumb positions
  const pointerLeftSv = `${hsv.s * 100}%`;
  const pointerTopSv = `${(1 - hsv.v) * 100}%`;
  const pointerLeftHue = `${(hsv.h / 360) * 100}%`;

  return (
    <div className={`flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors duration-200 ${className || ''}`}>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{label}</span>
        <div className="flex items-center gap-3 relative" ref={containerRef}>
            <input 
                type="text" 
                value={color} 
                onChange={handleExternalHexChange}
                className="w-20 text-center text-xs font-mono font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 focus:ring-2 focus:ring-brand-500 outline-none uppercase transition-colors duration-200"
            />
            <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="relative overflow-hidden rounded-full w-10 h-10 shadow-md ring-2 ring-white dark:ring-slate-800 cursor-pointer transition-colors duration-200 flex-shrink-0"
                style={{ backgroundColor: `#${hex}` }}
                title="Pick Color"
                aria-label="Pick Color"
            ></button>

            {/* Main Widget Container - Popover */}
            {isOpen && (
              <div className="absolute top-full right-0 mt-4 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-5 w-[320px] sm:w-[360px]">
                
                {/* Top Information Header */}
                <div className="flex items-center justify-center mb-5">
                  <div className="flex items-center text-[14px] font-semibold space-x-6 sm:space-x-8 text-slate-800 dark:text-slate-200">
                    <div className="flex items-center">
                      <span className="text-slate-400 font-medium mr-2">Hex</span>
                      <span className="uppercase tracking-wider">#{hexInput || hex}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-400 font-medium mr-2">RGB</span> 
                      <span>{rgb.r}, {rgb.g}, {rgb.b}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900 shadow-sm">
                  {/* Main SV Color Area (Saturation/Lightness) */}
                  <div
                    ref={svAreaRef}
                    onPointerDown={(e) => handlePointerDown(e, 'sv')}
                    className="relative w-full h-48 rounded-lg overflow-hidden cursor-crosshair touch-none shadow-inner border border-black/5 dark:border-black/20"
                    style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                    <div
                      className="absolute w-[18px] h-[18px] -ml-[9px] -mt-[9px] border-[3px] border-white rounded-full shadow-[0_0_4px_rgba(0,0,0,0.4)] pointer-events-none transition-transform duration-75"
                      style={{ left: pointerLeftSv, top: pointerTopSv }}
                    />
                  </div>

                  {/* Hue Slider */}
                  <div
                    ref={hueAreaRef}
                    onPointerDown={(e) => handlePointerDown(e, 'hue')}
                    className="relative w-full h-4 mt-5 rounded-full cursor-pointer touch-none shadow-inner border border-black/5 dark:border-black/20"
                    style={{ 
                      background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' 
                    }}
                  >
                    <div
                      className="absolute w-[20px] h-[20px] -ml-[10px] -mt-[2px] border-[3px] border-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] pointer-events-none"
                      style={{ 
                        left: pointerLeftHue, 
                        backgroundColor: `hsl(${hsv.h}, 100%, 50%)` 
                      }}
                    />
                  </div>

                  {/* Bottom Custom Input Box */}
                  <div className="flex items-center mt-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-400">
                    <div 
                      className="w-8 h-8 rounded-full flex-shrink-0 shadow-inner border border-black/10 dark:border-black/30" 
                      style={{ backgroundColor: `#${hex}` }}
                    />
                    <div className="flex items-center text-[17px] font-semibold text-slate-800 dark:text-slate-200 ml-3 w-full">
                      <span className="text-slate-300 dark:text-slate-500 mr-1 select-none">#</span>
                      <input
                        type="text"
                        value={hexInput}
                        onChange={handleHexChange}
                        className="w-full focus:outline-none uppercase tracking-wide bg-transparent placeholder-slate-300 dark:placeholder-slate-600"
                        spellCheck="false"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
        </div>
    </div>
  );
};
