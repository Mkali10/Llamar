import test from 'node:test';import assert from 'node:assert/strict';import {csvCell,reportCsv} from './reportExportFormat.js';
test('report CSV safely quotes values and neutralizes spreadsheet formulas',()=>{assert.equal(csvCell('a,"b"'),'"a,""b"""');const output=reportCsv([{name:'Alice, Inc',value:'=2+2'}]);assert.equal(output,'"name","value"\n"Alice, Inc","\'=2+2"\n')});
