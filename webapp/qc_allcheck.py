from playwright.sync_api import sync_playwright
import os
URL = "http://localhost:5248/"
OUT = r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\webapp\qc_all"
def shot(pg, sel, name):
    s = pg.query_selector(sel)
    if s: s.screenshot(path=os.path.join(OUT, name))
def selPill(pg, slide, term):
    pg.evaluate("""(a) => {
        const pills=[...document.querySelectorAll('[data-slide=\"'+a.s+'\"][data-highlight], [data-slide=\"'+a.s+'\"][class*=\"pill\"]')];
        const el=pills.find(e=>e.textContent.includes(a.t));
        if(el){ el.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true})); el.dispatchEvent(new MouseEvent('click',{bubbles:true})); }
    }""", {"s":slide,"t":term})
    pg.wait_for_timeout(1000)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width":1280,"height":860})
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL, wait_until="networkidle")
    pg.click("text=Capítulo 1", timeout=5000)
    pg.wait_for_timeout(900)
    os.makedirs(OUT, exist_ok=True)
    # A1
    pg.evaluate("() => { const d=document.querySelectorAll('.cap1-dot'); if(d[1]) d[1].click(); }")
    pg.wait_for_timeout(3500)
    selPill(pg, "1", "Superficial"); shot(pg, '[data-slide="1"] .sim-area', "a1.png")
    # A2
    pg.evaluate("() => { const d=document.querySelectorAll('.cap1-dot'); if(d[2]) d[2].click(); }")
    pg.wait_for_timeout(3500)
    shot(pg, '[data-slide="2"] .sim-area', "a2.png")
    # A3
    pg.evaluate("() => { const d=document.querySelectorAll('.cap1-dot'); if(d[3]) d[3].click(); }")
    pg.wait_for_timeout(3500)
    selPill(pg, "3", "Brachium");     shot(pg, '[data-slide="3"] .sim-area', "a3_brachium.png")
    selPill(pg, "3", "Femur");        shot(pg, '[data-slide="3"] .sim-area', "a3_femur.png")
    selPill(pg, "3", "Caput");        shot(pg, '[data-slide="3"] .sim-area', "a3_caput.png")
    print("DONE ERRORS:", errs)
    b.close()
