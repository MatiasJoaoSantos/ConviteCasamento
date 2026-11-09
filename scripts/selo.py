# Gera public/envelope/selo.webp (240px p/ exibir a 80px, sprite que acompanha a aba) e remendo.webp (300px p/ exibir a 100px, selo + sombra, é o botão)
# a partir do selo de lacre em originais/selo_lacre.jpeg (que traz o "xadrez" de transparência assado no JPEG).
import numpy as np, cv2
src = cv2.imread("originais/selo_lacre.jpeg")
b, g, r = [src[..., i].astype(int) for i in range(3)]
chroma = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)   # xadrez é cinza (croma ~0); lacre é dourado
m = (chroma > 18).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
m = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
cnt, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
m = np.zeros_like(m); cv2.drawContours(m, cnt, -1, 1, cv2.FILLED)           # preenche buracos
m = cv2.erode(m, np.ones((3, 3), np.uint8))                                  # come a franja do xadrez
a = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.5)
x, y, w, h = cv2.boundingRect(m)
rgba = np.dstack([src, (a * 255).astype(np.uint8)])[y:y + h, x:x + w]

def fit(img, lado):  # cabe num quadrado lado x lado, centralizado
    s = lado / max(img.shape[:2]); im = cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    out = np.zeros((lado, lado, 4), np.uint8); oy, ox = (lado - im.shape[0]) // 2, (lado - im.shape[1]) // 2
    out[oy:oy + im.shape[0], ox:ox + im.shape[1]] = im; return out

selo = fit(rgba, 240)
cv2.imwrite("public/envelope/selo.webp", selo, [cv2.IMWRITE_WEBP_QUALITY, 98])
# remendo: selo no mesmo tamanho/posição + sombra suave e deslocada para baixo
big = np.zeros((300, 300, 4), np.uint8); big[30:270, 30:270] = selo
sombra = cv2.GaussianBlur(big[..., 3].astype(np.float32) / 255, (0, 0), 9)
sombra = np.roll(sombra, 8, axis=0) * 0.45
out = np.zeros((300, 300, 4), np.float32); out[..., :3] = (60, 45, 35); out[..., 3] = sombra * 255   # BGR marrom
al = big[..., 3:4].astype(np.float32) / 255
out[..., :3] = big[..., :3] * al + out[..., :3] * (1 - al)
out[..., 3] = np.maximum(out[..., 3], big[..., 3])
cv2.imwrite("public/envelope/remendo.webp", np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 98])
for f in ("selo", "remendo"):
    im = cv2.imread(f"public/envelope/{f}.webp", cv2.IMREAD_UNCHANGED).astype(float); bg = np.array([233, 246, 254.])
    al = im[..., 3:4] / 255; cv2.imwrite(f"/tmp/{f}_prev.png", (im[..., :3] * al + bg * (1 - al)).astype(np.uint8))
