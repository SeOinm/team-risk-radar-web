import { useState, type FormEvent } from "react";
import { Btn, Input } from "@/components/ds";
import { TASK_SIZES, type TaskInput } from "@/api/tasks";
export function TaskForm({
  initial,
  busy,
  onSave,
  onCancel,
}: {
  initial?: TaskInput;
  busy: boolean;
  onSave: (input: TaskInput) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [size, setSize] = useState(initial?.size ?? "M");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("작업명을 입력해주세요.");
      return;
    }
    onSave({
      title: title.trim(),
      size,
      dueDate: dueDate || null,
      sortOrder: null,
    });
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <fieldset disabled={busy} className="space-y-3 min-w-0">
        <Input
          label="작업명"
          maxLength={100}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="block text-sm">
          작업 크기
          <select
            aria-label="작업 크기"
            className="block border border-border rounded p-2 mt-1"
            value={size}
            onChange={(e) => setSize(e.target.value as TaskInput["size"])}
          >
            {TASK_SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Input
          label="작업 마감일 (선택)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        {error && <p role="alert">{error}</p>}
        <div className="flex gap-2">
          <Btn type="button" onClick={onCancel}>
            취소
          </Btn>
          <Btn type="submit" variant="primary">
            {busy ? "저장 중…" : "작업 저장"}
          </Btn>
        </div>
      </fieldset>
    </form>
  );
}
