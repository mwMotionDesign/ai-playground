param(
    [string] $ZONOS_REPO_PATH = "W:\Michaverse\_AI\Zonos\Zonos-for-windows"
)

Write-Host "--- Starting setup_zonos_venv..."

# In das scripts-Verzeichnis wechseln
Set-Location "$PSScriptRoot\.."

# Alte venv löschen
if (Test-Path ".\venv-zonos") {
    Write-Host "--- Removing existing venv-zonos"
    Remove-Item -Recurse -Force ".\venv-zonos"
}

# Neue venv anlegen
Write-Host "--- Creating new PY 3.10 venv-zonos"
& py -3.10 -m venv venv-zonos

# venv aktivieren
Write-Host "--- Activating venv-zonos"
. .\venv-zonos\Scripts\Activate.ps1
# ─────────────── NEU ───────────────
# Damit Phonemizer eSpeak-NG automatisch findet, 
# hängen wir den eSpeak NG bin-Pfad in den PATH
$espeakBin = "C:\Program Files\eSpeak NG\bin"
if (Test-Path $espeakBin) {
    Write-Host "Adding eSpeak-NG bin to PATH"
    # Aktivierungs-Skript anpassen, damit es in jeder Session greift
    $activateScript = ".\venv-zonos\Scripts\Activate.ps1"
    Add-Content -Path $activateScript -Value "`n`$Env:Path = `"$espeakBin;`" + `$Env:Path"
    Add-Content -Path $activateScript -Value "`n`$Env:PHONEMIZER_ESPEAK_LIBRARY = `"$espeakBin\libespeak-ng.dll`""
    Write-Host "✅ eSpeak-NG env vars in Activate.ps1 eingetragen"
}
# ─────────────────────────────────────

# In dein Zonos-Repo wechseln
Write-Host "--- Changing to ZONOS_REPO_PATH = $ZONOS_REPO_PATH"
Set-Location $ZONOS_REPO_PATH

# UV-Installer ausführen (Wildcard-Suche)
$installer = Get-ChildItem -Path . -Filter "*install-uv-qinglong.ps1" | Select-Object -First 1
if ($installer) {
    Write-Host "--- Running installer $($installer.Name)"
    & $installer.FullName
}
else {
    Write-Warning "--- Kein install-uv-qinglong.ps1 gefunden - skipping"
}

# requirements-uv.txt installieren
if (Test-Path ".\requirements-uv.txt") {
    Write-Host "--- pip install -r requirements-uv.txt"
    pip install -r requirements-uv.txt
}
else {
    Write-Warning "--- requirements-uv.txt not found - skipping"
}

# Zonos editable installieren
Write-Host "--- pip install -e ."
pip install -e .

# Zurück ins Projekt-scripts-Verzeichnis
Write-Host "--- Returning to scripts folder"
Set-Location "$PSScriptRoot\.."

Write-Host '--- venv-zonos ready! Zum Testen: & .\venv-zonos\Scripts\Activate.ps1; python ..\zonosScript.py --text "Hallo"'
