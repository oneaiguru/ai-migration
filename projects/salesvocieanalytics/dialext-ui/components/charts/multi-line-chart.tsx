interface Series {
  label: string;
  color: string;
  data: number[];
}

interface MultiLineChartProps {
  months: string[];
  series: Series[];
  height?: number;
}

export function MultiLineChart({
  months,
  series,
  height = 400,
}: MultiLineChartProps) {
  const width = 1200;
  const padding = 60;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Y-axis label */}
      <text
        x={20}
        y={height / 2}
        textAnchor="middle"
        className="text-xs fill-slate-600 font-semibold"
        transform={`rotate(-90, 20, ${height / 2})`}
      >
        Кол-во (в тысячах)
      </text>

      {/* Y-axis grid lines and values */}
      {[0, 20, 40, 60, 80, 100].map((val) => {
        const y = height - padding - ((val / 100) * (height - 2 * padding));
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
              {val}
            </text>
          </g>
        );
      })}

      {months.map((month, i) => {
        const x = padding + (i * (width - 2 * padding)) / (months.length - 1);
        return (
          <text
            key={month}
            x={x}
            y={height - padding + 20}
            textAnchor="middle"
            className="text-xs fill-slate-500"
            transform={`rotate(-45, ${x}, ${height - padding + 20})`}
          >
            {month}
          </text>
        );
      })}

      {series.map((s) => {
        const points = s.data
          .map((val, i) => {
            const x = padding + (i * (width - 2 * padding)) / (s.data.length - 1);
            const y = height - padding - ((val / 100) * (height - 2 * padding));
            return `${x},${y}`;
          })
          .join(' ');

        return (
          <polyline
            key={s.label}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            points={points}
          />
        );
      })}
    </svg>
  );
}
