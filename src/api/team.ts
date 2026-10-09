import { apiRequest, ApiError } from "./client.ts";
import { ROLE_LABELS } from "./projects.ts";
export type Role = keyof typeof ROLE_LABELS;
export type JoinStatus = "PENDING" | "APPROVED" | "REJECTED" | "REMOVED";
export interface Member {
  id: number;
  userId: number;
  nickname: string;
  role: Role;
  joinStatus: JoinStatus;
  requestedAt: string;
  joinedAt: string | null;
  removedAt: string | null;
}
export interface Invite {
  id: number;
  projectId: number;
  token: string;
  expiresAt: string;
  createdAt: string;
}
export interface Preview {
  projectId: number;
  projectTitle: string;
  expiresAt: string;
}
const invalid = () =>
  new ApiError(
    502,
    "INVALID_RESPONSE",
    "팀 관리 응답 형식을 확인할 수 없습니다.",
  );
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
function member(v: unknown): Member {
  if (
    !record(v) ||
    !Number.isSafeInteger(v.id) ||
    !Number.isSafeInteger(v.userId) ||
    typeof v.nickname !== "string" ||
    typeof v.role !== "string" ||
    !Object.hasOwn(ROLE_LABELS, v.role) ||
    !["PENDING", "APPROVED", "REJECTED", "REMOVED"].includes(
      String(v.joinStatus),
    )
  )
    throw invalid();
  return v as unknown as Member;
}
function invite(v: unknown): Invite {
  if (
    !record(v) ||
    !Number.isSafeInteger(v.id) ||
    !Number.isSafeInteger(v.projectId) ||
    typeof v.token !== "string" ||
    !v.token ||
    typeof v.expiresAt !== "string"
  )
    throw invalid();
  return v as unknown as Invite;
}
function id(value: string | number) {
  if (!/^[1-9]\d*$/.test(String(value)))
    throw new ApiError(404, "NOT_FOUND", "대상을 찾을 수 없습니다.");
  return String(value);
}
export function createTeamApi(request = apiRequest) {
  const path = (p: number) => `/projects/${id(p)}`;
  const list = async (url: string, signal?: AbortSignal) => {
    const data = await request(url, { signal });
    if (!Array.isArray(data)) throw invalid();
    return data.map(member);
  };
  return {
    members: (p: number, signal?: AbortSignal) =>
      list(`${path(p)}/members`, signal),
    pending: (p: number, signal?: AbortSignal) =>
      list(`${path(p)}/join-requests`, signal),
    async membership(p: number, signal?: AbortSignal) {
      try {
        return member(await request(`${path(p)}/membership`, { signal }));
      } catch (e) {
        if (
          e instanceof ApiError &&
          e.status === 404 &&
          e.code === "MEMBER_NOT_FOUND"
        )
          return null;
        throw e;
      }
    },
    async current(p: number, signal?: AbortSignal) {
      try {
        const v = await request(`${path(p)}/invite-links/current`, { signal });
        return v === null ? null : invite(v);
      } catch (e) {
        if (
          e instanceof ApiError &&
          e.status === 404 &&
          e.code === "INVITE_NOT_FOUND"
        )
          return null;
        throw e;
      }
    },
    async issue(p: number) {
      return invite(
        await request(`${path(p)}/invite-links`, {
          method: "POST",
          body: { expiresInHours: 168 },
        }),
      );
    },
    async revoke(p: number, i: number) {
      await request(`${path(p)}/invite-links/${id(i)}`, { method: "DELETE" });
    },
    async approve(p: number, m: number) {
      await request(`${path(p)}/members/${id(m)}/approve`, { method: "POST" });
    },
    async reject(p: number, m: number) {
      await request(`${path(p)}/members/${id(m)}/reject`, { method: "POST" });
    },
    async role(p: number, m: number, role: Role) {
      await request(`${path(p)}/members/${id(m)}/role`, {
        method: "PATCH",
        body: { role },
      });
    },
    async remove(p: number, m: number) {
      await request(`${path(p)}/members/${id(m)}`, { method: "DELETE" });
    },
    async preview(token: string, signal?: AbortSignal): Promise<Preview> {
      const v = await request(`/invites/${encodeURIComponent(token)}`, {
        signal,
        public: true,
      });
      if (
        !record(v) ||
        !Number.isSafeInteger(v.projectId) ||
        typeof v.projectTitle !== "string" ||
        typeof v.expiresAt !== "string"
      )
        throw invalid();
      return v as unknown as Preview;
    },
    async join(token: string) {
      await request(`/invites/${encodeURIComponent(token)}/join`, {
        method: "POST",
      });
    },
  };
}
export const teamApi = createTeamApi();
