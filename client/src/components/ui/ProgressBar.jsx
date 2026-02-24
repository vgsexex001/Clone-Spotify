import { useState, useEffect, useRef, useCallback } from 'react';

export default function ProgressBar({ value, max, onChange, className = '' }) {
  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const percent = max > 0 ? (value / max) * 100 : 0;

  const calcValue = useCallback((clientX) => {
    if (!barRef.current) return value;
    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * max;
  }, [max, value]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => onChange(calcValue(e.clientX));
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, calcValue, onChange]);

  const showActive = isHovered || isDragging;

  return (
    <div
      ref={barRef}
      className={`relative flex items-center cursor-pointer group ${className}`}
      style={{ height: 12 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        setIsDragging(true);
        onChange(calcValue(e.clientX));
      }}
    >
      <div className="w-full rounded-full h-1 bg-white/30">
        <div
          className="h-full rounded-full transition-colors"
          style={{
            width: `${percent}%`,
            backgroundColor: showActive ? '#1DB954' : '#fff',
          }}
        />
      </div>
      {showActive && (
        <div
          className="absolute w-3 h-3 bg-white rounded-full shadow-md"
          style={{ left: `calc(${percent}% - 6px)` }}
        />
      )}
    </div>
  );
}
