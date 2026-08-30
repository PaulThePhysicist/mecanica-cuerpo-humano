import asyncio, pathlib
from playwright.async_api import async_playwright

HTML = pathlib.Path(r"C:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano\Capitulos\Capitulo_3\capitulo3.html").as_uri()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox","--use-gl=swiftshader"])
        pg = await b.new_page(viewport={"width":1280,"height":800}, device_scale_factor=1)
        await pg.goto(HTML, wait_until="networkidle")
        await pg.evaluate("(n)=>window.go(n)", 1)
        await pg.fill("#stab_theta", "0"); await pg.evaluate("drawStab()"); await pg.wait_for_timeout(300)
        # Get bounding box of canvas + its pixel analysis
        info = await pg.evaluate("""()=>{
          const cv=document.getElementById('sim-stab');
          const r=cv.getBoundingClientRect();
          const x=cv.getContext('2d'); const d=x.getImageData(0,0,cv.width,cv.height).data;
          const W=cv.width,H=cv.height;
          // skin color approx (e9c49f) -> (233,196,159)
          function isSkin(r,g,bb){ return Math.abs(r-233)<40 && Math.abs(g-196)<45 && Math.abs(bb-159)<45; }
          // teal (0d6e64) -> (13,110,100)
          function isTeal(r,g,bb){ return Math.abs(r-13)<40 && Math.abs(g-110)<50 && Math.abs(bb-100)<50; }
          let skinMinX=W,skinMaxX=0,skinMinY=H,skinMaxY=0, skinN=0;
          let teal=[];
          for(let y=0;y<H;y+=2){ for(let xx=0;xx<W;xx+=2){
            const i=(y*W+xx)*4; const r=d[i],g=d[i+1],bb=d[i+2];
            if(isSkin(r,g,bb)){ skinN++; if(xx<skinMinX)skinMinX=xx; if(xx>skinMaxX)skinMaxX=xx; if(y<skinMinY)skinMinY=y; if(y>skinMaxY)skinMaxY=y; }
            if(isTeal(r,g,bb) && teal.length<40){ teal.push([xx,y]); }
          }}
          return {W,H, rect:{x:r.x,y:r.y,w:r.width,h:r.height}, skinN, skinBox:[skinMinX,skinMinY,skinMaxX,skinMaxY], teal:teal.slice(0,12)};
        }""")
        print(info)
        await b.close()

asyncio.run(main())
