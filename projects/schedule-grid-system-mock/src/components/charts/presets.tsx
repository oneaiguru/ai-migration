import React from 'react';
import { BarChart, LineChart } from '.';
import type { BarChartProps, LineChartProps } from './types';

const DEFAULT_COVERAGE_CLAMP: BarChartProps['clamp'] = { min: 70, max: 100 };
const DEFAULT_ADHERENCE_CLAMP: LineChartProps['clamp'] = { min: 70, max: 100 };
const COVERAGE_VIEW_TOGGLE: NonNullable<BarChartProps['viewToggle']> = [
  { id: 'coverage', label: 'Покрытие' },
  { id: 'adherence', label: 'Соблюдение' },
];

export type CoverageChartProps = BarChartProps;

export const CoverageChart: React.FC<CoverageChartProps> = (props) => {
  const { clamp, viewToggle, ...rest } = props;
  return (
    <BarChart
      clamp={{ ...DEFAULT_COVERAGE_CLAMP, ...clamp }}
      viewToggle={viewToggle ?? COVERAGE_VIEW_TOGGLE}
      {...rest}
    />
  );
};

export type AdherenceChartProps = LineChartProps;

export const AdherenceChart: React.FC<AdherenceChartProps> = (props) => {
  const { clamp, targets, ...rest } = props;
  return (
    <LineChart
      clamp={{ ...DEFAULT_ADHERENCE_CLAMP, ...clamp }}
      targets={targets ?? [{ label: 'Цель 90%', value: 90, style: 'dashed' }]}
      {...rest}
    />
  );
};
