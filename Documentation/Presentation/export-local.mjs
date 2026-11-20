// Rebuild the editable deck locally from build-technical-deck.js.
// Uses the bundled presentation runtime supplied by Codex desktop.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const modulePath=process.env.ARTIFACT_TOOL_MODULE ?? '@oai/artifact-tool';
const {Presentation,PresentationFile}=await import(modulePath);

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(here, 'output');
await fs.mkdir(output, {recursive:true});
const source = await fs.readFile(path.join(here,'build-technical-deck.js'),'utf8');
const presentation = Presentation.create({slideSize:{width:1280,height:720}});
const artifactSession = {run:async (callback)=>callback({presentation})};
const nodeRepl = {write:(value)=>console.log(JSON.stringify(value))};
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
await new AsyncFunction('artifactSession','nodeRepl',source)(artifactSession,nodeRepl);

for (const [index,slide] of presentation.slides.items.entries()) {
  const png=await presentation.export({slide,format:'png',scale:1});
  const target=path.join(output,`slide-${String(index+1).padStart(2,'0')}.png`);
  await fs.writeFile(target,new Uint8Array(await png.arrayBuffer()));
}
const pptx=await PresentationFile.exportPptx(presentation);
await pptx.save(path.join(output,'violet-library-technical-deep-dive.pptx'));
console.log(`Exported ${presentation.slides.items.length} slides to ${output}`);
