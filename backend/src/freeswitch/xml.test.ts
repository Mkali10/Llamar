import assert from 'node:assert/strict';import test from 'node:test';import {renderFreeSwitchXml} from './xml.js';
test('renders a constrained inbound dialplan',()=>{const xml=renderFreeSwitchXml({section:'dialplan',Caller_Destination_Number:'+14155550100'});assert.match(xml,/llamar-inbound/);assert.match(xml,/llamar_did=\+14155550100/)})
test('rejects invalid destination',()=>{assert.match(renderFreeSwitchXml({section:'dialplan',Caller_Destination_Number:'<script>'}),/not found/)})
