import test from "node:test";
import assert from "node:assert/strict";
import { createTeamApi } from "../src/api/team.ts";
import { createApiClient } from "../src/api/client.ts";
const member = {
  id: 7,
  userId: 22,
  nickname: "팀원",
  role: "MEMBER",
  joinStatus: "PENDING",
  requestedAt: "2026-10-09",
  joinedAt: null,
  removedAt: null,
};
test("public preview does not require or send a token; membership uses Bearer", async () => {
  const calls = [];
  const api = createTeamApi(
    createApiClient(
      "/api",
      () => "secret",
      async (url, init) => {
        calls.push({ url, init });
        return Response.json(
          url.includes("/invites/")
            ? {
                projectId: 2,
                projectTitle: "프로젝트",
                expiresAt: "2026-12-01",
              }
            : member,
        );
      },
    ),
  );
  await api.preview("a/b?");
  await api.membership(2);
  assert.equal(calls[0].url, "/api/invites/a%2Fb%3F");
  assert.equal(calls[0].init.headers.Authorization, undefined);
  assert.equal(calls[1].init.headers.Authorization, "Bearer secret");
});
test("mutations use membership id and exact methods/fields", async () => {
  const calls = [];
  const api = createTeamApi(async (path, options) => {
    calls.push({ path, ...options });
    return null;
  });
  await api.approve(2, 7);
  await api.reject(2, 7);
  await api.role(2, 7, "CO_LEADER");
  await api.remove(2, 7);
  await api.revoke(2, 9);
  await api.join("a/b");
  assert.deepEqual(
    calls.map((c) => [c.path, c.method]),
    [
      ["/projects/2/members/7/approve", "POST"],
      ["/projects/2/members/7/reject", "POST"],
      ["/projects/2/members/7/role", "PATCH"],
      ["/projects/2/members/7", "DELETE"],
      ["/projects/2/invite-links/9", "DELETE"],
      ["/invites/a%2Fb/join", "POST"],
    ],
  );
  assert.deepEqual(calls[2].body, { role: "CO_LEADER" });
  assert.equal(calls[5].body, undefined);
});
test("invite issuance sends expiry; valid current links remain structured", async () => {
  const link = {
    id: 9,
    projectId: 2,
    token: "test-token",
    expiresAt: "2026-12-01",
    createdAt: "2026-10-09",
  };
  const api = createTeamApi(async (path, options) => {
    if (options.method === "POST")
      assert.deepEqual(options.body, { expiresInHours: 168 });
    return link;
  });
  assert.deepEqual(await api.issue(2), link);
  assert.deepEqual(await api.current(2), link);
});
test("only documented absence errors become empty; denied/expired/conflict errors remain errors", async () => {
  const build = (status, code) =>
    createTeamApi(
      createApiClient(
        "/api",
        () => "token",
        async () => Response.json({ code, message: "test" }, { status }),
      ),
    );
  assert.equal(await build(404, "MEMBER_NOT_FOUND").membership(2), null);
  assert.equal(await build(404, "INVITE_NOT_FOUND").current(2), null);
  for (const [status, code] of [
    [403, "PROJECT_ACCESS_DENIED"],
    [404, "PROJECT_NOT_FOUND"],
    [409, "PROJECT_NOT_WRITABLE"],
    [410, "INVITE_UNAVAILABLE"],
  ])
    await assert.rejects(
      build(status, code).current(2),
      (e) => e.status === status,
    );
});
test("invalid payloads and ids cannot become actionable members", async () => {
  await assert.rejects(
    createTeamApi(async () => [{ ...member, role: "ADMIN" }]).members(2),
    (e) => e.code === "INVALID_RESPONSE",
  );
  await assert.rejects(
    createTeamApi(async () => ({})).preview("token"),
    (e) => e.code === "INVALID_RESPONSE",
  );
  await assert.rejects(
    createTeamApi(async () => null).remove(2, -1),
    (e) => e.status === 404,
  );
});
