import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export function writePrintingHandoff(directory, language, { featured = false } = {}) {
  const source = featured ? '../' : '';
  const variants = featured ? [['Captioned', '']] : [['Clean', 'clean/'], ['Captioned', 'burned/']];
  const words = readFileSync(new URL('./en.srt', import.meta.url), 'utf8').trim()
    .split(/\r?\n\r?\n/).flatMap(cue => cue.split(/\r?\n/).slice(2)).join(' ');
  const files = variants.map(([label, dir]) =>
    `- ${label}: [Video](${dir}video.mp4) / [Subtitles](${dir}captions.srt) / [Thumbnail](${dir}thumbnail.jpg)`);
  const text = `# The shapes of letters - video handoff

Edit this file, save it, then tell your agent: **I updated the handoff.**
You can change a setting or scene below, or leave a note. No timecodes or code needed.

## Changes for the next cut

<!-- Add your edits here. -->

## This cut

- Version: ${featured ? 'Library exhibit sample v1' : path.basename(directory)}
- Audience and takeaway: library visitors; notice how early printed letters resembled handwriting.
- Picture: landscape, 1280 x 720, 30 fps. Length: 15 seconds, including the final 2.714-second hold.
- Voice: Linda Johnson's recorded English reading at its original pace. Keep this recording and its exact words unless explicitly changed.
- Captions: ${language === 'ar' ? 'Arabic translation' : 'English'}, synchronized by phrase. ${featured ? 'One captioned video.' : 'Two versions: clean and captioned; only the burned text differs.'}
- Closing action or link: none. Keep the book and reader credit. No music.

## Spoken words

${words}

## Scenes

1. **0-5.27 s, The written letter:** Slanted "Aa Bb Cc" drifts across the dark background.
2. **5.27-12.29 s, The printed letter:** Upright "Aa Bb Cc" settles into place as the reader compares printed and written letters.
3. **12.29-15 s, Closing hold:** Keep the printed letters on screen with "Arts and Crafts Essays, 1893 / Read by Linda Johnson".

## Files

${files.join('\n')}
- Sources: [Narration](${source}narration.wav) / [Scene artwork and timing](${source}scenes.ass) / [Timed caption text](${featured ? 'captions.srt' : 'source.srt'}) / [Recording credits](${source}NOTICE.md)
`;
  const editable = path.join(directory, 'HANDOFF.md');
  const snapshot = path.join(directory, 'as-delivered');
  mkdirSync(snapshot, { recursive: true });
  writeFileSync(editable, text, { flag: 'wx' });
  writeFileSync(path.join(snapshot, 'HANDOFF.md'), text, { flag: 'wx' });
  return editable;
}
