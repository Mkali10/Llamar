import test from 'node:test';
import assert from 'node:assert/strict';
import {retryDecision} from './callRetryPolicy.js';

test('permanent provider and policy errors fail without redial',()=>{
  assert.deepEqual(retryDecision(0,3,new Error('Twilio call failed (401): unauthorized')),{state:'failed',delaySeconds:0,reason:'permanent_error'});
  assert.equal(retryDecision(0,3,new Error('verified caller ID required')).state,'failed');
});

test('transient errors use bounded exponential backoff',()=>{
  assert.deepEqual(retryDecision(0,5,new Error('provider timeout')),{state:'retry',delaySeconds:30,reason:'transient_error'});
  assert.equal(retryDecision(20,25,new Error('network unavailable')).delaySeconds,3600);
});

test('attempt exhaustion always stops retrying',()=>{
  assert.deepEqual(retryDecision(2,3,new Error('provider timeout')),{state:'failed',delaySeconds:0,reason:'attempts_exhausted'});
});

test('a permanent primary-provider error fails over once to an available fallback',()=>{
  assert.deepEqual(retryDecision(0,3,new Error('provider failed (401): unauthorized'),2),{state:'retry',delaySeconds:0,reason:'provider_failover'});
  assert.equal(retryDecision(1,3,new Error('provider failed (401): unauthorized'),2).state,'failed');
});
