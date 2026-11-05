import json, subprocess, sys
S="/tmp/claude-0/-home-user-Claude-video/39002962-3150-5580-a644-ba29287a8542/scratchpad"
SRC=f"{S}/src/src.mp4"; d=json.load(open(f"{S}/vo/durs.json"))
GAP=0.35
Y="{\\c&H00E6FF&}"; W="{\\c&HFFFFFF&}"
PLANS={
"tiktok":dict(prefix="tik",tail=1.0,lines=[
 ([(45.5,None)],["KORANG CARI MOTOR TERPAKAI?",f"{Y}STOP SCROLL{W} DULU!"]),
 ([(0.3,None)],[f"STOK MOTOR TENGAH {Y}BANYAK GILA{W}!"]),
 ([(6.0,1.3),(26.0,None)],[f"LUAR KEDAI {Y}PENUH{W}...",f"DALAM LAGI {Y}PENUH{W}!"]),
 ([(30.0,None)],["KAPCAI ADA, SPORT ADA,",f"{Y}SKUTER{W} PUN ADA!"]),
 ([(34.0,None)],[f"HARGA {Y}SIAP TAMPAL{W}","SENANG NAK PILIH"]),
 ([(40.0,None)],["SKUTER PUN ADA",f"YANG NI {Y}RM6,500{W} JE!"]),
 ([(38.0,1.8),(9.0,None)],["STOK BANYAK...",f"TAPI YANG CUN {Y}CEPAT HABIS{W}!"]),
 ([(27.5,2.0),(31.5,1.8),(47.9,None)],["JANGAN TUNGGU LAMA!",f"DATANG PILIH {Y}HARI NI{W}!"]),
]),
"story":dict(prefix="story",tail=1.0,lines=[
 ([(45.5,None)],[f"STOK MOTOR {Y}BANYAK GILA{W}!"]),
 ([(26.5,2.4),(41.0,None)],["KAPCAI, SPORT, SKUTER",f"HARGA {Y}SIAP TAMPAL{W}"]),
 ([(34.0,1.8),(47.6,None)],[f"YANG CUN {Y}CEPAT HABIS{W}!",f"DATANG {Y}HARI NI{W}!"]),
]),
}
def ts(t):
  h=int(t//3600); m=int(t%3600//60); s=t%60
  return f"{h}:{m:02d}:{s:05.2f}"
def build(name):
  p=PLANS[name]; n=len(p["lines"])
  clips=[]; vo=[]; ev=[]; t=0.0
  for i,(segs,caps) in enumerate(p["lines"]):
    vd=d[f"{p['prefix']}{i}.wav"]; slot=vd+GAP+(p["tail"] if i==n-1 else 0)
    vo.append((f"{S}/vo/{p['prefix']}{i}.wav", t+0.15))
    rem=slot
    for k,(st,du) in enumerate(segs):
      du=rem if du is None or k==len(segs)-1 else du
      clips.append((st,du)); rem-=du
    # captions split by char length
    tot=sum(len(c) for c in caps); ct=t+0.1
    for j,c in enumerate(caps):
      cd=(vd+GAP)*len(c)/tot if j<len(caps)-1 else (t+slot-ct)
      ev.append((ct,ct+cd,c)); ct+=cd
    t+=slot
  total=t
  ass=f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter ExtraBold,82,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,7,3,5,90,90,0,1
Style: Badge,Inter ExtraBold,58,&H00000000,&H00000000,&H0000E6FF,&H0000E6FF,1,0,0,0,100,100,1,0,3,16,0,8,0,0,300,1
Style: Sub,Inter ExtraBold,44,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,2,0,1,4,2,8,0,0,400,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 1,{ts(0)},{ts(total)},Badge,,0,0,0,,STOK TENGAH BANYAK!
Dialogue: 1,{ts(0)},{ts(total)},Sub,,0,0,0,,MOTOSIKAL TERPAKAI
"""
  for a,b,c in ev:
    ass+=f"Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{{\\pos(540,1180)\\fscx80\\fscy80\\t(0,120,\\fscx100\\fscy100)}}{c}\n"
  assf=f"{S}/{name}.ass"; open(assf,"w").write(ass)
  import os; os.makedirs(f"{S}/clips",exist_ok=True)
  fc=[]; ins=[]
  for i,(st,du) in enumerate(clips):
    cf=f"{S}/clips/{name}_{i}.mp4"
    subprocess.run(["ffmpeg","-v","error","-y","-threads","2","-ss",str(st),"-i",SRC,"-t",f"{du:.3f}",
      "-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1",
      "-af","aresample=48000,aformat=channel_layouts=stereo,volume=0.12",
      "-c:v","libx264","-preset","veryfast","-crf","14","-c:a","pcm_s16le","-f","mov",cf],check=True)
    ins+=["-i",cf]
  m=len(clips)
  fc.append("".join(f"[{i}:v][{i}:a]" for i in range(m))+f"concat=n={m}:v=1:a=1[vc][bg]")
  fc.append(f"[vc]eq=contrast=1.06:saturation=1.18,unsharp=5:5:0.6,ass={assf},format=yuv420p[vout]")
  for k,(f,off) in enumerate(vo):
    ins+=["-i",f]
    fc.append(f"[{k+m}:a]adelay={int(off*1000)}|{int(off*1000)}[vo{k}]")
  fc.append("".join(f"[vo{k}]" for k in range(len(vo)))+f"amix=inputs={len(vo)}:normalize=0,acompressor=threshold=-18dB:ratio=3,volume=1.6[vom]")
  fc.append(f"[bg][vom]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000[aout]")
  out=f"/home/user/Claude-video/output/{name}_9x16.mp4"
  cmd=["ffmpeg","-v","error","-y","-threads","4",*ins,"-filter_complex",";".join(fc),"-map","[vout]","-map","[aout]","-t",f"{total:.3f}",
       "-c:v","libx264","-preset","medium","-crf","19","-profile:v","high","-r","30","-c:a","aac","-b:a","192k","-movflags","+faststart",out]
  subprocess.run(cmd,check=True); print(name,round(total,2),out)
for n in sys.argv[1:]: build(n)
