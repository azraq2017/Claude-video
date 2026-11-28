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
fetch v11 1uAzZr1pIPasM6_qjR2WGif_WK3YeKfRX 85 10 40   # Tas Tech anti-scam (no 19MTR outro)
fetch v12 1-r7vA3dDmMjU0f7Z7HnUGt9-pas_v_Sa 85 10 40   # Tas Tech tolak phone
# v13 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v13/source.mp4 ]; then
  mkdir -p public/v13
  curl -sSL -o public/v13/raw.mp4 "https://drive.usercontent.google.com/download?id=1QmpiM8CpBzmweCxZnSx-7tK9_nVk9Y0Q&export=download&confirm=t"
  ffmpeg -v error -y -i public/v13/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v13/source.mp4
  rm public/v13/raw.mp4
fi
fetch v13 1QmpiM8CpBzmweCxZnSx-7tK9_nVk9Y0Q 85 10 40   # 19MTR stok ~100 biji (voice-over)
# v14 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v14/source.mp4 ]; then
  mkdir -p public/v14
  curl -sSL -o public/v14/raw.mp4 "https://drive.usercontent.google.com/download?id=15Le4OydJwOvXdIrDgSHfEtx-dLPw2shq&export=download&confirm=t"
  ffmpeg -v error -y -i public/v14/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v14/source.mp4
  rm public/v14/raw.mp4
fi
fetch v14 15Le4OydJwOvXdIrDgSHfEtx-dLPw2shq 85 10 40   # 19MTR LC135 RM2,999
# v16 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v16/source.mp4 ]; then
  mkdir -p public/v16
  curl -sSL -o public/v16/raw.mp4 "https://drive.usercontent.google.com/download?id=1ZvQ1sFzSYjGiV_G6z6tKMB416Fjr6Rr7&export=download&confirm=t"
  ffmpeg -v error -y -i public/v16/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v16/source.mp4
  rm public/v16/raw.mp4
fi
fetch v16 1ZvQ1sFzSYjGiV_G6z6tKMB416Fjr6Rr7 85 10 40   # 19MTR Lagenda 115ZR RM1,950
# v17 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v17/source.mp4 ]; then
  mkdir -p public/v17
  curl -sSL -o public/v17/raw.mp4 "https://drive.usercontent.google.com/download?id=1pv1OIg9I1TvKI84Ka5gjtZ2WNXrMuAmB&export=download&confirm=t"
  ffmpeg -v error -y -i public/v17/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v17/source.mp4
  rm public/v17/raw.mp4
fi
fetch v17 1pv1OIg9I1TvKI84Ka5gjtZ2WNXrMuAmB 85 10 40   # 19MTR LC V4 x2
# v18 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v18/source.mp4 ]; then
  mkdir -p public/v18
  curl -sSL -o public/v18/raw.mp4 "https://drive.usercontent.google.com/download?id=14tmpPJuK_7aWaIkTl4hvw1BBpuEl3yqg&export=download&confirm=t"
  ffmpeg -v error -y -i public/v18/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v18/source.mp4
  rm public/v18/raw.mp4
fi
fetch v18 14tmpPJuK_7aWaIkTl4hvw1BBpuEl3yqg 85 10 40   # 19MTR Lagenda 115ZR biru RM2,999 (effects + subtitles)
# v19 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v19/source.mp4 ]; then
  mkdir -p public/v19
  curl -sSL -o public/v19/raw.mp4 "https://drive.usercontent.google.com/download?id=1rMaYXiXSsP3ksx2VCLdFasjcV3QcsIuY&export=download&confirm=t"
  ffmpeg -v error -y -i public/v19/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v19/source.mp4
  rm public/v19/raw.mp4
fi
fetch v19 1rMaYXiXSsP3ksx2VCLdFasjcV3QcsIuY 85 10 40   # 19MTR EX5 full restore (subtitles)
# v20 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v20/source.mp4 ]; then
  mkdir -p public/v20
  curl -sSL -o public/v20/raw.mp4 "https://drive.usercontent.google.com/download?id=1OKFlm-qWv-fv0ViFFulwUW29L1LQOWJ1&export=download&confirm=t"
  ffmpeg -v error -y -i public/v20/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v20/source.mp4
  rm public/v20/raw.mp4
fi
fetch v20 1OKFlm-qWv-fv0ViFFulwUW29L1LQOWJ1 85 10 40   # 19MTR Yamaha Sport CDI
# v21 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v21/source.mp4 ]; then
  mkdir -p public/v21
  curl -sSL -o public/v21/raw.mp4 "https://drive.usercontent.google.com/download?id=1HPmYbYp9ln0SKZOj7KC-VPjHyGrhoxaU&export=download&confirm=t"
  ffmpeg -v error -y -i public/v21/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v21/source.mp4
  rm public/v21/raw.mp4
fi
fetch v21 1HPmYbYp9ln0SKZOj7KC-VPjHyGrhoxaU 85 10 40   # 19MTR Yamaha XMAX V1
# Event akhir tahun: 7 clips + separate voice-over (event1..7.MOV, "voice event.m4a")
mkdir -p public/event
i=1; for id in 1p-gdnK42DpGQdQD7CLts6R2iPVaWI_H- 1dgg-HC2FT_15TVrg5JVkfrBr5X30ahn1 1vGGZD0d999DD6Shk2gK3HOKcdeM15kiX 14QXNNEr6EDs21fHgk69sSD9tJvif9kHK 1FObzpRn_5krY7Ns_zgMJIrLIQhpHPgPU 1rsDuTAMJn5aVIXtAn9vO-ZntgOM8NmTp 1yAviNymk1EVz1SaWODd6l3bat_aHn-jI; do
  [ -f public/event/f$i.mp4 ] || { curl -sSL -o public/event/raw.mov "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t"; ffmpeg -v error -y -i public/event/raw.mov -c:v copy -c:a aac -b:a 128k -movflags +faststart public/event/f$i.mp4; rm public/event/raw.mov; }
  i=$((i+1))
done
if [ ! -f public/event/vo.m4a ]; then
  curl -sSL -o public/event/raw.m4a "https://drive.usercontent.google.com/download?id=1dLPWWjehOnY1Ey5vwk5rbLUmWY0q-Tsy&export=download&confirm=t"
  ffmpeg -v error -y -i public/event/raw.m4a -af "highpass=f=85,afftdn=nr=8:nf=-40,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,equalizer=f=3000:t=q:w=1.2:g=2,loudnorm=I=-14:TP=-1.5:LRA=9" -ar 48000 -ac 2 -c:a aac -b:a 192k public/event/vo.m4a
  rm public/event/raw.m4a
fi
# v22 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v22/source.mp4 ]; then
  mkdir -p public/v22
  curl -sSL -o public/v22/raw.mp4 "https://drive.usercontent.google.com/download?id=1N2k12Z0GPjHuCM3NU4oRyzZKkAHVbPkX&export=download&confirm=t"
  ffmpeg -v error -y -i public/v22/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v22/source.mp4
  rm public/v22/raw.mp4
fi
fetch v22 1N2k12Z0GPjHuCM3NU4oRyzZKkAHVbPkX 85 10 40   # 19MTR Honda Vario 150
# v23 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v23/source.mp4 ]; then
  mkdir -p public/v23
  curl -sSL -o public/v23/raw.mp4 "https://drive.usercontent.google.com/download?id=17NGw4JZbNzlv2l2rwNyJpU_OCp2lhpb2&export=download&confirm=t"
  ffmpeg -v error -y -i public/v23/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v23/source.mp4
  rm public/v23/raw.mp4
fi
fetch v23 17NGw4JZbNzlv2l2rwNyJpU_OCp2lhpb2 85 10 40   # 19MTR LC135 row (subtitles)
# Event lelong (promo event 1-3): rotated HEVC -> upright, concatenated into one source
if [ ! -f public/event2/source.mp4 ]; then
  mkdir -p public/event2/tmp
  i=1; for id in 1MmaUClr2C3_u7yr_VjZAGVO3DiMyUQNK 1FBqQMQCrCwOz2ZarbEKHUxRe4CBVz7WR 1PIDHnpNegwXDx0zBC4r_qCq63Bb91_5h; do
    curl -sSL -o public/event2/tmp/raw.mp4 "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t"
    ffmpeg -v error -y -i public/event2/tmp/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k public/event2/tmp/f$i.mp4
    echo "file '$PWD/public/event2/tmp/f$i.mp4'" >> public/event2/tmp/list.txt; i=$((i+1))
  done
  ffmpeg -v error -y -f concat -safe 0 -i public/event2/tmp/list.txt -c copy -movflags +faststart public/event2/source.mp4
  rm -rf public/event2/tmp
fi
fetch event2 _ 85 10 40   # (source already present; just builds voice.m4a)
# v24 (HEVC .MOV, upright): transcode to H.264; audio kept untouched
if [ ! -f public/v24/source.mp4 ]; then
  mkdir -p public/v24
  curl -sSL -o public/v24/raw.mov "https://drive.usercontent.google.com/download?id=1uICqXG2zfpEc2qU-S41fm2VVmOTko8Vb&export=download&confirm=t"
  ffmpeg -v error -y -i public/v24/raw.mov -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v24/source.mp4
  ffmpeg -v error -y -i public/v24/source.mp4 -vn -c:a copy public/v24/voice.m4a
  rm public/v24/raw.mov
fi
# v25 arrives as rotated HEVC: transcode upright first
if [ ! -f public/v25/source.mp4 ]; then
  mkdir -p public/v25
  curl -sSL -o public/v25/raw.mp4 "https://drive.usercontent.google.com/download?id=1HJssMD8iYFpRv7Rr3hwdTMdbRoD0Cakt&export=download&confirm=t"
  ffmpeg -v error -y -i public/v25/raw.mp4 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart public/v25/source.mp4
  rm public/v25/raw.mp4
fi
fetch v25 1HJssMD8iYFpRv7Rr3hwdTMdbRoD0Cakt 85 10 40   # 19MTR motor bajet row (subtitles)
