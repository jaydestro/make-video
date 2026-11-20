# Make a new voice take without a cloud account

This **optional** recipe uses CPU inference with Piper, no API key or GPU.
The [offline printing demo](../../README.md#try-a-15-second-video-without-an-account) does not need
Python, Piper or these downloads. The standalone skill never imports this helper.

**Before downloading:** obtain consent for a private virtual environment and
downloads from PyPI and Hugging Face. Use 64-bit Python **3.11 or 3.12** and
run the following from the repository root. The pinned English model is
63,531,379 bytes (60.6 MiB) plus a 4,972-byte JSON config. Allow additional
space for the Piper and ONNX Runtime packages. No script text is sent online.

**Windows / PowerShell**

```powershell
py -3.12 -m venv .voice-env
.\.voice-env\Scripts\python.exe -m pip install piper-tts==1.4.2
.\.voice-env\Scripts\python.exe examples\local-voice\voice.py fetch .local\voices
.\.voice-env\Scripts\python.exe examples\local-voice\voice.py say .local\voices examples\local-voice\garden.txt out\garden-audition --audition
```

**macOS or Linux**

```sh
python3.12 -m venv .voice-env
./.voice-env/bin/python -m pip install 'piper-tts==1.4.2'
./.voice-env/bin/python examples/local-voice/voice.py fetch .local/voices
./.voice-env/bin/python examples/local-voice/voice.py say .local/voices examples/local-voice/garden.txt out/garden-audition --audition
```

Listen to `out/garden-audition/narration.wav`. If the voice and delivery fit,
repeat the `say` command with a **new output directory** such as `out/garden-take`
and omit `--audition`. After `fetch`, synthesis works offline: the helper verifies
both model-file hashes and loads only those local files. It writes one PCM
`narration.wav` and a matching **phrase-timed** `captions.srt`. Try a different
sentence in a fresh audition folder to test a hard pronunciation.

For your own narration, give the helper a UTF-8 script with **one complete
sentence per line**. It synthesizes complete sentences at natural speed, joins
their PCM samples without extra pauses, and takes cue boundaries from cumulative
sample counts, not estimated reading speed. Keep sentence breaks natural.
Audition joins; if continuous context is needed, use a full-take engine with
timings or align the continuous take separately. Do not claim word highlights
or translate captions by dividing a sentence into equal word durations. Give
the skill the actual WAV and SRT for rendering.

**Licensing and provenance:** the [Piper engine](https://github.com/OHF-Voice/piper1-gpl/tree/v1.4.2)
is GPL-3.0-or-later. The [pinned voices repository](https://huggingface.co/rhasspy/piper-voices/blob/e9c8a39444359388adaa94255becb37a5a2b8e51/README.md)
declares MIT at repository level; the [specific voice card](https://huggingface.co/rhasspy/piper-voices/blob/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_US/ljspeech/medium/MODEL_CARD)
identifies its training dataset as public domain. The card does not provide a
separate weights license. Check the card and the terms for your jurisdiction
and intended use; never assume other voices share these terms. No Piper code,
model weights or config are redistributed here. The script and helper in this
directory are MIT. This English model is an example, not a default for other languages.
