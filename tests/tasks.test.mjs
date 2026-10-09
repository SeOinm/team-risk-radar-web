import test from "node:test";
import assert from "node:assert/strict";
import { createTasksApi } from "../src/api/tasks.ts";
import { createApiClient } from "../src/api/client.ts";
const task = {
  id: 11,
  projectId: 2,
  title: "작업",
  size: "M",
  dueDate: null,
  sortOrder: 0,
  status: "TODO",
  progress: 0,
  assignees: [],
  updatedAt: "2026-10-09",
};
const child = {
  id: 15,
  taskId: 11,
  title: "하위 작업",
  completed: false,
  assigneeMemberId: null,
  assigneeNickname: null,
  sortOrder: 0,
};
test("task list/detail/create accept documented unwrapped response", async () => {
  const calls = [];
  const api = createTasksApi(async (path, options = {}) => {
    calls.push({ path, ...options });
    return path.endsWith("/tasks") && options.method !== "POST" ? [task] : task;
  });
  assert.deepEqual(await api.list(2), [task]);
  assert.equal((await api.detail(2, "11")).id, 11);
  const input = { title: "작업", size: "M", dueDate: null, sortOrder: null };
  await api.create(2, input);
  assert.deepEqual(calls[2], {
    path: "/projects/2/tasks",
    method: "POST",
    body: input,
  });
});
test("settings and assignment requests cannot update progress/status", async () => {
  const calls = [];
  const api = createTasksApi(async (path, options) => {
    calls.push({ path, ...options });
    return null;
  });
  const input = { title: "수정", size: "L", dueDate: null, sortOrder: null };
  await api.update(2, 11, input);
  await api.assignees(2, 11, [3]);
  await api.assignees(2, 11, []);
  await api.cancel(2, 11);
  assert.deepEqual(
    calls.map((c) => [c.path, c.method]),
    [
      ["/projects/2/tasks/11", "PUT"],
      ["/projects/2/tasks/11/assignees", "PUT"],
      ["/projects/2/tasks/11/assignees", "PUT"],
      ["/projects/2/tasks/11/cancel", "POST"],
    ],
  );
  assert.deepEqual(calls[1].body, { memberIds: [3] });
  assert.deepEqual(calls[2].body, { memberIds: [] });
  assert.equal("progress" in calls[0].body, false);
  assert.equal(calls[3].body, undefined);
});
test("sub-task CRUD and completion use member ID, null unassignment and completed only", async () => {
  const calls = [];
  const api = createTasksApi(async (path, options = {}) => {
    calls.push({ path, ...options });
    return options.method === "POST" ? child : options.method ? null : [child];
  });
  assert.deepEqual(await api.children(2, 11), [child]);
  await api.addChild(2, 11, { title: "하위 작업", assigneeMemberId: 3 });
  await api.updateChild(2, 11, 15, {
    title: "수정",
    assigneeMemberId: null,
    sortOrder: 0,
  });
  await api.completion(2, 11, 15, true);
  await api.deleteChild(2, 11, 15);
  assert.equal(calls[3].path, "/projects/2/tasks/11/sub-tasks/15/completion");
  assert.equal(calls[3].method, "PATCH");
  assert.deepEqual(calls[3].body, { completed: true });
  assert.equal(calls[2].body.assigneeMemberId, null);
  assert.equal(calls[4].method, "DELETE");
});
test("templates are fetched from server and creation returns the new task list", async () => {
  const template = {
    template: "REPORT",
    name: "보고서",
    tasks: [{ title: "초안", size: "M" }],
  };
  const api = createTasksApi(async (path, options) => {
    if (path.endsWith("/templates")) return [template];
    assert.deepEqual(options.body, { template: "REPORT", dueDate: null });
    return [task];
  });
  assert.deepEqual(await api.templates(2), [template]);
  assert.deepEqual(await api.fromTemplate(2, "REPORT", null), [task]);
});
test("authorization, closed project and invalid success stay errors without automatic retry", async () => {
  for (const status of [401, 403, 409]) {
    let count = 0;
    const api = createTasksApi(
      createApiClient(
        "/api",
        () => "token",
        async () => {
          count++;
          return Response.json(
            { code: "TASK_NOT_WRITABLE", message: "수정 불가" },
            { status },
          );
        },
      ),
    );
    await assert.rejects(api.cancel(2, 11), (e) => e.status === status);
    assert.equal(count, 1);
  }
  await assert.rejects(
    createTasksApi(async () => [{ ...task, status: "UNKNOWN" }]).list(2),
    (e) => e.code === "INVALID_RESPONSE",
  );
  await assert.rejects(
    createTasksApi(async () => task).detail(2, "../3"),
    (e) => e.status === 404,
  );
});

test('drag order moves active tasks in both directions without mutating input or cancelled tasks', async () => {
  const {moveTask} = await import('../src/lib/taskOrder.ts');
  const items = [task, {...task,id:12,sortOrder:1}, {...task,id:13,sortOrder:2}, {...task,id:14,sortOrder:3,status:'CANCELLED'}];
  assert.deepEqual(moveTask(items,13,11).map(t=>t.id),[13,11,12]);
  assert.deepEqual(moveTask(items,11,13).map(t=>t.id),[12,13,11]);
  assert.deepEqual(moveTask(items,11,13,"before").map(t=>t.id),[12,11,13]);
  assert.deepEqual(moveTask(items,13,11,"after").map(t=>t.id),[11,13,12]);
  assert.deepEqual(moveTask(items,14,11),[]);
  assert.deepEqual(moveTask(items,11,11),[]);
  assert.deepEqual(items.map(t=>t.id),[11,12,13,14]);
});
