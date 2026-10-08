import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient, ApiError } from '../src/api/client.ts';
import { createProjectsApi } from '../src/api/projects.ts';
const project = { id: 12, title: '테스트', className: null, deadline: '2026-12-20', checkinTime: '23:00:00', checkinFrequency: 2, checkinDays: ['MON', 'FRI'], status: 'CLOSED', myRole: 'CO_LEADER' };
test('list/detail read unwrapped server data and preserve closed state and role', async () => {
  const calls = [];
  const api = createProjectsApi(createApiClient('https://server/api/', () => 'token', async (url, init) => {
    calls.push({ url, init });
    return Response.json(url.endsWith('/projects') ? [project] : project);
  }));
  assert.deepEqual(await api.list(), [project]);
  assert.deepEqual(await api.detail('12'), project);
  assert.equal(calls[1].url, 'https://server/api/projects/12');
  assert.equal(calls[1].init.headers.Authorization, 'Bearer token');
  assert.equal(calls[1].init.body, undefined);
  assert.equal(calls[1].init.credentials, 'omit');
});
test('create sends the full documented JSON and returns the new id', async () => {
  const input = { title: '새 프로젝트', className: '', deadline: '2026-12-20', checkinTime: '23:59:00', checkinFrequency: 2, checkinDays: ['MON', 'FRI'] };
  const api = createProjectsApi(createApiClient('/api', () => 'token', async (url, init) => {
    assert.equal(url, '/api/projects'); assert.equal(init.method, 'POST');
    assert.deepEqual(JSON.parse(init.body), input);
    return Response.json({ ...project, ...input }, { status: 201 });
  }));
  assert.equal((await api.create(input)).id, 12);
});
test('missing session fails before a request; 401/403/404/409 keep status and field errors', async () => {
  await assert.rejects(createApiClient('/api', () => undefined, () => { throw Error('must not fetch'); })('/projects'), e => e.status === 401);
  for (const status of [401, 403, 404, 409]) {
    const api = createProjectsApi(createApiClient('/api', () => 'token', async () => Response.json({ code: 'SERVER_ERROR', message: '서버 오류', fieldErrors: { title: '확인 필요' } }, { status })));
    await assert.rejects(api.list(), e => e instanceof ApiError && e.status === status && e.fieldErrors.title === '확인 필요');
  }
});
test('invalid IDs and malformed success are not rendered as real projects', async () => {
  const api = createProjectsApi(async () => ({ data: [project] }));
  await assert.rejects(api.list(), e => e.code === 'INVALID_RESPONSE');
  await assert.rejects(api.detail('../auth/me'), e => e.code === 'PROJECT_NOT_FOUND');
  await assert.rejects(createProjectsApi(async () => [{ ...project, myRole: 'ADMIN' }]).list(), e => e.code === 'INVALID_RESPONSE');
});
test('network failures and aborts do not become empty projects', async () => {
  await assert.rejects(createApiClient('/api', () => 'token', async () => { throw Error('offline'); })('/projects'), e => e.code === 'NETWORK_ERROR');
  const controller = new AbortController(); controller.abort();
  await assert.rejects(createApiClient('/api', () => 'token', async (_, init) => { init.signal.throwIfAborted(); })('/projects', { signal: controller.signal }), e => e.name === 'AbortError');
});

test('update sends all settings; close has no body and accepts empty success responses', async () => {
  const calls = [];
  const api = createProjectsApi(createApiClient('/api', () => 'token', async (url, init) => {
    calls.push({ url, init }); return new Response(null, { status: 204 });
  }));
  const input = { title: '수정', className: '', deadline: '2026-12-20', checkinTime: '22:00:00', checkinFrequency: 1, checkinDays: ['SUN'] };
  await api.update('12', input); await api.close('12');
  assert.equal(calls[0].url, '/api/projects/12'); assert.equal(calls[0].init.method, 'PUT');
  assert.deepEqual(JSON.parse(calls[0].init.body), input);
  assert.equal(calls[1].url, '/api/projects/12/close'); assert.equal(calls[1].init.method, 'POST');
  assert.equal(calls[1].init.body, undefined); assert.equal(calls[1].init.headers['Content-Type'], undefined);
  await assert.rejects(api.close('../other'), e => e.code === 'PROJECT_NOT_FOUND');
});
test('write conflicts propagate without retrying update or close', async () => {
  let calls = 0;
  const api = createProjectsApi(createApiClient('/api', () => 'token', async () => {
    calls++; return Response.json({ code: 'PROJECT_NOT_WRITABLE', message: '종료된 프로젝트입니다.' }, { status: 409 });
  }));
  await assert.rejects(api.update('12', {}), e => e.status === 409);
  await assert.rejects(api.close('12'), e => e.code === 'PROJECT_NOT_WRITABLE');
  assert.equal(calls, 2);
});
