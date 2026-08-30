from playwright.sync_api import sync_playwright

HTML = r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\Capitulos\Capitulo_2\capitulo2.html"
errs=[]; cerrs=[]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width":1280,"height":800})
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: cerrs.append(m.text) if m.type=="error" else None)
    pg.goto("file:///" + HTML, wait_until="domcontentloaded")
    pg.wait_for_timeout(1200)
    pg.evaluate("()=>window.go && window.go(1)")
    pg.wait_for_timeout(800)

    def state():
        return pg.evaluate("""()=>{
            const host=document.getElementById('carousel-1');
            const slides=[...host.querySelectorAll('.cslide')];
            const active=slides.findIndex(s=>s.classList.contains('active'));
            const dots=[...document.querySelectorAll('#carDots-1 .car-dot')];
            const theory=document.querySelector('.theory');
            return {active, n:slides.length, dots:dots.length,
                    activeDot:dots.findIndex(d=>d.classList.contains('active')),
                    count:document.getElementById('carCount-1').textContent,
                    scrollH:theory.scrollHeight, clientH:theory.clientHeight,
                    overflowY:getComputedStyle(theory).overflowY};
        }""")

    print("inicial:", state())
    # navegar next x3 (debe envolver/clamp)
    pg.evaluate("()=>window.cNext && window.cNext(1)"); pg.wait_for_timeout(250)
    print("tras cNext:", state())
    pg.evaluate("()=>window.cNext && window.cNext(1)"); pg.wait_for_timeout(250)
    print("tras cNext2:", state())
    pg.evaluate("()=>window.cNext && window.cNext(1)"); pg.wait_for_timeout(250)
    print("tras cNext3 (tope):", state())
    pg.evaluate("()=>window.cPrev && window.cPrev(1)"); pg.wait_for_timeout(250)
    print("tras cPrev:", state())
    # click dot 0
    pg.evaluate("()=>window.carGoto && window.carGoto(1,0)"); pg.wait_for_timeout(250)
    print("tras carGoto(0):", state())
    # captura
    pg.evaluate("()=>window.carGoto && window.carGoto(1,1)"); pg.wait_for_timeout(300)
    pg.screenshot(path=r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\Capitulos\Capitulo_2\_qc_carousel_shot.png")
    b.close()

print("PAGE ERRORS:", errs)
print("CONSOLE ERRORS:", cerrs)
print("RESULT:", "PASS" if not errs and not cerrs else "FAIL")
