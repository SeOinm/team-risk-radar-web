import { apiRequest, ApiError } from "./client.ts";

export interface CheckinRound {
  id: number;
  projectId: number;
  scheduledDate: string;
  opensAt: string;
  deadlineAt: string;
  lateUntilAt: string;
}
export interface CheckinSnapshot {
  taskId: number;
  title: string;
  size: string;
  status: string;
  progress: number;
  totalChildren: number;
  completedChildren: number;
  issue: { open: boolean; content: string | null; revision: number } | null;
  requestToTeam: string | null;
  nextAction: string | null;
}
export interface CheckinTarget {
  taskId: number;
  titleAtOpen: string;
  excludedReason: string | null;
  version: string | null;
  current: CheckinSnapshot | null;
}
export interface CurrentCheckin {
  round: CheckinRound | null;
  serverTime: string;
  phase: "NOT_OPEN" | "ON_TIME" | "LATE" | "CLOSED" | null;
  canSubmit: boolean;
  canEdit: boolean;
  unavailableReason: string | null;
  targets: CheckinTarget[];
  submission: {
    roundId: number;
    revision: number;
    late: boolean;
    submittedAt: string;
    updatedAt: string;
    tasks: CheckinSnapshot[];
  } | null;
}
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const nullableString = (v: unknown) => v === null || typeof v === "string";
function snapshot(v: unknown): boolean {
  return (
    object(v) &&
    Number.isSafeInteger(v.taskId) &&
    typeof v.title === "string" &&
    typeof v.status === "string" &&
    typeof v.progress === "number" &&
    v.progress >= 0 &&
    v.progress <= 100 &&
    Number.isSafeInteger(v.totalChildren) &&
    Number.isSafeInteger(v.completedChildren) &&
    nullableString(v.requestToTeam) &&
    nullableString(v.nextAction) &&
    (v.issue === null ||
      (object(v.issue) &&
        typeof v.issue.open === "boolean" &&
        Number.isSafeInteger(v.issue.revision) &&
        nullableString(v.issue.content)))
  );
}
export interface CheckinEntry {
  taskId: number;
  expectedVersion: string;
  expectedIssueRevision?: number;
  issueContent?: string;
  requestToTeam?: string;
  nextAction?: string;
}
export interface CheckinSubmissionInput {
  requestKey: string;
  expectedRevision: number;
  tasks: CheckinEntry[];
}
export type FirstCheckinSubmission = CheckinSubmissionInput & {
  expectedRevision: 0;
};
function id(value: number) {
  if (!Number.isSafeInteger(value) || value < 1)
    throw new ApiError(
      400,
      "INVALID_REQUEST",
      "올바른 프로젝트·체크인 회차가 필요합니다.",
    );
  return value;
}
export function createCheckinsApi(request = apiRequest) {
  return {
    async current(
      projectId: number,
      signal?: AbortSignal,
    ): Promise<CurrentCheckin> {
      const data = await request(
        `/projects/${id(projectId)}/checkins/current`,
        { signal },
      );
      if (!data || typeof data !== "object" || Array.isArray(data))
        throw invalid();
      const v = data as Record<string, unknown>;
      if (
        !("round" in v) ||
        !("submission" in v) ||
        typeof v.serverTime !== "string" ||
        typeof v.canSubmit !== "boolean" ||
        typeof v.canEdit !== "boolean" ||
        !Array.isArray(v.targets) ||
        (v.phase !== null && typeof v.phase !== "string") ||
        (v.unavailableReason !== null &&
          typeof v.unavailableReason !== "string")
      )
        throw invalid();
      if (
        v.phase !== null &&
        !["NOT_OPEN", "ON_TIME", "LATE", "CLOSED"].includes(String(v.phase))
      )
        throw invalid();
      if (
        v.round !== null &&
        (!object(v.round) ||
          !Number.isSafeInteger(v.round.id) ||
          v.round.projectId !== projectId ||
          !["scheduledDate", "opensAt", "deadlineAt", "lateUntilAt"].every(
            (k) => typeof (v.round as Record<string, unknown>)[k] === "string",
          ))
      )
        throw invalid();
      if (
        !v.targets.every(
          (t) =>
            object(t) &&
            Number.isSafeInteger(t.taskId) &&
            typeof t.titleAtOpen === "string" &&
            nullableString(t.excludedReason) &&
            nullableString(t.version) &&
            (t.current === null || snapshot(t.current)) &&
            (t.excludedReason !== null ||
              (typeof t.version === "string" &&
                t.version.length === 64 &&
                object(t.current) &&
                t.current.taskId === t.taskId)),
        )
      )
        throw invalid();
      if (
        v.submission !== null &&
        (!object(v.submission) ||
          !Number.isSafeInteger(v.submission.roundId) ||
          !Number.isSafeInteger(v.submission.revision) ||
          typeof v.submission.late !== "boolean" ||
          typeof v.submission.submittedAt !== "string" ||
          !Array.isArray(v.submission.tasks) ||
          !v.submission.tasks.every(snapshot))
      )
        throw invalid();
      return v as unknown as CurrentCheckin;
    },
    async update(
      projectId: number,
      roundId: number,
      input: CheckinSubmissionInput,
    ) {
      if (
        !Number.isSafeInteger(input.expectedRevision) ||
        input.expectedRevision < 1 ||
        !input.tasks.length ||
        new Set(input.tasks.map((t) => t.taskId)).size !== input.tasks.length ||
        input.tasks.some(
          (t) =>
            !Number.isSafeInteger(t.taskId) ||
            t.taskId < 1 ||
            t.expectedVersion.length !== 64,
        )
      )
        throw new ApiError(
          400,
          "INVALID_REQUEST",
          "체크인 대상 작업과 버전을 확인해주세요.",
        );
      return request(
        `/projects/${id(projectId)}/checkins/${id(roundId)}/submission`,
        { method: "PUT", body: input },
      );
    },
    async submit(
      projectId: number,
      roundId: number,
      input: FirstCheckinSubmission,
    ) {
      // Caller must supply every server-designated target and keep the same key
      // and body when retrying an ambiguous outcome. Never automatically retry.
      if (
        input.expectedRevision !== 0 ||
        !input.tasks.length ||
        new Set(input.tasks.map((t) => t.taskId)).size !== input.tasks.length ||
        input.tasks.some(
          (t) =>
            !Number.isSafeInteger(t.taskId) ||
            t.taskId < 1 ||
            t.expectedVersion.length !== 64,
        )
      ) {
        throw new ApiError(
          400,
          "INVALID_REQUEST",
          "체크인 대상 작업과 버전을 확인해주세요.",
        );
      }
      return request(
        `/projects/${id(projectId)}/checkins/${id(roundId)}/submission`,
        {
          method: "POST",
          body: input,
        },
      );
    },
  };
}
function invalid() {
  return new ApiError(
    502,
    "INVALID_RESPONSE",
    "체크인 응답 형식을 확인할 수 없습니다.",
  );
}
export const checkinsApi = createCheckinsApi();
