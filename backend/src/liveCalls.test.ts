import test from 'node:test';import assert from 'node:assert/strict';import {maskPhone} from './liveCalls.js';
test('live call monitor masks customer numbers',()=>{const masked=maskPhone('+919876543210');assert.equal(masked.startsWith('+91'),true);assert.equal(masked.endsWith('3210'),true);assert.equal(masked.includes('987654'),false);assert.equal(maskPhone(null),'—')});
