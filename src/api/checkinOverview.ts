import { apiRequest, ApiError } from "./client.ts";
export interface CheckinCounts {
  eligible: number;
  submitted: number;
  onTime: number;
  late: number;
  missed: number;
  pending: number;
  submissionRate: number | null;
}
export interface TaskIssue {
  taskId: number;
  open: boolean;
  content: string | null;
  revision: number;
  reportedByMemberId: number | null;
  reportedAt: string | null;
  resolvedByMemberId: number | null;
  resolvedAt: string | null;
}
function id(n: number) {
  if (!Number.isSafeInteger(n) || n < 1)
    throw new ApiError(400, "INVALID_REQUEST", "올바른 ID가 필요합니다.");
  return n;
}
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
function invalid() {
  return new ApiError(
    502,
    "INVALID_RESPONSE",
    "응답 형식을 확인할 수 없습니다.",
  );
}
function counts(v: unknown): CheckinCounts {
  if (
    !object(v) ||
    !["eligible", "submitted", "onTime", "late", "missed", "pending"].every(
      (k) => Number.isSafeInteger(v[k]) && Number(v[k]) >= 0,
    ) ||
    (v.submissionRate !== null && typeof v.submissionRate !== "number")
  )
    throw invalid();
  return v as unknown as CheckinCounts;
}
function issue(v: unknown): TaskIssue {
  if (
    !object(v) ||
    !Number.isSafeInteger(v.taskId) ||
    typeof v.open !== "boolean" ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 0 ||
    !["content", "reportedAt", "resolvedAt"].every(
      (k) => v[k] === null || typeof v[k] === "string",
    ) ||
    !["reportedByMemberId", "resolvedByMemberId"].every(
      (k) => v[k] === null || Number.isSafeInteger(v[k]),
    )
  )
    throw invalid();
  return v as unknown as TaskIssue;
}
export function createCheckinOverviewApi(request = apiRequest) {
  return {
    async summary(p: number, signal?: AbortSignal) {
      return counts(
        await request(`/projects/${id(p)}/checkins/summary`, { signal }),
      );
    },
    async status(p: number, r: number, signal?: AbortSignal) {
      const v = await request(`/projects/${id(p)}/checkins/${id(r)}/status`, {
        signal,
      });
      if (
        !object(v) ||
        !object(v.round) ||
        v.round.id !== r ||
        v.round.projectId !== p ||
        typeof v.round.scheduledDate !== "string" ||
        !Array.isArray(v.members)
      )
        throw invalid();
      return {
        summary: counts(v.summary),
        scheduledDate: v.round.scheduledDate,
        members: v.members as unknown[],
      };
    },
    async issue(p: number, t: number, signal?: AbortSignal) {
      const v = issue(
        await request(`/projects/${id(p)}/tasks/${id(t)}/issue`, { signal }),
      );
      if (v.taskId !== t) throw invalid();
      return v;
    },
    async resolve(p: number, t: number, expectedRevision: number) {
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
        throw new ApiError(400, "INVALID_REQUEST", "이슈 버전을 확인해주세요.");
      return issue(
        await request(`/projects/${id(p)}/tasks/${id(t)}/issue/resolve`, {
          method: "PATCH",
          body: { expectedRevision },
        }),
      );
    },
  };
}
export const checkinOverviewApi = createCheckinOverviewApi();
