# Tira o "disco" claro e liso que sobrou no centro de public/envelope/foto.webp (lugar do selo antigo):
# refaz a luz por interpolação do entorno, devolve a granulação do papel e prolonga as 4 dobras até o centro.
# Entrada: originais/foto_envelope.webp. Uso: python3 scripts/foto_remendo.py [saida.webp]  (sem argumento, grava em public/envelope/foto.webp)
import numpy as np, cv2, sys
p = "public/envelope/foto.webp"; im = cv2.imread("originais/foto_envelope.webp").astype(np.float32)
H, W = im.shape[:2]; C = np.array([293., 519.]); R, F = 100, 35
yy, xx = np.mgrid[:H, :W]; d = np.hypot(xx - C[0], yy - C[1])
w = np.clip((R + F - d) / F, 0, 1)[..., None]
lp = cv2.GaussianBlur(im, (0, 0), 5)
hole = (d < R).astype(np.uint8) * 255
alvo = cv2.inpaint(np.clip(lp, 0, 255).astype(np.uint8), hole, 25, cv2.INPAINT_TELEA).astype(np.float32)
alvo = cv2.GaussianBlur(alvo, (0, 0), 6)
fino = im - lp
limpo = lambda x0, x1, y0, y1: fino[y0:y1, x0:x1].std()          # papel sem flor nem dobra
sd_fora = np.mean([limpo(385, 415, 540, 600), limpo(170, 200, 540, 600), limpo(385, 415, 400, 450)])
sd_dentro = fino[d < R - 10].std()
rng = np.random.default_rng(3)
ruido = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 1.0)[..., None]
ruido *= np.sqrt(max(sd_fora ** 2 - sd_dentro ** 2, 0)) / ruido.std()
novo = alvo + fino + ruido
# dobras: cada uma vai do centro a um canto; copia a seção transversal de logo fora do disco, ao longo da dobra
cantos = [(52, 180), (523, 177), (60, 865), (525, 865)]
for cx, cy in cantos:
    v = np.array([cx - C[0], cy - C[1]]); v /= np.hypot(*v); n = np.array([-v[1], v[0]])
    t = (xx - C[0]) * v[0] + (yy - C[1]) * v[1]; u = (xx - C[0]) * n[0] + (yy - C[1]) * n[1]
    ref = C + v * (R + 14)
    mx = (ref[0] + n[0] * u).astype(np.float32); my = (ref[1] + n[1] * u).astype(np.float32)
    amostra = cv2.remap(im, mx, my, cv2.INTER_LINEAR)
    amostra_lp = cv2.remap(lp, mx, my, cv2.INTER_LINEAR)
    wu = np.clip(1 - (np.abs(u) - 8) / 10, 0, 1)                 # só perto da dobra
    wt = np.clip((t - 20) / 15, 0, 1) * np.clip((R + 8 - t) / 12, 0, 1)   # entre o selo e a borda do disco
    k = (wu * wt)[..., None]
    novo = novo * (1 - k) + (alvo + (amostra - amostra_lp)) * k
out = im * (1 - w) + novo * w
print("granulação dentro/fora:", round(float(sd_dentro), 2), round(float(sd_fora), 2))
cv2.imwrite(sys.argv[1] if len(sys.argv) > 1 else p, np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 92])
