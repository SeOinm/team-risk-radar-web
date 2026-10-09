import { useCallback, useEffect, useState } from "react";
import { teamApi } from "@/api/team";
import type { ProjectResponse } from "@/api/projects";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useTeamAction } from "@/hooks/useTeamAction";
import { Btn } from "@/components/ds";
export function InviteLinkPanel({
  project,
  reload,
}: {
  project: ProjectResponse;
  reload: () => void;
}) {
  const load = useCallback(
    (signal: AbortSignal) => teamApi.current(project.id, signal),
    [project.id],
  );
  const query = useApiQuery(load);
  const action = useTeamAction();
  const [confirm, setConfirm] = useState<"issue" | "revoke" | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const link = query.data;
  const url = link
    ? `${window.location.origin}/join?token=${encodeURIComponent(link.token)}`
    : "";
  const writable =
    project.status === "IN_PROGRESS" &&
    project.myRole !== "MEMBER" &&
    !action.locked;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 1000);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);
  const expired = link ? Date.parse(link.expiresAt) <= now : false;
  const refresh = () => {
    setConfirm(null);
    setCopyMessage("");
    query.retry();
  };
  return (
    <section className="border border-border rounded-md overflow-hidden">
      <div className="px-5 py-3 bg-muted border-b border-border text-sm font-semibold">
        초대 링크
      </div>
      <div className="p-5 space-y-3">
        {query.loading ? (
          <p role="status">초대 링크를 불러오고 있습니다…</p>
        ) : query.error ? (
          <>
            <p role="alert">{query.error}</p>
            <Btn onClick={query.retry}>다시 시도</Btn>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <input
                aria-label="초대 링크"
                readOnly
                value={url}
                placeholder="발급된 초대 링크가 없습니다"
                className="min-w-0 flex-1 border border-border rounded p-2 text-sm"
              />
              <Btn
                disabled={!link || expired || !writable || action.busy}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(url);
                    setCopyMessage("복사되었습니다.");
                  } catch {
                    setCopyMessage(
                      "복사하지 못했습니다. 링크를 직접 선택해 복사해주세요.",
                    );
                  }
                }}
              >
                복사
              </Btn>
            </div>
            {link && (
              <p className="text-xs text-muted-foreground">
                만료: {new Date(link.expiresAt).toLocaleString("ko-KR")}
                {expired ? " · 만료됨" : ""}
              </p>
            )}
            <div className="flex gap-2">
              <Btn
                disabled={!writable || action.busy}
                onClick={() =>
                  link
                    ? setConfirm("issue")
                    : void action.run(() => teamApi.issue(project.id), refresh)
                }
              >
                {link ? "링크 재생성" : "초대 링크 발급"}
              </Btn>
              {link && (
                <Btn
                  disabled={!writable || action.busy}
                  onClick={() => setConfirm("revoke")}
                >
                  링크 비활성화
                </Btn>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              링크는 7일간 유효합니다. 재생성하면 기존 링크로 새 가입을 요청할
              수 없습니다.
            </p>
          </>
        )}
        {confirm && (
          <div className="border border-border p-3 rounded space-y-2">
            <p>
              {confirm === "issue"
                ? "기존 링크를 무효화하고 새로 발급할까요?"
                : "현재 링크를 비활성화할까요?"}
            </p>
            <Btn disabled={action.busy} onClick={() => setConfirm(null)}>
              취소
            </Btn>{" "}
            <Btn
              disabled={action.busy || !writable}
              onClick={() =>
                void action.run(
                  () =>
                    confirm === "issue"
                      ? teamApi.issue(project.id)
                      : teamApi.revoke(project.id, link!.id),
                  refresh,
                )
              }
            >
              확인
            </Btn>
          </div>
        )}
        {copyMessage && <p role="status">{copyMessage}</p>}
        {action.notice && <p role="status">{action.notice}</p>}
        {action.error && <p role="alert">{action.error}</p>}
        {action.locked && <Btn onClick={reload}>최신 상태 불러오기</Btn>}
      </div>
    </section>
  );
}
