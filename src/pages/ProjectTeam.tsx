import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ProjectLoader } from "@/components/ProjectLoader";
import { InviteLinkPanel } from "@/components/InviteLinkPanel";
import { Btn, NavBack, RoleBadgeDs, AlertBanner } from "@/components/ds";
import { projectsApi, ROLE_LABELS, type ProjectResponse } from "@/api/projects";
import { teamApi, type Member, type Role } from "@/api/team";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTeamAction } from "@/hooks/useTeamAction";
import { useAuth } from "@/auth/context";

export function ProjectTeam({ inviteOnly = false }: { inviteOnly?: boolean }) {
  const { projectId = "" } = useParams();
  return (
    <ProjectLoader key={projectId} id={projectId}>
      {(project, reload) => (
        <TeamView
          key={`${project.id}:${project.updatedAt}:${project.myRole}`}
          project={project}
          reload={reload}
          inviteOnly={inviteOnly}
        />
      )}
    </ProjectLoader>
  );
}
function TeamView({
  project,
  reload,
  inviteOnly,
}: {
  project: ProjectResponse;
  reload: () => void;
  inviteOnly: boolean;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const load = useCallback(
    async (signal: AbortSignal) => {
      const current = await projectsApi.detail(String(project.id), signal);
      const [members, pending] = await Promise.all([
        teamApi.members(project.id, signal),
        current.myRole !== "MEMBER"
          ? teamApi.pending(project.id, signal)
          : Promise.resolve([]),
      ]);
      return { project: current, members, pending };
    },
    [project.id],
  );
  const q = useApiQuery(load);
  const action = useTeamAction();
  const [confirmation, setConfirmation] = useState<{
    member: Member;
    kind: "remove" | "role" | "reject";
    role?: Role;
  } | null>(null);
  const current = q.data?.project ?? project;
  const manager = current.myRole !== "MEMBER";
  const writable =
    manager &&
    current.status === "IN_PROGRESS" &&
    !action.locked &&
    !q.loading &&
    !q.error;
  const members = q.data?.members ?? [];
  const leaderCount = members.filter((m) => m.role === "LEADER").length;
  const refresh = () => {
    setConfirmation(null);
    q.retry();
  };
  return (
    <div className="min-h-screen bg-white">
      <header className="h-12 flex items-center border-b border-border">
        <NavBack fallback={`/projects/${project.id}`} />
        <span className="text-sm font-semibold">
          {inviteOnly ? "팀원 초대" : "팀원 관리"}
        </span>
        <span className="ml-auto mr-5 text-xs text-muted-foreground">
          {current.title}
        </span>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {manager && (
          <InviteLinkPanel
            key={`${current.status}:${current.myRole}`}
            project={current}
            reload={reload}
          />
        )}
        {!manager && (
          <p>
            팀원 목록을 조회할 수 있습니다. 초대·가입 승인은 팀장·공동 팀장만
            가능합니다.
          </p>
        )}
        {current.status !== "IN_PROGRESS" && (
          <p>완료·종료된 프로젝트는 팀원을 변경할 수 없습니다.</p>
        )}
        {action.error && (
          <p role="alert" className="text-destructive">
            {action.error}
          </p>
        )}
        {action.notice && <p role="status">{action.notice}</p>}
        {action.locked && <Btn onClick={reload}>최신 상태 불러오기</Btn>}
        {q.loading ? (
          <p role="status">팀원을 불러오고 있습니다…</p>
        ) : q.error ? (
          <div>
            <p role="alert">{q.error}</p>
            <Btn onClick={q.retry}>다시 시도</Btn>
          </div>
        ) : (
          <>
            {manager && (
              <section className="border border-[#FDE68A] bg-[#FFFBEB] rounded-md overflow-hidden">
                <h2 className="px-5 py-3">
                  가입 요청 ({q.data?.pending.length ?? 0}명)
                </h2>
                {!q.data?.pending.length && (
                  <p className="px-5 pb-4 text-sm">
                    승인 대기 중인 요청이 없습니다.
                  </p>
                )}
                {q.data?.pending.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-4 border-t border-[#FDE68A]"
                  >
                    <div className="flex-1">
                      <p>{m.nickname}</p>
                      <p className="text-xs text-muted-foreground">
                        요청{" "}
                        {m.requestedAt
                          ? new Date(m.requestedAt).toLocaleDateString("ko-KR")
                          : "—"}
                      </p>
                    </div>
                    <Btn
                      disabled={!writable || action.busy}
                      onClick={() =>
                        setConfirmation({ member: m, kind: "reject" })
                      }
                    >
                      거절
                    </Btn>
                    <Btn
                      variant="primary"
                      disabled={!writable || action.busy}
                      onClick={() =>
                        void action.run(
                          () => teamApi.approve(project.id, m.id),
                          refresh,
                        )
                      }
                    >
                      승인
                    </Btn>
                  </div>
                ))}
              </section>
            )}
            <AlertBanner
              level="info"
              title="팀장은 최소 1명이 남아있어야 합니다"
              desc="역할 변경은 팀장만 가능합니다. 공동 팀장은 일반 팀원만 내보낼 수 있습니다."
            />
            <section className="border border-border rounded-md overflow-hidden">
              <h2 className="px-5 py-3 bg-muted">
                팀원 목록 ({members.length}명)
              </h2>
              {members.map((m) => {
                const lastLeader = m.role === "LEADER" && leaderCount <= 1;
                const canRemove =
                  writable &&
                  !lastLeader &&
                  (current.myRole === "LEADER" || m.role === "MEMBER");
                return (
                  <div
                    key={m.id}
                    className="p-4 border-t border-border flex items-center gap-3 flex-wrap"
                  >
                    <div className="flex-1 min-w-40">
                      <div className="flex gap-2 items-center">
                        <span>{m.nickname}</span>
                        <RoleBadgeDs role={ROLE_LABELS[m.role]} />
                        {m.userId === user?.id && (
                          <span className="text-xs">(나)</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        가입{" "}
                        {m.joinedAt
                          ? new Date(m.joinedAt).toLocaleDateString("ko-KR")
                          : "—"}{" "}
                        · 작업 연결 대기 · 체크인 통계 보류
                      </p>
                    </div>
                    {!inviteOnly && (
                      <>
                        <Btn disabled size="sm">
                          참여 요약 · 보류
                        </Btn>
                        {current.myRole === "LEADER" && (
                          <select
                            aria-label={`${m.nickname} 역할`}
                            value={m.role}
                            disabled={!writable || action.busy || lastLeader}
                            onChange={(e) =>
                              setConfirmation({
                                member: m,
                                kind: "role",
                                role: e.target.value as Role,
                              })
                            }
                            className="text-sm border border-border p-1 rounded"
                          >
                            {Object.entries(ROLE_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        )}
                        {manager && (
                          <Btn
                            size="sm"
                            disabled={!canRemove || action.busy}
                            onClick={() =>
                              setConfirmation({ member: m, kind: "remove" })
                            }
                          >
                            내보내기
                          </Btn>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </section>
          </>
        )}
        <Btn onClick={() => navigate(`/projects/${project.id}`)}>
          프로젝트 상세로 이동
        </Btn>
      </main>
      {confirmation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-confirm-title"
            className="bg-white rounded-md border border-border p-6 max-w-sm w-full space-y-4"
          >
            <h2 id="team-confirm-title">
              {confirmation.kind === "remove"
                ? "팀원 내보내기"
                : confirmation.kind === "role"
                  ? "역할 변경"
                  : "가입 요청 거절"}
            </h2>
            <p>
              {confirmation.member.nickname}님
              {confirmation.kind === "role"
                ? `의 역할을 ${ROLE_LABELS[confirmation.role!]}(으)로 변경할까요?`
                : confirmation.kind === "remove"
                  ? "을 내보낼까요? 내보낸 팀원은 초대 링크로 다시 가입할 수 없습니다."
                  : "의 가입 요청을 거절할까요?"}
            </p>
            <div className="flex gap-2">
              <Btn disabled={action.busy} onClick={() => setConfirmation(null)}>
                취소
              </Btn>
              <Btn
                variant="danger"
                disabled={!writable || action.busy}
                onClick={() =>
                  void action.run(async () => {
                    const m = confirmation.member;
                    if (confirmation.kind === "remove")
                      await teamApi.remove(project.id, m.id);
                    else if (confirmation.kind === "role")
                      await teamApi.role(project.id, m.id, confirmation.role!);
                    else await teamApi.reject(project.id, m.id);
                    if (m.userId === user?.id && confirmation.kind === "remove")
                      navigate("/projects", { replace: true });
                  }, refresh)
                }
              >
                확인
              </Btn>
            </div>
            {action.error && <p role="alert">{action.error}</p>}
            {action.locked && <Btn onClick={reload}>최신 상태 불러오기</Btn>}
          </div>
        </div>
      )}
    </div>
  );
}
