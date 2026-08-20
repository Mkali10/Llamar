import test from 'node:test';import assert from 'node:assert/strict';import {maxRecordingBytes,minRecordingBytes,recordingMime,recordingPath} from './recordingStorage.js';
test('recording storage blocks traversal and maps audio MIME types',()=>{assert.throws(()=>recordingPath('../secret'));assert.equal(recordingMime('wav'),'audio/wav');assert.equal(recordingMime('opus'),'audio/ogg; codecs=opus')});
test('recording upload defaults to 1 KB minimum and 50 MB maximum',()=>{assert.equal(minRecordingBytes(),1024);assert.equal(maxRecordingBytes(),50*1024*1024)});
