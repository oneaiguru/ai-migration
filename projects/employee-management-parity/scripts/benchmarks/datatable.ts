import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '../../src/wrappers/data/DataTable';

type RowData = {
  id: string;
  fio: string;
  team: string;
  position: string;
};

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  pretendToBeVisual: true,
});

Object.defineProperty(globalThis, 'window', {
  value: dom.window,
  configurable: true,
});
Object.defineProperty(globalThis, 'document', {
  value: dom.window.document,
  configurable: true,
});
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);

if (typeof (window as any).ResizeObserver !== 'function') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (window as any).ResizeObserver = ResizeObserverStub;
}

if (typeof (window as any).matchMedia !== 'function') {
  (window as any).matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    media: '',
  });
}

const columns: ColumnDef<RowData>[] = [
  { accessorKey: 'fio', header: 'Ф.И.О.' },
  { accessorKey: 'team', header: 'Команда' },
  { accessorKey: 'position', header: 'Должность' },
];

const generateRows = (count: number): RowData[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `emp-${index}`,
    fio: `Сотрудник ${index}`,
    team: `Команда ${index % 10}`,
    position: 'Оператор контакт-центра',
  }));

const mountPoint = document.getElementById('root');

if (!mountPoint) {
  console.error('Не удалось найти корневой контейнер для бенчмарка.');
  process.exit(1);
}

const root: Root = createRoot(mountPoint);

const runBenchmark = async (size: number) => {
  const data = generateRows(size);
  const start = performance.now();

  root.render(
    React.createElement(DataTable<RowData>, {
      data,
      columns,
      rowHeight: 48,
      height: 600,
      enableKeyboardNavigation: false,
      testId: 'benchmark-table',
    }),
  );

  await new Promise((resolve) => setTimeout(resolve, 0));
  const end = performance.now();

  console.log(`Размер ${size.toLocaleString('ru-RU')}: ${(end - start).toFixed(2)}ms`);
};

(async () => {
  for (const size of [10000, 30000, 50000]) {
    await runBenchmark(size);
  }

  root.unmount();
  dom.window.close();
})();
