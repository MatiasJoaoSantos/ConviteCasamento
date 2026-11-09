# Gera as peças da vinheta a partir de originais/previa_floral_sobre_creme.jpg:
# apaga o logo, separa cada COMPONENTE (flor, folha, galho) por cor + forma, tira o creme (alfa),
# salva cada peça recortada em public/vinheta/ e escreve src/vinhetaPecas.js.
# Uso: python3 scripts/vinheta.py   (precisa de numpy + opencv-python)
import json, os
import numpy as np, cv2
K=lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*n+1,2*n+1))
im = cv2.imread("originais/previa_floral_sobre_creme.jpg"); BG=np.array([233,246,254])
im[0:300,515:670]=BG
d = np.abs(im.astype(int)-BG).max(-1)
ink = (d>22).astype(np.uint8)
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(float); h=hsv[...,0]*2; s=hsv[...,1]/255; v=hsv[...,2]/255
fol = ink.astype(bool) & (((h>=65)&(h<=170)&(s>0.18)) | ((h<65)&(s<0.5)&(v<0.7)) | ((s<0.22)&(v<0.75)))
flor = (ink.astype(bool) & ~fol).astype(np.uint8)
flor = cv2.morphologyEx(flor, cv2.MORPH_OPEN, K(2)); flor = cv2.morphologyEx(flor, cv2.MORPH_CLOSE, K(3))
n,lf,st,_ = cv2.connectedComponentsWithStats(flor)
for i in range(1,n):
    if st[i,4]<250: flor[lf==i]=0
n_f,lf = cv2.connectedComponents(flor)
folh = (ink.astype(bool) & ~flor.astype(bool)).astype(np.uint8)
er = cv2.erode(folh, K(3))
n,ls,st,_ = cv2.connectedComponentsWithStats(er)
for i in range(1,n):
    if st[i,4]<60: ls[ls==i]=0
ls=np.where(ls>0,ls,0); ns=ls.max()
markers = ls.copy(); markers[lf>0]=lf[lf>0]+ns
src = (markers==0).astype(np.uint8)
dist,lab = cv2.distanceTransformWithLabels(src, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
# lab: índice do pixel zero mais próximo -> mapeia p/ marcador
ys,xs = np.where(src==0); order = np.argsort(ys*src.shape[1]+xs)  # labels seguem ordem raster dos zeros
tab = np.zeros(lab.max()+1,np.int32); tab[1:len(ys)+1]=markers[ys,xs]
out = tab[lab]; out[ink==0]=0

# peças pequenas demais viram parte da maior vizinha
area = np.bincount(out.ravel(), minlength=out.max()+1); area[0]=0
grande = area >= 1500
mk = np.where(grande[out], out, 0).astype(np.int32)
# espalha os rótulos 3px além da tinta, para levar a borda suave (alfa) junto
alfa = np.clip((d - 6) / 30, 0, 1)
zero = (mk == 0).astype(np.uint8)
_, lab2 = cv2.distanceTransformWithLabels(zero, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
ys, xs = np.where(zero == 0); tab = np.zeros(lab2.max()+1, np.int32); tab[1:len(ys)+1] = mk[ys, xs]
fim = tab[lab2]; fim[alfa == 0] = 0
H, W = fim.shape
rgba = np.dstack([im, (alfa * 255).astype(np.uint8)])
os.makedirs("public/vinheta", exist_ok=True)
for f in os.listdir("public/vinheta"): os.remove("public/vinheta/" + f)
pecas = []; mx = W / 2
for i in np.unique(fim)[1:]:
    m = fim == i; yy, xx = np.where(m); x0, x1, y0, y1 = xx.min(), xx.max()+1, yy.min(), yy.max()+1
    t = rgba[y0:y1, x0:x1].copy(); t[~m[y0:y1, x0:x1], 3] = 0
    n = f"p{i}"; cv2.imwrite(f"public/vinheta/{n}.webp", t, [cv2.IMWRITE_WEBP_QUALITY, 90])
    lado = int((x0 + x1) / 2 >= mx)
    pecas.append(dict(n=n, lado=lado, x=round((x0 - lado*mx) / mx * 100, 3), y=round(y0 / H * 100, 3),
                      w=round((x1 - x0) / mx * 100, 3), cy=round((y0 + y1) / 2 / H, 3)))
open("src/vinhetaPecas.js", "w").write("export default " + json.dumps(pecas, separators=(",", ":")) + "\n")
print(len(pecas), "peças")
