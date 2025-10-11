// AdvancedGaugeChart.jsx
import React from "react";

const AdvancedGaugeChart = ({
  percentage = 85.56,
  label = "Progress",
  size = 200,
}) => {
  const rotation = (percentage / 100) * 180;
  const radius = size / 2;
  const strokeWidth = 12;

  // Calculs pour le SVG
  const circumference = 2 * Math.PI * (radius - strokeWidth);
  const dashOffset = circumference - (percentage / 100) * circumference;

  // Couleur basée sur le pourcentage
  const getColor = (percent) => {
    if (percent > 70) return "#ef4444"; // rouge
    if (percent < 70) return "#f59e0b"; // orange
    return "#10b981"; // vert
  };

  return (
    <div className="flex flex-col items-center">
      {/* Jauge SVG plus précise */}
      <div className="relative" style={{ width: size, height: size / 2 }}>
        <svg
          width={size}
          height={size / 2}
          viewBox={`0 0 ${size} ${size / 2}`}
          className="overflow-visible"
        >
          {/* Fond de la jauge */}
          <path
            d={`
              M ${strokeWidth} ${radius}
              A ${radius - strokeWidth} ${radius - strokeWidth} 0 0 1 ${
              size - strokeWidth
            } ${radius}
            `}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Partie colorée */}
          <path
            d={`
              M ${strokeWidth} ${radius}
              A ${radius - strokeWidth} ${radius - strokeWidth} 0 0 1 ${
              size - strokeWidth
            } ${radius}
            `}
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(180, ${size / 2}, ${radius})`}
            style={{
              transition:
                "stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease-in-out",
            }}
          />
        </svg>

        {/* Aiguille */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transition: "transform 0.5s ease-in-out",
            height: radius - strokeWidth,
          }}
        >
          <div className="w-1 h-full bg-gray-800 mx-auto"></div>
          <div className="w-3 h-3 bg-gray-800 rounded-full -mt-1.5 -ml-1"></div>
        </div>
      </div>

      {/* Affichage des informations */}
      <div className="mt-6 text-center">
        <div className="text-3xl font-bold text-gray-800">{percentage}%</div>
        <div className="text-sm text-gray-600 mt-1">{label}</div>
      </div>
    </div>
  );
};

export default AdvancedGaugeChart;
