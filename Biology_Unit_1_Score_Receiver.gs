/** Honors Biology Unit 1 — Google Sheets score receiver.
 * Paste into Extensions > Apps Script, deploy as web app, then connect quiz URL.
 * Public browser submissions are not authenticated; do not treat this as tamper-proof.
 */
const SPREADSHEET_ID='1mjvtrotk0XshnpLFHuako6UkwVN8rYdiUc6eu94PItk';
function doPost(e) {
 const lock=LockService.getScriptLock(); lock.waitLock(25000);
 try {
  const p=JSON.parse(e.postData.contents||'{}');
  const name=String(p.name||'').trim().slice(0,100), block=String(p.block||'').trim().slice(0,100);
  const reflection=String(p.reflection||'').trim().slice(0,4000);
  const correct=Number(p.correct), total=Number(p.total);
  if(!name||!block||!reflection||!Number.isInteger(correct)||total!==30||correct<0||correct>30) throw Error('Invalid submission');
  const sheet=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Biology Ch 1 Results');
  const n=sheet.getLastRow();
  const existing=n>1?sheet.getRange(2,2,n-1,3).getValues():[];
  const past=existing.filter(r=>String(r[0]).trim().toLowerCase()===name.toLowerCase()&&String(r[1])===block);
  if(past.length>=2) return result({ok:false,error:'Two attempts already recorded'});
  const missed=Array.isArray(p.missed)?p.missed.map(v=>String(v).slice(0,200)).slice(0,30).join(' | '):'';
  const id=Utilities.getUuid(), attempt=past.length+1;
  sheet.appendRow([new Date(),name,block,attempt,correct,30,100*correct/30,missed,reflection,id,'']);
  return result({ok:true,attempt,id});
 }catch(err){return result({ok:false,error:String(err.message||err)});}
 finally{lock.releaseLock();}
}
function result(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
