import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { writePrintingHandoff } from '../examples/printing/handoff.mjs';

const example = fileURLToPath(new URL('../examples/printing/', import.meta.url));

function readDelivery(directory) {
  const text = readFileSync(path.join(directory, 'HANDOFF.md'), 'utf8');
  const baseline = readFileSync(path.join(directory, 'as-delivered', 'HANDOFF.md'), 'utf8');
  assert.equal(text, baseline);
  const links = [...text.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
  for (const link of links) {
    assert.ok(!path.isAbsolute(link) && statSync(path.resolve(directory, link)).size > 0, link);
  }
  return { text, links };
}

test('exhibit handoff points to the featured cut and its editable sources', () => {
  const { text, links } = readDelivery(path.join(example, 'sample'));
  assert.deepEqual(links.filter(name => name.endsWith('.mp4')), ['video.mp4']);
  assert.ok(['captions.srt', 'thumbnail.jpg', '../narration.wav', '../scenes.ass'].every(name => links.includes(name)));
  assert.match(text, /One captioned video/);
});

test('a bilingual render hands off both cuts and preserves edits separately from delivered state', t => {
  const workspace = mkdtempSync(path.join(tmpdir(), 'printing-handoff-'));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  const log = execFileSync(process.execPath, [path.join(example, 'render.mjs'), 'ar'], { cwd: workspace, encoding: 'utf8' });
  const file = log.match(/^Editable handoff: (.+)$/m)?.[1].trim();
  assert.ok(file, 'Render must report the editable file to the user');
  const directory = path.dirname(file);
  const { text, links } = readDelivery(directory);
  for (const cut of ['clean', 'burned']) {
    for (const asset of ['video.mp4', 'captions.srt', 'thumbnail.jpg']) {
      assert.ok(links.includes(`${cut}/${asset}`));
    }
  }
  assert.match(text, /Captions: Arabic translation/);
  const words = readFileSync(path.join(example, 'en.srt'), 'utf8').trim()
    .split(/\r?\n\r?\n/).map(cue => cue.split(/\r?\n/).slice(2).join(' ')).join(' ');
  assert.ok(text.includes(words), 'Handoff script must match the spoken language, not the translation');
  appendFileSync(file, '\nPlease hold the closing credit one second longer.\n');
  assert.throws(() => writePrintingHandoff(directory, 'ar'), { code: 'EEXIST' });
  assert.match(readFileSync(file, 'utf8'), /one second longer/);
  assert.equal(readFileSync(path.join(directory, 'as-delivered', 'HANDOFF.md'), 'utf8'), text);
});
