import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=ts.transpileModule(fs.readFileSync('data/curriculum.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};vm.runInNewContext(code,{exports:mod.exports,module:mod});
const c=mod.exports;
assert.equal(c.topics.length,23);assert.equal(c.learningQuestions.length,69);
assert.equal(new Set(c.learningQuestions.map(q=>q.id)).size,69);
assert.equal(new Set(c.learningQuestions.map(q=>q.sentence.replace(/[ًٌٍَُِّْٰـ]/g,''))).size,69,'All sentences must be unique');
const complete=[];
for(const [ti,t] of c.topics.entries()){
 const questions=c.learningQuestions.filter(q=>q.topic===t);assert.equal(questions.length,3);assert.equal(questions.map(q=>q.difficulty).join(','),'Dasar,Menengah,Lanjutan');
 assert.equal(c.topicUnlocked(t,complete),true);
 if(ti+1<c.topics.length)assert.equal(c.topicUnlocked(c.topics[ti+1],complete),false);
 for(const [qi,q] of questions.entries()){
  assert.equal(q.sentence,q.words.map(w=>w.token).join(' '));for(const g of q.analysisGroups||[])assert.ok(g.indices.length&&g.indices.every(i=>Number.isInteger(i)&&i>=0&&i<q.words.length));
  for(const [i,w] of q.words.entries()){
   assert.ok(w.explanation&&w.fullIrab&&w.hint);
   const answer=c.expectedAnswer(q,i);assert.equal(c.gradeAnswer(q,i,answer),true);
   assert.equal(c.gradeAnswer(q,i,{...answer,kind:''}),false);
   if(qi<3)complete.push(`${q.id}:${i}`);
  }
 }
}
assert.equal(c.topicUnlocked('unknown',complete),false);
const grouped=c.learningQuestions.find(q=>q.sentence.includes('عِنْدَ الْبَابِ'));
assert.ok(grouped?.analysisGroups?.some(g=>g.indices.length===2&&g.functionLabel.includes('ẓarfiyyah')));
const delayed=c.learningQuestions.find(q=>q.topic==='Khabar muqaddam dan mubtada’ mu’akhkhar');
assert.ok(delayed?.analysisGroups?.some(g=>g.indices.length===2&&g.functionLabel.includes('muqaddam')));
// Uji ambang kelulusan tepat 80% pada materi kedua yang memiliki 10 kata.
const secondTopic=c.topics[1];
const secondQuestions=c.learningQuestions.filter(q=>q.topic===secondTopic);
const firstQuestions=c.learningQuestions.filter(q=>q.topic===c.topics[0]);
const firstWords=firstQuestions.flatMap(q=>q.words.map((_,i)=>`${q.id}:${i}`));
const eightWords=secondQuestions.flatMap(q=>q.words.map((_,i)=>`${q.id}:${i}`)).slice(0,8);
const sevenWords=eightWords.slice(0,7);
assert.equal(c.topicScore(secondTopic,eightWords),80);
assert.equal(c.topicUnlocked(c.topics[2],[...firstWords,...eightWords]),true);
assert.equal(c.topicScore(secondTopic,sevenWords),70);
assert.equal(c.topicUnlocked(c.topics[2],[...firstWords,...sevenWords]),false);
console.log(`PASS: 23 topics, 69 globally unique sentences, 3 integrated progressive questions per topic, ${c.learningQuestions.reduce((n,q)=>n+q.words.length,0)} graded words, and word-based 80% unlocks.`);
