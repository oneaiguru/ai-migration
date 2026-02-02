import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class StubResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== "undefined" && !("ResizeObserver" in window)) {
  // @ts-expect-error jsdom stub
  window.ResizeObserver = StubResizeObserver;
}

vi.mock("@tanstack/react-virtual", () => {
  return {
    useVirtualizer: (options: {
      count: number;
      estimateSize?: () => number;
    }) => {
      const size = options.estimateSize ? options.estimateSize() : 48;
      const count = options.count ?? 0;
      return {
        getVirtualItems: () =>
          Array.from({ length: count }).map((_, index) => ({
            index,
            start: index * size,
            size,
          })),
        getTotalSize: () => count * size,
        scrollToIndex: vi.fn(),
      };
    },
  };
});
