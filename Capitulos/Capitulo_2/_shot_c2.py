from playwright.sync_api import sync_playwright

HTML = r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\Capitulos\Capitulo_2\capitulo2.html"
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width":1280,"height":800})
    pg.goto("file:///" + HTML, wait_until="domcontentloaded")
    pg.wait_for_timeout(1200)
    pg.evaluate("(s)=>window.go && window.go(s)", 4)  # slide del módulo Palancas
    pg.wait_for_timeout(900)
    pg.screenshot(path=r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\Capitulos\Capitulo_2\_qc_c2_shot.png")
    b.close()
print("shot saved")
