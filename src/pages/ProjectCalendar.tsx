import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { Link } from "react-router";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ApiError } from "@/api/client";
import { tasksApi, type Task } from "@/api/tasks";
import type { ProjectResponse } from "@/api/projects";
import { TaskForm } from "@/components/TaskForm";
import { Btn } from "@/components/ds";
import { useApiAction } from "@/hooks/useApiAction";
import { useApiQuery } from "@/hooks/useApiQuery";
import { calendarTemplates, matchesProjectType, PROJECT_TYPES } from "@/lib/projectTemplates";

const collapseTaskListWidth = 72;
const minTaskListWidth = 192;
const maxTaskListWidth = 384;
const clampTaskListWidth = (width: number) => Math.min(maxTaskListWidth, Math.max(minTaskListWidth, Math.round(width)));

const dayMs = 86_400_000;
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
const datePart = (value: string) => value.slice(0, 10);
const stamp = (date: string) => Date.parse(date + "T00:00:00Z");
const shift = (date: string, days: number) => new Date(stamp(date) + days * dayMs).toISOString().slice(0, 10);
const gap = (from: string, to: string) => Math.round((stamp(to) - stamp(from)) / dayMs);
const weekend = (date: string) => [0, 6].includes(new Date(stamp(date)).getUTCDay());
const dateLabel = new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric", weekday: "short", timeZone: "UTC" });
const colors = ["bg-blue-100 text-blue-950", "bg-violet-100 text-violet-950", "bg-teal-100 text-teal-950", "bg-amber-100 text-amber-950"];
const field = "rounded border border-border bg-white px-2 py-1.5 text-sm";

type Starts = Record<number, { start: string; due: string }>;
type Drag = { id: number; edge: "move" | "start" | "end" };
type Range = { start: string; end: string };
type Settings = { task: Task | null; range: Range; error: string };

function readStarts(key: string): Starts {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function taskRange(task: Task, starts: Starts): Range | undefined {
  if (!task.dueDate) return;
  const end = datePart(task.dueDate);
  if (!Number.isFinite(stamp(end))) return;
  const local = starts[task.id];
  const start = local?.due === end && /^\d{4}-\d{2}-\d{2}$/.test(local.start)
    && Number.isFinite(stamp(local.start)) && local.start <= end ? local.start : end;
  return { start, end };
}

export function ProjectCalendarPanel({ project, query, recommendedType, onRecommendationDismiss, demo }: {
  project: Pick<ProjectResponse, "id" | "deadline" | "myRole" | "status">;
  query: ReturnType<typeof useApiQuery<Task[]>>;
  recommendedType?: string | null;
  onRecommendationDismiss?: () => void;
  demo?: { starts: Starts; links: { taskId: number; prerequisites: { taskId: number }[] }[] };
}) {
  const base = `/projects/${project.id}`;
  const storageKey = demo ? "risense:project-calendar:demo" : `risense:project-calendar:starts:${project.id}`;
  const [starts, setStarts] = useState(() => demo?.starts ?? readStarts(storageKey));
  const deadline = datePart(project.deadline);
  const anchor = Number.isFinite(stamp(deadline)) ? deadline : today();
  const [view, setView] = useState(() => {
    const defaults = { range: { start: shift(anchor, -13), end: anchor }, weekends: true, showLinks: true, assignee: "", taskListWidth: minTaskListWidth };
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey + ":view") ?? "null");
      const span = saved ? gap(saved.range.start, saved.range.end) : NaN;
      if (span >= 0 && span <= 92 && typeof saved.weekends === "boolean"
        && typeof saved.showLinks === "boolean" && typeof saved.assignee === "string") {
        return { ...saved, taskListWidth: Number.isFinite(saved.taskListWidth) ? clampTaskListWidth(saved.taskListWidth) : defaults.taskListWidth } as typeof defaults;
      }
    } catch {
      // Keep the default view when browser storage is unavailable.
    }
    return defaults;
  });
  const { range, weekends, showLinks, assignee, taskListWidth } = view;
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey + ":view", JSON.stringify(view));
    } catch {
      // Viewing the calendar does not require browser storage.
    }
  }, [storageKey, view]);
  const recommendation = PROJECT_TYPES.find(type => type.value === recommendedType);
  const [panel, setPanel] = useState<"task" | "template" | Settings | null>(() => recommendation ? "template" : null);
  const settings = typeof panel === "object" ? panel : null;
  const editTask = settings?.task;
  const preview = settings?.range;

  function openSettings(next: Range, task: Task | null = null) {
    if (task) setSelected(null);
    setPanel({ task, range: next, error: "" });
  }

  function closeTemplate() {
    setPanel(null);
    onRecommendationDismiss?.();
  }
  const [storageWarning, setStorageWarning] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateStart, setTemplateStart] = useState(() => {
    const defaultStart = shift(anchor, -13);
    const current = today();
    return current > defaultStart && current <= anchor ? current : defaultStart;
  });
  const [templateWarning, setTemplateWarning] = useState("");
  const [templateDue, setTemplateDue] = useState(anchor);
  const taskListId = useId();
  const panelResize = useRef<{ pointerId: number; x: number; width: number } | null>(null);
  function resizeTaskList(width: number) {
    const next = clampTaskListWidth(width);
    setView(current => current.taskListWidth === next ? current : { ...current, taskListWidth: next });
  }
  const [showTaskList, setShowTaskList] = useState(true);
  const taskListToggleLabel = showTaskList ? "작업 목록 숨기기" : "작업 목록 표시";
  const [selected, setSelected] = useState<number | null>(null);
  const [pendingSchedule, setPendingSchedule] = useState<{ taskId: number; dates: Range } | null>(null);
  const [dropDay, setDropDay] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<Drag | null>(null);
  const action = useApiAction();
  const hasEditPermission = !demo && project.myRole !== "MEMBER" && project.status === "IN_PROGRESS";
  const canEdit = hasEditPermission && !action.busy && !action.locked;
  const tasks = useMemo(() => query.data?.filter(task => task.status !== "CANCELLED"), [query.data]);
  const loadLinks = useCallback(async (signal: AbortSignal) => {
    if (!tasks?.length || !showLinks) return [];
    if (demo) return demo.links;
    return Promise.all(tasks.map(async task => ({
      taskId: task.id, prerequisites: await tasksApi.prerequisites(project.id, task.id, signal),
    })));
  }, [demo, project.id, tasks, showLinks]);
  const links = useApiQuery(loadLinks);
  const loadTemplates = useCallback((signal: AbortSignal) =>
    panel === "template" && !demo ? tasksApi.templates(project.id, signal) : Promise.resolve([]), [demo, project.id, panel]);
  const templates = useApiQuery(loadTemplates);
  const choices = calendarTemplates(templates.data ?? []);
  const template = choices.find(item => item.template === templateName)
    ?? (recommendation && choices.find(item => matchesProjectType(item, recommendation)))
    ?? choices[0];
  const templateSpan = gap(templateStart, templateDue);
  const validTemplateRange = templateSpan >= 0 && templateSpan <= 92;
  const plan = validTemplateRange && template ? template.tasks.map((task, index, items) => ({
    ...task,
    start: shift(templateStart, Math.round(templateSpan * index / items.length)),
    due: shift(templateStart, Math.round(templateSpan * (index + 1) / items.length)),
  })) : [];
  const members = [...new Map((tasks ?? []).flatMap(task => task.assignees.map(member => [member.memberId, member] as const))).values()].sort((a, b) => a.memberId - b.memberId);
  const visible = (tasks ?? []).filter(task => !assignee || task.assignees.some(member => String(member.memberId) === assignee));
  const days = Array.from({ length: gap(range.start, range.end) + 1 }, (_, i) => shift(range.start, i)).filter(date => weekends || !weekend(date));
  const scheduled = visible.flatMap(task => {
    const dates = pendingSchedule?.taskId === task.id ? pendingSchedule.dates : taskRange(task, starts);
    if (!dates) return [];
    const first = days.findIndex(day => day >= dates.start && day <= dates.end);
    const last = days.findLastIndex(day => day >= dates.start && day <= dates.end);
    return first < 0 ? [] : [{ task, dates, first, last }];
  }).sort((a, b) => a.dates.start.localeCompare(b.dates.start) || a.task.sortOrder - b.task.sortOrder || a.task.id - b.task.id);
  const column = 82;
  const row = 44;
  const width = days.length * column;
  const chartHeight = Math.max(5, visible.length + 1) * row;
  const dragTask = dragItem ? tasks?.find(task => task.id === dragItem.id) : undefined;
  const dragDates = dropDay && dragItem && dragTask ? datesForDrop(dragTask, dropDay, dragItem.edge) : undefined;
  const dragFirst = dragDates ? days.findIndex(day => day >= dragDates.start && day <= dragDates.end) : -1;
  const dragLast = dragDates ? days.findLastIndex(day => day >= dragDates.start && day <= dragDates.end) : -1;
  const dragRow = scheduled.findIndex(({ task }) => task.id === dragItem?.id);

  function blockColor(task: Task) {
    const owner = members.findIndex(member => member.memberId === task.assignees[0]?.memberId);
    return owner < 0 ? "bg-slate-100 text-slate-900" : colors[owner % colors.length];
  }

  function storeStarts(additions: Starts) {
    const next = { ...starts, ...readStarts(storageKey), ...additions };
    setStarts(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageWarning("");
    } catch {
      setStorageWarning("브라우저 저장 공간을 사용할 수 없어 시작일이 현재 화면에만 유지됩니다.");
    }
  }

  function save(task: Task, dates: Range) {
    if (!canEdit || dates.start > dates.end) return;
    const previous = taskRange(task, starts);
    if (previous?.start === dates.start && previous.end === dates.end) return;
    void action.run(async () => {
      setPendingSchedule({ taskId: task.id, dates });
      try {
        const latest = await tasksApi.detail(project.id, String(task.id));
        if (latest.status === "CANCELLED" || latest.dueDate !== task.dueDate) {
          query.retry();
          throw new ApiError(409, "TASK_SCHEDULE_CHANGED", "다른 곳에서 작업 일정이 변경되었습니다. 달력을 다시 열어 최신 일정을 확인해주세요.");
        }
        if (previous?.end !== dates.end) {
          await tasksApi.update(project.id, task.id, { title: latest.title, size: latest.size, dueDate: dates.end, sortOrder: null });
          query.updateData(current => current?.map(item => item.id === task.id ? { ...item, dueDate: dates.end } : item) ?? null);
        }
        storeStarts({ [task.id]: { start: dates.start, due: dates.end } });
        setSelected(null);
      } finally {
        setPendingSchedule(null);
      }
    });
  }

  function applyTemplate() {
    if (!template || !canEdit || templates.loading || !plan.length) return;
    setTemplateWarning("");
    void action.run(async () => {
      if (template.template.startsWith("local:")) {
        const datesToStore: Starts = {};
        try {
          for (const item of plan) {
            const task = await tasksApi.create(project.id, { title: item.title, size: item.size, dueDate: item.due });
            datesToStore[task.id] = { start: item.start, due: item.due };
          }
        } catch (error) {
          if (!Object.keys(datesToStore).length || (error instanceof ApiError && error.status === 401)) throw error;
          setTemplateWarning("일부 작업만 추가됐습니다. 달력에서 생성된 작업을 확인하고 남은 작업을 추가해주세요.");
        } finally {
          if (Object.keys(datesToStore).length) storeStarts(datesToStore);
        }
        return;
      }
      const created = await tasksApi.fromTemplate(project.id, template.template, templateDue);
      const pending = [...plan];
      const datesToStore: Starts = {};
      const dates = await Promise.allSettled(created.map(async task => {
        const index = pending.findIndex(item => item.title === task.title);
        if (index < 0) return;
        const [item] = pending.splice(index, 1);
        if (task.dueDate !== item.due) {
          await tasksApi.update(project.id, task.id, {
            title: task.title, size: task.size, dueDate: item.due, sortOrder: null,
          });
        }
        datesToStore[task.id] = { start: item.start, due: item.due };
      }));
      const unauthorized = dates.find(result => result.status === "rejected" && result.reason instanceof ApiError && result.reason.status === 401);
      if (unauthorized?.status === "rejected") throw unauthorized.reason;
      storeStarts(datesToStore);
      if (pending.length || dates.some(result => result.status === "rejected")) {
        setTemplateWarning("템플릿 작업을 추가했지만 일부 마감일을 배치하지 못했습니다. 달력에서 해당 작업을 확인해주세요.");
      }
    }, () => { closeTemplate(); showPeriod(templateStart, templateSpan + 1); query.retry(); });
  }

  function startDrag(event: DragEvent, item: Drag) {
    if (!canEdit) return;
    setDragItem(item);
    event.dataTransfer.setData("text/plain", String(item.id));
    event.dataTransfer.effectAllowed = "move";
  }

  function clearDrag() {
    setDragItem(null);
    setDropDay(null);
  }

  function datesForDrop(task: Task, date: string, edge: Drag["edge"]): Range {
    const previous = taskRange(task, starts);
    if (edge === "start" && previous) return { start: date, end: previous.end };
    if (edge === "end" && previous) return { start: previous.start, end: date };
    return { start: date, end: shift(date, previous ? gap(previous.start, previous.end) : 0) };
  }

  function dateUnderPointer(event: DragEvent<HTMLDivElement>) {
    const left = event.currentTarget.getBoundingClientRect().left;
    return days[Math.floor((event.clientX - left) / column)];
  }

  const periodLength = gap(range.start, range.end) + 1;

  function showPeriod(start: string, length: number) {
    setView(current => ({ ...current, range: { start, end: shift(start, length - 1) } }));
  }

  return (
    <section id="calendar" aria-label="작업 흐름 달력">
      <div className="space-y-4">
        {action.error && <p role="alert">{action.error}</p>}
        {templateWarning && <p role="alert">{templateWarning}</p>}
        {storageWarning && <p role="alert">{storageWarning}</p>}
        {query.loading && <p role="status">작업을 불러오는 중…</p>}
        {query.error && <div role="alert">{query.error} <Btn onClick={query.retry}>다시 시도</Btn></div>}
        {panel === "template" && (
          <section className="space-y-3 rounded-lg border border-border p-4" aria-label="작업 템플릿 미리보기">
            {recommendation && <h2 className="font-semibold">{recommendation.label} 프로젝트 추천 일정 초안</h2>}
            {templates.loading && <p role="status">템플릿을 불러오는 중…</p>}
            {templates.error && <p role="alert">서버 템플릿을 불러오지 못했습니다. 기본 템플릿을 사용할 수 있습니다. <Btn onClick={templates.retry}>다시 시도</Btn></p>}
            {!templates.loading && template && <>
              <label className="flex flex-wrap items-center gap-2 text-sm">템플릿<select className={field} value={template.template} onChange={event => setTemplateName(event.target.value)}>{choices.map(item => <option key={item.template} value={item.template}>{item.name}</option>)}</select></label>
              <div className="flex flex-wrap gap-3">
                <label className="grid gap-1 text-sm">시작일<input type="date" className={field} value={templateStart} onChange={event => setTemplateStart(event.target.value)} /></label>
                <label className="grid gap-1 text-sm">최종 마감일<input type="date" className={field} value={templateDue} onChange={event => setTemplateDue(event.target.value)} /></label>
              </div>
              {!validTemplateRange && <p role="alert">시작일부터 마감일까지 최대 93일을 선택해주세요.</p>}
              <ol className="list-decimal pl-6 text-sm">
                {template.tasks.map((task, index) => <li key={index}>{task.title}{plan[index] && <span className="ml-2 text-muted-foreground">{plan[index].start} ~ {plan[index].due}</span>}</li>)}
              </ol>
            </>}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
              <Btn disabled={action.busy} onClick={closeTemplate}>닫기</Btn>
              {!templates.loading && template && (
                <Btn variant="primary" disabled={!canEdit || !plan.length} onClick={applyTemplate}>
                  미리보기 일정으로 작업 추가
                </Btn>
              )}
            </div>
          </section>
        )}
        <div className={`relative grid grid-cols-[minmax(0,1fr)] rounded-xl border border-border ${showTaskList ? "lg:grid-cols-[var(--task-list-width)_1px_minmax(0,1fr)]" : ""}`}
          style={{ "--task-list-width": `${taskListWidth}px` } as CSSProperties}>
            <Btn size="sm" variant="ghost" className="absolute left-3 top-[18px] z-10 size-7 px-0" aria-controls={taskListId}
              aria-expanded={showTaskList} aria-label={taskListToggleLabel} title={taskListToggleLabel}
              onClick={() => {
                setSelected(null);
                setShowTaskList(!showTaskList);
              }}>
              {showTaskList
                ? <PanelLeftClose aria-hidden="true" className="size-4" />
                : <PanelLeftOpen aria-hidden="true" className="size-4" />}
            </Btn>
          <aside id={taskListId} className={`min-h-0 min-w-0 flex-col gap-3 px-4 pt-5 pb-4 lg:[contain:size] ${showTaskList ? "flex" : "hidden"}`}>
            <div className="flex items-center justify-between gap-1 pl-7"><h2 className="text-sm font-semibold">일정 배치</h2><Btn size="sm" disabled={!canEdit} onClick={() => setPanel("task")}>작업 추가</Btn></div>
            {panel === "task" && <TaskForm busy={action.busy} onCancel={() => setPanel(null)} onSave={input => {
              if (!canEdit) return;
              void action.run(() => tasksApi.create(project.id, input), () => { setPanel(null); query.retry(); });
            }} />}
            <div className="min-h-0 max-h-64 space-y-3 overflow-y-auto p-0.5 lg:max-h-none" role="region" aria-label="일정 배치 작업 목록" tabIndex={0}>
              {visible.map(task => (
                <button key={task.id} type="button" disabled={!canEdit} draggable={canEdit} aria-pressed={selected === task.id}
                  className="block w-full rounded-md border border-border p-2 text-left text-sm aria-pressed:bg-blue-50"
                  onDragStart={event => startDrag(event, { id: task.id, edge: "move" })} onDragEnd={clearDrag}
                  onClick={() => setSelected(id => id === task.id ? null : task.id)}>
                  <span className="block break-words font-medium">{task.title}</span>
                  <span className="text-xs text-muted-foreground">{task.assignees.map(member => member.nickname).join(", ") || "미배정"} · {task.dueDate ? datePart(task.dueDate) : "일정 미정"}</span>
                </button>
              ))}
              {tasks && !visible.length && <p className="text-sm text-muted-foreground">표시할 작업이 없습니다.</p>}
            </div>
          </aside>
          {showTaskList && (
            <div role="separator" tabIndex={0} aria-orientation="vertical" aria-label="일정 배치 목록 너비"
              aria-controls={taskListId} aria-valuemin={minTaskListWidth} aria-valuemax={maxTaskListWidth} aria-valuenow={taskListWidth}
              title="드래그하여 작업 목록 너비 조절"
              className="group relative z-20 hidden touch-none cursor-col-resize select-none items-center justify-center bg-border outline-none before:absolute before:inset-y-0 before:left-1/2 before:w-4 before:-translate-x-1/2 before:content-[''] hover:bg-muted-foreground/50 focus-visible:bg-ring active:bg-ring lg:flex"
              onPointerDown={event => {
                if (event.button !== 0 || !event.isPrimary) return;
                panelResize.current = { pointerId: event.pointerId, x: event.clientX, width: taskListWidth };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={event => {
                const resize = panelResize.current;
                if (resize?.pointerId !== event.pointerId) return;
                resizeTaskList(resize.width + event.clientX - resize.x);
              }}
              onPointerUp={event => {
                const resize = panelResize.current;
                if (resize?.pointerId !== event.pointerId) return;
                panelResize.current = null;
                const width = resize.width + event.clientX - resize.x;
                if (width > collapseTaskListWidth) {
                  resizeTaskList(width);
                  return;
                }
                resizeTaskList(resize.width);
                setSelected(null);
                setShowTaskList(false);
              }}
              onLostPointerCapture={() => { panelResize.current = null; }}
              onKeyDown={event => {
                let next: number;
                switch (event.key) {
                  case "ArrowLeft": next = taskListWidth - 16; break;
                  case "ArrowRight": next = taskListWidth + 16; break;
                  case "Home": next = minTaskListWidth; break;
                  case "End": next = maxTaskListWidth; break;
                  default: return;
                }
                event.preventDefault();
                resizeTaskList(next);
              }}>
              <span aria-hidden="true" className="pointer-events-none absolute h-8 w-1.5 rounded-full border border-border bg-background group-hover:border-muted-foreground/50 group-focus-visible:border-ring" />
            </div>
          )}
          <section className={`min-w-0 overflow-hidden rounded-b-xl lg:rounded-bl-none lg:rounded-tr-xl ${showTaskList ? "border-t border-border lg:border-t-0" : "rounded-t-xl lg:rounded-bl-xl"}`} aria-label="간트 달력">
            <div className={`flex flex-wrap items-center gap-2 px-3 pt-5 pb-3 ${showTaskList ? "" : "pl-12"}`}>
              <Btn size="sm" aria-label="이전 기간" onClick={() => showPeriod(shift(range.start, -periodLength), periodLength)}>←</Btn>
              <span className="text-sm font-medium tabular-nums">
                {dragDates && dragFirst >= 0 ? `${dragDates.start} ~ ${dragDates.end}` : `${range.start} ~ ${range.end}`}
              </span>
              <Btn size="sm" aria-label="다음 기간" onClick={() => showPeriod(shift(range.end, 1), periodLength)}>→</Btn>
              <Btn size="sm" variant="ghost" onClick={() => showPeriod(today(), periodLength)}>오늘</Btn>
              <div className="ml-auto flex flex-wrap gap-2">
                <Btn size="sm" disabled={!canEdit} onClick={() => { setTemplateName(""); setPanel("template"); }}>템플릿 선택</Btn>
                <Btn size="sm" onClick={() => openSettings(range)}>달력 설정</Btn>
              </div>
            </div>
            {settings && preview && (
              <form key={editTask?.id ?? "view"} aria-label={editTask ? "작업 일정 수정" : "달력 설정"} className="border-y border-border bg-slate-50/80 px-4 py-4" onSubmit={event => {
                event.preventDefault();
                const length = gap(preview.start, preview.end);
                if (!Number.isFinite(length) || length < 0 || (!editTask && length > 92)) {
                  setPanel({
                    ...settings,
                    error: editTask ? "마감일은 시작일과 같거나 이후여야 합니다." : "시작일부터 종료일까지 최대 93일을 선택해주세요.",
                  });
                  return;
                }
                if (editTask) save(editTask, preview);
                else {
                  const values = new FormData(event.currentTarget);
                  setView(current => ({
                    ...current,
                    range: preview,
                    assignee: String(values.get("assignee") ?? ""),
                    weekends: values.has("weekends"),
                    showLinks: values.has("showLinks"),
                  }));
                  setSelected(null);
                }
                setPanel(null);
              }}>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-5">
                  <fieldset className="min-w-0 space-y-2">
                    <legend className="mb-2 text-sm font-semibold">{editTask ? editTask.title : "표시 기간"}</legend>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))] gap-2">
                      <label className="grid min-w-0 gap-1 text-xs text-muted-foreground">
                        {editTask ? "작업 시작일" : "시작일"}
                        <input className={`${field} min-w-0 w-full text-foreground`} type="date" required value={preview.start}
                          onChange={event => setPanel({ ...settings, range: { ...preview, start: event.target.value } })} />
                      </label>
                      <label className="grid min-w-0 gap-1 text-xs text-muted-foreground">
                        {editTask ? "작업 마감일" : "종료일"}
                        <input className={`${field} min-w-0 w-full text-foreground`} type="date" required value={preview.end}
                          onChange={event => setPanel({ ...settings, range: { ...preview, end: event.target.value } })} />
                      </label>
                    </div>
                    {!editTask && (
                      <div className="inline-flex flex-wrap gap-0.5 rounded-md border border-border bg-white p-0.5" role="group" aria-label="빠른 기간 선택">
                        {[7, 14, 30].map(length => (
                          <Btn size="sm" variant="ghost" type="button" key={length}
                            className="h-7 px-2.5 aria-pressed:bg-slate-100 aria-pressed:text-foreground"
                            disabled={!Number.isFinite(stamp(preview.start))}
                            aria-pressed={gap(preview.start, preview.end) + 1 === length}
                            onClick={() => setPanel({
                              ...settings, range: { ...preview, end: shift(preview.start, length - 1) }, error: "",
                            })}>
                            {length === 30 ? "30일" : length / 7 + "주"}
                          </Btn>
                        ))}
                      </div>
                    )}
                  </fieldset>
                  {!editTask && (
                    <fieldset className="min-w-0 space-y-2">
                      <legend className="mb-2 text-sm font-semibold">보기 옵션</legend>
                      <label className="grid gap-1 text-xs text-muted-foreground">
                        담당자
                        <select className={`${field} w-full text-foreground`} name="assignee" defaultValue={assignee}>
                          <option value="">전체 담당자</option>
                          {members.map(member => <option key={member.memberId} value={member.memberId}>{member.nickname}</option>)}
                        </select>
                      </label>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <label className="inline-flex min-h-8 items-center gap-1.5 text-sm">
                          <input className="accent-slate-900" name="weekends" type="checkbox" defaultChecked={weekends} />주말 표시
                        </label>
                        <label className="inline-flex min-h-8 items-center gap-1.5 text-sm">
                          <input className="accent-slate-900" name="showLinks" type="checkbox" defaultChecked={showLinks} />연결선 표시
                        </label>
                      </div>
                    </fieldset>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                  {settings.error && <p className="mr-auto text-sm text-red-700" role="alert">{settings.error}</p>}
                  <Btn type="button" size="sm" variant="ghost" onClick={() => setPanel(null)}>취소</Btn>
                  <Btn type="submit" size="sm" variant="primary" disabled={Boolean(editTask) && !canEdit}>
                    {editTask ? "일정 저장" : "적용"}
                  </Btn>
                </div>
              </form>
            )}
            <ul className={`flex flex-wrap gap-2 px-3 pb-3 text-xs ${settings ? "pt-3" : ""}`} aria-label="담당자 색상">
              {members.map((member, index) => <li key={member.memberId} className={`rounded px-2 py-1 ${colors[index % colors.length]}`}>{member.nickname}</li>)}
              <li className="rounded bg-slate-100 px-2 py-1 text-slate-900">미배정</li>
            </ul>
            {showLinks && links.error && <p className="px-3 pb-2 text-sm" role="alert">연결선을 불러오지 못했습니다. <Btn size="sm" onClick={links.retry}>다시 시도</Btn></p>}
            {!days.length && <p className="p-4 text-sm">표시할 날짜가 없습니다. 주말을 표시하거나 날짜 범위를 바꿔주세요.</p>}
            <div className="overflow-x-auto border-t border-border" tabIndex={0} aria-label="날짜 열을 좌우로 스크롤">
              <div style={{ width }}>
                <div className="flex">
                  {days.map(day => <button key={day} type="button" style={{ width: column }} aria-label={day + "에 배치"}
                    onClick={() => {
                      const task = visible.find(item => item.id === selected);
                      if (task) save(task, datesForDrop(task, day, "move"));
                    }}
                    className={`shrink-0 border-r border-border px-1 py-2 text-xs ${day === deadline ? "bg-violet-100 font-semibold" : "bg-slate-50"}`}>
                    {dateLabel.format(stamp(day))}{day === deadline && <span className="block">최종 제출</span>}
                  </button>)}
                </div>
                <div className="relative" style={{ height: chartHeight }}
                  onDragOver={event => {
                    if (!dragItem || !dragTask) return;
                    event.preventDefault();
                    const day = dateUnderPointer(event);
                    const dates = day ? datesForDrop(dragTask, day, dragItem.edge) : undefined;
                    const valid = dates && dates.start <= dates.end;
                    event.dataTransfer.dropEffect = valid ? "move" : "none";
                    setDropDay(valid ? day : null);
                  }}
                  onDragLeave={event => {
                    if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
                      setDropDay(null);
                    }
                  }}
                  onDrop={event => {
                    if (!dragItem || !dragTask) return;
                    event.preventDefault();
                    const day = dateUnderPointer(event);
                    if (day) save(dragTask, datesForDrop(dragTask, day, dragItem.edge));
                    clearDrag();
                  }}>
                  <div className="absolute inset-0 flex">
                    {days.map(day => <div key={day} style={{ width: column }}
                      className={`shrink-0 border-r border-border ${weekend(day) ? "bg-slate-50" : ""}`}
                    />)}
                  </div>
                  {showLinks && links.data && <svg aria-hidden="true" className="pointer-events-none absolute inset-0 text-slate-400" width={width} height={chartHeight}>
                    {links.data.flatMap(({ taskId, prerequisites }) => prerequisites.map(({ taskId: source }) => {
                      const from = scheduled.findIndex(item => item.task.id === source);
                      const to = scheduled.findIndex(item => item.task.id === taskId);
                      if (from < 0 || to < 0) return null;
                      const x1 = (scheduled[from].last + 1) * column - 8;
                      const x2 = scheduled[to].first * column + 8;
                      const y1 = from * row + row / 2;
                      const y2 = to * row + row / 2;
                      const exit = x1 + 5;
                      const entry = x2 - 7;
                      const gapY = y1 + Math.sign(y2 - y1) * row / 2;
                      const path = exit <= entry
                        ? `M ${x1} ${y1} H ${exit} V ${y2} H ${x2}`
                        : `M ${x1} ${y1} H ${exit} V ${gapY} H ${entry} V ${y2} H ${x2}`;
                      return (
                        <g key={`${source}-${taskId}`} stroke="currentColor" fill="none">
                          <path d={path} />
                          <circle cx={x1} cy={y1} r="3" fill="white" />
                          <path d={`M ${x2 - 4} ${y2 - 3} L ${x2} ${y2} L ${x2 - 4} ${y2 + 3}`} />
                        </g>
                      );
                    }))}
                  </svg>}
                  {scheduled.map(({ task, dates, first, last }, index) => {
                    const description = `${task.title} · ${task.assignees.map(member => member.nickname).join(", ") || "미배정"} · ${dates.start} ~ ${dates.end}`;
                    return <div key={task.id} className={`group absolute z-10 hover:z-20 focus-within:z-20 flex h-8 items-center rounded-md ${dragFirst >= 0 && dragItem?.id === task.id ? "opacity-0" : ""} ${blockColor(task)}`}
                      style={{ top: index * row + 6, left: first * column + 8, width: (last - first + 1) * column - 16 }}>
                      {hasEditPermission && <button type="button" disabled={!canEdit} className="h-full w-2 shrink-0 cursor-ew-resize border-r border-current/20 disabled:cursor-default" draggable={canEdit} aria-label={task.title + " 시작일 조정"} title="끌어서 시작일 조정" onDragStart={event => startDrag(event, { id: task.id, edge: "start" })} onDragEnd={clearDrag} onClick={() => openSettings(dates, task)} />}
                      <Link to={demo ? `/task/t${task.id}` : `${base}/tasks/${task.id}`} state={{ fromCalendar: true }} aria-label={description}
                        className="min-w-0 flex-1 truncate px-1.5 text-xs font-medium hover:underline" draggable={false}>{task.title}</Link>
                      {hasEditPermission && <button type="button" disabled={!canEdit} className="h-full w-2 shrink-0 cursor-ew-resize border-l border-current/20 disabled:cursor-default" draggable={canEdit} aria-label={task.title + " 마감일 조정"} title="끌어서 마감일 조정" onDragStart={event => startDrag(event, { id: task.id, edge: "end" })} onDragEnd={clearDrag} onClick={() => openSettings(dates, task)} />}
                      <span className={`pointer-events-none absolute top-full z-10 hidden w-max max-w-56 whitespace-normal rounded bg-slate-900 px-2 py-1 text-xs text-white shadow group-hover:block group-focus-within:block ${last >= days.length - 2 && first > 1 ? "right-0" : "left-0"}`} aria-hidden="true">{description}</span>
                    </div>;
                  })}
                  {dragTask && dragFirst >= 0 && <div aria-hidden="true"
                    className={`pointer-events-none absolute z-30 flex h-8 items-center rounded-md px-2.5 text-xs font-medium shadow-sm ring-1 ring-inset ring-current/15 ${blockColor(dragTask)}`}
                    style={{
                      top: (dragRow >= 0 ? dragRow : scheduled.length) * row + 6,
                      left: dragFirst * column + 8,
                      width: (dragLast - dragFirst + 1) * column - 16,
                    }}>
                    <span className="min-w-0 truncate">{dragTask.title}</span>
                  </div>}
                </div>
              </div>
            </div>
            <p className="sr-only" role="status">{action.busy ? "저장 중…" : ""}</p>
          </section>
        </div>
      </div>
    </section>
  );
}
