# Run Script
# & "W:\Michaverse\_Projects\02 Whisper to Chatterbox\scripts\_powerShellScripts\extractAudioToWhisper.ps1"

# MP4 from Smartphone for Resolve
# ffmpeg -i input.mp4 -vf "fps=30" -c:v libx264 -preset fast -crf 18 -c:a aac -movflags +faststart fixed.mp4

# Ask for audio track index
$trackIndex = Read-Host "Welchen Audio-Track möchtest du extrahieren? (z. B. 0 für ersten Track)"
$language = Read-Host "Welchen Sprache ist das Audio? (z.B. English German)"

# Video-Formate, die durchsucht werden sollen
$videoExtensions = @("*.mp4", "*.mov", "*.mkv")

# Loop durch alle passenden Dateien
foreach ($ext in $videoExtensions) {
    Get-ChildItem -Path . -Filter $ext | ForEach-Object {
        $inputFile = $_.FullName
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($inputFile)

        Write-Host "`n→ Verarbeite: $inputFile"

        $trackExtractDir = "Track Extract"
        if (!(Test-Path $trackExtractDir)) {
            New-Item -ItemType Directory -Path $trackExtractDir | Out-Null
        }
        $outputAudioFilePath = Join-Path $trackExtractDir "$baseName.wav"

        # ffmpeg-Befehl zum Extrahieren
        & ffmpeg -i "$inputFile" -map "0:a:$trackIndex" -ar 16000 -ac 1 -c:a pcm_s16le "$outputAudioFilePath"

        $transcriptDIR = "Transcript"
        if (!(Test-Path $transcriptDIR)) {
            New-Item -ItemType Directory -Path $transcriptDIR | Out-Null
        }

        & whisper "$outputAudioFilePath" --language "$language" --model medium --output_format txt --output_dir "$transcriptDIR"

        $txtDIRfile = Join-Path $transcriptDIR "$baseName.txt"
        if (Test-Path $txtDIRfile) {
            $content = Get-Content $txtDIRfile -Raw
            $charCount = $content.Length
            Write-Host "`n`nTranskript gespeichert unter '$txtDIRfile' mit $charCount Zeichen."
        }
        else {
            Write-Host "`n`nTranskript für '$baseName' wurde nicht gefunden."
        }
    }
}

Write-Host "Fertig. Track extrahiert und transkribiert.`n`n"
