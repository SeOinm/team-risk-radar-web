import { useRef, useState } from "react";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/context";
export function useApiAction() {
  const { logout } = useAuth();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [notice, setNotice] = useState("");
  async function run(action: () => Promise<unknown>, refresh: () => void) {
    if (inFlight.current || locked) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice("처리가 완료되었습니다.");
      refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) logout();
      else {
        setError(e instanceof Error ? e.message : "처리하지 못했습니다.");
        if (e instanceof ApiError && [403, 404, 409, 410].includes(e.status))
          setLocked(true);
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return { busy, error, locked, notice, run };
}
