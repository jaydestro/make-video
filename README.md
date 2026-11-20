# make-video

A standalone Copilot skill for creating, resuming, and revising narrated videos in ordinary chat. **The only file you distribute is `SKILL.md`.** Copilot writes the project brief, scenes, timing data, captions and render commands in a private workspace, then runs them. No renderer repository, Python scripts or template project are required.

**No Azure subscription, cloud speech account or API key is required.** Try the offline example below before choosing a voice for your own material.

## See an interview and its finished video

**“Show library visitors how handwriting shaped early printed letters.”** Follow the [sample interview](examples/printing/interview.md) from that idea to the finished cut: the same three letter pairs change from slanted handwriting to upright type as a human narrator reads an 1893 passage.

[![Watch The shapes of letters: upright letterforms and English captions on a dark page](examples/printing/sample/thumbnail.jpg)](examples/printing/sample/video.mp4?raw=true)

**[Watch or download the video (15 seconds, MP4)](examples/printing/sample/video.mp4?raw=true)** · [Read the interview](examples/printing/interview.md) · [Get the SRT](examples/printing/sample/captions.srt) · [View the thumbnail](examples/printing/sample/thumbnail.jpg).
No install or render is needed to watch. If your browser downloads the file instead of playing it, open it in your usual video player.

## Try a 15-second video without an account

Download or clone this repository, then open a terminal in its root. With [FFmpeg and ffprobe](#set-up-and-check-ffmpeg) and **Node.js 22+** installed, run:

```text
node examples/printing/render.mjs
```

The included human voice explains how handwriting influenced early printing. The example creates a **15-second clean MP4 and a captioned MP4**, plus `captions.srt` and `thumbnail.jpg` beside each. The command prints all six paths under a new `out/printing/` run. No Copilot login, network calls, packages, model downloads or credentials are used by the demo.

Try `node examples/printing/render.mjs ar` for **English narration with Arabic captions**. Default captions are English. Both demonstration tracks use measured phrase boundaries, not word highlights. [Recording credits, transcripts and reuse terms](examples/printing/NOTICE.md). Node is only for this optional demo and smoke test, **not** a skill requirement.

## Install or update the skill

**Tested chat host:** GitHub Copilot CLI on Windows. The skill is plain Markdown; other agents or hosts that read `SKILL.md` may work, but their discovery, slash commands, file access and consent prompts are not verified here. Using Copilot itself requires its normal access; the offline demo does not.

Clone using the repository's **Code > HTTPS** URL, or download the ZIP. From the root of your trusted local copy, start `copilot` to use the project skill directly. To make it available in **other workspaces** without copying it, register this checkout's skills directory once:

| Windows (PowerShell) | macOS / Linux (terminal) |
| --- | --- |
| `copilot skill add (Resolve-Path '.github\skills').Path` | `copilot skill add "$PWD/.github/skills"` |

Use `copilot skill list` to check discovery. To update a Git checkout, run `git pull --ff-only` in it; for ZIP installs, replace the extracted files at the same path. Run `/skills reload` in an open chat. If you previously installed a **copy** of `SKILL.md`, update that copy too or use only the registered-directory method; don't keep two different `make-video` skills enabled. To install only in a single project, run `copilot skill add --project <path-to-SKILL.md>` from that project instead.

## Use it

In Copilot chat, choose how to start:

| Type this | What happens |
| --- | --- |
| `/make-video interview` | Answer one question at a time. Start with a web URL, document, script, pasted text or just a topic. You can give a specific action or link for viewers, plus optional examples, screenshots or pronunciation notes. Copilot recommends the technical settings. |
| `/make-video yolo https://science.nasa.gov/eclipses/` | Paste a public URL, answer one short format check, then let Copilot write, narrate, render and verify. |
| `/make-video https://science.nasa.gov/eclipses/` | Same quick setup as YOLO. No command to memorize beyond the skill name. |
| `/make-video` | Start the guided interview without supplying a source yet. |

For a revision, give the project name or previous output path and what should change. Prior deliveries stay intact.

### What YOLO asks

| Setting | Choose |
| --- | --- |
| Screen shape | **Landscape** (wide, default) or **portrait** (vertical). |
| Captions in the picture | **On** (always visible, default), **off** (subtitle file only), or **both** (a captioned MP4 and a clean MP4). |
| Length and audience | Optional. Default: 90-120 seconds including the ending hold, for the audience implied by the page. |
| Languages | What should viewers hear and read? Narration and captions default to the source language, not your device locale. You can request translated phrase captions, e.g. English audio with Arabic subtitles. |
| Call to action | Optional. What should viewers do next? Give an action (e.g. "Try the query"), a destination URL, both, or "none". Your CTA appears on the closing card. |

One reply is enough: **“Portrait, both, about 45 seconds, for beginners. CTA: try the query in your own container.”** After that, Copilot takes over. **Every MP4 gets its own SRT subtitle file and JPEG thumbnail**, including previews and videos with captions turned off. Choosing *both* produces two complete sets of three files using the same narration and layout.

To skip even the setup, specify shape, captions and CTA in the command (e.g. `portrait, captions off, CTA: none`), or use `/make-video yolo <URL> use defaults`. Label a separate CTA link with `CTA:` so it stays distinct from the source URL.

## What you need on the computer that renders the video

You can **start an interview with just Copilot CLI and the installed skill**. To finish a narrated MP4 using the standalone FFmpeg path, the machine running Copilot needs:

| Needed for rendering | What to have ready |
| --- | --- |
| Encode, mix and inspect media | `ffmpeg` **and** `ffprobe` on `PATH`. Use an FFmpeg build with the `lavfi` input, `color` and `apad` filters, `ass` filter (libass for text/diagrams), `libx264` and `aac` encoders for MP4, and `mjpeg` for the thumbnail. Even a clean video can use libass to draw its scene labels. |
| Draw readable text | An installed font covering the language of the video, e.g. Segoe UI on Windows or DejaVu Sans for Latin text on Linux. No browser or GPU is required for this render path. |
| Narrate and synchronize | **One** usable speech route: an installed neural speech engine **and its licensed voice model**; a configured, explicitly authorized speech service; or a permitted recording of the exact script. For synchronized captions, use provider timings, supplied timings, or an available local alignment tool. Word highlights need word-level timing. FFmpeg encodes audio; it does **not** create a natural voice. |
| Read and write the job | Read access to the source URL or local material and a writable private project folder with room for audio, previews and one MP4 per variant. An online source or hosted voice needs network access; local files plus a local voice can render offline. |

No separate renderer checkout, Python scripts, Node installation, or API key is required by the **skill itself**. A *chosen speech engine* can have its own installation or credential requirements. Keep credentials outside the brief and chat.

### Set up and check FFmpeg

If either command below is missing, install an FFmpeg distribution that includes both programs, then open a **new terminal** so it sees the updated `PATH`. Typical package-manager commands (choose only the one for your machine):

| Windows with WinGet | macOS with Homebrew | Ubuntu/Debian |
| --- | --- | --- |
| `winget install --id Gyan.FFmpeg -e` | `brew install ffmpeg-full` | `sudo apt install ffmpeg fonts-dejavu-core` |

On macOS, the full formula supplies libass and is keg-only. Before running the checks or demo, run `export PATH="$(brew --prefix ffmpeg-full)/bin:$PATH"` in that terminal. Use a font with the necessary glyphs and shaping support (e.g. DejaVu Sans or a suitable Noto font for the language).

Run these checks in the terminal where you run Copilot:

```text
ffmpeg -version
ffprobe -version
ffmpeg -hide_banner -h filter=ass
```

Both tools should print versions, and the last command should describe the **ass** filter. If it reports an unknown filter, use a build with **libass** enabled.

**Optional one-second encode test:** Run these in an empty, writable folder. They create a blue picture and a test tone, not a narrated video:

```text
ffmpeg -nostdin -v error -n -f lavfi -i color=c=navy:s=320x180:r=30 -f lavfi -i sine=frequency=440:sample_rate=48000 -af apad -t 1 -c:v libx264 -pix_fmt yuv420p -c:a aac make-video-check.mp4
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height -of compact make-video-check.mp4
ffmpeg -nostdin -v error -n -ss 0.5 -i make-video-check.mp4 -frames:v 1 -c:v mjpeg make-video-check.jpg
```

Expect an H.264 video stream at 320x180, an AAC audio stream, and a JPEG. You can delete the two `make-video-check` files afterward. If FFmpeg reports an unknown encoder, choose a build with the named encoder enabled.

### Voice and permissions

The skill prefers models and tools that can generate expressive, natural-sounding speech. It checks phrasing on a sentence from the script; it won't substitute a robotic voice just because one is installed. **For YOLO, set up and authorize your narration route before starting.** A cloud API key alone is not consent to send the script or incur charges.

For **new synthetic narration with no speech account**, follow the [local Piper recipe](examples/local-voice/README.md): install a CPU engine in a private environment, fetch a checksum-pinned English voice once, audition a sentence, then generate a full WAV and phrase-timed SRT offline. Or bring your own permitted recording and timings. Hosted speech services are optional; no specific provider is preferred.

After the format check, YOLO makes no further creative requests. It does not install software, bypass host permissions or approve new spending for you. If an essential prerequisite is missing, it saves the draft and reports exactly what is missing instead of delivering a silent or incorrectly narrated MP4.

## License and contributing

The skill, docs, example code and original designs use the [MIT license](LICENSE). The [public-domain recording](examples/printing/NOTICE.md) and [external engine/model](examples/local-voice/README.md) have separately documented terms. A source URL is a reference, not permission to republish photos, music, or a person's voice. Keep private briefs, credentials and generated projects out of commits.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the offline release check, platform coverage, safe bug reports and release checklist.
