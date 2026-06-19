#!/usr/bin/env python3
"""Gera media/icon.png (128x128) sem dependencias externas (so zlib/struct).
Tema: nucleo brilhante com orbitas (antigravity) + pontos (skills)."""
import zlib, struct, math, os

OUT = os.path.join(os.path.dirname(__file__), "..", "media", "icon.png")
SIZE = 128
SS = 4               # supersampling
W = SIZE * SS

def smooth(e0, e1, x):
    if e1 == e0:
        return 0.0 if x < e0 else 1.0
    t = (x - e0) / (e1 - e0)
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))

def over(dst, src, a):
    return tuple(src[i] * a + dst[i] * (1 - a) for i in range(3))

cx = cy = W / 2.0
maxd = math.hypot(cx, cy)

BG_IN  = (22, 30, 50)
BG_OUT = (12, 16, 22)
BLUE   = (88, 166, 255)
PURPLE = (188, 140, 255)
CYAN   = (130, 215, 252)
PINK   = (244, 120, 185)
CORE_A = (236, 244, 255)
CORE_B = (96, 170, 255)

# orbitas: (angulo, semi-eixo a, b)  em px de alta resolucao
RINGS = [
    (math.radians(-22), W * 0.40, W * 0.20, BLUE),
    (math.radians( 28), W * 0.42, W * 0.17, PURPLE),
]
# pontos orbitando: (ring_index, parametro)
DOTS = [(0, math.radians(8), CYAN), (0, math.radians(190), CYAN),
        (1, math.radians(120), PINK), (1, math.radians(300), PINK)]

rr = W * 0.18          # raio dos cantos arredondados
margin = W * 0.045
inner = W - margin

def rounded_alpha(x, y):
    # distancia ao retangulo arredondado [margin, inner]
    dx = max(margin + rr - x, 0, x - (inner - rr))
    dy = max(margin + rr - y, 0, y - (inner - rr))
    d = math.hypot(dx, dy) - rr
    return 1.0 - smooth(0.0, 1.5 * SS, d)

def ring_intensity(px, py, ang, a, b):
    dx, dy = px - cx, py - cy
    u =  dx * math.cos(ang) + dy * math.sin(ang)
    v = -dx * math.sin(ang) + dy * math.cos(ang)
    r = math.sqrt((u / a) ** 2 + (v / b) ** 2)
    dpx = abs(r - 1.0) * min(a, b)
    half = 1.6 * SS
    return 1.0 - smooth(half, half + 1.4 * SS, dpx)

def dot_world(ang, a, b, p):
    u, v = a * math.cos(p), b * math.sin(p)
    x = cx + u * math.cos(ang) - v * math.sin(ang)
    y = cy + u * math.sin(ang) + v * math.cos(ang)
    return x, y

# pre-calcula posicoes dos dots no mundo
DOT_POS = []
for ri, p, col in DOTS:
    ang, a, b, _ = RINGS[ri]
    x, y = dot_world(ang, a, b, p)
    DOT_POS.append((x, y, col))

hi = bytearray(W * W * 4)
for y in range(W):
    for x in range(W):
        px, py = x + 0.5, y + 0.5
        d = math.hypot(px - cx, py - cy)

        # fundo radial
        bg = lerp(BG_IN, BG_OUT, smooth(0.0, maxd * 0.95, d))
        col = bg

        # orbitas (atras do nucleo)
        for ang, a, b, rc in RINGS:
            i = ring_intensity(px, py, ang, a, b) * 0.9
            if i > 0:
                col = over(col, rc, i)

        # glow do nucleo
        R = W * 0.135
        glow = math.exp(-((d / (R * 2.3)) ** 2)) * 0.55
        if glow > 0:
            col = over(col, CORE_B, glow)

        # pontos orbitando
        for dx0, dy0, dc in DOT_POS:
            dd = math.hypot(px - dx0, py - dy0)
            i = 1.0 - smooth(W * 0.018, W * 0.024, dd)
            if i > 0:
                col = over(col, dc, i)

        # nucleo solido
        core = 1.0 - smooth(R - 1.5 * SS, R, d)
        if core > 0:
            inner_t = smooth(0.0, R, d)
            cc = lerp(CORE_A, CORE_B, inner_t)
            col = over(col, cc, core)

        a = rounded_alpha(px, py)
        o = (y * W + x) * 4
        hi[o]   = max(0, min(255, int(col[0] + 0.5)))
        hi[o+1] = max(0, min(255, int(col[1] + 0.5)))
        hi[o+2] = max(0, min(255, int(col[2] + 0.5)))
        hi[o+3] = max(0, min(255, int(a * 255 + 0.5)))

# downsample SSxSS -> SIZE
out = bytearray(SIZE * SIZE * 4)
for y in range(SIZE):
    for x in range(SIZE):
        r = g = b = a = 0
        for j in range(SS):
            for i in range(SS):
                o = ((y * SS + j) * W + (x * SS + i)) * 4
                r += hi[o]; g += hi[o+1]; b += hi[o+2]; a += hi[o+3]
        n = SS * SS
        oo = (y * SIZE + x) * 4
        out[oo] = r // n; out[oo+1] = g // n; out[oo+2] = b // n; out[oo+3] = a // n

def png_bytes(width, height, rgba):
    def chunk(typ, data):
        c = typ + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw += rgba[y * stride:(y + 1) * stride]
    idat = zlib.compress(bytes(raw), 9)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")

with open(OUT, "wb") as f:
    f.write(png_bytes(SIZE, SIZE, out))
print("wrote", os.path.abspath(OUT))
