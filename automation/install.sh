#!/bin/bash
# Installs a launchd job that runs run-daily.sh every day at 09:30 local time.
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)"
claude_bin="$(command -v claude)"
label=dev.lookbk.awesome-daily
plist="$HOME/Library/LaunchAgents/$label.plist"
cat >"$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$dir/run-daily.sh</string></array>
  <key>EnvironmentVariables</key><dict>
    <key>PATH</key><string>$(dirname "$claude_bin"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>CLAUDE_BIN</key><string>$claude_bin</string>
  </dict>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>30</integer></dict>
  <key>StandardOutPath</key><string>$dir/logs/launchd.log</string>
  <key>StandardErrorPath</key><string>$dir/logs/launchd.log</string>
</dict></plist>
PLIST
mkdir -p "$dir/logs"
launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$plist"
echo "installed $plist (runs daily 09:30, uses $claude_bin)"
