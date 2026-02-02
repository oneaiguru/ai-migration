import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { CSSProperties } from "react";

const initialTeams = ["Поддержка", "Развитие", "Аналитика", "Коммуникации"];

function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px 12px",
    marginBottom: 8,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    boxShadow: "0 8px 16px rgba(15,23,42,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>{id}</span>
      <span aria-hidden>↕</span>
    </div>
  );
}

export function DndDemo() {
  const [teams, setTeams] = useState(initialTeams);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTeams((items) => arrayMove(items, items.indexOf(String(active.id)), items.indexOf(String(over.id))));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={teams} strategy={verticalListSortingStrategy}>
        <div style={{ maxWidth: 360 }}>
          {teams.map((team) => (
            <SortableItem key={team} id={team} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
