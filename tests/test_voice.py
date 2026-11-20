import importlib.util
from pathlib import Path
import tempfile
import unittest
import wave


ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("voice", ROOT / "examples/local-voice/voice.py")
voice = importlib.util.module_from_spec(spec)
spec.loader.exec_module(voice)


class RecordedSentenceTiming(unittest.TestCase):
    def test_exact_sample_boundaries_and_transcript(self):
        fixture = ROOT / "examples/printing"
        text = (fixture / "en.srt").read_text(encoding="utf-8").strip().split("\n\n")
        lines = [" ".join(cue.splitlines()[2:]) for cue in text]
        with tempfile.TemporaryDirectory() as tmp, wave.open(str(fixture / "narration.wav")) as original:
            dest = Path(tmp) / "take"
            samples = [116125, 154781]

            def recorded_sentence(line, writer):
                writer.setparams(original.getparams())
                writer.writeframes(original.readframes(samples[lines.index(line)]))

            voice.write_take(lines, recorded_sentence, dest)
            actual = (dest / "captions.srt").read_text(encoding="utf-8").strip().split("\n\n")
            for got, expected in zip(actual, text, strict=True):
                self.assertEqual(got.splitlines()[:2], expected.splitlines()[:2])
                self.assertEqual(" ".join(got.splitlines()[2:]), " ".join(expected.splitlines()[2:]))
            with wave.open(str(dest / "narration.wav")) as joined:
                original.rewind()
                self.assertEqual(joined.getparams(), original.getparams())
                self.assertEqual(joined.readframes(sum(samples)), original.readframes(sum(samples)))
            with self.assertRaises(FileExistsError):
                voice.write_take(lines, recorded_sentence, dest)


if __name__ == "__main__":
    unittest.main()
