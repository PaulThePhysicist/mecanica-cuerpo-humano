import sys, time
from playwright.sync_api import sync_playwright

HTML = r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\Capitulos\Capitulo_2\capitulo2.html"

# slide -> canvas id primario (los secundarios se checkean aparte)
CANVAS = {2:'sim-torque',3:'sim-levers',4:'sim-amp',5:'sim-forearm',6:'sim-forearm2',
          7:'sim-hip',8:'sim-hipcane',9:'sim-back',10:'sim-disc',11:'sim-shoulder',
          12:'sim-ankle',13:'sim-threeforce',14:'sim-segments',15:'sim-touch',16:'sim-thermal'}
EXTRA = {11:'sim-knee',12:'sim-jaw'}  # dibujados además en esas slides

errors=[]; console_errs=[]

def non_blank(page, cid):
    return page.evaluate("""(id) => {
        const c = document.getElementById(id);
        if (!c) return {ok:false, reason:'no canvas '+id};
        const ctx = c.getContext('2d');
        const w = c.width, h = c.height;
        if (!w || !h) return {ok:false, reason:'zero '+w+'x'+h};
        const d = ctx.getImageData(0,0,w,h).data;
        let n=0, nb=0;
        for (let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2],a=d[i+3]; if (a>8){ n++; if(!(r>248&&g>248&&b>248)) nb++; } }
        return {ok:true, w, h, total:n, painted:nb, frac:(nb/(w*h)).toFixed(3)};
    }""", cid)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width":1280,"height":800})
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: console_errs.append(m.text) if m.type=="error" else None)
    page.goto("file:///" + HTML, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1500)

    # estructura
    npills = page.evaluate("()=>document.querySelectorAll('.mpill').length")
    ndots  = page.evaluate("()=>document.querySelectorAll('.nav-dot').length")
    ntabs  = page.evaluate("()=>document.querySelectorAll('.module-tab').length")
    nkatex = page.evaluate("()=>document.querySelectorAll('.katex').length")
    print(f"estructura: mpills={npills} nav-dots={ndots} module-tabs={ntabs} katex={nkatex}")

    TOTAL = page.evaluate("()=>window.TOTAL || document.querySelectorAll('.slide,.slide-full').length")
    print("TOTAL slides:", TOTAL)

    bad=[]
    for n in range(TOTAL):
        page.evaluate("(s)=>window.go && window.go(s)", n)
        page.wait_for_timeout(900)
        page.evaluate("()=>window.redrawSlide && window.redrawSlide(window.__currentSlide||0)")
        page.wait_for_timeout(400)
        # tab activa debe coincidir con moduleOf(n)
        tab_ok = page.evaluate("""(s)=>{
            const cur = document.querySelector('.slide.active,.slide-full.active');
            const mod = cur ? (cur.dataset.module) : null;
            const act = document.querySelector('.module-tab.active');
            return {slide:s, mod, activeTab: act?act.dataset.module:null};
        }""", n)
        if tab_ok['mod'] is not None and tab_ok['activeTab'] is not None and tab_ok['mod']!=tab_ok['activeTab']:
            bad.append(f"slide {n}: tab activa {tab_ok['activeTab']} != modulo {tab_ok['mod']}")
        if n in CANVAS:
            res = non_blank(page, CANVAS[n])
            flag = "" if (res.get('ok') and int(res.get('painted',0))>50) else "  <-- VACIO"
            if not (res.get('ok') and int(res.get('painted',0))>50): bad.append(f"slide {n} canvas {CANVAS[n]} {res}")
            print(f"slide {n} [{CANVAS[n]}]: {res}{flag}")
            if n in EXTRA:
                r2 = non_blank(page, EXTRA[n])
                if not (r2.get('ok') and int(r2.get('painted',0))>50): bad.append(f"slide {n} canvas extra {EXTRA[n]} {r2}")
                print(f"   extra [{EXTRA[n]}]: {r2}")
        else:
            print(f"slide {n}: (sin sim canvas primario)")

    browser.close()

print("\n=== PAGE ERRORS (", len(errors), ") ===")
for e in errors: print("  ", e)
print("=== CONSOLE ERRORS (", len(console_errs), ") ===")
for e in console_errs: print("  ", e)
if bad:
    print("=== CANVAS/TAB WARNINGS ===")
    for b in bad: print("  ", b)
ok = (not errors and not console_errs and not bad)
print("RESULT:", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
