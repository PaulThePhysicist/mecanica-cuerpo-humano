# -*- coding: utf-8 -*-
"""Ensambla capitulo10.html a partir del clon (cap9) + body + sims."""
import io, os

HERE = os.path.dirname(os.path.abspath(__file__))
CLONE = r"C:/Users/PaulM/Documents/la universidad de paul/La Mecanica del Cuerpo Humano/Capitulos/Capitulo_9/capitulo9.html"
OUT = os.path.join(HERE, "..", "capitulo10.html")

with io.open(CLONE, encoding="utf-8") as f:
    lines = f.read().split("\n")

# líneas verificadas del clon (1-indexed → slice 0-indexed)
part_a   = lines[0:441]        # head + CSS + <body>
eng_start= lines[1655:1664]    # <script> ... const TOTAL = 24;
eng_tail = lines[1677:1935]    # let current = 0; ... espan }
keyboard = lines[3192:3200]    # ── Teclado ── ...
domready = lines[3215:3227]    # DOMContentLoaded ...
closing  = lines[3228:3231]    # </script></body></html>

with io.open(os.path.join(HERE, "body.html"), encoding="utf-8") as f:
    body = f.read().strip().split("\n")
with io.open(os.path.join(HERE, "sims.js"), encoding="utf-8") as f:
    sims = f.read().rstrip("\n")

out = part_a + body + ["\n"] + eng_start + eng_tail + sims.split("\n") + keyboard + domready + closing
text = "\n".join(out)

# renombra referencias del capítulo 9 → 10 en descripción/título/comentarios del motor
text = text.replace("Los pulmones y la respiración", "Sonido, habla y audición")
text = text.replace("Capítulo 9", "Capítulo 10")
text = text.replace("capítulo 9", "capítulo 10")

with io.open(os.path.join(HERE, "..", "capitulo10.html"), "w", encoding="utf-8") as f:
    f.write(text)
print("OK", len(text.split("\n")), "líneas →", os.path.normpath(OUT))
