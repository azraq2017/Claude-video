#!/usr/bin/env bash
# Fetch the raw recording and build the cleaned voice track.
# Usage: bash scripts/setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DRIVE_ID="1AP_dyqDl0yxDyjQLioc3mSGtCoJOwh9K"
if [ ! -f public/source.mp4 ]; then
  curl -sSL -o public/source.mp4 "https://drive.usercontent.google.com/download?id=${DRIVE_ID}&export=download&confirm=t"
fi
# Voice chain: rumble cut -> light denoise -> compressor -> presence lift -> -14 LUFS
ffmpeg -v error -y -i public/source.mp4 -vn \
  -af "highpass=f=85,afftdn=nr=10:nf=-40,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,equalizer=f=3000:t=q:w=1.2:g=2,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -ar 48000 -c:a aac -b:a 192k public/voice.m4a
echo "Ready: public/source.mp4 + public/voice.m4a"
