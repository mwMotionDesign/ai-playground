import sys
import os
from pathlib import Path
import torchaudio as ta
import torch
from chatterbox.tts import ChatterboxTTS

# --- DETECT HARDWARE ---
if torch.cuda.is_available():
    device = "cuda"
elif torch.backends.mps.is_available():
    device = "mps"
else:
    device = "cpu"

print(f"Using device: {device}")
# print("Received arguments:", sys.argv)


# --- LOAD MODEL ---
model = ChatterboxTTS.from_pretrained(device=device)


# --- RUN MODEL ---
if sys.argv[1] != "":
    text = sys.argv[1]
    exaggeration = float(sys.argv[3])
    pase = float(sys.argv[4])
    temperature = float(sys.argv[5])
else:
    text = "You dumb little shit! The input field, it's empty!"
    exaggeration = 0.6
    pase = 0.05
    temperature = 0.2

default_audio_path = str(Path(__file__).parent / "StandardVoiceEnglish.wav")

if len(sys.argv) > 2 and sys.argv[2].strip():
    audio_prompt_path = sys.argv[2]
else:
    audio_prompt_path = default_audio_path


wav = model.generate(
    text,
    audio_prompt_path=audio_prompt_path,
    exaggeration=exaggeration, #0.6
    temperature=pase, #0.2
    cfg_weight=temperature, #0.05
    )


# --- SAVE TO FILE ---
output_dir = Path(__file__).resolve().parent.parent / "Audiofiles"
output_dir.mkdir(parents=True, exist_ok=True)

output_path = output_dir / "chatterbotOutput.wav"
ta.save(str(output_path), wav, model.sr)