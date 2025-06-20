import sys
import whisper
# import torchaudio as ta
# import torch

# # --- DETECT HARDWARE ---
# if torch.cuda.is_available():
#     device = "cuda"
# elif torch.backends.mps.is_available():
#     device = "mps"
# else:
#     device = "cpu"

# print(f"Using device: {device}")

model = whisper.load_model("medium")  # "base", "small", "medium", "large"

path = sys.argv[1]
result = model.transcribe(path)

sys.stdout.buffer.write(result["text"].encode('utf-8'))
sys.stdout.flush()