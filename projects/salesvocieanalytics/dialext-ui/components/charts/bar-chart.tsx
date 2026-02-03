interface Metric {
  label: string;
  percentage: number;
}

interface BarChartProps {
  metrics: Metric[];
}

export function BarChart({ metrics }: BarChartProps) {
  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{metric.label}</span>
            <span className="font-semibold">{metric.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-primary h-6 rounded-full transition-all"
              style={{ width: `${metric.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
