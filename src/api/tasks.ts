import { apiRequest, ApiError } from "./client.ts";
export const TASK_STATUS = {
  TODO: "시작 전",
  IN_PROGRESS: "진행 중",
  BLOCKED: "막힘",
  DONE: "완료",
  CANCELLED: "취소",
} as const;
export const TASK_SIZES = ["S", "M", "L", "XL"] as const;
export type TaskSize = (typeof TASK_SIZES)[number];
export interface TaskInput {
  title: string;
  size: TaskSize;
  dueDate: string | null;
  sortOrder?: number | null;
}
export interface Task extends TaskInput {
  id: number;
  projectId: number;
  status: keyof typeof TASK_STATUS;
  progress: number;
  sortOrder: number;
  assignees: { memberId: number; nickname: string; assignedAt: string }[];
  updatedAt: string;
}
export interface SubTask {
  id: number;
  taskId: number;
  title: string;
  completed: boolean;
  assigneeMemberId: number | null;
  assigneeNickname: string | null;
  sortOrder: number;
}
export interface SubTaskInput {
  title: string;
  assigneeMemberId: number | null;
  sortOrder?: number | null;
}
export interface TaskTemplate {
  template: string;
  name: string;
  tasks: { title: string; size: TaskSize }[];
}
export interface AssignmentHistory {
  id: number;
  memberId: number;
  nickname: string;
  action: "ASSIGN" | "UNASSIGN";
  changedByMemberId: number;
  changedByNickname: string;
  changedAt: string;
}
const invalid = () =>
  new ApiError(502, "INVALID_RESPONSE", "작업 응답 형식을 확인할 수 없습니다.");
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
function id(v: number | string) {
  if (!/^[1-9]\d*$/.test(String(v)))
    throw new ApiError(404, "TASK_NOT_FOUND", "작업을 찾을 수 없습니다.");
  return String(v);
}
function task(v: unknown): Task {
  if (
    !object(v) ||
    !Number.isSafeInteger(v.id) ||
    !Number.isSafeInteger(v.projectId) ||
    typeof v.title !== "string" ||
    !TASK_SIZES.includes(v.size as TaskSize) ||
    typeof v.status !== "string" ||
    !Object.hasOwn(TASK_STATUS, v.status) ||
    typeof v.progress !== "number" ||
    v.progress < 0 ||
    v.progress > 100 ||
    !Array.isArray(v.assignees) ||
    !v.assignees.every(
      (a) =>
        object(a) &&
        Number.isSafeInteger(a.memberId) &&
        typeof a.nickname === "string",
    ) ||
    (v.dueDate !== null && typeof v.dueDate !== "string")
  )
    throw invalid();
  return v as unknown as Task;
}
function child(v: unknown): SubTask {
  if (
    !object(v) ||
    !Number.isSafeInteger(v.id) ||
    !Number.isSafeInteger(v.taskId) ||
    typeof v.title !== "string" ||
    typeof v.completed !== "boolean" ||
    (v.assigneeMemberId !== null && !Number.isSafeInteger(v.assigneeMemberId))
  )
    throw invalid();
  return v as unknown as SubTask;
}
function array<T>(v: unknown, parse: (item: unknown) => T) {
  if (!Array.isArray(v)) throw invalid();
  return v.map(parse);
}
export function createTasksApi(request = apiRequest) {
  const base = (p: number) => `/projects/${id(p)}/tasks`;
  const path = (p: number, t: number | string) => `${base(p)}/${id(t)}`;
  return {
    async list(p: number, signal?: AbortSignal) {
      return array(await request(base(p), { signal }), task);
    },
    async detail(p: number, t: string, signal?: AbortSignal) {
      return task(await request(path(p, t), { signal }));
    },
    async create(p: number, input: TaskInput) {
      return task(await request(base(p), { method: "POST", body: input }));
    },
    async update(p: number, t: number, input: TaskInput) {
      await request(path(p, t), { method: "PUT", body: input });
    },
    async cancel(p: number, t: number) {
      await request(path(p, t) + "/cancel", { method: "POST" });
    },
    async assignees(p: number, t: number, memberIds: number[]) {
      await request(path(p, t) + "/assignees", {
        method: "PUT",
        body: { memberIds },
      });
    },
    async histories(p: number, t: number, signal?: AbortSignal) {
      return array(
        await request(path(p, t) + "/assignee-histories", { signal }),
        (v) => {
          if (
            !object(v) ||
            !Number.isSafeInteger(v.id) ||
            !Number.isSafeInteger(v.memberId) ||
            typeof v.nickname !== "string" ||
            !["ASSIGN", "UNASSIGN"].includes(String(v.action)) ||
            typeof v.changedAt !== "string"
          )
            throw invalid();
          return v as unknown as AssignmentHistory;
        },
      );
    },
    async templates(p: number, signal?: AbortSignal) {
      return array(await request(base(p) + "/templates", { signal }), (v) => {
        if (
          !object(v) ||
          typeof v.template !== "string" ||
          typeof v.name !== "string" ||
          !Array.isArray(v.tasks) ||
          !v.tasks.every(
            (t) =>
              object(t) &&
              typeof t.title === "string" &&
              TASK_SIZES.includes(t.size as TaskSize),
          )
        )
          throw invalid();
        return v as unknown as TaskTemplate;
      });
    },
    async fromTemplate(p: number, template: string, dueDate: string | null) {
      return array(
        await request(base(p) + "/from-template", {
          method: "POST",
          body: { template, dueDate },
        }),
        task,
      );
    },
    async children(p: number, t: number, signal?: AbortSignal) {
      return array(await request(path(p, t) + "/sub-tasks", { signal }), child);
    },
    async addChild(p: number, t: number, input: SubTaskInput) {
      return child(
        await request(path(p, t) + "/sub-tasks", {
          method: "POST",
          body: input,
        }),
      );
    },
    async updateChild(p: number, t: number, c: number, input: SubTaskInput) {
      await request(path(p, t) + `/sub-tasks/${id(c)}`, {
        method: "PUT",
        body: input,
      });
    },
    async deleteChild(p: number, t: number, c: number) {
      await request(path(p, t) + `/sub-tasks/${id(c)}`, { method: "DELETE" });
    },
    async completion(p: number, t: number, c: number, completed: boolean) {
      await request(path(p, t) + `/sub-tasks/${id(c)}/completion`, {
        method: "PATCH",
        body: { completed },
      });
    },
  };
}
export const tasksApi = createTasksApi();
