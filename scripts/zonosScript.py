#!/usr/bin/env python
import os
import sys
import shutil

# ─── 1) libespeak-ng.dll bekannt machen ───
# phonemizer-3.x erwartet PHONEMIZER_ESPEAK_LIBRARY
dll = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"
if os.path.isfile(dll):
    os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = dll
    print(f"✅ PHONEMIZER_ESPEAK_LIBRARY = {dll}", file=sys.stderr)
else:
    print(f"❌ DLL nicht gefunden: {dll}", file=sys.stderr)
    sys.exit(1)

# ─── 2) (Optional) CLI-Fallback ───
# für alte phonemizer-Versionen oder Debug
espeak_exe = shutil.which("espeak") or shutil.which("espeak-ng")
if espeak_exe:
    os.environ["PATH"] = os.path.dirname(espeak_exe) + os.pathsep + os.environ.get("PATH", "")
    print(f"✅ CLI gefunden unter {espeak_exe}", file=sys.stderr)

# ────────────────────────────────────────

import argparse
import json

import torch
import torchaudio

from zonos.model import Zonos
from zonos.conditioning import make_cond_dict
from zonos.utils import DEFAULT_DEVICE as device

def main():
    p = argparse.ArgumentParser(description="Invoke Zonos TTS")
    p.add_argument("--text",     required=True,  default="Hello Zonos you bitch! How are you doin?", help="Text to synthesize")
    p.add_argument("--audio",    required=False, default="StandardVoice.wav", help="Path to audio sample for voice embedding")
    p.add_argument("--language", default="en-us", help="Language code")
    p.add_argument("--model",    default="Zyphra/Zonos-v0.1-transformer", help="Pretrained model")
    p.add_argument("--seed",     type=int, default=421, help="Random seed")
    p.add_argument("--output",   default="zonos_output.wav", help="Output WAV file")
    args = p.parse_args()

    # 1) Lade das Modell
    model = Zonos.from_pretrained(args.model, device=device)

    # 2) Speaker‐Embedding (falls ein Audio kommen)
    speaker = None
    if args.audio:
        if not os.path.exists(args.audio):
            print(json.dumps({"status":"error","message":f"Audio file not found: {args.audio}"}))
            sys.exit(1)
        wav, sr = torchaudio.load(args.audio)
        speaker = model.make_speaker_embedding(wav, sr)

    # 3) Seed setzen
    torch.manual_seed(args.seed)

    # 4) Conditioning zusammenbauen und generieren
    cond = make_cond_dict(text=args.text, speaker=speaker, language=args.language)
    conditioning = model.prepare_conditioning(cond)
    codes = model.generate(conditioning)

    # 5) Decoden & Speichern
    wavs = model.autoencoder.decode(codes).cpu()
    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    torchaudio.save(args.output, wavs[0], model.autoencoder.sampling_rate)

    # 6) JSON zurückgeben
    print(json.dumps({
        "status": "ok",
        "output_audio": args.output
    }))

if __name__ == "__main__":
    main()


# python zonosScript.py --text "Hello Zonos you bitch! How are you doin?" --audio ".\StandardVoice.wav" --output "out.wav"
# python zonosScript.py
