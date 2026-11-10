const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createMealPlanner, validatePreferences, validatePlan } = require('../meal-planner');

const preferences = { goal: 'Build muscle', diet: 'Vegetarian', calories: 2000, days: 1, allergies: 'peanuts', preferences: 'Quick Pakistani meals' };
function validPlan(days = 1) {
  return { title: 'Your balanced day', summary: 'Simple meals that fit your routine.', days: Array.from({ length: days }, (_, i) => ({ day: i + 1, meals: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(type => ({ type, name: 'Lentil bowl', portion: '1 bowl (300g)', ingredients: ['150g lentils', '100g rice'], instructions: 'Cook and combine.', calories: 500, protein: 25, carbs: 60, fat: 17, prepMinutes: 20 })) })) };
}
function mockResponse() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
function handler(router, method = 'post', path = '/') {
  return router.stack.find(layer => layer.route?.path === path && layer.route.methods[method]).route.stack[0].handle;
}
function providerResponse(plan = validPlan()) {
  return { ok: true, json: async () => ({ model: 'test/free', choices: [{ message: { content: JSON.stringify(plan) } }] }) };
}

test('preferences accept explicit goals, exclusions, and 1/3/7 day lengths', () => {
  for (const days of [1, 3, 7]) assert.equal(validatePreferences({ ...preferences, days }).days, days);
  assert.equal(validatePreferences({ ...preferences, allergies: ' peanuts ' }).allergies, 'peanuts');
});

test('preferences reject unsafe ranges, unknown options, and oversized inputs', () => {
  for (const invalid of [{ calories: 500 }, { calories: '2000' }, { calories: 5000 }, { goal: 'Crash diet' }, { diet: 'unknown' }, { days: 2 }, { allergies: [] }, { allergies: 'a'.repeat(301) }, { preferences: 'x'.repeat(601) }]) {
    assert.throws(() => validatePreferences({ ...preferences, ...invalid }));
  }
});

test('plan validation enforces all meals, numeric nutrition, and calorie targets', () => {
  assert.equal(validatePlan(validPlan(), preferences).days[0].meals.length, 4);
  for (const mutate of [
    plan => { plan.days[0].meals.pop(); },
    plan => { plan.days[0].meals[0].protein = '25'; },
    plan => { plan.days[0].meals[0].fat = -3; },
    plan => { plan.days[0].meals[0].ingredients = []; },
    plan => { plan.days[0].meals[0].type = 'Dinner'; },
    plan => { plan.days[0].meals[0].calories = 2500; },
  ]) { const plan = validPlan(); mutate(plan); assert.throws(() => validatePlan(plan, preferences)); }
  assert.throws(() => validatePlan(validPlan(), { ...preferences, days: 3 }));
});

test('status never reveals server API key', () => {
  const response = mockResponse();
  handler(createMealPlanner({ apiKey: 'secret-test-key' }), 'get', '/status')({}, response);
  assert.equal(response.body.configured, true);
  assert.ok(!JSON.stringify(response.body).includes('secret-test-key'));
});

test('missing API key returns actionable setup message without contacting provider', async () => {
  let called = false;
  const response = mockResponse();
  await handler(createMealPlanner({ apiKey: '', fetchImpl: async () => { called = true; } }))({ body: preferences }, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, 'AI_NOT_CONFIGURED');
  assert.equal(called, false);
});

test('invalid input is rejected before provider calls', async () => {
  let called = false;
  const response = mockResponse();
  await handler(createMealPlanner({ apiKey: 'test', fetchImpl: async () => { called = true; } }))({ body: { ...preferences, calories: 100 } }, response);
  assert.equal(response.statusCode, 400);
  assert.equal(called, false);
});

test('AI route forwards all preferences and returns validated plan with provenance', async () => {
  let payload;
  const response = mockResponse();
  const router = createMealPlanner({ apiKey: 'secret', fetchImpl: async (url, options) => {
    assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
    assert.equal(options.headers.Authorization, 'Bearer secret');
    payload = JSON.parse(options.body);
    return providerResponse();
  } });
  await handler(router)({ body: preferences }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(payload.model, 'openrouter/free');
  assert.deepEqual(JSON.parse(payload.messages[1].content), preferences);
  assert.equal(response.body.source, 'ai');
  assert.equal(response.body.model, 'test/free');
  assert.equal(response.body.days.length, 1);
  assert.ok(response.body.createdAt);
  assert.ok(!JSON.stringify(response.body).includes('secret'));
});

test('7-day output has enough token budget and is validated in full', async () => {
  const response = mockResponse();
  const router = createMealPlanner({ apiKey: 'test', fetchImpl: async (_url, options) => {
    assert.equal(JSON.parse(options.body).max_tokens, 12000);
    return providerResponse(validPlan(7));
  } });
  await handler(router)({ body: { ...preferences, days: 7 } }, response);
  assert.equal(response.body.days.length, 7);
});

test('provider quota and authentication failures do not leak upstream details', async () => {
  for (const [upstreamStatus, expectedStatus] of [[429, 429], [401, 502], [403, 502], [500, 502]]) {
    const response = mockResponse();
    await handler(createMealPlanner({ apiKey: 'test', fetchImpl: async () => ({ ok: false, status: upstreamStatus }) }))({ body: preferences }, response);
    assert.equal(response.statusCode, expectedStatus);
    assert.equal(typeof response.body.error, 'string');
  }
});

test('malformed, empty, and incomplete model output return recoverable errors', async () => {
  for (const content of ['not json', '{}', null, JSON.stringify({ title: 'Incomplete' })]) {
    const response = mockResponse();
    await handler(createMealPlanner({ apiKey: 'test', fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { content } }] }) }) }))({ body: preferences }, response);
    assert.equal(response.statusCode, 502);
    assert.ok(response.body.error.startsWith('The AI'));
  }
});

test('timeout and network failures have clear errors', async () => {
  for (const [error, status] of [[new DOMException('Timeout', 'TimeoutError'), 504], [new Error('network secret detail'), 502]]) {
    const response = mockResponse();
    await handler(createMealPlanner({ apiKey: 'test', fetchImpl: async () => { throw error; } }))({ body: preferences }, response);
    assert.equal(response.statusCode, status);
    assert.ok(!response.body.error.includes('secret'));
  }
});

test('server protects free quota with hourly request limit', async () => {
  const route = handler(createMealPlanner({ apiKey: 'test', fetchImpl: async () => providerResponse() }));
  for (let i = 0; i < 20; i++) await route({ body: preferences }, mockResponse());
  const response = mockResponse();
  await route({ body: preferences }, response);
  assert.equal(response.statusCode, 429);
});
