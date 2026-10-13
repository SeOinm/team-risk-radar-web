import {
  isCheckinSnapshot,
  type CurrentCheckin,
  type CheckinRound,
} from "./checkins.ts";
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
export type CheckinSubmission = NonNullable<CurrentCheckin["submission"]>;
export interface CheckinHistory {
  round: CheckinRound;
  status: string;
  targetCount: number;
  submission: CheckinSubmission | null;
}
export interface MemberCheckinStatus {
  memberId: number;
  nickname: string;
  status: string;
  departed: boolean;
  targetCount: number;
  submission: CheckinSubmission | null;
}
function submission(v: unknown): CheckinSubmission | null {
  if (v === null) return null;
  if (
    !object(v) ||
    !Number.isSafeInteger(v.roundId) ||
    !Number.isSafeInteger(v.revision) ||
    typeof v.late !== "boolean" ||
    typeof v.submittedAt !== "string" ||
    typeof v.updatedAt !== "string" ||
    !Array.isArray(v.tasks) ||
    !v.tasks.every(isCheckinSnapshot)
  )
    throw invalid();
  return v as unknown as CheckinSubmission;
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
        members: v.members.map((m): MemberCheckinStatus => {
          if (
            !object(m) ||
            !Number.isSafeInteger(m.memberId) ||
            typeof m.nickname !== "string" ||
            typeof m.status !== "string" ||
            typeof m.departed !== "boolean" ||
            !Number.isSafeInteger(m.targetCount)
          )
            throw invalid();
          const saved = submission(m.submission);
          if (saved && saved.roundId !== r) throw invalid();
          return { ...m, submission: saved } as unknown as MemberCheckinStatus;
        }),
      };
    },
    async history(p: number, beforeRoundId?: number, signal?: AbortSignal) {
      const query = new URLSearchParams({ limit: "20" });
      if (beforeRoundId !== undefined)
        query.set("beforeRoundId", String(id(beforeRoundId)));
      const v = await request(`/projects/${id(p)}/checkins/mine?${query}`, {
        signal,
      });
      if (
        !object(v) ||
        !Array.isArray(v.items) ||
        (v.nextBeforeRoundId !== null &&
          (!Number.isSafeInteger(v.nextBeforeRoundId) ||
            Number(v.nextBeforeRoundId) < 1))
      )
        throw invalid();
      const items = v.items.map((h): CheckinHistory => {
        if (
          !object(h) ||
          !object(h.round) ||
          !Number.isSafeInteger(h.round.id) ||
          h.round.projectId !== p ||
          typeof h.round.scheduledDate !== "string" ||
          typeof h.status !== "string" ||
          !Number.isSafeInteger(h.targetCount)
        )
          throw invalid();
        const saved = submission(h.submission);
        if (saved && saved.roundId !== h.round.id) throw invalid();
        return { ...h, submission: saved } as unknown as CheckinHistory;
      });
      if (
        beforeRoundId !== undefined &&
        v.nextBeforeRoundId !== null &&
        Number(v.nextBeforeRoundId) >= beforeRoundId
      )
        throw invalid();
      return { items, nextBeforeRoundId: v.nextBeforeRoundId as number | null };
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
