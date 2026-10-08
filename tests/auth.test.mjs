import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthApi, AuthApiError } from '../src/api/auth.ts';
import { createSessionStore, SESSION_KEY } from '../src/auth/session.ts';
import { validateAuthInput } from '../src/auth/validation.ts';

const user = {
  id: 11,
  email: 'student@example.com',
  nickname: '서인이',
  createdAt: '2026-10-08T10:00:00+09:00',
};
const credentials = {
  email: ' Student@Example.COM ',
  password: ' password123 ',
};

function transport(responses) {
  const requests = [];
  const api = createAuthApi(
    'https://api.example.com/api/',
    async (url, options) => {
      requests.push({ url, ...options });
      return responses.shift();
    },
  );
  return { api, requests };
}

test('register calls the documented path, normalizes email/nickname and never trims passwords', async () => {
  const { api, requests } = transport([Response.json(user, { status: 201 })]);
  assert.deepEqual(
    await api.register({ ...credentials, nickname: ' 서인이 ' }),
    user,
  );
  assert.equal(requests[0].url, 'https://api.example.com/api/auth/register');
  assert.equal(requests[0].method, 'POST');
  assert.deepEqual(JSON.parse(requests[0].body), {
    email: user.email,
    password: credentials.password,
    nickname: user.nickname,
  });
  assert.equal(requests[0].headers.Authorization, undefined);
  assert.equal(requests.length, 1); // registration must not implicitly log in
});

test('login reads the unwrapped response and me sends exactly one Bearer prefix', async () => {
  const response = {
    accessToken: 'test.jwt.token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user,
  };
  const { api, requests } = transport([
    Response.json(response),
    Response.json(user),
  ]);
  assert.deepEqual(await api.login(credentials), response);
  assert.equal(requests[0].url, 'https://api.example.com/api/auth/login');
  assert.equal(requests[0].headers.Authorization, undefined);
  assert.deepEqual(await api.me(response.accessToken), user);
  assert.equal(requests[1].url, 'https://api.example.com/api/auth/me');
  assert.equal(requests[1].method, 'GET');
  assert.equal(requests[1].headers.Authorization, 'Bearer test.jwt.token');
  assert.equal(requests[1].body, undefined);
  assert.equal(requests[1].credentials, 'omit');
});

test('server 400/401/409 field errors preserve error codes and readable messages', async () => {
  for (const [status, code] of [
    [400, 'INVALID_REQUEST'],
    [401, 'INVALID_CREDENTIALS'],
    [409, 'EMAIL_ALREADY_EXISTS'],
  ]) {
    const { api } = transport([
      Response.json(
        {
          code,
          message: 'server error',
          fieldErrors: { email: '이메일을 확인해주세요.' },
        },
        { status },
      ),
    ]);
    await assert.rejects(
      () => api.login(credentials),
      (error) => {
        assert.ok(error instanceof AuthApiError);
        assert.equal(error.status, status);
        assert.equal(error.code, code);
        assert.equal(error.fieldErrors.email, '이메일을 확인해주세요.');
        assert.notEqual(error.message, 'server error');
        return true;
      },
    );
  }
});

test('non-JSON gateway errors and network failures produce safe UI messages', async () => {
  const { api } = transport([
    new Response('<html>Bad gateway</html>', { status: 502 }),
  ]);
  await assert.rejects(
    () => api.login(credentials),
    (error) =>
      error instanceof AuthApiError &&
      error.status === 502 &&
      !error.message.includes('<html>'),
  );
  const offline = createAuthApi('/api', async () => {
    throw new TypeError('Failed to fetch');
  });
  await assert.rejects(
    () => offline.login(credentials),
    (error) => error.code === 'NETWORK_ERROR',
  );
});

test('malformed success responses cannot create an authenticated session', async () => {
  for (const payload of [
    { data: user },
    { accessToken: '', tokenType: 'Bearer', expiresIn: 3600, user },
    { accessToken: 'token', tokenType: 'Bearer', expiresIn: 0, user },
  ]) {
    const { api } = transport([Response.json(payload)]);
    await assert.rejects(
      () => api.login(credentials),
      (error) => error.code === 'INVALID_RESPONSE',
    );
  }
});

test('UTF-8 password size is checked independently of character count; login does not impose signup minimum', () => {
  assert.deepEqual(
    validateAuthInput({
      email: 'a@example.com',
      password: '가'.repeat(24),
      nickname: '학생',
    }),
    {},
  );
  assert.ok(
    validateAuthInput({
      email: 'a@example.com',
      password: '가'.repeat(25),
      nickname: '학생',
    }).password,
  );
  assert.ok(
    validateAuthInput({
      email: 'a@example.com',
      password: 'short',
      nickname: '학생',
    }).password,
  );
  assert.deepEqual(
    validateAuthInput({ email: 'a@example.com', password: 'short' }),
    {},
  );
  assert.ok(
    validateAuthInput({ email: 'bad email', password: '', nickname: ' ' })
      .email,
  );
  assert.ok(
    validateAuthInput({
      email: 'a@example.com',
      password: '12345678',
      nickname: ' ',
    }).nickname,
  );
});

test('session stores only token/expiry, survives reload, expires exactly at deadline and logs out', () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
  let now = 1000;
  const store = createSessionStore(storage, () => now);
  store.save({ accessToken: 'test-token', expiresAt: 4600 });
  assert.deepEqual(Object.keys(JSON.parse(data.get(SESSION_KEY))).sort(), [
    'accessToken',
    'expiresAt',
  ]);
  const restored = createSessionStore(storage, () => now);
  assert.equal(restored.read().accessToken, 'test-token');
  now = 4600;
  assert.equal(restored.read(), null);
  assert.equal(data.has(SESSION_KEY), false);
  store.save({ accessToken: 'other', expiresAt: 9000 });
  store.clear();
  assert.equal(store.read(), null);
  assert.equal(data.has(SESSION_KEY), false);
});

test('corrupt and unavailable browser storage do not crash authentication', () => {
  let removed = false;
  const broken = createSessionStore({
    getItem: () => '{invalid',
    setItem: () => {},
    removeItem: () => {
      removed = true;
    },
  });
  assert.equal(broken.read(), null);
  assert.ok(removed);
  const denied = createSessionStore(
    {
      getItem: () => {
        throw Error('denied');
      },
      setItem: () => {
        throw Error('denied');
      },
      removeItem: () => {
        throw Error('denied');
      },
    },
    () => 1,
  );
  denied.save({ accessToken: 'memory-only', expiresAt: 100 });
  assert.equal(denied.read().accessToken, 'memory-only');
  denied.clear();
  assert.equal(denied.read(), null);
});
