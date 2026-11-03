import cv2, json, sys
cap=cv2.VideoCapture(sys.argv[1]); fps=cap.get(5); W=int(cap.get(3)); H=int(cap.get(4))
sc=0.5; det=cv2.FaceDetectorYN.create(sys.argv[2],"",(int(W*sc),int(H*sc)),0.6)
out=[]; i=0; step=int(fps/5)
while True:
    ok,f=cap.read()
    if not ok: break
    if i%step==0:
        s=cv2.resize(f,(int(W*sc),int(H*sc)))
        _,fa=det.detect(s)
        box=None
        if fa is not None and len(fa):
            b=max(fa,key=lambda r:r[2]*r[3]); box=[round(float(b[0])/sc/W,3),round(float(b[1])/sc/H,3),round(float(b[2])/sc/W,3),round(float(b[3])/sc/H,3)]
        out.append({"t":round(i/fps,2),"box":box})
    i+=1
json.dump(out,open(sys.argv[3],"w"))
n=sum(1 for o in out if o["box"]); print(len(out),n)
