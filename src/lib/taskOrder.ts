import type { Task } from '../api/tasks.ts';

// Cancelled tasks are read-only; only the active list receives new positions.
export function moveTask(tasks: Task[], source: number, target: number, placement?: "before" | "after"): Task[] {
  const ordered = tasks.filter(t => t.status !== 'CANCELLED').sort((a,b) => a.sortOrder-b.sortOrder || a.id-b.id);
  const from = ordered.findIndex(t => t.id === source);
  const to = ordered.findIndex(t => t.id === target);
  if (from < 0 || to < 0 || from === to) return [];
  const [moved] = ordered.splice(from,1);
  const insertion = placement ? ordered.findIndex(t => t.id === target) + (placement === "after" ? 1 : 0) : to;
  ordered.splice(insertion,0,moved);
  return ordered;
}
