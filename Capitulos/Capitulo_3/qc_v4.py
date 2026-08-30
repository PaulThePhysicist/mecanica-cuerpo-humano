import asyncio, pathlib, io
from playwright.async_api import async_playwright

HTML = pathlib.Path(r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\Capitulos\Capitulo_3\capitulo3.html").as_uri()
OUT = r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\Capitulos\Capitulo_3\_qc_stab"

async def main():
    errs=[]
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox","--use-gl=swiftshader"])
        pg = await b.new_page(viewport={"width":1280,"height":800}, device_scale_factor=2)
        pg.on("pageerror", lambda e: errs.append("PAGEERROR: "+str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE["+m.type+"]: "+m.text) if m.type=="error" else None)
        await pg.goto(HTML, wait_until="networkidle")
        await pg.evaluate("(n)=>window.go(n)", 1)
        await pg.wait_for_timeout(400)
        a = await pg.evaluate("document.getElementById('sim-stab').toDataURL()")
        await pg.wait_for_timeout(450)
        c2 = await pg.evaluate("document.getElementById('sim-stab').toDataURL()")
        alive = a!=c2
        nb = await pg.evaluate("""()=>{
          const cv=document.getElementById('sim-stab'); const x=cv.getContext('2d');
          const d=x.getImageData(0,0,cv.width,cv.height).data; let n=0;
          for(let i=3;i<d.length;i+=4){ if(d[i]>10) n++; } return {total:d.length/4,n};
        }""")
        await pg.fill("#stab_theta", "0"); await pg.evaluate("drawStab()"); await pg.wait_for_timeout(250)
        el = await pg.query_selector("#sim-stab"); await el.screenshot(path=OUT+"_v4_neutral.png")
        await pg.fill("#stab_theta", "-9"); await pg.evaluate("drawStab()"); await pg.wait_for_timeout(250)
        await el.screenshot(path=OUT+"_v4_back.png")
        await pg.fill("#stab_theta", "9"); await pg.evaluate("drawStab()"); await pg.wait_for_timeout(250)
        await el.screenshot(path=OUT+"_v4_fwd.png")
        await pg.fill("#stab_theta", "0"); await pg.evaluate("drawStab()")
        print("ALIVE:", alive, "NONBLANK:", nb, "ERRORS:", len(errs))
        for e in errs[:15]: print("  ", e)
        await pg.close(); await b.close()

asyncio.run(main())
