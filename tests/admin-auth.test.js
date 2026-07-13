import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { isAdminUser } from '../functions/_shared/auth.js';

test('Sterling is the default administrator', () => {
  assert.equal(isAdminUser({ id: 'sterling' }), true);
  assert.equal(isAdminUser({ id: 'cydney' }), false);
});

test('ADMIN_USER_IDS supports an explicit comma-separated allowlist', () => {
  const env = { ADMIN_USER_IDS: 'sterling, cydney' };
  assert.equal(isAdminUser({ id: 'sterling' }, env), true);
  assert.equal(isAdminUser({ id: 'cydney' }, env), true);
  assert.equal(isAdminUser({ id: 'ryan' }, env), false);
});

test('missing and malformed users are never administrators', () => {
  assert.equal(isAdminUser(null), false);
  assert.equal(isAdminUser({}), false);
});

test('privileged API handlers enforce the shared admin session policy', async () => {
  const protectedHandlers = [
    'functions/api/admin/cards.js',
    'functions/api/admin/card-mechanics.js',
    'functions/api/admin/submissions.js',
    'functions/api/admin/submission.js',
    'functions/api/admin/submission-action.js',
    'functions/api/schema.js',
    'functions/api/schema-details.js',
    'functions/api/images.js',
    'functions/api/images-summary.js',
    'functions/api/submission-inventory.js',
    'functions/api/submission-review-audit.js',
    'functions/api/pull-pool.js',
    'functions/api/pull-simulate.js',
    'functions/api/battle-simulate.js',
    'functions/api/vault-inventory.js',
    'functions/api/submissions.js',
    'functions/api/admin/telemetry.js',
  ];
  const contents = await Promise.all(protectedHandlers.map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
  assert.ok(contents.every((content) => content.includes('getAdminSessionUser')));
  assert.ok(contents.every((content) => content.includes('Admin authorization required.')));
});

test('known player colors retain the approved identity palette', async () => {
  const authSource = await readFile(new URL('../functions/_shared/auth.js', import.meta.url), 'utf8');
  assert.match(authSource, /\['cydney', 'Cydney', '#789461'\]/);
});
