from playwright.sync_api import sync_playwright
import os
HTML = r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\Capitulos\Capitulo_2\capitulo2.html"
URL = "file:///" + HTML.replace("\\","/")
OUT = os.path.dirname(HTML)
os.makedirs(os.path.join(OUT,"_audit"), exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", headless=True, args=["--no-sandbox"])
    pg = b.new_page(viewport={"width":1366,"height":768})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL, wait_until="load", timeout=30000)
    pg.wait_for_timeout(500)
    # let c2t advance a bit for life
    pg.wait_for_timeout(500)
    for n in range(3,19):
        pg.evaluate(f"window.go({n})")
        pg.wait_for_timeout(450)
        # screenshot the sim-area if present, else whole slide
        elh = pg.query_selector(".slide.active .sim-area") or pg.query_selector(".slide.active")
        try:
            elh.screenshot(path=os.path.join(OUT,"_audit","sim_{:02d}.png".format(n)))
        except Exception as e:
            pg.screenshot(path=os.path.join(OUT,"_audit","sim_{:02d}.png".format(n)))
    # also capture amp (slide 4) full maybe
    b.close()
print("rendered", len(os.listdir(os.path.join(OUT,"_audit"))), "slides")
print("ERR:", errs if errs else "none")
