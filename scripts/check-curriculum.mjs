import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=ts.transpileModule(fs.readFileSync('data/curriculum.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};vm.runInNewContext(code,{exports:mod.exports,module:mod});
const c=mod.exports;
assert.equal(c.topics.length,22);assert.equal(c.learningQuestions.length,110);
assert.equal(new Set(c.learningQuestions.map(q=>q.id)).size,110);
assert.equal(new Set(c.learningQuestions.map(q=>q.sentence.replace(/[ًٌٍَُِّْٰـ]/g,''))).size,110,'All sentences must be distinct, including across topics');
const complete=[];
for(const [ti,t] of c.topics.entries()){
 const questions=c.learningQuestions.filter(q=>q.topic===t);assert.equal(questions.length,5);
 assert.equal(c.topicUnlocked(t,complete),true);
 if(ti+1<c.topics.length)assert.equal(c.topicUnlocked(c.topics[ti+1],complete),false);
 for(const [qi,q] of questions.entries()){
  assert.equal(q.sentence,q.words.map(w=>w.token).join(' '));
  for(const [i,w] of q.words.entries()){
   assert.ok(w.explanation&&w.fullIrab);
   const answer=c.expectedAnswer(q,i);assert.equal(c.gradeAnswer(q,i,answer),true);
   assert.equal(c.gradeAnswer(q,i,{...answer,kind:''}),false);
   if(qi<4)complete.push(`${q.id}:${i}`);
  }
 }
}
assert.equal(c.topicUnlocked('unknown',complete),false);
console.log(`PASS: 22 topics, 110 globally unique sentences, ${c.learningQuestions.reduce((n,q)=>n+q.words.length,0)} graded words, foundation stages, and sequential 80% unlocks.`);
