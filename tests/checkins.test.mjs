import test from "node:test";
import assert from "node:assert/strict";
import { createCheckinsApi } from "../src/api/checkins.ts";
import { ApiError } from "../src/api/client.ts";
const empty = {
  round: null,
  serverTime: "2026-10-10T11:02:52Z",
  phase: null,
  canSubmit: false,
  canEdit: false,
  unavailableReason: "NO_ROUND",
  targets: [],
  submission: null,
};
test("current accepts observed no-round response and rejects incomplete envelopes", async () => {
  const calls = [];
  const api = createCheckinsApi(async (path, options) => {
    calls.push({ path, options });
    return empty;
  });
  assert.deepEqual(await api.current(4), empty);
  assert.equal(calls[0].path, "/projects/4/checkins/current");
  await assert.rejects(
    createCheckinsApi(async () => ({ round: null })).current(4),
    (e) => e.code === "INVALID_RESPONSE",
  );
  await assert.rejects(api.current(-1), (e) => e.code === "INVALID_REQUEST");
});
test("first submission sends every provided target even with no edited fields", async () => {
  const calls = [];
  const api = createCheckinsApi(async (path, options) => {
    calls.push({ path, ...options });
    return null;
  });
  const input = {
    requestKey: "b75be95c-7904-4a6a-a171-c67c185b2e67",
    expectedRevision: 0,
    tasks: [
      { taskId: 3, expectedVersion: "a".repeat(64) },
      {
        taskId: 4,
        expectedVersion: "b".repeat(64),
        expectedIssueRevision: 0,
        issueContent: "지연",
        requestToTeam: "검토",
        nextAction: "수정",
      },
    ],
  };
  await api.submit(4, 10, input);
  assert.deepEqual(calls, [
    { path: "/projects/4/checkins/10/submission", method: "POST", body: input },
  ]);
  await assert.rejects(
    api.submit(4, 10, { ...input, tasks: [] }),
    (e) => e.code === "INVALID_REQUEST",
  );
  await assert.rejects(
    api.submit(4, 10, { ...input, tasks: [input.tasks[0], input.tasks[0]] }),
    (e) => e.code === "INVALID_REQUEST",
  );
});
test("submission failures propagate without retry or generating a new request key", async () => {
  let count = 0;
  const api = createCheckinsApi(async () => {
    count++;
    throw new ApiError(409, "CHECKIN_TASK_CHANGED", "변경됨");
  });
  await assert.rejects(
    api.submit(4, 10, {
      requestKey: "b75be95c-7904-4a6a-a171-c67c185b2e67",
      expectedRevision: 0,
      tasks: [{ taskId: 3, expectedVersion: "a".repeat(64) }],
    }),
    (e) => e.code === "CHECKIN_TASK_CHANGED",
  );
  assert.equal(count, 1);
});
test("current validates documented active targets and excluded items", async () => {
  const task = {
    taskId: 3,
    title: "작업",
    status: "TODO",
    progress: 0,
    totalChildren: 0,
    completedChildren: 0,
    issue: { open: false, content: null, revision: 0 },
    requestToTeam: null,
    nextAction: null,
  };
  const current = {
    ...empty,
    round: {
      id: 10,
      projectId: 4,
      scheduledDate: "2026-10-10",
      opensAt: "2026-10-10T00:00:00Z",
      deadlineAt: "2026-10-10T12:00:00Z",
      lateUntilAt: "2026-10-11T00:00:00Z",
    },
    phase: "ON_TIME",
    canSubmit: true,
    unavailableReason: null,
    targets: [
      {
        taskId: 3,
        titleAtOpen: "작업",
        excludedReason: null,
        version: "a".repeat(64),
        current: task,
      },
      {
        taskId: 4,
        titleAtOpen: "취소 작업",
        excludedReason: "CANCELLED",
        version: null,
        current: null,
      },
    ],
  };
  assert.equal(
    (await createCheckinsApi(async () => current).current(4)).targets.length,
    2,
  );
  await assert.rejects(
    createCheckinsApi(async () => ({
      ...current,
      targets: [{ ...current.targets[0], version: null }],
    })).current(4),
    (e) => e.code === "INVALID_RESPONSE",
  );
  await assert.rejects(
    createCheckinsApi(async () => ({
      ...current,
      submission: { tasks: [] },
    })).current(4),
    (e) => e.code === "INVALID_RESPONSE",
  );
});

test("timely edit sends latest revision and propagates late-edit rejection", async () => {
  const calls = [];
  const api = createCheckinsApi(async (path, options) => {
    calls.push({ path, ...options });
  });
  const body = {
    requestKey: "b75be95c-7904-4a6a-a171-c67c185b2e67",
    expectedRevision: 3,
    tasks: [
      {
        taskId: 3,
        expectedVersion: "a".repeat(64),
        expectedIssueRevision: 2,
        requestToTeam: "수정",
      },
    ],
  };
  await api.update(4, 10, body);
  assert.deepEqual(calls, [
    { path: "/projects/4/checkins/10/submission", method: "PUT", body },
  ]);
  await assert.rejects(
    api.update(4, 10, { ...body, expectedRevision: 0 }),
    (e) => e.code === "INVALID_REQUEST",
  );
  await assert.rejects(
    createCheckinsApi(async () => {
      throw new ApiError(409, "CHECKIN_LATE_EDIT_NOT_ALLOWED", "수정 불가");
    }).update(4, 10, body),
    (e) => e.code === "CHECKIN_LATE_EDIT_NOT_ALLOWED",
  );
});
