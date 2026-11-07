#!/usr/bin/env bash
# Fetch the raw recordings and build the cleaned voice tracks.
# Usage: bash scripts/setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

fetch() { # <folder> <google-drive-id>
  mkdir -p "public/$1"
  if [ ! -f "public/$1/source.mp4" ]; then
    curl -sSL -o "public/$1/source.mp4" "https://drive.usercontent.google.com/download?id=$2&export=download&confirm=t"
  fi
  # Voice chain: rumble cut -> denoise -> compressor -> presence lift -> -14 LUFS
  ffmpeg -v error -y -i "public/$1/source.mp4" -vn \
    -af "highpass=f=$3,afftdn=nr=$4:nf=-$5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,equalizer=f=3000:t=q:w=1.2:g=2,loudnorm=I=-14:TP=-1.5:LRA=9" \
    -ar 48000 -c:a aac -b:a 192k "public/$1/voice.m4a"
  echo "Ready: public/$1"
}

fetch v1 1AP_dyqDl0yxDyjQLioc3mSGtCoJOwh9K 85 10 40   # Tolak motor
fetch v2 1EbTBDmRIJFTnfT3Uu5wlRQ6XfFHLVH-x 90 14 35   # Repair phone (noisier shop)
fetch v3 1C-340--bzSDSi--lyxnPAM5uoytGpSMD 85 10 40   # Showroom 19 Motor Trading
fetch v4 10Lv3y7Tddv-uAGlvz61waC2BQ40bqXJD 85 10 40   # Stok baru sampai
fetch v5 1yfvjI5XHXoe6G0Zpv8iXxEWvLUsSjIVN 85 10 40   # EX5 Dream RM5,000
fetch v6 1ZeFxxKl5axgK-VcB2_iRWdJTvWoR5C4a 85 10 40   # Phone lama jangan buang
fetch v7 1ounZlu3GCzUM7UkkvCK7hzdY-awIXiD5 85 10 40   # Repair TV (voice-over)
