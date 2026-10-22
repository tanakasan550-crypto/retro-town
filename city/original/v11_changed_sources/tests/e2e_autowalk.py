import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox']); ctx = await b.new_context(viewport={'width':900,'height':480},has_touch=True,is_mobile=True); pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg)
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' else None)
        await pg.goto('http://127.0.0.1:8765/index.html?city=4'); await pg.wait_for_selector('#title .card.setup', timeout=60000)
        await pg.click('[data-step="2"]'); await pg.click('[data-k="lifeAge"][data-s="18"]')
        await pg.click('button.btn:has-text("はじめる")')
        await pg.wait_for_function("()=>window.NLS&&window.NLS.G", timeout=90000); await pg.wait_for_timeout(2500)
        ev=lambda s: pg.evaluate(s)
        await pg.evaluate("async()=>{window.__m=await import('/src/motion.js')}")
        print(await ev("()=>JSON.stringify({loc:NLS.G.S.loc,modal:!!NLS.U.modal,home:NLS.G.hero.homeB})"))
        for _ in range(4):
            if await ev("()=>!!NLS.U.modal"): await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='/home/claude/work/out/aw_0.png')
        async def tap(x,y,wait=3000,tag=''):
            h0=await ev("()=>[NLS.G.S.loc.k,NLS.G.S.loc.b,NLS.G.S.loc.floor,NLS.G.S.loc.x|0,NLS.G.S.loc.y|0]")
            await pg.mouse.click(x,y); await pg.wait_for_timeout(150)
            a=await ev("()=>JSON.stringify([NLS.AW.active,NLS.AW.goal&&NLS.AW.goal.kind,NLS.AW.path&&NLS.AW.path.length])")
            for _ in range(int(wait/500)):
                await pg.wait_for_timeout(500)
                if not await ev("()=>NLS.AW.active"): break
            h1=await ev("()=>[NLS.G.S.loc.k,NLS.G.S.loc.b,NLS.G.S.loc.floor,NLS.G.S.loc.x|0,NLS.G.S.loc.y|0,NLS.AW.active,!!NLS.U.modal]")
            print(tag,'tap',x,y,h0,'->',h1,a); await pg.screenshot(path=f'/home/claude/work/out/aw_{tag}.png')
        await ev("()=>{const g=NLS.G,b=g.bld(g.hero.homeB);g.S.loc={k:'out',x:b.doorX+0.5,y:b.doorY+1.5,f:'d'};}"); await pg.wait_for_timeout(2500)
        print('loc',await ev("()=>JSON.stringify(NLS.G.S.loc)"))
        await pg.screenshot(path='/home/claude/work/out/aw_out0.png')
        await tap(650,300,tag='out1',wait=8000); await tap(250,380,tag='out2',wait=8000)
        await ev("()=>NLS.homeBtn()"); await pg.wait_for_timeout(400)
        await pg.click('[data-k=walk]')
        for k in range(30):
            await pg.wait_for_timeout(1000)
            if not await ev("()=>NLS.AW.active"): break
        print('home?',await ev("()=>JSON.stringify({loc:NLS.G.S.loc,home:NLS.G.hero.homeB,aw:NLS.AW.active,modal:!!NLS.U.modal})"))
        await ev("async()=>{const g=NLS.G;const b=g.world.map.buildings.find(x=>x.type==='station');const m=window.__m;g.S.loc={k:'in',b:b.idx,floor:1,x:0,y:0,f:'u'};const I=m.interiorOf(g,b.idx,1).I;console.log(JSON.stringify(I.stairs));g.S.loc.x=I.door.x+.5;g.S.loc.y=I.door.y-3.6;m.clearInteriorCache&&0}")
        await pg.wait_for_timeout(1200)
        xy=await ev("()=>{const m=window.__m,L=NLS.G.S.loc;const d=m.interiorOf(NLS.G,L.b,L.floor).I.door;return [NLS.R.ip.X(d.x+.5,d.y+.5),NLS.R.ip.Y(d.x+.5,d.y+.5,3.4)]}")
        print('chip',xy); await pg.screenshot(path='/home/claude/work/out/aw_st1.png')
        await pg.mouse.click(xy[0],xy[1])
        for k in range(24):
            await pg.wait_for_timeout(1000)
            st=await ev("()=>JSON.stringify([NLS.G.S.loc.k,NLS.G.S.loc.floor,NLS.AW.active,!!NLS.U.modal])")
            print(k,st)
            if 'out' in st: break
        print('errors',errs[:8]); await b.close()
asyncio.run(main())
