const test = require('node:test');
const assert = require('node:assert');
const L = require('./lib');

const good = { name: 'Sales Bot', shortDescription: 'Sales helper', longDescription: 'Helps with sales.', developer: 'Acme', website: 'https://acme.com', privacyUrl: 'https://acme.com/p', termsUrl: 'https://acme.com/t' };

test('redirect URI follows each data centre', () => {
  assert.strictEqual(L.redirectUri('us'), 'https://www.workato.com/oauth/callback');
  assert.strictEqual(L.redirectUri('eu'), 'https://app.eu.workato.com/oauth/callback');
  assert.strictEqual(L.redirectUri('trial'), 'https://app.trial.workato.com/oauth/callback');
  assert.strictEqual(L.redirectUri('uk'), 'https://app.uk.workato.com/oauth/callback');
});

test('endpoint validation accepts the documented format and rejects others', () => {
  assert.strictEqual(L.validateEndpoint('https://app.workato.com/skype_webhooks/event?coak_id=42', 'us'), null);
  assert.strictEqual(L.validateEndpoint('https://app.eu.workato.com/skype_webhooks/event?coak_id=7', 'eu'), null);
  assert.match(L.validateEndpoint('https://app.eu.workato.com/skype_webhooks/event?coak_id=7', 'us'), /Host must be/);
  assert.match(L.validateEndpoint('http://app.workato.com/skype_webhooks/event?coak_id=1', 'us'), /https/);
  assert.match(L.validateEndpoint('https://app.workato.com/other?coak_id=1', 'us'), /Path must be/);
  assert.match(L.validateEndpoint('https://app.workato.com/skype_webhooks/event', 'us'), /coak_id/);
  assert.match(L.validateEndpoint('nope', 'us'), /valid URL/);
});

test('input validation enforces Teams manifest limits', () => {
  assert.deepStrictEqual(L.validateInputs(good), []);
  assert.ok(L.validateInputs({ ...good, shortDescription: 'x'.repeat(81) }).some((e) => /short description/.test(e)));
  assert.ok(L.validateInputs({ ...good, developer: 'd'.repeat(33) }).some((e) => /developer/.test(e)));
  assert.ok(L.validateInputs({ ...good, website: 'http://acme.com' }).some((e) => /website/.test(e)));
  assert.ok(L.validateInputs({ ...good, name: 'Bad!Name' }).some((e) => /name/.test(e)));
  assert.ok(L.validateInputs({ ...good, name: 'n'.repeat(31) }).some((e) => /name/.test(e)));
});

test('manifest assignments are valid path=json for the Teams CLI', () => {
  const sets = L.manifestAssignments();
  assert.strictEqual(sets.length, 3);
  for (const s of sets) { const i = s.indexOf('='); assert.ok(i > 0); JSON.parse(s.slice(i + 1)); }
  const cmds = JSON.parse(sets[1].slice(sets[1].indexOf('=') + 1));
  assert.deepStrictEqual(cmds[0].scopes, ['personal', 'team', 'groupChat']);
  assert.strictEqual(cmds[0].commands[0].title, 'help');
  assert.deepStrictEqual(JSON.parse(sets[2].slice(sets[2].indexOf('=') + 1)), ['*.workato.com']);
});

test('app update args carry scopes and details without any secret field', () => {
  const a = L.appUpdateArgs('app-id', good);
  assert.ok(a.includes('--scopes') && a[a.indexOf('--scopes') + 1] === 'personal,team,groupChat');
  assert.ok(!a.some((x) => /secret/i.test(x)));
});

test('parseJsonOutput tolerates banner lines; admin detection; redaction', () => {
  assert.deepStrictEqual(L.parseJsonOutput('banner\n{"a":1}\n'), { a: 1 });
  assert.throws(() => L.parseJsonOutput('no json'));
  assert.ok(L.isTeamsAdmin(['Teams Administrator']));
  assert.ok(!L.isTeamsAdmin(['Reports Reader']));
  assert.strictEqual(L.redact('token s3cr3t here s3cr3t', ['s3cr3t', undefined]), 'token *** here ***');
});
