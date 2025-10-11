const GaugeChart = ({ percentage = 20, label = "Progress", unity }) => {
  // Limiter le pourcentage entre 0 et 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Convertir le pourcentage en angle entre -90° (gauche) et +90° (droite)
  const angle = -90 + (clampedPercentage / 100) * 180;

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center w-80">
        {/* Conteneur de la demi-jauge */}
        <div className="text-sm text-gray-600 text-center font-bold">
          {label}
        </div>
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Zone verte (0% - 25%) */}
          <div
            className="absolute w-48 h-48 rounded-full border-24 border-transparent border-t-green-500 border-r-green-500"
            style={{
              transform: "rotate(180deg)",
            }}
          ></div>

          {/* Zone orange (25% - 75%) */}
          <div
            className="absolute w-48 h-48 rounded-full border-24 border-transparent border-t-amber-500 border-r-amber-500"
            style={{
              transform: "rotate(0deg)",
            }}
          ></div>

          {/* Zone rouge (75% - 100%) */}
          <div
            className="absolute w-48 h-48 rounded-full border-24 border-transparent border-t-red-500 border-r-red-500"
            style={{
              transform: "rotate(85deg)",
            }}
          ></div>

          {/* Aiguille centrale */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div
              className="w-0.5 h-16 bg-gray-800 origin-bottom"
              style={{
                transform: `rotate(${angle}deg)`,
                transition: "transform 0.5s ease-in-out",
              }}
            ></div>
            <div className="w-4 h-4 bg-gray-800 rounded-full -mt-2 -ml-1.5"></div>
          </div>
        </div>

        {/* Texte en dessous */}
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold text-gray-800">
            {clampedPercentage}
            {unity}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;
