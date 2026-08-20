import test from 'node:test';import assert from 'node:assert/strict';import {recordingMime,recordingPath} from './recordingStorage.js';
test('recording storage blocks traversal and maps audio MIME types',()=>{assert.throws(()=>recordingPath('../secret'));assert.equal(recordingMime('wav'),'audio/wav');assert.equal(recordingMime('opus'),'audio/ogg; codecs=opus')});
