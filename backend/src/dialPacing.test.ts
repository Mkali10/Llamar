import test from 'node:test';import assert from 'node:assert/strict';import {normalizedCps} from './dialPacing.js';
test('CPS pacing normalizes fractional and excessive values safely',()=>{assert.equal(normalizedCps(0.5),1);assert.equal(normalizedCps(12.9),12);assert.equal(normalizedCps(5000),1000);assert.throws(()=>normalizedCps(0),/positive/)});
