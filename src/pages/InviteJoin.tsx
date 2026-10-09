import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { Btn } from "@/components/ds";
import { teamApi, type Preview } from "@/api/team";
import { useAuth } from "@/auth/context";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTeamAction } from "@/hooks/useTeamAction";
export function InviteJoin({ token }: { token: string }) {
  const load = useCallback(
    (signal: AbortSignal) => teamApi.preview(token, signal),
    [token],
  );
  const q = useApiQuery(load);
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAuth();
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <main className="w-full max-w-[390px] px-4 py-8 space-y-5">
        <BrandLogo />
        {q.loading ? (
          <p role="status">초대 링크를 확인하고 있습니다…</p>
        ) : q.error ? (
          <>
            <p role="alert">{q.error}</p>
            <Btn onClick={q.retry}>다시 확인</Btn>
            <Btn onClick={() => navigate("/projects")}>프로젝트 목록</Btn>
          </>
        ) : (
          q.data && (
            <>
              <section className="border border-border rounded-md p-4 space-y-2">
                <p className="text-xs text-muted-foreground">초대된 프로젝트</p>
                <h1>{q.data.projectTitle}</h1>
                <p className="text-xs text-muted-foreground">
                  링크 만료:{" "}
                  {new Date(q.data.expiresAt).toLocaleString("ko-KR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  마감일·체크인 일정·팀원 정보는 가입 승인 후 확인할 수
                  있습니다.
                </p>
              </section>
              <section className="border border-[#BFDBFE] bg-[#EFF6FF] rounded-md p-4 text-sm">
                로그인 → 가입 요청 → 팀장·공동 팀장 승인 후 프로젝트에 참여할 수
                있습니다.
              </section>
              {status === "checking" ? (
                <p role="status">로그인 확인 중…</p>
              ) : status === "authenticated" ? (
                <JoinActions key={token} token={token} preview={q.data} />
              ) : (
                <Btn
                  variant="primary"
                  onClick={() =>
                    navigate("/auth", {
                      state: { from: location.pathname + location.search },
                    })
                  }
                >
                  로그인 / 회원가입
                </Btn>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
}
function JoinActions({ token, preview }: { token: string; preview: Preview }) {
  const navigate = useNavigate();
  const load = useCallback(
    (signal: AbortSignal) => teamApi.membership(preview.projectId, signal),
    [preview.projectId],
  );
  const q = useApiQuery(load);
  const action = useTeamAction();
  const state = q.data?.joinStatus;
  const text =
    state === "PENDING"
      ? "승인 대기 중입니다. 팀장·공동 팀장의 승인 후 참여할 수 있습니다."
      : state === "APPROVED"
        ? "가입이 승인되었습니다."
        : state === "REJECTED"
          ? "가입 요청이 거절되었습니다. 다시 요청할 수 있습니다."
          : state === "REMOVED"
            ? "프로젝트에서 내보내기 처리되어 다시 가입할 수 없습니다."
            : "";
  return (
    <section className="space-y-3">
      {q.loading ? (
        <p role="status">가입 상태를 확인하고 있습니다…</p>
      ) : q.error ? (
        <>
          <p role="alert">{q.error}</p>
          <Btn onClick={q.retry}>가입 상태 다시 확인</Btn>
        </>
      ) : (
        <>
          {text && <p role="status">{text}</p>}
          {state === "APPROVED" ? (
            <Btn
              variant="primary"
              onClick={() =>
                navigate(`/projects/${preview.projectId}`, { replace: true })
              }
            >
              프로젝트로 이동
            </Btn>
          ) : state === "PENDING" ? (
            <Btn onClick={q.retry}>승인 상태 새로고침</Btn>
          ) : (
            state !== "REMOVED" && (
              <Btn
                variant="primary"
                disabled={action.busy || action.locked}
                onClick={() =>
                  void action.run(() => teamApi.join(token), q.retry)
                }
              >
                {action.busy
                  ? "요청 중…"
                  : state === "REJECTED"
                    ? "다시 가입 요청"
                    : "가입 요청하기"}
              </Btn>
            )
          )}
        </>
      )}
      {action.error && <p role="alert">{action.error}</p>}
      {action.locked && (
        <Btn onClick={() => window.location.reload()}>현재 상태 다시 확인</Btn>
      )}
    </section>
  );
}
