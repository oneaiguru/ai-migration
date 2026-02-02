import React from 'react';

interface ChartOverlayProps {
  dates: Array<{ day: number; dateString: string }>;
}

const ChartOverlay: React.FC<ChartOverlayProps> = ({ dates }) => {
  const chartDataPoints = dates.slice(0, 20); // Use first 20 days for chart
  
  return (
    <div className="schedule-chart-overlay border-b-2 border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-4">
          <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
            Прогноз + план
          </button>
          <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm">
            Отклонения
          </button>
          <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm">
            Уровень сервиса (SL)
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1">
            <input type="checkbox" className="w-3 h-3" />
            <span>Σ</span>
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" className="w-3 h-3" />
            <span>123</span>
          </label>
        </div>
      </div>
      
      {/* Mock Chart */}
      <div className="h-16 bg-gradient-to-r from-blue-100 via-green-100 to-orange-100 border border-gray-300 rounded flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around p-2">
          {chartDataPoints.map((date, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center"
              style={{ width: '3px' }}
            >
              <div 
                className="w-1 bg-blue-500 rounded-t"
                style={{ height: `${Math.random() * 25 + 5}px` }}
              />
            </div>
          ))}
        </div>
        
        <span className="text-xs text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded relative z-10">
          📊 Прогноз vs План ({chartDataPoints.length} дней)
        </span>
      </div>
    </div>
  );
};

export default ChartOverlay;
