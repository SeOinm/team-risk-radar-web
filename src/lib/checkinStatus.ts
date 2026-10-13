export function checkinStatusLabel(status: string) {
  return (
    (
      {
        ON_TIME: "정시 제출",
        LATE: "지각 제출",
        MISSED: "미제출",
        PENDING: "제출 대기",
        SUBMITTED: "제출 완료",
        NOT_ELIGIBLE: "대상 아님",
        EXCLUDED: "제외",
      } as Record<string, string>
    )[status] ?? status
  );
}
