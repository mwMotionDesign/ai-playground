import sys
import whisper

model = whisper.load_model("medium")  # "base", "small", "medium", "large"

path = sys.argv[1]
result = model.transcribe(path)

sys.stdout.buffer.write(result["text"].encode('utf-8'))
sys.stdout.flush()