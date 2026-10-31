(function(){
  'use strict';
  const report = document.getElementById('report');
  const exportStatus = document.getElementById('exportStatus');
  const exportButton = document.getElementById('exportCumulativeWordBtn');
  const raw = localStorage.getItem('movarisch_cumulative_data');
  localStorage.removeItem('movarisch_cumulative_data');

  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = value => String(value == null ? '' : value).replace(/\s+/g,' ').trim();
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const fmt = value => value == null || value === '' || !Number.isFinite(Number(value)) ? '' : Number(value).toFixed(2);
  const list = value => Array.isArray(value) ? value : [];
  const max = (rows, getter) => { const values=rows.map(getter).filter(value=>typeof value === 'number' && Number.isFinite(value)); return values.length ? Math.max(...values) : null; };
  const badge = (value,css) => `<span class="badge ${css}">${esc(value)}</span>`;
  const safeExcerpt = (value,maxLength=280) => {
    const normalized=text(value);
    if(normalized.length<=maxLength)return normalized;
    const shortened=normalized.slice(0,maxLength+1).replace(/\s+\S*$/,'').replace(/[\s,;:.-]+$/,'');
    return `${shortened||normalized.slice(0,maxLength)}…`;
  };
  const dpiSummary = item => safeExcerpt(item?.technicalSummary || item?.sourceText || '');
  const hazardApi = window.MovarischHazardStatementsIt || {};
  const normalizeHazard = value => hazardApi.normalizeCode ? hazardApi.normalizeCode(value) : (text(value).match(/\b(?:EUH|H)\s*\d{3}[A-Z]{0,2}\b/i)?.[0]||'').replace(/\s+/g,'').toUpperCase();
  const formatHazard = hazard => hazard?.code ? `${hazard.code}${hazard.category?` cat.${hazard.category}`:''}` : text(hazard);
  const hazardDescription = hazard => {
    const official=hazardApi.descriptionFor ? hazardApi.descriptionFor(hazard?.code||hazard) : '';
    if(official)return official;
    const source=text(hazard?.sourceText).replace(new RegExp(`^.*?${String(hazard?.code||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s*[-–—:;,.]*\\s*`,'i'),'');
    return safeExcerpt(source||'',240);
  };
  const productHazards = row => {
    const evidence=list(row.sdsEvidence?.productHazards);
    const fallback=[...list(row.hcodes),...list(row.hcodesPhysical)].map(code=>({code:text(code).split(/\s+cat\./i)[0],category:text(code).match(/cat\.\s*([123](?:[ABC])?)/i)?.[1]||null}));
    const selected=new Map();
    for(const hazard of evidence.length?evidence:fallback){
      const key=normalizeHazard(hazard?.code||hazard);
      if(key&&!selected.has(key))selected.set(key,hazard);
    }
    return [...selected.values()];
  };

  let data;
  try{
    data=JSON.parse(raw || 'null');
    const age=Date.now()-new Date(data?.timestamp).getTime();
    if(!Array.isArray(data?.rows)||!data.rows.length||!Number.isFinite(age)||age<0||age>300000)throw new Error('Dati assenti o scaduti');
  }catch(error){
    exportButton.disabled=true;
    report.innerHTML=`<section class="section"><h2>Dati non disponibili</h2><p>Apri questa scheda dal pulsante “Scheda cumulativa” dopo aver confermato le SDS.</p></section>`;
    return;
  }

  const rows=data.rows;
  if(rows.some(row => row.review?.status !== 'confirmed')) {
    exportButton.disabled=true;
    report.textContent='Conferma tutte le valutazioni prima di generare la scheda cumulativa.';
    return;
  }
  const healthSummary=window.KemivalReportHealth.summarize(rows);
  const maxHealth=healthSummary.maximum;
  const maxSafety=max(rows,row=>row.IRC);
  const maxOverall=max(rows,row=>row.OverallRiskValue);
  const healthRisk=healthSummary.classification;
  const reviewers=[...new Set(rows.map(row=>row.review?.reviewer).filter(Boolean))];
  const confirmed=rows.filter(row=>row.review?.status==='confirmed').length;
  const cmr=rows.filter(row=>(row.isCmr || row.healthAssessmentStatus === 'excluded_cmr')).length;
  const overallSummary=cmr ? 'CMR 1A/1B — Titolo IX, Capo II' : healthSummary.unresolved ? '' : fmt(maxOverall);
  const generatedAt=new Date();
  const reportVersion=text(data.version||window.electronAPI?.version||'web');

  const productRows=rows.map((row,index)=>{
    const health=window.KemivalReportHealth.classify(row);
    return `<tr><td>${index+1}</td><td><strong>${esc(row.nome||row.file)}</strong><br><small>${esc(row.file)}</small></td><td>${esc(list(row.hcodes).join(', ')||'')}</td><td>${row.isCmr || row.healthAssessmentStatus === 'excluded_cmr' ? '' : fmt(row.SCORE)}</td><td>${health.value === null ? '' : fmt(health.value)}<br>${badge(health.label,health.css)}</td><td>${esc(list(row.hcodesPhysical).join(', ')||'')}</td><td>${fmt(row.IRC)}<br>${esc(row.mircText||row.mircLevel||'')}</td><td>${row.isCmr || row.healthAssessmentStatus === 'excluded_cmr' ? 'CMR — Capo II' : fmt(row.OverallRiskValue)}</td></tr>`;
  }).join('');

  const hazardEntries=rows.flatMap(row=>{
    const hazards=productHazards(row);
    if(!hazards.length)return [{product:row.nome||row.file,file:row.file,code:'',description:'Nessuna frase H rilevata nella classificazione del prodotto in Sezione 2.'}];
    return hazards.map(hazard=>({product:row.nome||row.file,file:row.file,code:formatHazard(hazard),description:hazardDescription(hazard)}));
  });
  const hazardRows=hazardEntries.map(item=>`<tr><td><strong>${esc(item.product)}</strong><br><small>${esc(item.file)}</small></td><td>${esc(item.code)}</td><td>${esc(item.description)}</td></tr>`).join('');

  const categories=[
    ['hands','Mani / guanti'],['eyesFace','Occhi e viso'],['body','Pelle e corpo'],['respiratory','Vie respiratorie']
  ];
  const outcome={
    required:['Prescritto nella SDS','danger'],recommended:['Consigliato nella SDS','warn'],conditional:['Richiesto alle condizioni indicate','warn'],mentioned:['Citato nella SDS','muted'],not_required:['Non richiesto dalla SDS','ok'],not_specified:['Non specificato','muted']
  };
  const dpiEntries=rows.flatMap(row=>categories.map(([key,label])=>{
    const item=list(row.sdsEvidence?.dpi?.items).find(candidate=>candidate.category===key);
    return {product:row.nome||row.file,file:row.file,device:label,status:'not_specified',sourceText:'',...(item||{})};
  }));
  const dpiRows=dpiEntries.map(item=>{
    const [outcomeText,outcomeClass]=outcome[item.status]||outcome.mentioned;
    const summary=dpiSummary(item);
    const page=item.page?`Sezione 8, pag. ${item.page}`:'';
    return `<tr><td><strong>${esc(item.product)}</strong><br><small>${esc(item.file)}</small></td><td>${esc(item.device)}</td><td>${badge(outcomeText,outcomeClass)}</td><td><span class="dpi-summary">${esc(summary)}</span><span class="dpi-ref">${esc(page)}</span></td></tr>`;
  }).join('');

  const interventions=[];
  if(cmr)interventions.push(`${cmr} prodotto/i con classificazione CMR 1A/1B: percorso di valutazione specifico del Titolo IX, Capo II.`);
  if(maxHealth>=21)interventions.push('Rischio salute superiore all’irrilevante: ambito degli artt. 225, 226, 229 e 230 del D.Lgs. 81/08.');
  else if(maxHealth>=15)interventions.push('Il valore calcolato appartiene all’intervallo di incertezza del modello MoVaRisCh.');
  if(rows.some(row=>list(row.hcodesPhysical).length))interventions.push('Sono presenti pericoli fisici nelle classificazioni dei prodotti esaminati.');

  report.innerHTML=`
    <section class="section"><h2>1. Quadro generale</h2><div class="metrics">
      <div class="metric"><span>Prodotti valutati</span><strong>${rows.length}</strong></div>
      <div class="metric"><span>Valutazioni confermate</span><strong>${confirmed}/${rows.length}</strong></div>
      <div class="metric"><span>Massimo rischio salute</span><strong>${maxHealth === null ? '' : fmt(maxHealth)}</strong>${badge(healthRisk.label,healthRisk.css)}</div>
      <div class="metric"><span>Massimo indice sicurezza</span><strong>${fmt(maxSafety)}</strong></div>
    </div><p class="footer-note">Data: ${esc(generatedAt.toLocaleString('it-IT'))} · Professionista/i: ${esc(reviewers.join(', '))} · Inquadramento complessivo: ${esc(overallSummary)}</p></section>
    <section class="section"><h2>2. Riepilogo dei prodotti</h2><div class="table-wrap"><table id="productsTable"><thead><tr><th>#</th><th>Prodotto</th><th>H salute (Sez. 2)</th><th>Score</th><th>R salute</th><th>H fisiche</th><th>IRC sicurezza</th><th>Complessivo</th></tr></thead><tbody>${productRows}</tbody></table></div></section>
    <section class="section"><h2>3. Frasi H considerate nella valutazione</h2><p class="section-lead">Descrizioni CLP associate alla classificazione del prodotto riportata nella Sezione 2 della relativa SDS.</p><div class="table-wrap"><table class="hazard-table" id="hazardStatementsTable"><thead><tr><th>Prodotto e SDS di riferimento</th><th>Frase H</th><th>Descrizione</th></tr></thead><tbody>${hazardRows}</tbody></table></div></section>
    <section class="section"><h2>4. Dispositivi di protezione individuale</h2><div class="notice">Il prospetto riporta le indicazioni sui dispositivi di protezione individuale contenute nella Sezione 8 delle SDS.</div><div class="table-wrap" style="margin-top:14px"><table class="dpi-table" id="dpiSummaryTable"><thead><tr><th>Prodotto e SDS</th><th>Dispositivo</th><th>Indicazione SDS</th><th>Sintesi tecnica, condizioni e riferimento</th></tr></thead><tbody>${dpiRows}</tbody></table></div></section>
    <section class="section"><h2>5. Inquadramento normativo</h2><ol class="interventions">${interventions.map(item=>`<li>${esc(item)}</li>`).join('')}</ol></section>
    <section class="section"><h2>6. Validazione</h2><p>Il presente riepilogo integra ${rows.length} SDS. Le classificazioni del prodotto sono riportate nella Sezione 2; la Sezione 16 resta informativa; il prospetto DPI riporta le indicazioni della Sezione 8 delle SDS.</p></section>`;

  function downloadBlob(blob,filename){
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download=filename;anchor.rel='noopener';anchor.style.display='none';
    document.body.appendChild(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  function exportWord(){
    if(!window.docx)throw new Error('Libreria Word non disponibile.');
    const {Document,Paragraph,Table,TableRow,TableCell,TextRun,WidthType,AlignmentType,BorderStyle,ShadingType,VerticalAlign,HeadingLevel,Packer}=window.docx;
    const navy='213A5A',blue='365F91',pale='EAF0F7',light='F5F7FA',line='B8C4D3',ink='172033',muted='526174',white='FFFFFF';
    const borders={top:{style:BorderStyle.SINGLE,size:2,color:line},bottom:{style:BorderStyle.SINGLE,size:2,color:line},left:{style:BorderStyle.SINGLE,size:2,color:line},right:{style:BorderStyle.SINGLE,size:2,color:line},insideHorizontal:{style:BorderStyle.SINGLE,size:1,color:'D9E0E8'},insideVertical:{style:BorderStyle.SINGLE,size:1,color:'D9E0E8'}};
    const para=(value,options={})=>{
      const runs=[];
      if(value == null || String(value).trim() === '') runs.push(new TextRun({text:'          ',highlight:'yellow',font:'Times New Roman',size:24}));
      String(value==null?'':value).split(/\r?\n/).forEach((line,index)=>{
        if(index)runs.push(new TextRun({break:1}));
        runs.push(new TextRun({text:text(line),bold:Boolean(options.bold),color:options.color||ink,size:24,font:'Times New Roman'}));
      });
      return new Paragraph({alignment:options.alignment||AlignmentType.JUSTIFIED,spacing:{before:options.before||0,after:options.after==null?100:options.after,line:360},pageBreakBefore:Boolean(options.pageBreakBefore),keepNext:Boolean(options.keepNext),children:runs});
    };
    const heading=(value,level=1,pageBreakBefore=false)=>new Paragraph({heading:level===1?HeadingLevel.HEADING_1:HeadingLevel.HEADING_2,pageBreakBefore,keepNext:true,spacing:{before:level===1?260:180,after:120},children:[new TextRun({text:value,bold:true,color:navy,size:24,font:'Times New Roman'})]});
    const cell=(value,options={})=>new TableCell({width:options.width?{size:options.width,type:WidthType.PERCENTAGE}:undefined,shading:options.fill?{fill:options.fill,type:ShadingType.CLEAR}:undefined,verticalAlign:VerticalAlign.CENTER,margins:{top:90,bottom:90,left:110,right:110},children:[para(value,{bold:options.bold,color:options.color||ink,size:24,after:0,alignment:options.alignment})]});
    const table=(headers,body,widths)=>new Table({width:{size:100,type:WidthType.PERCENTAGE},borders,rows:[
      new TableRow({tableHeader:true,cantSplit:true,children:headers.map((value,index)=>cell(value,{bold:true,fill:navy,color:white,size:17,width:widths[index]}))}),
      ...body.map((values,rowIndex)=>new TableRow({cantSplit:true,children:values.map((value,index)=>cell(value,{fill:rowIndex%2?light:white,width:widths[index]}))}))
    ]});
    const spacer=()=>new Paragraph({spacing:{after:80},children:[]});
    const metricTable=table(['Prodotti','Confermate','R salute massimo','IRC massimo'],[[String(rows.length),`${confirmed}/${rows.length}`,[fmt(maxHealth),healthRisk.label].filter(Boolean).join(' — '),fmt(maxSafety)]],[18,18,36,28]);
    const productTable=table(['Prodotto / SDS','H salute','Score','R salute','IRC'],rows.map(row=>[
      `${row.nome||row.file}\nSDS: ${row.file||''}`,list(row.hcodes).join(', ')||'',row.isCmr || row.healthAssessmentStatus === 'excluded_cmr' ? 'Non applicabile' : fmt(row.SCORE),[window.KemivalReportHealth.classify(row).value === null ? '' : fmt(row.Rtot),window.KemivalReportHealth.classify(row).label].filter(Boolean).join(' - '),`${fmt(row.IRC)} - ${row.mircText||row.mircLevel||''}`
    ]),[30,24,10,18,18]);
    const hazardTable=table(['Prodotto e SDS di riferimento','Frase H','Descrizione'],hazardEntries.map(item=>[`${item.product}\nSDS: ${item.file||''}`,item.code,item.description]),[31,16,53]);
    const dpiTable=table(['Prodotto e SDS','Dispositivo','Indicazione SDS','Sintesi tecnica e condizioni'],dpiEntries.map(item=>{
      const status=item.status === 'not_specified' ? '' : (outcome[item.status]||outcome.mentioned)[0];
      const reference=item.page?`Sezione 8, pag. ${item.page}`:'';
      return [`${item.product}\nSDS: ${item.file||''}`,item.device,status,`${dpiSummary(item)}\n${reference}`];
    }),[24,16,20,40]);
    const children=[
      para('KEMIVAL',{bold:true,color:blue,size:18,after:80}),
      para('Scheda cumulativa del rischio chimico',{bold:true,color:navy,size:36,after:80}),
      para('Riepilogo multi-prodotto delle valutazioni confermate',{color:muted,size:22,after:220}),
      table(['Data di elaborazione','Professionista/i','Versione report'],[[generatedAt.toLocaleString('it-IT'),reviewers.join(', '),`KEMIVAL ${reportVersion}`]],[33,42,25]),
      heading('1. Quadro generale'),metricTable,
      para(overallSummary ? `Inquadramento complessivo: ${overallSummary}.` : '',{color:muted,size:18,before:100,after:120}),
      heading('2. Riepilogo dei prodotti'),productTable,
      heading('3. Frasi H considerate nella valutazione',1,true),
      para('Classificazione del prodotto riportata nella Sezione 2 della SDS. La tabella associa ogni codice alla relativa descrizione CLP.',{color:muted,size:18}),hazardTable,
      heading('4. Dispositivi di protezione individuale',1,true),
      para('Indicazioni sui dispositivi di protezione individuale riportate nella Sezione 8 delle SDS.',{color:muted,size:18}),dpiTable,
      heading('5. Inquadramento normativo',1,true),
      ...interventions.map((item,index)=>new Paragraph({numbering:{reference:'priority-list',level:0},spacing:{after:90,line:360},children:[new TextRun({text:item,color:ink,size:24,font:'Times New Roman'})]})),
      heading('6. Validazione'),
      para(`Il presente riepilogo integra ${rows.length} SDS. Le classificazioni del prodotto sono riportate nella Sezione 2; la Sezione 16 resta informativa; il prospetto DPI riporta le indicazioni della Sezione 8 delle SDS.`,{after:160}),
      spacer(),para('Firma del professionista'),para('')
    ];
    const doc=new Document({
      creator:'KEMIVAL',title:'Scheda cumulativa del rischio chimico',description:'Riepilogo cumulativo multi-prodotto',
      styles:{default:{document:{run:{font:'Times New Roman',size:24,color:ink},paragraph:{spacing:{after:100,line:360}}}}},
      numbering:{config:[{reference:'priority-list',levels:[{level:0,format:'decimal',text:'%1.',alignment:AlignmentType.START,style:{paragraph:{indent:{left:420,hanging:220}}}}]}]},
      sections:[{properties:{page:{margin:{top:900,right:720,bottom:900,left:720}}},children}]
    });
    return Packer.toBlob(doc);
  }

  document.getElementById('printCumulativeBtn').addEventListener('click',()=>window.print());
  exportButton.addEventListener('click',async()=>{
    exportButton.disabled=true;exportStatus.textContent='Generazione del documento Word in corso…';
    try{
      const blob=await exportWord();
      downloadBlob(blob,'KEMIVAL_scheda_cumulativa.docx');
      exportStatus.textContent='Documento Word generato correttamente.';
    }catch(error){
      console.error('Errore esportazione Word cumulativa',error);
      exportStatus.textContent=`Errore durante la generazione Word: ${error?.message||error}`;
    }finally{exportButton.disabled=false;}
  });
})();
