const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
function loadSource(file) {
  const absolute = path.resolve(__dirname,'..',file)
  const code = ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const compiledModule = new Module(absolute,module)
  compiledModule._compile(code,absolute)
  return compiledModule.exports
}
const {validateEnquiry,cleanEnquiry,resolveDelivery}=loadSource('src/enquiry.ts')
const valid={name:' Manoj ',email:'name+enquiry@example.com',company:'',topic:'General enquiry',subject:'A business question',message:'Please clarify the proposed scope.'}
assert.deepEqual(validateEnquiry(valid),{})
assert.equal(cleanEnquiry(valid).name,'Manoj')
for(const email of ['','a@','a@localhost','a@@example.com','a..b@example.com','.a@example.com','a.@example.com','a@-example.com','a@example-.com','a@exa mple.com','a@example.com\r\nBcc:x@example.com'])assert(validateEnquiry({...valid,email}).email,email)
for(const email of ['a@example.co.in','a.b+tag@example.com','customer/department@example.org'])assert.equal(validateEnquiry({...valid,email}).email,undefined,email)
assert(validateEnquiry({...valid,name:'  '}).name)
assert(validateEnquiry({...valid,subject:'Hello\nBcc: victim'}).subject)
assert(validateEnquiry({...valid,message:' '}).message)
assert(validateEnquiry({...valid,message:'x'.repeat(3001)}).message)
assert(validateEnquiry({...valid,topic:'unrecognized'}).topic)
assert.equal(validateEnquiry({...valid,name:'王',message:'<script>alert(1)</script>'}).name,undefined)
assert.equal(resolveDelivery('', 'https://example.com').endpoint,null)
for(const value of ['javascript:alert(1)','//evil.example/x','http://example.com/post','https://user:password@example.com/x','https://example.com/x#fragment'])assert.equal(resolveDelivery(value,'https://example.com').invalid,true,value)
assert.equal(resolveDelivery(' /api/enquiry ','https://example.com').endpoint,'https://example.com/api/enquiry')
assert.equal(resolveDelivery('/api/enquiry','http://127.0.0.1:4173').endpoint,'http://127.0.0.1:4173/api/enquiry')
assert.equal(resolveDelivery('/api/enquiry','http://insecure.example').invalid,true)
const {demoRows,filterDemo,demoCsv}=loadSource('src/demoReports.ts')
assert.equal(demoRows[2].distance,-2)
assert.equal(demoRows[8].distance,-3)
for(const [window,count,first,last] of [['all',12,1,12],['first',6,1,6],['last',6,7,12]]){
 const rows=filterDemo(window);assert.equal(rows.length,count);assert.equal(rows[0].observation,first);assert.equal(rows.at(-1).observation,last)
 const csv=demoCsv(window).trim().split('\r\n');assert.equal(csv.length,count+1);assert.equal(csv[0],'data_type,observation,index_units,peak_distance_points');assert(csv.slice(1).every(line=>line.startsWith('ILLUSTRATIVE_SYNTHETIC_DEMO,')))
}
assert.equal(filterDemo('last')[0].distance,-2,'Window filtering retains full-series peak reference')
console.log('PASS enquiry validation, endpoint safety, synthetic report calculations and CSV windows')
