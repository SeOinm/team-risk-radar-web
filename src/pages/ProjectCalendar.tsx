import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Link, Navigate, useParams } from "react-router";
import { ApiError } from "@/api/client";
import { tasksApi, type Task } from "@/api/tasks";
import type { ProjectResponse } from "@/api/projects";
import { TaskForm } from "@/components/TaskForm";
import { Btn } from "@/components/ds";
import { useApiAction } from "@/hooks/useApiAction";
import { useApiQuery } from "@/hooks/useApiQuery";

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

export function ProjectCalendar() {
  const { projectId = "" } = useParams();
  return <Navigate to={`/projects/${projectId}/tasks`} replace />;
}

export function ProjectCalendarPanel({ project, query }: {
  project: ProjectResponse;
  query: ReturnType<typeof useApiQuery<Task[]>>;
}) {
  const base = `/projects/${project.id}`;
  const storageKey = `risense:project-calendar:starts:${project.id}`;
  const [starts, setStarts] = useState(() => readStarts(storageKey));
  const deadline = datePart(project.deadline);
  const anchor = Number.isFinite(stamp(deadline)) ? deadline : today();
  const [view, setView] = useState(() => {
    const defaults = { range: { start: shift(anchor, -13), end: anchor }, weekends: true, showLinks: true, assignee: "" };
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey + ":view") ?? "null");
      const span = saved ? gap(saved.range.start, saved.range.end) : NaN;
      if (span >= 0 && span <= 92 && typeof saved.weekends === "boolean"
        && typeof saved.showLinks === "boolean" && typeof saved.assignee === "string") return saved as typeof defaults;
    } catch {
      // Keep the default view when browser storage is unavailable.
    }
    return defaults;
  });
  const { range, weekends, showLinks, assignee } = view;
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey + ":view", JSON.stringify(view));
    } catch {
      // Viewing the calendar does not require browser storage.
    }
  }, [storageKey, view]);
  const setRange = (next: Range) => setView(current => ({ ...current, range: next }));
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [preview, setPreview] = useState<Range | null>(null);
  const [panel, setPanel] = useState<"task" | "template" | "settings" | null>(null);
  const [settingsError, setSettingsError] = useState("");
  const [storageWarning, setStorageWarning] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateStart, setTemplateStart] = useState(() => shift(anchor, -13));
  const [templateWarning, setTemplateWarning] = useState("");
  const [templateDue, setTemplateDue] = useState(anchor);
  const [includeScheduled, setIncludeScheduled] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [dropDay, setDropDay] = useState<string | null>(null);
  const drag = useRef<Drag | null>(null);
  const action = useApiAction();
  const canEdit = project.myRole !== "MEMBER" && project.status === "IN_PROGRESS" && !action.busy && !action.locked;
  const tasks = useMemo(() => query.data?.filter(task => task.status !== "CANCELLED"), [query.data]);
  const loadLinks = useCallback(async (signal: AbortSignal) => {
    if (!tasks?.length || !showLinks) return [];
    return Promise.all(tasks.map(async task => ({
      taskId: task.id, prerequisites: await tasksApi.prerequisites(project.id, task.id, signal),
    })));
  }, [project.id, tasks, showLinks]);
  const links = useApiQuery(loadLinks);
  const loadTemplates = useCallback((signal: AbortSignal) =>
    panel === "template" ? tasksApi.templates(project.id, signal) : Promise.resolve([]), [project.id, panel]);
  const templates = useApiQuery(loadTemplates);
  const template = templates.data?.find(item => item.template === templateName) ?? templates.data?.[0];
  const templateSpan = gap(templateStart, templateDue);
  const validTemplateRange = templateSpan >= 0 && templateSpan <= 92;
  const plan = validTemplateRange && template ? template.tasks.map((task, index, items) => ({
    ...task,
    start: shift(templateStart, Math.round(templateSpan * index / items.length)),
    due: shift(templateStart, Math.round(templateSpan * (index + 1) / items.length)),
  })) : [];
  const members = [...new Map((tasks ?? []).flatMap(task => task.assignees.map(member => [member.memberId, member] as const))).values()].sort((a, b) => a.memberId - b.memberId);
  const visible = (tasks ?? []).filter(task => !assignee || task.assignees.some(member => String(member.memberId) === assignee));
  const placementTasks = includeScheduled ? visible : visible.filter(task => !task.dueDate);
  const days = Array.from({ length: gap(range.start, range.end) + 1 }, (_, i) => shift(range.start, i)).filter(date => weekends || !weekend(date));
  const scheduled = visible.flatMap(task => {
    const dates = taskRange(task, starts);
    if (!dates) return [];
    const first = days.findIndex(day => day >= dates.start && day <= dates.end);
    const last = days.findLastIndex(day => day >= dates.start && day <= dates.end);
    return first < 0 ? [] : [{ task, dates, first, last }];
  }).sort((a, b) => a.dates.start.localeCompare(b.dates.start) || a.task.sortOrder - b.task.sortOrder || a.task.id - b.task.id);
  const column = 82;
  const row = 44;
  const width = days.length * column;
  const chartHeight = Math.max(5, scheduled.length + 1) * row;

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
    }, () => {});
  }

  function applyTemplate() {
    if (!template || !canEdit || !plan.length) return;
    setTemplateWarning("");
    void action.run(async () => {
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
    }, () => { setPanel(null); showPeriod(templateStart, templateSpan + 1); query.retry(); });
  }

  function startDrag(event: DragEvent, item: Drag) {
    if (!canEdit) return;
    drag.current = item;
    event.dataTransfer.setData("text/plain", String(item.id));
    event.dataTransfer.effectAllowed = "move";
  }

  function clearDrag() {
    drag.current = null;
    setDropDay(null);
  }

  function place(date: string, item: Drag | null) {
    const task = tasks?.find(candidate => candidate.id === item?.id);
    if (!task || !item) return;
    const previous = taskRange(task, starts);
    if (item.edge === "start" && previous) return save(task, { start: date, end: previous.end });
    if (item.edge === "end" && previous) return save(task, { start: previous.start, end: date });
    save(task, { start: date, end: shift(date, previous ? gap(previous.start, previous.end) : 0) });
  }

  function showPeriod(start: string, length: number) {
    setRange({ start, end: shift(start, length - 1) });
  }

  return (
    <section aria-label="작업 흐름 달력">
      <div className="space-y-4">
        {action.error && <p role="alert">{action.error}</p>}
        {templateWarning && <p role="alert">{templateWarning}</p>}
        {storageWarning && <p role="alert">{storageWarning}</p>}
        {query.loading && <p role="status">작업을 불러오는 중…</p>}
        {query.error && <div role="alert">{query.error} <Btn onClick={query.retry}>다시 시도</Btn></div>}
        {panel === "settings" && preview && (
          <form className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4" onSubmit={event => {
            event.preventDefault();
            const length = gap(preview.start, preview.end);
            if (!Number.isFinite(length) || length < 0 || (!editTask && length > 92)) {
              setSettingsError(editTask ? "마감일은 시작일과 같거나 이후여야 합니다." : "시작일부터 종료일까지 최대 93일을 선택해주세요.");
              return;
            }
            if (editTask) save(editTask, preview);
            else setRange(preview);
            setPanel(null);
          }}>
            <label className="grid gap-1 text-sm">{editTask ? "작업 시작일" : "표시 시작일"}<input className={field} type="date" required value={preview.start} onChange={event => setPreview({ ...preview, start: event.target.value })} /></label>
            <label className="grid gap-1 text-sm">{editTask ? "작업 마감일" : "표시 종료일"}<input className={field} type="date" required value={preview.end} onChange={event => setPreview({ ...preview, end: event.target.value })} /></label>
            <Btn type="submit" disabled={Boolean(editTask) && !canEdit}>{editTask ? "일정 저장" : "범위 적용"}</Btn>
            <Btn type="button" onClick={() => setPanel(null)}>닫기</Btn>
            {settingsError && <p role="alert">{settingsError}</p>}
          </form>
        )}
        {panel === "template" && (
          <section className="space-y-3 rounded-lg border border-border p-4" aria-label="작업 템플릿 미리보기">
            {templates.loading && <p>템플릿을 불러오는 중…</p>}
            {templates.error && <p role="alert">{templates.error} <Btn onClick={templates.retry}>다시 시도</Btn></p>}
            {template && <>
              <label className="flex flex-wrap items-center gap-2 text-sm">템플릿<select className={field} value={template.template} onChange={event => setTemplateName(event.target.value)}>{templates.data?.map(item => <option key={item.template} value={item.template}>{item.name}</option>)}</select></label>
              <div className="flex flex-wrap gap-3">
                <label className="grid gap-1 text-sm">시작일<input type="date" className={field} value={templateStart} onChange={event => setTemplateStart(event.target.value)} /></label>
                <label className="grid gap-1 text-sm">최종 마감일<input type="date" className={field} value={templateDue} onChange={event => setTemplateDue(event.target.value)} /></label>
              </div>
              {!validTemplateRange && <p role="alert">시작일부터 마감일까지 최대 93일을 선택해주세요.</p>}
              <ol className="list-decimal pl-6 text-sm">
                {template.tasks.map((task, index) => <li key={index}>{task.title}{plan[index] && <span className="ml-2 text-muted-foreground">{plan[index].start} ~ {plan[index].due}</span>}</li>)}
              </ol>
              <Btn disabled={!canEdit || !plan.length} onClick={applyTemplate}>미리보기 일정으로 작업 추가</Btn>
            </>}
            {!templates.loading && !templates.error && !template && <p>사용할 수 있는 템플릿이 없습니다.</p>}
            <Btn onClick={() => setPanel(null)}>닫기</Btn>
          </section>
        )}
        <div className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">일정 배치</h2><Btn size="sm" disabled={!canEdit} onClick={() => setPanel("task")}>작업 추가</Btn></div>
            {panel === "task" && <TaskForm busy={action.busy} onCancel={() => setPanel(null)} onSave={input => {
              if (!canEdit) return;
              void action.run(() => tasksApi.create(project.id, input), () => { setPanel(null); query.retry(); });
            }} />}
            {visible.some(task => task.dueDate) && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={includeScheduled} onChange={event => {
                  setIncludeScheduled(event.target.checked);
                  setSelected(null);
                }} />
                배치된 작업도 보기
              </label>
            )}
            {placementTasks.map(task => (
              <button key={task.id} type="button" disabled={!canEdit} draggable={canEdit} aria-pressed={selected === task.id}
                className="block w-full rounded-md border border-border p-2 text-left text-sm aria-pressed:bg-blue-50"
                onDragStart={event => startDrag(event, { id: task.id, edge: "move" })} onDragEnd={clearDrag}
                onClick={() => setSelected(id => id === task.id ? null : task.id)}>
                <span className="block break-words font-medium">{task.title}</span>
                <span className="text-xs text-muted-foreground">{task.assignees.map(member => member.nickname).join(", ") || "미배정"} · {task.dueDate ? datePart(task.dueDate) : "일정 미정"}</span>
              </button>
            ))}
            {tasks && !placementTasks.length && <p className="text-sm text-muted-foreground">일정 미정 작업이 없습니다.</p>}
          </aside>
          <section className="min-w-0 rounded-xl border border-border" aria-label="간트 달력">
            <div className="flex flex-wrap items-center gap-2 p-3">
              <Btn size="sm" aria-label="이전 기간" onClick={() => showPeriod(shift(range.start, -gap(range.start, range.end) - 1), gap(range.start, range.end) + 1)}>←</Btn>
              <Btn size="sm" onClick={() => showPeriod(today(), gap(range.start, range.end) + 1)}>오늘</Btn>
              <Btn size="sm" aria-label="다음 기간" onClick={() => showPeriod(shift(range.end, 1), gap(range.start, range.end) + 1)}>→</Btn>
              <span className="text-sm font-medium">{range.start} ~ {range.end}</span>
              {[7, 14, 30].map(length => <Btn size="sm" key={length} aria-pressed={gap(range.start, range.end) + 1 === length}
                onClick={() => showPeriod(range.start, length)}>{length === 30 ? "30일" : length / 7 + "주"}</Btn>)}
              <select className={field} aria-label="담당자 필터" value={assignee} onChange={event => { setView({ ...view, assignee: event.target.value }); setSelected(null); }}>
                <option value="">전체 담당자</option>{members.map(member => <option key={member.memberId} value={member.memberId}>{member.nickname}</option>)}
              </select>
              <label className="text-sm"><input type="checkbox" checked={weekends} onChange={event => setView({ ...view, weekends: event.target.checked })} /> 주말</label>
              <label className="text-sm"><input type="checkbox" checked={showLinks} onChange={event => setView({ ...view, showLinks: event.target.checked })} /> 연결선</label>
              <div className="ml-auto flex flex-wrap gap-2">
                <Btn size="sm" disabled={!canEdit} onClick={() => { setTemplateName(""); setPanel("template"); }}>템플릿 선택</Btn>
                <Btn size="sm" onClick={() => { setEditTask(null); setPreview(range); setSettingsError(""); setPanel("settings"); }}>달력 설정</Btn>
              </div>
            </div>
            <ul className="flex flex-wrap gap-2 px-3 pb-3 text-xs" aria-label="담당자 색상">
              {members.map((member, index) => <li key={member.memberId} className={`rounded px-2 py-1 ${colors[index % colors.length]}`}>{member.nickname}</li>)}
              <li className="rounded bg-slate-100 px-2 py-1 text-slate-900">미배정</li>
            </ul>
            {showLinks && links.error && <p className="px-3 pb-2 text-sm" role="alert">연결선을 불러오지 못했습니다. <Btn size="sm" onClick={links.retry}>다시 시도</Btn></p>}
            {!days.length && <p className="p-4 text-sm">표시할 날짜가 없습니다. 주말을 표시하거나 날짜 범위를 바꿔주세요.</p>}
            <div className="overflow-x-auto border-t border-border" tabIndex={0} aria-label="날짜 열을 좌우로 스크롤">
              <div style={{ width }}>
                <div className="flex">
                  {days.map(day => <button key={day} type="button" style={{ width: column }} aria-label={day + "에 배치"}
                    onClick={() => selected !== null && place(day, { id: selected, edge: "move" })}
                    className={`shrink-0 border-r border-border px-1 py-2 text-xs ${day === deadline ? "bg-violet-100 font-semibold" : "bg-slate-50"}`}>
                    {dateLabel.format(stamp(day))}{day === deadline && <span className="block">최종 제출</span>}
                  </button>)}
                </div>
                <div className="relative" style={{ height: chartHeight }}>
                  <div className="absolute inset-0 flex">
                    {days.map(day => <div key={day} style={{ width: column }}
                      className={`shrink-0 border-r border-border ${dropDay === day ? "bg-blue-100" : weekend(day) ? "bg-slate-50" : ""}`}
                      onDragOver={event => { if (drag.current) { event.preventDefault(); setDropDay(day); } }}
                      onDrop={event => { event.preventDefault(); place(day, drag.current); clearDrag(); }}
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
                      return <g key={`${source}-${taskId}`} stroke="currentColor" fill="white"><path d={`M ${x1} ${y1} H ${x1 + 5} V ${y2} H ${x2}`} fill="none" /><circle cx={x1} cy={y1} r="3" /><circle cx={x2} cy={y2} r="3" /></g>;
                    }))}
                  </svg>}
                  {scheduled.map(({ task, dates, first, last }, index) => {
                    const owner = members.findIndex(member => member.memberId === task.assignees[0]?.memberId);
                    const description = `${task.title} · ${task.assignees.map(member => member.nickname).join(", ") || "미배정"} · ${dates.start} ~ ${dates.end}`;
                    return <div key={task.id} className={`group absolute z-10 hover:z-20 focus-within:z-20 flex h-8 items-center rounded-md ${owner < 0 ? "bg-slate-100 text-slate-900" : colors[owner % colors.length]}`}
                      style={{ top: index * row + 6, left: first * column + 8, width: (last - first + 1) * column - 16 }}
                      onDragOver={event => { if (drag.current) event.preventDefault(); }}
                      onDrop={event => {
                        if (!drag.current) return;
                        event.preventDefault();
                        const bounds = event.currentTarget.getBoundingClientRect();
                        const day = days[Math.min(last, first + Math.floor((event.clientX - bounds.left + 8) / column))];
                        if (day) place(day, drag.current);
                        clearDrag();
                      }}>
                      {canEdit && <button type="button" className="h-full w-2 shrink-0 cursor-ew-resize border-r border-current/20" draggable aria-label={task.title + " 시작일 조정"} title="끌어서 시작일 조정" onDragStart={event => startDrag(event, { id: task.id, edge: "start" })} onDragEnd={clearDrag} onClick={() => { setSelected(null); setEditTask(task); setPreview(dates); setSettingsError(""); setPanel("settings"); }} />}
                      <Link to={`${base}/tasks/${task.id}`} state={{ fromCalendar: true }} aria-label={description}
                        className="min-w-0 flex-1 truncate px-1.5 text-xs font-medium hover:underline" draggable={false}>{task.title}</Link>
                      {canEdit && <button type="button" className="h-full w-2 shrink-0 cursor-ew-resize border-l border-current/20" draggable aria-label={task.title + " 마감일 조정"} title="끌어서 마감일 조정" onDragStart={event => startDrag(event, { id: task.id, edge: "end" })} onDragEnd={clearDrag} onClick={() => { setSelected(null); setEditTask(task); setPreview(dates); setSettingsError(""); setPanel("settings"); }} />}
                      <span className={`pointer-events-none absolute top-full z-10 hidden w-max max-w-56 whitespace-normal rounded bg-slate-900 px-2 py-1 text-xs text-white shadow group-hover:block group-focus-within:block ${last >= days.length - 2 && first > 1 ? "right-0" : "left-0"}`} aria-hidden="true">{description}</span>
                    </div>;
                  })}
                </div>
              </div>
            </div>
            {action.busy && <p className="border-t border-border p-3 text-xs text-muted-foreground" role="status">저장 중…</p>}
          </section>
        </div>
      </div>
    </section>
  );
}
