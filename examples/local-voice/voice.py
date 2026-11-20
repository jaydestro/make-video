"""Optional Piper example. Only the explicit fetch command uses the network."""

import argparse
import hashlib
import io
from pathlib import Path
import shutil
import sys
import tempfile
import urllib.request
import wave


MODEL = "en_US-ljspeech-medium.onnx"
BASE = ("https://huggingface.co/rhasspy/piper-voices/resolve/"
        "e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_US/ljspeech/medium/")
FILES = {
    MODEL: "6f52a751e2349abe7a76735eb09dc1875298c77ea2342ffd2fef79ff81b87f22",
    MODEL + ".json": "141d612cc0a95ed7efc1ca936b845c2364967f2e9217c5dbfcf69fc4d6c65860",
}


def verify_file(path):
    with path.open("rb") as f:
        if hashlib.file_digest(f, "sha256").hexdigest() != FILES[path.name]:
            raise ValueError(f"Checksum mismatch: {path}")


def fetch(directory):
    directory.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=directory) as tmp:
        for name in FILES:
            dest = directory / name
            if dest.exists():
                verify_file(dest)
                continue
            staged = Path(tmp) / name
            with urllib.request.urlopen(BASE + name, timeout=90) as src, staged.open("xb") as out:
                shutil.copyfileobj(src, out)
            verify_file(staged)
            with staged.open("rb") as src, dest.open("xb") as out:
                shutil.copyfileobj(src, out)
    print(f"Verified voice: {directory / MODEL}")


def stamp(frames, rate):
    ms = round(frames * 1000 / rate)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def write_take(lines, synthesize, output):
    output.mkdir(parents=True, exist_ok=False)
    total, rate = 0, None
    with wave.open(str(output / "narration.wav"), "wb") as track, (
        output / "captions.srt"
    ).open("x", encoding="utf-8", newline="\n") as srt:
        for i, line in enumerate(lines, start=1):
            with io.BytesIO() as buf:
                with wave.open(buf, "wb") as chunk:
                    synthesize(line, chunk)
                buf.seek(0)
                with wave.open(buf, "rb") as chunk:
                    if rate is None:
                        rate = chunk.getframerate()
                        track.setparams(chunk.getparams())
                    frames = chunk.getnframes()
                    if (not frames or chunk.getframerate() != rate or
                            chunk.getnchannels() != 1 or chunk.getsampwidth() != 2):
                        raise ValueError("Expected nonempty mono 16-bit PCM at a consistent sample rate")
                    track.writeframes(chunk.readframes(frames))
                    end = total + frames
                    srt.write(f"{i}\n{stamp(total, rate)} --> {stamp(end, rate)}\n{line}\n\n")
                    total = end
    print(f"{output}: {total / rate:.3f}s, {len(lines)} measured sentence cues")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    download = sub.add_parser("fetch")
    download.add_argument("directory", type=Path)
    say = sub.add_parser("say")
    say.add_argument("directory", type=Path)
    say.add_argument("script", type=Path, help="UTF-8, one complete sentence per line")
    say.add_argument("output", type=Path, help="new directory, never overwritten")
    say.add_argument("--audition", action="store_true", help="render the first sentence only")
    args = parser.parse_args()
    if args.command == "fetch":
        fetch(args.directory)
        return
    lines = [s.strip() for s in args.script.read_text(encoding="utf-8-sig").splitlines() if s.strip()]
    if not lines:
        parser.error("The script is empty")
    for name in FILES:
        verify_file(args.directory / name)
    from piper import PiperVoice
    voice = PiperVoice.load(args.directory / MODEL)
    write_take(lines[:1] if args.audition else lines, voice.synthesize_wav, args.output)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ImportError, ValueError) as error:
        sys.exit(str(error))
