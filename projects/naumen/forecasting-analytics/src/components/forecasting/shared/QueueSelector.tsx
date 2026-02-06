import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { QueueNode } from '../../../types/forecasting';

export interface QueueSelectorProps {
  tree: QueueNode[];
  selectedLeafIds: Set<string>;
  onSelectionChange: (next: Set<string>) => void;
  title?: string;
  description?: string;
}

interface SelectionSnapshot {
  checked: boolean;
  indeterminate: boolean;
}

export const buildLeafMap = (nodes: QueueNode[]): Map<string, string[]> => {
  const map = new Map<string, string[]>();

  const walk = (node: QueueNode): string[] => {
    if (!node.children?.length) {
      map.set(node.id, [node.id]);
      return [node.id];
    }

    const leaves = node.children.flatMap(walk);
    map.set(node.id, leaves.length ? leaves : [node.id]);
    return leaves;
  };

  nodes.forEach((node) => walk(node));
  return map;
};

const computeSelection = (
  leafMap: Map<string, string[]>,
  nodeId: string,
  selectedLeafIds: Set<string>,
): SelectionSnapshot => {
  const leaves = leafMap.get(nodeId) ?? [nodeId];
  const selectedCount = leaves.filter((leaf) => selectedLeafIds.has(leaf)).length;
  const checked = selectedCount > 0 && selectedCount === leaves.length;
  const indeterminate = selectedCount > 0 && selectedCount < leaves.length;
  return { checked, indeterminate };
};

const QueueSelector: React.FC<QueueSelectorProps> = ({
  tree,
  selectedLeafIds,
  onSelectionChange,
  title,
  description,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const rootIds = new Set<string>();
    tree.forEach((node) => rootIds.add(node.id));
    setExpanded(rootIds);
  }, [tree]);

  const leafMap = useMemo(() => buildLeafMap(tree), [tree]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleNode = useCallback(
    (node: QueueNode) => {
      const leaves = leafMap.get(node.id) ?? [node.id];
      const allSelected = leaves.every((leaf) => selectedLeafIds.has(leaf));
      const next = new Set(selectedLeafIds);
      if (allSelected) {
        leaves.forEach((leaf) => next.delete(leaf));
      } else {
        leaves.forEach((leaf) => next.add(leaf));
      }
      onSelectionChange(next);
    },
    [leafMap, onSelectionChange, selectedLeafIds],
  );

  const renderNode = useCallback(
    (node: QueueNode, depth = 0) => {
      const { checked, indeterminate } = computeSelection(leafMap, node.id, selectedLeafIds);
      const hasChildren = Boolean(node.children?.length);
      const isExpanded = expanded.has(node.id) || !hasChildren;

      const handleChange = () => toggleNode(node);
      const handleKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleChange();
        }
      };

      return (
        <li key={node.id} className="space-y-2">
          <div
            className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm"
            style={{ paddingLeft: depth ? 12 + depth * 12 : 12 }}
          >
            <div className="flex flex-1 items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200"
                  aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              ) : (
                <span className="inline-flex h-6 w-6 items-center justify-center" aria-hidden="true" />
              )}
              <label className="flex flex-1 items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  checked={checked}
                  ref={(element) => {
                    if (element) {
                      element.indeterminate = indeterminate;
                    }
                  }}
                  onChange={handleChange}
                />
                <span className="font-medium text-gray-800">{node.name}</span>
              </label>
            </div>
            {hasChildren ? (
              <button
                type="button"
                onClick={handleChange}
                onKeyDown={handleKey}
                className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-purple-200 hover:text-purple-600"
              >
                {checked ? 'Снять' : 'Выбрать все'}
              </button>
            ) : null}
          </div>
          {hasChildren && isExpanded ? (
            <ul className="space-y-2" aria-label={`Подочереди ${node.name}`}>
              {node.children!.map((child) => renderNode(child, depth + 1))}
            </ul>
          ) : null}
        </li>
      );
    },
    [expanded, leafMap, selectedLeafIds, toggleExpand, toggleNode],
  );

  return (
    <section className="space-y-3">
      {title ? <h3 className="text-sm font-semibold text-gray-900">{title}</h3> : null}
      {description ? <p className="text-xs text-gray-500">{description}</p> : null}
      <ul className="space-y-2" aria-label="Рабочая структура">
        {tree.map((node) => renderNode(node))}
      </ul>
    </section>
  );
};

export const collectAllLeafIds = (tree: QueueNode[]): string[] => {
  const leafMap = buildLeafMap(tree);
  return Array.from(new Set(Array.from(leafMap.values()).flat()));
};

export const collectLeafIdsForNode = (tree: QueueNode[], nodeId: string): string[] => {
  const leafMap = buildLeafMap(tree);
  return leafMap.get(nodeId) ?? [];
};

export default QueueSelector;
