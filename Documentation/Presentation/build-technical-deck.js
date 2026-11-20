// Run in an Artifact Session presentation canvas. All diagrams and charts use
// editable slide objects; every measured claim has a source in speaker notes.
await artifactSession.run(async ({ presentation }) => {
  presentation.slides.keep([]);

  const C = {
    violet: '#57068C', deep: '#2B103E', ink: '#241A2C', muted: '#6D6273',
    lavender: '#E9DCF2', pale: '#F7F2FA', white: '#FFFFFF', green: '#197568',
    line: '#D7C7E2', red: '#9D3E55', amber: '#B7772B', gray: '#B6AEBB'
  };
  const W = 1280, H = 720;
  const addShape = (s, geometry, x, y, w, h, fill='none', stroke='none', sw=0) =>
    s.shapes.add({ geometry, position:{left:x,top:y,width:w,height:h},
      fill, line:{style:'solid',fill:stroke,width:sw} });
  const txt = (s, str, x, y, w, h, size=22, color=C.ink, bold=false, font='Arial', align='left') => {
    const sh=addShape(s,'textbox',x,y,w,h);
    sh.text=str;
    sh.text.style={fontSize:size,color,bold,typeface:font,alignment:align,
      verticalAlignment:'middle',insets:0,wrap:true};
    return sh;
  };
  const rect=(s,x,y,w,h,fill,stroke='none',sw=0)=>addShape(s,'rect',x,y,w,h,fill,stroke,sw);
  const line=(s,x1,y1,x2,y2,color=C.line,width=2)=>
    addShape(s,'line',Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1),'none',color,width);
  const arrow=(s,x1,y1,x2,y2,color=C.violet)=>{
    line(s,x1,y1,x2-12,y2,color,3);
    txt(s,'›',x2-15,y2-19,22,32,29,color,true,'Arial','center');
  };
  const label=(s,str,x,y,w,color=C.violet)=>txt(s,str.toUpperCase(),x,y,w,22,14,color,true,'Arial');
  const base=(section,title,num,subtitle='')=>{
    const s=presentation.slides.add({width:W,height:H});
    s.background.fill=C.white;
    rect(s,0,0,13,H,C.violet);
    label(s,section,72,42,650);
    txt(s,title,72,77,1136,82,41,C.deep,true,'Georgia');
    if(subtitle) txt(s,subtitle,74,154,1090,38,19,C.muted);
    line(s,72,636,1208,636,C.line,1);
    txt(s,'VIOLET LIBRARY  /  TECHNICAL DEEP DIVE',72,650,770,22,12,C.muted,true);
    txt(s,String(num).padStart(2,'0'),1150,647,58,26,15,C.violet,true,'Arial','right');
    return s;
  };
  const box=(s,x,y,w,h,title,body,accent=C.violet)=>{
    rect(s,x,y,5,h,accent);
    txt(s,title,x+19,y,w-20,34,22,C.deep,true);
    txt(s,body,x+19,y+40,w-24,h-44,17,C.ink);
  };
  const note=(s,content)=>{s.speakerNotes.text=content;};
  const bar=(s,y,labelText,value,max,color,annotation='')=>{
    txt(s,labelText,88,y-7,210,32,21,C.ink,true);
    rect(s,308,y,724,28,C.pale);
    rect(s,308,y,724*value/max,28,color);
    txt(s,`${value}/50`,1050,y-7,105,32,22,color,true);
    if(annotation)txt(s,annotation,310,y+35,715,24,14,C.muted);
  };

  // 01 Cover
  {
    const s=presentation.slides.add({width:W,height:H}); s.background.fill=C.deep;
    rect(s,0,0,17,H,C.violet); line(s,82,115,1198,115,'#8D57AF',2);
    label(s,'NYU-INSPIRED OPEN-ACCESS BOOK SEARCH',84,70,960,'#D8B7EC');
    txt(s,'Violet Library',82,176,1100,116,80,C.white,true,'Georgia');
    txt(s,'Technical architecture, model evidence and deployment choices',86,312,1050,90,31,'#EEDFF7');
    rect(s,84,505,160,6,'#B879D8');
    txt(s,'Project deep dive',84,540,580,37,23,C.white,true);
    txt(s,'19 November 2026',84,586,580,28,18,'#CDB6D8');
    note(s,'Technical overview of the current repository and live prototype. Source: README.md, Documentation/HANDOVER.md, Documentation/UI/runbook.md.');
  }

  // 02 Scope
  {
    const s=base('System boundary','One project, two search environments',2,
      'The public link is a browser demo; the full catalog remains a research index.');
    box(s,82,236,333,277,'Source and research','DOAB metadata\n91,667 prepared books\nFull keyword and vector indexes\nTemporary GitHub runners',C.violet);
    box(s,475,236,333,277,'Public search demo','GitHub Pages\n1,884 selected books\nModel runs in visitor browser\nOwn ranking code',C.green);
    box(s,870,236,333,277,'Feedback service','Public rating controls\nPrivate D1 storage\nReview before ranking changes\n90-day raw data window',C.amber);
    arrow(s,415,373,469,373); arrow(s,808,373,862,373);
    txt(s,'No external provider selects the candidate books or orders the results.',82,555,1050,42,22,C.deep,true);
    note(s,'Full catalog and public sample are separate scopes. The demo sample was selected from prior top-ten result pools, so it is not a representative full-catalog evaluation set. Sources: Documentation/UI/runbook.md, Documentation/Feedback/runbook.md, Documentation/Search/runbook.md.');
  }

  // 03 Data prep
  {
    const s=base('Data','The catalog starts with metadata, not book text',3,
      'A direct DOAB export became a compact search-ready book table.');
    txt(s,'102,078',84,237,300,72,58,C.violet,true,'Georgia');
    txt(s,'source rows',88,306,300,30,20,C.muted);
    arrow(s,361,281,451,281);
    txt(s,'91,667',483,237,300,72,58,C.green,true,'Georgia');
    txt(s,'book records kept',487,306,360,30,20,C.muted);
    rect(s,84,374,1118,3,C.line);
    box(s,85,417,340,146,'Search fields','Title, alternate title, author, subject, abstract');
    box(s,471,417,340,146,'Display and access','Language, year, publisher, DOI, ISBN, book link',C.green);
    box(s,856,417,340,146,'Prepared output','Versioned Parquet, about 117 MB, stored remotely',C.amber);
    txt(s,'13,125 books lack an abstract (14.3%); missing descriptions weaken context matching.',86,584,1100,34,18,C.red,true);
    note(s,'The direct export had 102,078 rows. Preparation excluded 10,410 non-book rows and one book without a title, leaving 91,667 records. Prepared Parquet is about 117 MB on Hugging Face. Abstract absence: 13,125 / 91,667. Subjects missing: 5,763; languages missing: 1,266. Sources: Documentation/Data-Preparation/data-dictionary.md, Documentation/Data-Preparation/session-log.md.');
  }

  // 04 Index build
  {
    const s=base('Index build','Four cloud jobs replaced one timed-out job',4,
      'The source snapshot and model stayed fixed while the work was split.');
    const xs=[86,375,664,953];
    xs.forEach((x,i)=>{
      rect(s,x,266,238,83,i===0?C.pale:C.white,C.line,2);
      txt(s,`Shard ${i+1}`,x+15,278,207,28,21,C.deep,true);
      txt(s,'~22,900 books',x+15,311,207,26,18,C.muted);
    });
    xs.forEach(x=>line(s,x+119,349,x+119,385,C.line,2));
    line(s,205,385,1072,385,C.line,2);
    line(s,639,385,639,412,C.line,2);
    rect(s,436,412,406,92,C.deep);
    txt(s,'Assemble + verify',461,429,354,31,25,C.white,true);
    txt(s,'SQLite keyword index + vectors',462,466,350,25,17,'#EEDFF7');
    txt(s,'75,008 / 91,667',87,553,330,37,29,C.red,true,'Georgia');
    txt(s,'first run stopped at 3 hours',87,590,350,25,17,C.muted);
    txt(s,'~56 minutes',855,553,330,37,29,C.green,true,'Georgia');
    txt(s,'parallel run completed',855,590,335,25,17,C.muted);
    note(s,'First full build reached 75,008/91,667 before the GitHub job limit. A four-shard workflow plus assembly completed in about 56 minutes. Final full index: roughly 367 MB SQLite and 141 MB vector array, remotely published. Source: Documentation/Search/parallel-build-plan.md.');
  }

  // 05 Search method
  {
    const s=base('Retrieval','Our code controls candidates and ranking',5,
      'Two independent searches meet in a rank-fusion step.');
    rect(s,457,219,369,57,C.deep); txt(s,'Student request',485,227,315,37,24,C.white,true,'Arial','center');
    line(s,642,276,642,305,C.violet,3); line(s,253,305,1027,305,C.violet,3);
    line(s,253,305,253,329,C.violet,3); line(s,1027,305,1027,329,C.violet,3);
    box(s,89,331,460,124,'Meaning path','Query vector compared with book vectors. Top 500 candidates.',C.green);
    box(s,731,331,460,124,'Keyword path','Weighted text search over title, subjects and description. Top 500.',C.violet);
    line(s,319,455,319,480,C.violet,2);
    line(s,961,455,961,480,C.violet,2);
    line(s,319,480,961,480,C.violet,2);
    rect(s,516,481,249,69,C.pale,C.line,2);
    txt(s,'RRF, offset 60',541,493,195,41,23,C.deep,true,'Arial','center');
    txt(s,'Remove repeat titles and weak previews; show five, with up to ten on request.',133,577,1015,33,20,C.ink);
    note(s,'Full index: FTS5 BM25 up to 500 and normalized embedding dot product up to 500. RRF uses reciprocal rank 1/(60+rank). Public demo has its own browser keyword scoring over the 1,884 books, plus semantic vector search and fusion. Scores shown in UI are relative to the current result list; top score is 100, not a probability. Sources: src/libraries_search, frontend/src/search.ts, Documentation/Search/design.md.');
  }

  // 06 Models
  {
    const s=base('Models','Three pretrained encoders, one search interface',6,
      'All three create query vectors in the browser; the user can switch models.');
    const rows=[
      ['E5 small','384','~118 MB','query: prefix','Mean'],
      ['E5 base','768','~278 MB','query: prefix','Mean'],
      ['GTE base','768','~340 MB','No prefix','CLS']
    ];
    const cols=[88,368,574,774,988];
    ['Model','Vector size','First download','Query text','Pooling'].forEach((h,i)=>label(s,h,cols[i],243,i===0?250:185,C.muted));
    line(s,84,277,1196,277,C.line,2);
    rows.forEach((r,j)=>{
      const y=295+j*87;
      if(j===2)rect(s,82,y-6,1115,74,C.pale);
      r.forEach((v,i)=>txt(s,v,cols[i],y,i===0?250:190,55,i===0?22:20,i===0?C.deep:C.ink,i===0));
      line(s,84,y+68,1196,y+68,C.line,1);
    });
    rect(s,89,586,195,28,C.green); txt(s,'DEFAULT DEMO MODE',99,588,176,22,14,C.white,true);
    txt(s,'GTE base + keyword fusion',302,580,730,38,24,C.deep,true);
    note(s,'Browser models are pinned q8 ONNX builds and run via a web worker. They are pretrained models; this project did not train a new encoder. Download estimates are first-use model sizes and may vary by browser caching/transfer. Query convention and pooling are model-specific. Source: frontend/src/model-config.ts, frontend/src/model-worker.ts.');
  }

  // 07 First baseline
  {
    const s=base('Evaluation','Hybrid improved the first baseline',7,
      'Full 91,667-book catalog, 50 authored student-style questions.');
    bar(s,238,'Keyword only',11,50,C.gray);
    bar(s,338,'Meaning only',14,50,C.violet);
    bar(s,438,'Hybrid',15,50,C.green);
    txt(s,'The later v2 ranking pass moved E5 small hybrid to 17/50.',88,563,1070,45,24,C.deep,true);
    note(s,'Initial persona diagnostic: keyword 11/50, semantic 14/50, hybrid 15/50 questions with at least one clear fit in top five; nDCG@5 .5007/.7191/.7448 and warm runner p95 143/54/172 ms respectively. A later v2 diagnostic measured E5 small hybrid at 17/50. These are different phases, not all three scores from the final comparison run. Source: Documentation/Evaluation/persona-results.md, Documentation/Evaluation/assistant-v2-results.md.');
  }

  // 08 Controlled model comparison
  {
    const s=base('Evaluation','Larger encoders helped only a little',8,
      'Same 50 questions and full catalog; hybrid search, clear fit among first five.');
    bar(s,222,'E5 small',17,50,C.violet);
    bar(s,316,'E5 base',18,50,'#8050A5');
    bar(s,410,'GTE base',19,50,C.green);
    line(s,901,202,901,483,C.red,2);
    txt(s,'Target: at least 41/50',87,526,545,45,28,C.deep,true,'Georgia');
    txt(s,'Best observed: 19/50',665,526,535,45,28,C.red,true,'Georgia');
    txt(s,'Runner p95: 152 ms, 199 ms, 200 ms. Model loading and downloads excluded.',88,587,1080,27,17,C.muted);
    note(s,'Controlled comparison: E5 small hybrid 17/50, E5 base hybrid 18/50, GTE base hybrid 19/50. User target is strictly above 40/50, hence at least 41/50 and a gap of 22 from best observed. Warm runner p95 for hybrid: 152, 199, 200 ms. These full-index diagnostics do not measure public 1,884-book browser demo quality. Source: Documentation/Evaluation/embedding-model-comparison-results.md.');
  }

  // 09 Quality blockers
  {
    const s=base('Quality blockers','A topic match often misses the whole request',9,
      'The hard cases include reading level, examples, language and course context.');
    const causes=[
      ['Thin metadata','13,125 books have no abstract; the model sees less context.'],
      ['Coverage','A suitable title may be absent from DOAB or from the public sample.'],
      ['Ranking','Fusion can push a strong meaning match below the first five.'],
      ['Specific needs','Topic alone misses beginner level, practical cases or region.']
    ];
    causes.forEach((c,i)=>box(s,91,229+i*88,1080,72,c[0],c[1],i%2?C.green:C.violet));
    txt(s,'GTE meaning-only and hybrid each found 19/50, but on different questions.',91,595,1090,31,18,C.deep,true);
    note(s,'The saved result pool analysis found 133 of 1,113 distinct books without abstracts. GTE meaning-only and GTE hybrid each achieved 19/50; their hindsight union covered 21/50, showing ranking differences but not an implemented oracle. Language slices were too small for reliable ranking; French queries showed misses to investigate. Sources: Documentation/Evaluation/embedding-model-comparison-results.md, Documentation/Evaluation/query-fit-results.md.');
  }

  // 10 Engineering blockers
  {
    const s=base('Engineering blockers','Constraints shaped the system',10,
      'Each pivot kept candidate selection under project control.');
    const data=[
      ['Source feeds','Initial feed: 55,606 books; OAI harvest: 85,171.','Direct export gave 91,667 prepared books.'],
      ['Build time','A single index job hit the three-hour limit.','Four parallel shards finished in about 56 minutes.'],
      ['Free hosting','Static Pages cannot execute the full server index.','Search 1,884 books inside each browser.'],
      ['Rerank speed','Experimental reranking reached 7.5 s warm p95.','Keep it out of the public demo for now.']
    ];
    data.forEach((r,i)=>{
      const y=224+i*96;
      txt(s,r[0],87,y,201,40,22,C.deep,true);
      txt(s,r[1],291,y,423,64,18,C.ink);
      line(s,719,y+29,756,y+29,C.violet,2);
      txt(s,r[2],774,y,411,64,18,C.green,true);
      line(s,85,y+80,1192,y+80,C.line,1);
    });
    note(s,'Source attempts and final export: Documentation/Data-Preparation/session-log.md. Three-hour timeout and four-shard recovery: Documentation/Search/parallel-build-plan.md. Experimental reranker warm p95 7,507 ms versus 152 ms for E5 small hybrid: Documentation/Evaluation/assistant-v2-results.md. Pages architectural limitation is from static hosting design; current browser sample is documented in Documentation/UI/runbook.md.');
  }

  // 11 Deployment
  {
    const s=base('Deployment','The public demo runs without a paid search server',11,
      'Static assets load from Pages; inference and retrieval happen in the visitor browser.');
    rect(s,91,236,266,83,C.deep);txt(s,'GitHub Pages',111,247,228,37,25,C.white,true);
    txt(s,'UI, catalog, vectors',111,282,228,25,17,'#EBDDF5');
    arrow(s,358,278,435,278);
    rect(s,441,221,408,114,C.pale,C.line,2);
    txt(s,'Visitor browser',467,230,350,40,27,C.deep,true);
    txt(s,'ONNX query model + own ranking + top 5/10',467,276,352,45,18,C.ink);
    arrow(s,851,278,916,278);
    rect(s,925,236,268,83,C.green);
    txt(s,'Book links',948,246,223,38,25,C.white,true);
    txt(s,'Open-access records',948,283,223,24,17,'#D5F5EF');
    line(s,642,336,642,395,C.violet,3);
    rect(s,423,397,438,102,C.white,C.line,2);
    txt(s,'Feedback API + private D1',448,410,389,34,23,C.deep,true);
    txt(s,'Save, correct or delete a rating',449,451,380,25,18,C.ink);
    txt(s,'Full 91,667-book index stays in a separate remote research workflow.',92,556,1090,44,21,C.deep,true);
    note(s,'Public URL: https://veedantbrahmbhatt.github.io/Libraries/. Pages workflow: .github/workflows/deploy-demo-pages.yml. UI and browser search: frontend/src. Feedback service: feedback-api/worker/index.js and Documentation/Feedback/runbook.md. The static catalog is a 1,884-book selected sample, not the full catalog. Model files range about 118–340 MB on first use.');
  }

  // 12 Feedback loop
  {
    const s=base('Learning loop','Visitor feedback enters a controlled release cycle',12,
      'Ratings help locate failures; changes still pass a separate evaluation.');
    const steps=[
      ['1','Visitor rates a book'],['2','Private service stores the report'],
      ['3','Team groups failures'],['4','Data or ranking change'],
      ['5','Retest and version release']
    ];
    steps.forEach((p,i)=>{
      const x=78+i*239;
      rect(s,x,259,209,142,i===0?C.deep:C.pale,i===0?'none':C.line,i===0?0:2);
      txt(s,p[0],x+14,269,50,38,28,i===0?C.white:C.violet,true,'Georgia');
      txt(s,p[1],x+16,315,178,75,19,i===0?C.white:C.ink,true);
      if(i<4)arrow(s,x+211,332,x+237,332);
    });
    txt(s,'Useful / Somewhat useful / Not useful / None fit',80,445,950,35,22,C.deep,true);
    txt(s,'Public votes can be revised or deleted. Raw reports expire after 90 days.',80,492,1060,38,19,C.ink);
    rect(s,80,565,1110,3,C.line);
    txt(s,'The live release collects feedback; ranking changes ship only in a later version.',80,583,1110,35,19,C.green,true);
    note(s,'Feedback controls are public and anonymous. API validates known IDs and catalog checksum, limits requests, provides idempotency and receipt-based correction/deletion, and stores private D1 records. Scheduled retention uses the /health path. No automatic online training or immediate ranking update. Sources: Documentation/Feedback/runbook.md, Documentation/Feedback/design.md, feedback-api/worker/index.js.');
  }

  // 13 Next work
  {
    const s=base('Next decisions','The quality target drives the next release',13,
      'Prioritize catalog coverage and retrieval logic before committing to a larger model.');
    box(s,90,231,511,126,'1  Explain the misses','For each query, separate missing books from thin metadata and wrong ordering.');
    box(s,680,231,511,126,'2  Improve the inputs','Add permitted descriptions and a vetted beginner textbook source.',C.green);
    box(s,90,388,511,126,'3  Test ranking changes','Protect strong meaning matches and compare against a frozen question set.',C.amber);
    box(s,680,388,511,126,'4  Decide full-catalog hosting','Keep the browser demo for meetings; plan remote compute only if full-scale access is needed.',C.violet);
    txt(s,'Release bar: at least 41 of 50 questions find a suitable book in the first five.',90,566,1100,43,22,C.deep,true);
    note(s,'Target requested by project owner is more than 40/50, expressed as at least 41/50. Current best observed diagnostic is 19/50. Recommended work aligns with Documentation/Evaluation/embedding-model-comparison-results.md and Documentation/Feedback/runbook.md. This slide describes planned work, not completed improvements.');
  }

  // 14 Presenter handoff
  {
    const s=base('Demo and sources','How to present the working prototype',14,
      'Use the public link to show model choice, five results, more options and feedback.');
    txt(s,'Live demo',87,226,250,42,27,C.deep,true,'Georgia');
    txt(s,'veedantbrahmbhatt.github.io/Libraries/',87,275,1090,46,27,C.violet,true);
    line(s,85,345,1194,345,C.line,2);
    txt(s,'Suggested flow',87,375,270,37,24,C.deep,true);
    txt(s,'Enter a natural student request. Compare GTE hybrid with E5. Open a book link. Rate a result.',87,421,1085,82,22,C.ink);
    txt(s,'Two numbers to keep distinct',87,524,430,33,23,C.deep,true);
    txt(s,'91,667 books in the research index  /  1,884 in the public demo sample',87,566,1090,39,20,C.green,true);
    note(s,'Presenter sources: README.md, Documentation/HANDOVER.md, Documentation/Data-Preparation/data-dictionary.md, Documentation/Search/parallel-build-plan.md, Documentation/Evaluation/persona-results.md, Documentation/Evaluation/embedding-model-comparison-results.md, Documentation/UI/runbook.md, Documentation/Feedback/runbook.md. Public URL https://veedantbrahmbhatt.github.io/Libraries/.');
  }

  nodeRepl.write({slideCount:presentation.slides.items.length});
}, {artifactType:'presentation'});
