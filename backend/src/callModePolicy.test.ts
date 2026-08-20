import test from 'node:test';
import assert from 'node:assert/strict';
import {machineDetectionForMode} from './callModePolicy.js';

test('predictive and broadcast calls enable appropriate AMD modes',()=>{
  assert.equal(machineDetectionForMode('predictive'),'Enable');
  assert.equal(machineDetectionForMode('ivr_broadcast'),'DetectMessageEnd');
  assert.equal(machineDetectionForMode('power'),undefined);
  assert.equal(machineDetectionForMode('manual'),undefined);
});
