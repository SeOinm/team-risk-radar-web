import test from "node:test";
import assert from "node:assert/strict";
import { createCheckinOverviewApi } from "../src/api/checkinOverview.ts";
import { ApiError } from "../src/api/client.ts";
const issue = {
  taskId: 3,
  open: true,
  content: "검토 필요",
  revision: 2,
  reportedByMemberId: 7,
  reportedAt: "2026-10-11T00:00:00Z",
  resolvedByMemberId: null,
  resolvedAt: null,
};
const counts = {
  eligible: 0,
  submitted: 0,
  onTime: 0,
  late: 0,
  missed: 0,
  pending: 0,
  submissionRate: null,
};
test("summary preserves no denominator; status reads requested project/checkin", async () => {
  const api = createCheckinOverviewApi(async (path) =>
    path.endsWith("/summary")
      ? counts
      : {
          round: { id: 1, projectId: 5, scheduledDate: "2026-10-11" },
          summary: counts,
          members: [],
        },
  );
  assert.equal((await api.summary(5)).submissionRate, null);
  assert.equal((await api.status(5, 1)).summary.eligible, 0);
  await assert.rejects(api.status(5, 2), (e) => e.code === "INVALID_RESPONSE");
});
test("issue resolution sends only exact revision with PATCH and respects server conflicts", async () => {
  const calls = [];
  const api = createCheckinOverviewApi(async (path, options) => {
    calls.push({ path, ...options });
    return issue;
  });
  await api.issue(5, 3);
  await api.resolve(5, 3, 2);
  assert.deepEqual(calls[1], {
    path: "/projects/5/tasks/3/issue/resolve",
    method: "PATCH",
    body: { expectedRevision: 2 },
  });
  await assert.rejects(api.resolve(5, 3, -1));
  await assert.rejects(
    createCheckinOverviewApi(async () => {
      throw new ApiError(409, "VERSION_CONFLICT", "변경됨");
    }).resolve(5, 3, 2),
    (e) => e.status === 409,
  );
});

test("history cursor and member snapshots use documented shapes and preserve historical issue", async () => {
  const task = {
    taskId: 3,
    title: "과거 작업",
    status: "BLOCKED",
    progress: 50,
    totalChildren: 2,
    completedChildren: 1,
    issue: { open: true, content: "과거 이슈", revision: 2 },
    requestToTeam: "검토",
    nextAction: "수정",
  };
  const saved = {
    roundId: 10,
    revision: 1,
    late: false,
    submittedAt: "2026-10-11T00:00:00Z",
    updatedAt: "2026-10-11T00:00:00Z",
    tasks: [task],
  };
  const round = { id: 10, projectId: 5, scheduledDate: "2026-10-11" };
  let path;
  const api = createCheckinOverviewApi(async (url) => {
    path = url;
    return url.includes("/mine?")
      ? {
          items: [
            { round, status: "ON_TIME", targetCount: 1, submission: saved },
          ],
          nextBeforeRoundId: 10,
        }
      : {
          round,
          summary: counts,
          members: [
            {
              memberId: 7,
              nickname: "테스트",
              status: "ON_TIME",
              departed: true,
              targetCount: 1,
              submission: saved,
            },
          ],
        };
  });
  const history = await api.history(5, 20);
  assert.equal(path, "/projects/5/checkins/mine?limit=20&beforeRoundId=20");
  assert.equal(history.items[0].submission.tasks[0].issue.content, "과거 이슈");
  assert.equal(history.nextBeforeRoundId, 10);
  assert.equal((await api.status(5, 10)).members[0].departed, true);
  await assert.rejects(
    api.history(5, 10),
    (e) => e.code === "INVALID_RESPONSE",
  );
  await assert.rejects(
    createCheckinOverviewApi(async () => ({
      items: [{ round, status: "ON_TIME", targetCount: 1, submission: {} }],
      nextBeforeRoundId: null,
    })).history(5),
    (e) => e.code === "INVALID_RESPONSE",
  );
});
