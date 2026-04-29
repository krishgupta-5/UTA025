'use client';

import { useState, useEffect, useRef } from 'react';

interface SizeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  className?: string;
}

export default function SizeSlider({ 
  min = 200, 
  max = 4000, 
  step = 100, 
  defaultValue = 800,
  onChange,
  className = ''
}: SizeSliderProps) {
  const [value, setValue] = useState(defaultValue);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Update slider visual progress
  const updateSliderBackground = (val: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, 
      var(--saffron) 0%, 
      var(--saffron) ${percentage}%, 
      var(--slate) ${percentage}%, 
      var(--slate) 100%)`;
  };

  // Get size tier based on value
  const getSizeTier = (val: number) => {
    if (val <= 500) return 'Studio / 1 RK';
    if (val <= 900) return '1–2 BHK';
    if (val <= 1500) return '2–3 BHK';
    if (val <= 2500) return '3–4 BHK';
    return 'Villa / Bungalow';
  };

  // Handle slider change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    updateSliderBackground(newValue);
    onChange?.(newValue);
  };

  // Initialize slider on mount
  useEffect(() => {
    updateSliderBackground(value);
  }, []);

  // Define our markers with their exact numerical values
  const markers = [
    { value: 200, label: '200' },
    { value: 1000, label: '1K' },
    { value: 2000, label: '2K' },
    { value: 3000, label: '3K' },
    { value: 4000, label: '4K+' }
  ];

  return (
    <div className={`size-slider-container ${className}`}>
      <div className="size-display">
        <div>
          <div className="size-val">{value} sq ft</div>
          <div className="size-tier">{getSizeTier(value)}</div>
        </div>
        <div style={{fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '600'}}>
          Drag to adjust →
        </div>
      </div>
      
      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="size-slider-input"
        style={{ marginBottom: '8px' }}
      />
      
      {/* We override the flexbox CSS inline to use absolute positioning mapped to percentages */}
      <div className="size-markers" style={{ position: 'relative', display: 'block', height: '24px' }}>
        {markers.map((marker) => {
          // Calculate the exact percentage along the slider track where this marker belongs
          const percentage = ((marker.value - min) / (max - min)) * 100;
          
          return (
            <div
              key={marker.value}
              className="size-marker"
              style={{
                position: 'absolute',
                left: `calc(${percentage}%)`,
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              {marker.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
