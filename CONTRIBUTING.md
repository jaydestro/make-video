# Contributing

Keep the installed skill self-contained in `.github/skills/make-video/SKILL.md`.
Examples and release checks may use optional tools but must not become production
dependencies. Keep generic examples independent of any cloud provider or account.
Document the source and redistribution rights of all new fixtures.

## Before opening a pull request

From the repository root, with Node 22+, FFmpeg with libass, ffprobe and a font
supporting Arabic (see the README), run:

```text
node examples/printing/render.mjs en
node examples/printing/render.mjs ar
```

Both runners use the same bundled English narration without network access.
Each creates a new run, verifies full audio/video decode, dimensions, fps, frame
count, runtime, SRT text and measured timings, burned vs clean subtitle bands,
and decodable JPEG thumbnails. Open one of the Arabic burned frames and confirm
the glyphs are joined, legible and not clipped. Pixel checks alone do not prove
correct translation or shaping. For changes to the optional sentence-timing
helper run `python -m unittest discover -s tests -v` with Python 3.11+.

The GitHub Actions matrix repeats the fixture on Windows, macOS and Ubuntu.
Runner provisioning needs network access; the render itself does not. A manual
workflow dispatch can explicitly enable the **real Piper synthesis** check,
which downloads packages and the pinned model to the CI runner. A configured
job is not evidence that a specific platform passed: use the result for the
commit you are releasing.

## Reporting an issue

Include OS/architecture, Copilot CLI version (if used), FFmpeg/ffprobe versions,
the mode and language pair, expected result, actual error and a **public or
synthetic** repro source. Do not upload `.env`, credentials, signed media URLs,
private narration, private briefs or logs with identifying data. Report sensitive
issues privately to the maintainers, not by opening a public issue with details.

## Releasing after a repository move

1. Review the reachable Git history and the exact files to publish, not just
   `.gitignore`. Exclude private projects, renders, secrets and downloaded models.
   Verify `LICENSE`, the fixture NOTICE and external dependency license links.
2. Verify personal and project skill discovery from a clean checkout. Use the
   interview and URL examples, including separate spoken/caption languages.
3. Run the offline matrix and manually opted-in neural audition/full-take check.
   Record real platform results, outstanding limitations and whether audio was
   listened to. Do not mark an unrun integration or unsupported host as tested.
4. Have the authorized owner confirm release scope and destination. After checks
   pass and the intended files are committed, tag that commit with the agreed
   `vX.Y.Z` version, publish release notes and link to that immutable skill file.
   Do not tag a dirty checkout or old commit, or change repo visibility as part
   of rendering/testing.
