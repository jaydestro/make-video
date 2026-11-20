// Optional zero-package example and release check. The installed skill does not import it.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const language = args[0] ?? 'en';
if (args.length > 1 || !['en', 'ar'].includes(language)) {
  throw new Error('Usage: node examples/printing/render.mjs [en|ar]');
}
const output = path.resolve('out', 'printing');
mkdirSync(output, { recursive: true });
const cwd = mkdtempSync(path.join(output, `${language}-`));
const run = (tool, args) => execFileSync(tool, args, { cwd, encoding: 'utf8' }).trim();
const ff = (...args) => run('ffmpeg', ['-nostdin', '-hide_banner', '-v', 'error', '-xerror', ...args]);
const probe = (...args) => JSON.parse(run('ffprobe', ['-v', 'error', '-of', 'json', ...args]));
const srt = readFileSync(path.join(here, `${language}.srt`), 'utf8');
copyFileSync(path.join(here, 'scenes.ass'), path.join(cwd, 'scenes.ass'));
copyFileSync(path.join(here, `${language}.srt`), path.join(cwd, 'source.srt'));
const wav = path.join(here, 'narration.wav');
const [audio] = probe('-show_streams', wav).streams;
assert.equal(Number(audio.duration_ts), 116125 + 154781);
assert.equal(Number(audio.sample_rate), 22050);
const subtitleFilter = "subtitles=source.srt:original_size=1280x720:force_style='FontName=sans-serif,FontSize=14,Outline=1,MarginV=18'";
for (const variant of ['clean', 'burned']) {
  mkdirSync(path.join(cwd, variant));
  const mp4 = `${variant}/video.mp4`;
  const jpg = `${variant}/thumbnail.jpg`;
  ff('-n', '-f', 'lavfi', '-i', 'color=c=0x152634:s=1280x720:r=30',
    '-i', wav, '-map', '0:v:0', '-map', '1:a:0', '-vf',
    variant === 'clean' ? 'ass=scenes.ass' : `ass=scenes.ass,${subtitleFilter}`,
    '-af', 'apad', '-t', '15', '-c:v', 'libx264', '-preset', 'veryfast',
    '-threads', '2', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', mp4);
  ff('-n', '-ss', '7', '-i', mp4, '-frames:v', '1', '-q:v', '2', jpg);
  const sub = `${variant}/captions.srt`;
  copyFileSync(path.join(cwd, 'source.srt'), path.join(cwd, sub));
  ff('-i', mp4, '-f', 'null', '-');
  ff('-i', jpg, '-f', 'null', '-');
  const media = probe('-count_frames', '-show_streams', '-show_format', mp4);
  const video = media.streams.find(s => s.codec_type === 'video');
  assert.deepEqual([video.codec_name, video.width, video.height, video.avg_frame_rate,
    Number(video.nb_read_frames)], ['h264', 1280, 720, '30/1', 450]);
  assert.ok(media.streams.some(s => s.codec_name === 'aac'));
  assert.ok(Math.abs(Number(media.format.duration) - 15) <= 1 / 30);
  assert.equal(probe('-show_streams', jpg).streams[0].codec_name, 'mjpeg');
  const packets = probe('-show_packets', sub).packets;
  assert.deepEqual(packets.map(p => [Number(p.pts), Number(p.duration)]), [[0, 5266], [5266, 7020]]);
  assert.equal(readFileSync(path.join(cwd, sub), 'utf8'), srt);
}

// Inspect the subtitle band, not the whole scene: only burned should contain text there.
function brightPixels(variant, time) {
  const band = execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-ss', String(time),
    '-i', `${variant}/video.mp4`, '-vf', 'crop=1280:220:0:500,format=gray',
    '-frames:v', '1', '-f', 'rawvideo', '-'], { cwd });
  let count = 0;
  for (const luma of band) if (luma > 185) count++;
  return count;
}
for (const t of [2, 8]) {
  assert.ok(brightPixels('clean', t) < 20, `Unexpected overlay in clean cut at ${t}s`);
  assert.ok(brightPixels('burned', t) > 400, `Subtitle missing at ${t}s`);
}
console.log(`Verified ${language} captions, 15 s, 450 frames, H.264/AAC.\n${cwd}`);
for (const variant of ['clean', 'burned']) {
  console.log(['video.mp4', 'captions.srt', 'thumbnail.jpg'].map(f => path.join(cwd, variant, f)).join('\n'));
}
