interface LineChartProps {
  data: Array<{ hour: number; count: number }>;
  height?: number;
}

export function LineChart({ data, height = 300 }: LineChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const width = 1200;
  const padding = 40;

  const points = data
    .map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - ((d.count / maxCount) * (height - 2 * padding));
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Y-axis label */}
      <text
        x={15}
        y={20}
        textAnchor="start"
        className="text-xs fill-slate-600 font-medium"
      >
        Кол-во (в тысячах)
      </text>

      {[0, 20000, 40000, 60000, 80000].map((val) => {
        const y = height - padding - ((val / maxCount) * (height - 2 * padding));
        return (
          <g key={val}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={y + 5}
              textAnchor="end"
              className="text-xs fill-slate-500"
            >
              {val / 1000}k
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
        return (
          <g key={`tick-${d.hour}`}>
            <line
              x1={x}
              y1={height - padding}
              x2={x}
              y2={height - padding + 4}
              stroke="#D1D5DB"
              strokeWidth="1"
            />
            <text
              x={x}
              y={height - padding + 18}
              textAnchor="middle"
              className="text-xs fill-slate-500"
            >
              {d.hour}
            </text>
          </g>
        );
      })}

      <polyline fill="none" stroke="#0066CC" strokeWidth="3" points={points} />

      {data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
        const y = height - padding - ((d.count / maxCount) * (height - 2 * padding));
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="#0066CC"
            stroke="white"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}
