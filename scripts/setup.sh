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
# v8 arrives as rotated HEVC 1920x1080: transcode to upright H.264 1080x1920 first
if [ ! -f public/v8/source.mp4 ]; then
  mkdir -p public/v8
  curl -sSL -o public/v8/raw.mp4 "https://drive.usercontent.google.com/download?id=1f4j9A2knFC79GzKs64noR6ifmCyB0q_L&export=download&confirm=t"
  ffmpeg -v error -y -i public/v8/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v8/source.mp4
  rm public/v8/raw.mp4
fi
fetch v8 1f4j9A2knFC79GzKs64noR6ifmCyB0q_L 85 10 40   # Stok walkthrough (captions only)
fetch v9 1icuezGHs9zc5DMXNHgfKjCtFAKRejiHA 85 10 40   # Promo Deepavali (minimal style)
# v10 is graded before editing: shadow lift + saturation, extra lift on the backlit opening (first 14.8s)
if [ ! -f public/v10/source.mp4 ]; then
  mkdir -p public/v10
  curl -sSL -o public/v10/raw.mp4 "https://drive.usercontent.google.com/download?id=1DF9NGsgOQ0PCbDgr4F5_KeWGSNeGW28S&export=download&confirm=t"
  ffmpeg -v error -y -i public/v10/raw.mp4 -vf "curves=all='0/0 0.18/0.27 0.45/0.53 0.8/0.84 1/1',eq=saturation=1.1:contrast=1.03,curves=all='0/0 0.15/0.24 0.4/0.48 1/1':enable='lt(t,14.8)',unsharp=5:5:0.4" \
    -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a copy -movflags +faststart public/v10/source.mp4
  rm public/v10/raw.mp4
fi
fetch v10 1DF9NGsgOQ0PCbDgr4F5_KeWGSNeGW28S 85 10 40   # Offer bos RM1,650 (graded)
