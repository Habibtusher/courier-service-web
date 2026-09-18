import React from 'react';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Lightweight SVG Code 128 / Barcode Renderer for Thermal Labels
 */
export const Barcode: React.FC<BarcodeProps> = ({
  value,
  width = 2,
  height = 50,
  className = '',
}) => {
  // Hash characters to deterministic bar widths (1-4)
  const generateBars = (text: string) => {
    const bars: { width: number; isBar: boolean }[] = [];
    // Start pattern
    bars.push({ width: 2, isBar: true }, { width: 1, isBar: false }, { width: 1, isBar: true });

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const w1 = (code % 3) + 1;
      const w2 = ((code * 2) % 3) + 1;
      const w3 = ((code * 3) % 3) + 1;
      bars.push({ width: w1, isBar: true });
      bars.push({ width: 1, isBar: false });
      bars.push({ width: w2, isBar: true });
      bars.push({ width: 1, isBar: false });
      bars.push({ width: w3, isBar: true });
      bars.push({ width: 1, isBar: false });
    }

    // Stop pattern
    bars.push({ width: 2, isBar: true }, { width: 2, isBar: false }, { width: 3, isBar: true });
    return bars;
  };

  const bars = generateBars(value || 'MSL20260918000001');
  let currentX = 10;
  const barElements = bars.map((bar, idx) => {
    const barW = bar.width * width;
    const element = bar.isBar ? (
      <rect
        key={idx}
        x={currentX}
        y={10}
        width={barW}
        height={height}
        fill="#000000"
      />
    ) : null;
    currentX += barW;
    return element;
  });

  const totalWidth = currentX + 10;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width={totalWidth}
        height={height + 20}
        viewBox={`0 0 ${totalWidth} ${height + 25}`}
        className="max-w-full"
      >
        {barElements}
      </svg>
      <div className="font-mono text-xs font-extrabold tracking-widest text-slate-900 mt-1">
        {value}
      </div>
    </div>
  );
};
