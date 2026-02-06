interface StackedBarChartProps {
  managers: Array<{ name: string; callsCount: number; averageScore: number }>;
}

export function StackedBarChart({ managers }: StackedBarChartProps) {
  return (
    <div className="space-y-4">
      {managers.map((manager) => {
        const score = Math.max(0, Math.min(100, manager.averageScore));
        const goodPercent = score >= 72 ? score : 0;
        const acceptablePercent = score >= 40 && score < 72 ? score - 40 : 0;
        const poorPercent = Math.max(0, 100 - goodPercent - acceptablePercent);

        return (
          <div key={manager.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{manager.name}</span>
              <span className="font-semibold">{manager.callsCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
              {goodPercent > 0 && (
                <div
                  className="bg-score-good h-6"
                  style={{ width: `${goodPercent}%` }}
                />
              )}
              {acceptablePercent > 0 && (
                <div
                  className="bg-score-acceptable h-6"
                  style={{ width: `${acceptablePercent}%` }}
                />
              )}
              {poorPercent > 0 && (
                <div
                  className="bg-score-poor h-6"
                  style={{ width: `${poorPercent}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
