import test from 'node:test';import assert from 'node:assert/strict';import {retryDelaySeconds} from './automationWorker.js';
test('automation retry delay is bounded exponential backoff',()=>{assert.equal(retryDelaySeconds(1),5);assert.equal(retryDelaySeconds(4),40);assert.equal(retryDelaySeconds(20),3600)});
