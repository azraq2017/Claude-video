import numpy as np, sys, os
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
SR=48000; out=sys.argv[1]; rng=np.random.default_rng(7)
def t(d): return np.arange(int(SR*d))/SR
def norm(x,pk=0.89): return x/np.max(np.abs(x))*pk
def save(name,x):
    if x.ndim==1: x=np.stack([x,x],1)
    x=norm(x); wavfile.write(os.path.join(out,name+".wav"),SR,(x*32767).astype(np.int16))
def reverb(x,dur=1.2,mix=0.25,decay=4):
    ir=rng.standard_normal(int(SR*dur))*np.exp(-decay*t(dur)); ir=sosfilt(butter(2,6000,'low',fs=SR,output='sos'),ir)
    L=fftconvolve(x,ir)[:len(x)+len(ir)-1]; R=fftconvolve(x,np.roll(ir,331))[:len(L)]
    dry=np.pad(x,(0,len(L)-len(x))); L=dry+mix*norm(L,1)*np.max(np.abs(x)); R=dry+mix*norm(R,1)*np.max(np.abs(x))
    return np.stack([L,R],1)
def bandsweep(n,f0,f1,q=1.2):
    # time-varying bandpass via frame processing
    y=np.zeros_like(n); hop=512; N=len(n)
    for i in range(0,N,hop):
        p=i/N; fc=f0*(f1/f0)**p; lo=max(30,fc/q); hi=min(SR/2-100,fc*q)
        sos=butter(2,[lo,hi],'band',fs=SR,output='sos'); seg=n[max(0,i-2048):i+hop]
        y[i:i+hop]=sosfilt(sos,seg)[-len(n[i:i+hop]):]
    return y
# whoosh
d=0.55; tt=t(d); n=rng.standard_normal(len(tt))
env=np.sin(np.pi*np.clip(tt/d,0,1))**2.2
w=bandsweep(n,400,5000)*env; pan=tt/d
save("whoosh",reverb(w,0.6,0.18)*1 if False else np.stack([w*(1-pan*0.7),w*(0.3+pan*0.7)],1))
# whoosh down (reverse-ish deeper)
d=0.7; tt=t(d); n=rng.standard_normal(len(tt)); env=(tt/d)**1.5*np.exp(-((tt-d*0.8)/0.12)**2*0)*np.sin(np.pi*tt/d)**1.5
w=bandsweep(n,3000,250)*env; save("swoosh_down",reverb(w,0.8,0.2))
# pop
d=0.18; tt=t(d); f=900*np.exp(-tt*35)+250; ph=2*np.pi*np.cumsum(f)/SR
p=np.sin(ph)*np.exp(-tt*30); p+= 0.15*rng.standard_normal(len(tt))*np.exp(-tt*300); save("pop",reverb(p,0.3,0.12))
# click/tick (UI)
d=0.06; tt=t(d); c=sosfilt(butter(2,[2500,8000],'band',fs=SR,output='sos'),rng.standard_normal(len(tt)))*np.exp(-tt*180)+0.4*np.sin(2*np.pi*3200*tt)*np.exp(-tt*120); save("click",c)
# ding (FM bell)
d=1.6; tt=t(d); fc=1568; b=np.sin(2*np.pi*fc*tt+2.2*np.exp(-tt*3)*np.sin(2*np.pi*fc*1.4*tt))*np.exp(-tt*2.8)
b+=0.4*np.sin(2*np.pi*fc*2.01*tt)*np.exp(-tt*5); save("ding",reverb(b,1.5,0.3,3))
# cash register: bell double + coins rattle + drawer thunk
d=1.4; tt=t(d)
def bell(f,dl):
    x=np.zeros(len(tt)); k=int(dl*SR); tb=tt[:len(tt)-k]; x[k:]=np.sin(2*np.pi*f*tb+1.5*np.exp(-tb*6)*np.sin(2*np.pi*f*2.76*tb))*np.exp(-tb*4); return x
c=bell(2093,0.0)+0.8*bell(2637,0.09)
coins=np.zeros(len(tt))
for k in range(28):
    st=int(SR*(0.12+rng.random()*0.45)); L=int(SR*0.05); fr=4000+rng.random()*5000
    seg=np.sin(2*np.pi*fr*t(0.05))*np.exp(-t(0.05)*90)*(0.3+rng.random()*0.4); coins[st:st+L]+=seg[:len(coins[st:st+L])]
th=np.zeros(len(tt)); st=int(0.1*SR); tb=t(0.25); th[st:st+len(tb)]=np.sin(2*np.pi*(90*np.exp(-tb*8)+50)*tb)*np.exp(-tb*14)
save("cash",reverb(c+0.6*coins+0.9*th,1.0,0.2))
# bass impact / boom
d=1.5; tt=t(d); f=55+120*np.exp(-tt*18); im=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*3.2)
im+=0.5*sosfilt(butter(2,1800,'low',fs=SR,output='sos'),rng.standard_normal(len(tt)))*np.exp(-tt*25)
im=np.tanh(im*1.8); save("impact",reverb(im,1.4,0.18,3))
# riser (1.5s)
d=1.5; tt=t(d); n=rng.standard_normal(len(tt)); r=bandsweep(n,300,9000,1.4)*(tt/d)**2.2
tone=np.sin(2*np.pi*np.cumsum(200*(1+3*(tt/d)**2))/SR)*(tt/d)**2*0.35; save("riser",reverb(r+tone,0.5,0.15))
# glitch/error buzz (for "rosak")
d=0.45; tt=t(d); sq=np.sign(np.sin(2*np.pi*110*tt))*0.6+np.sign(np.sin(2*np.pi*116*tt))*0.4
gate=(np.floor(tt*28)%3!=0).astype(float); er=sosfilt(butter(2,2500,'low',fs=SR,output='sos'),sq*gate)*np.exp(-tt*3); save("error",er)
# boing/negative "price drop" descending
d=0.9; tt=t(d); f=900*np.exp(-tt*2.5)+120; dr=np.sin(2*np.pi*np.cumsum(f)/SR)*(1-np.exp(-tt*80))*np.exp(-tt*2); dr+=0.3*np.sin(2*np.pi*np.cumsum(f*2)/SR)*np.exp(-tt*3)
save("drop",reverb(dr,0.6,0.15))
# sparkle / shine (for "basuh bagi gilat")
d=1.4; tt=t(d); sp=np.zeros(len(tt))
for k in range(14):
    st=int(SR*k*0.06); fr=2600*2**(k/7); L=int(SR*0.5); tb=t(0.5)
    seg=np.sin(2*np.pi*fr*tb)*np.exp(-tb*9)*0.5; sp[st:st+L]+=seg[:len(sp[st:st+L])]
save("sparkle",reverb(sp,1.3,0.4,3))
# camera shutter / snap
d=0.25; tt=t(d); sn=sosfilt(butter(2,[1500,9000],'band',fs=SR,output='sos'),rng.standard_normal(len(tt)))
sn*=np.exp(-((tt-0.01)/0.008)**2)+0.7*np.exp(-((tt-0.09)/0.01)**2); save("shutter",sn)
# notification (for DM)
d=0.9; tt=t(d)
def tn(f,s,dd=0.35):
    x=np.zeros(len(tt)); k=int(s*SR); tb=t(dd); x[k:k+len(tb)]=(np.sin(2*np.pi*f*tb)+0.3*np.sin(2*np.pi*2*f*tb))*np.exp(-tb*9); return x
save("notif",reverb(tn(1318,0)+tn(1760,0.11)+tn(2637,0.22,0.5),0.8,0.25))

# glass crack / shatter (for "pecah")
d=1.2; tt=t(d); g=np.zeros(len(tt))
crack=sosfilt(butter(2,[2000,12000],'band',fs=SR,output='sos'),rng.standard_normal(len(tt)))*np.exp(-tt*40)
g+=crack
for k in range(40):
    st=int(SR*(0.005+rng.random()**2*0.6)); L=int(SR*0.12); fr=3000+rng.random()*9000
    seg=np.sin(2*np.pi*fr*t(0.12)+rng.random()*6)*np.exp(-t(0.12)*(40+rng.random()*60))*(0.2+rng.random()*0.5)
    g[st:st+L]+=seg[:len(g[st:st+L])]
tb=t(0.3); g[:len(tb)]+=0.9*np.sin(2*np.pi*(70+80*np.exp(-tb*20))*tb)*np.exp(-tb*15)
save("glass",reverb(g,1.0,0.22))
# message send / bubble (for WhatsApp)
d=0.35; tt=t(d); f=500+1400*(tt/d)**0.6; snd=np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*np.clip(tt/0.22,0,1))*(tt<0.22)
snd+=0.6*np.sin(2*np.pi*1900*tt)*np.exp(-((tt-0.24)/0.03)**2)
save("send",reverb(snd,0.4,0.15))
# stamp / thud
d=0.6; tt=t(d); th=np.sin(2*np.pi*(60+140*np.exp(-tt*30))*tt)*np.exp(-tt*9)+0.4*sosfilt(butter(2,900,'low',fs=SR,output='sos'),rng.standard_normal(len(tt)))*np.exp(-tt*40)
save("stamp",reverb(np.tanh(th*2),0.5,0.12))
print(sorted(os.listdir(out)))
