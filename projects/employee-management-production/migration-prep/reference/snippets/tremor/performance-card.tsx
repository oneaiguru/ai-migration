import {
  Card,
  Title,
  Text,
  Metric,
  Flex,
  ProgressBar,
  AreaChart,
} from "@tremor/react";

const data = [
  { date: "2025-09-01", value: 125 },
  { date: "2025-09-02", value: 132 },
  { date: "2025-09-03", value: 118 },
  { date: "2025-09-04", value: 141 },
  { date: "2025-09-05", value: 137 },
];

export function PerformanceCard() {
  return (
    <Card className="max-w-xl">
      <Flex justifyContent="between" alignItems="start">
        <div>
          <Title>Уровень SLA</Title>
          <Text>Среднее значение за неделю</Text>
        </div>
        <Metric>94%</Metric>
      </Flex>

      <ProgressBar percentageValue={94} color="emerald" className="mt-4" />

      <AreaChart
        data={data}
        index="date"
        categories={["value"]}
        colors={["emerald"]}
        valueFormatter={(v) => `${v}%`}
        className="mt-6 h-48"
      />
    </Card>
  );
}
