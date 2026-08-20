import test from 'node:test';import assert from 'node:assert/strict';import {integrationRetryDelay} from './integrationWorker.js';
test('integration retry uses bounded exponential backoff',()=>{assert.equal(integrationRetryDelay(0),15);assert.equal(integrationRetryDelay(3),120);assert.equal(integrationRetryDelay(20),3600)});
