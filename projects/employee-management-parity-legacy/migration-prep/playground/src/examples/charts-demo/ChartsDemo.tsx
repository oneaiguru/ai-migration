import { Card, Title, Flex, Metric, AreaChart, Text } from "@tremor/react";
import { ResponsiveContainer, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

const slaData = [
  { date: "Пн", value: 92 },
  { date: "Вт", value: 95 },
  { date: "Ср", value: 93 },
  { date: "Чт", value: 96 },
  { date: "Пт", value: 94 },
];

const callsData = [
  { hour: "10", value: 120 },
  { hour: "11", value: 140 },
  { hour: "12", value: 135 },
  { hour: "13", value: 150 },
  { hour: "14", value: 142 },
];

export function ChartsDemo() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <Flex justifyContent="between" alignItems="center" className="mb-4">
          <div>
            <Title>Уровень SLA</Title>
            <Text>Среднее за неделю</Text>
          </div>
          <Metric>94%</Metric>
        </Flex>
        <AreaChart
          data={slaData}
          index="date"
          categories={["value"]}
          valueFormatter={(value) => `${value}%`}
          colors={["emerald"]}
          className="h-48"
        />
      </Card>

      <Card>
        <Title>Количество звонков по часам</Title>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={callsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value} звонков`} />
              <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
