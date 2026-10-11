// Renders the store item images in the overlay's style.
//   node store-items/render.cjs [slug ...]     (all items when no slug is given)
// Writes store-items/images/<slug>.png at 334x465 and <slug>@2x.png at 668x930.
const path = require("path")
const fs = require("fs")
const { chromium } = require("playwright")

const ICONS = {
  // Three reels in a frame; the middle one is the one that lands.
  // A slot machine: three reels behind the glass, a lever with a red knob.
  bonus: `<rect x="6" y="14" width="42" height="40" rx="6"/><rect x="12" y="22" width="30" height="18" rx="3"/><path d="M22 22v18M32 22v18"/><path d="M14 48h26"/><path d="M48 38h5a2 2 0 0 0 2-2V20"/><circle cx="55" cy="16" r="3.5" class="accent-fill"/><path d="M26 31h2" class="accent"/>`,
  gift: `<rect x="10" y="26" width="44" height="28" rx="4"/><rect x="7" y="18" width="50" height="9" rx="3"/><path d="M32 18v36" class="accent"/><path d="M32 18c-4-9-15-10-15-3 0 4 8 3 15 3zM32 18c4-9 15-10 15-3 0 4-8 3-15 3z"/>`,
  vip: `<path d="M10 22l11 9 11-15 11 15 11-9-5 26H15z"/><path d="M15 54h34"/><circle cx="32" cy="36" r="3.5" class="accent-fill"/>`,
  tip: `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="16" class="faint"/><path d="M37 25.5c-1.2-1.8-3.1-2.7-5-2.7-3.2 0-5.4 1.8-5.4 4.3 0 6 10.8 3.2 10.8 9.6 0 2.6-2.4 4.5-5.6 4.5-2.3 0-4.4-1-5.6-2.9M32 19.5v3.3M32 41.2v3.3" class="accent"/>`,
}

/**
 * Full-size illustrations for the middle of the card. An item whose icon has
 * one here gets it instead of the small icon in a ring.
 */
/**
 * Real slot thumbnails for the two cards behind the "?": put two portrait
 * images (3:4) in store-items/thumbs/ and list them here, e.g.
 * ["thumbs/gates.png", "thumbs/sweet-bonanza.png"]. Empty means stylised
 * placeholders are drawn instead.
 */
// From the slots table (Supabase), image_url of each game.
const THUMBS = ["thumbs/gates-of-olympus-1000.png", "thumbs/sweet-bonanza-1000.png"]

/**
 * The same fan for everything that is not a slot: a red card in front with
 * the item's icon and a tag, and two dark cards behind with a faint copy.
 */
const iconFan = (icon, tag) => () => {
  const svg = `<svg viewBox="0 0 64 64">${ICONS[icon]}</svg>`
  return `<div class="fan icon-fan"><div class="glow"></div>
    <div class="thumb thumb-0"><div class="t-art t-graphite">${svg}</div></div>
    <div class="thumb thumb-1"><div class="t-art t-charcoal">${svg}</div></div>
    <div class="thumb thumb-2"><div class="t-art t-blood">${svg}</div><span class="t-tag">${tag}</span></div>
  </div>`
}

const ART = {
  gift: iconFan("gift", "Gifted sub"),
  vip: iconFan("vip", "VIP"),
  tip: iconFan("tip", "Tip"),
  // Two slot thumbnails fanned out behind a "?" — any slot you like.
  bonus: () => {
    const faces = [
      // Mostly hidden behind the "?", so no symbol that would read half cut off.
      { cls: "t-graphite", symbol: "" },
      { cls: "t-charcoal", symbol: "" },
      { cls: "t-blood", symbol: "?" },
    ]
    const card = (face, index) => {
      // The front card is always the "?", never a real game.
      const file = index < 2 ? THUMBS[index] : undefined
      const inner = file
        ? `<img src="data:image/${path.extname(file).slice(1)};base64,${fs.readFileSync(path.join(__dirname, file)).toString("base64")}">`
        : `<div class="t-art ${face.cls}"><span class="t-sym">${face.symbol}</span><span class="t-reels"></span></div>`
      // Real art is graded into the card's palette — grey, dark, a touch of
      // red — and fades into the ground, so it reads as part of the card.
      const grade = file ? '<span class="t-tint"></span><span class="t-fade"></span>' : ""
      return `<div class="thumb thumb-${index}${file ? " real" : ""}">${inner}${grade}${index === 2 ? '<span class="t-tag">Any slot</span>' : ""}</div>`
    }
    return `<div class="fan"><div class="glow"></div>${faces.map(card).join("")}</div>`
  },
  // Three reels, the middle row lined up on a red win line.
  reels: () => {
    const reel = (symbols, lit) => `<div class="reel${lit ? " lit" : ""}">${symbols
      .map((symbol, row) => `<div class="sym${row === 1 ? " hit" : ""}">${symbol}</div>`)
      .join("")}</div>`
    return `<div class="machine">
      <div class="glow"></div>
      <div class="reels">
        ${reel(["◆", "7", "BAR"], false)}
        ${reel(["BAR", "7", "◆"], true)}
        ${reel(["◆", "7", "BAR"], false)}
      </div>
      <div class="winline"><span></span><span></span></div>
    </div>`
  },
}

const ART_CSS = `
.fan{position:relative;width:280px;height:220px}
.fan .glow{position:absolute;inset:-20px;background:radial-gradient(closest-side,rgba(217,21,44,.24),transparent 75%)}
.thumb{position:absolute;top:22px;width:118px;height:158px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.1);box-shadow:0 18px 36px rgba(0,0,0,.6)}
.thumb img{width:100%;height:100%;object-fit:cover;display:block}
.thumb.real{border-color:rgba(255,255,255,.07);background:#0f0f11}
.thumb.real img{filter:saturate(.4) contrast(1.05) brightness(.9)}
.t-tint{position:absolute;inset:0;background:#d9152c;mix-blend-mode:color;opacity:.12}
.t-fade{position:absolute;inset:0;background:linear-gradient(transparent 50%,rgba(15,15,17,.85) 100%)}
.thumb-0{left:12px;transform:rotate(-12deg)}
.thumb-1{right:12px;transform:rotate(12deg)}
.thumb-2{left:71px;top:10px;width:138px;height:184px;border-color:rgba(217,21,44,.5);box-shadow:0 22px 44px rgba(0,0,0,.7),0 0 30px rgba(217,21,44,.25)}
.t-art{position:relative;width:100%;height:100%;display:grid;place-items:center}
.t-art::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 55%,rgba(0,0,0,.55))}
.t-graphite{background:radial-gradient(circle at 30% 20%,#3a3a42,#141417 70%)}
.t-charcoal{background:radial-gradient(circle at 70% 25%,#2c2c33,#0e0e10 70%)}
.t-blood{background:radial-gradient(circle at 50% 30%,#8e1424,#2a060b 72%)}
.t-sym{position:relative;z-index:1;font-weight:800;font-size:44px;color:rgba(255,255,255,.9);letter-spacing:-.03em;text-shadow:0 4px 18px rgba(0,0,0,.5)}
.thumb-2 .t-sym{font-size:96px;font-weight:700;color:#fff;margin-top:-14px;text-shadow:0 0 28px rgba(255,60,80,.6)}
.thumb-2 .t-reels{display:none}
.t-reels{position:absolute;inset:14px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:repeating-linear-gradient(90deg,transparent 0 33.2%,rgba(255,255,255,.06) 33.2% 33.4%)}
.icon-fan .thumb-0 svg,.icon-fan .thumb-1 svg{width:46px;height:46px;stroke:rgba(255,255,255,.18);position:relative;z-index:1}
.icon-fan .thumb-0 svg .accent,.icon-fan .thumb-1 svg .accent{stroke:rgba(255,255,255,.18)}
.icon-fan .thumb-0 svg .accent-fill,.icon-fan .thumb-1 svg .accent-fill{fill:rgba(255,255,255,.18)}
.icon-fan .thumb-2 svg{width:84px;height:84px;margin-top:-18px;stroke:#fff;stroke-width:2.4;position:relative;z-index:1;filter:drop-shadow(0 0 16px rgba(255,60,80,.55))}
.icon-fan .thumb-2 svg .accent{stroke:#fff}
.icon-fan .thumb-2 svg .accent-fill{fill:#fff}
.icon-fan .thumb-2 svg .faint{stroke:rgba(255,255,255,.35)}
.t-tag{position:absolute;z-index:2;left:50%;bottom:12px;transform:translateX(-50%);padding:4px 10px;border-radius:6px;background:#d9152c;color:#fff;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;white-space:nowrap}
.machine{position:relative;width:250px;height:196px;display:grid;place-items:center}
.machine .glow{position:absolute;inset:-30px;background:radial-gradient(closest-side,rgba(217,21,44,.22),transparent 75%)}
.reels{position:relative;display:flex;gap:10px;padding:12px;border-radius:16px;background:linear-gradient(#18181b,#0c0c0e);border:1px solid rgba(255,255,255,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 20px 40px rgba(0,0,0,.5)}
.reel{width:66px;height:168px;border-radius:10px;background:linear-gradient(#101012,#1c1c20 50%,#101012);border:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;justify-content:space-around;align-items:center;overflow:hidden;
  -webkit-mask-image:linear-gradient(transparent,#000 28%,#000 72%,transparent)}
.reel.lit{border-color:rgba(217,21,44,.35)}
.sym{font-weight:800;font-size:22px;color:rgba(255,255,255,.35);letter-spacing:-.02em}
.sym.hit{font-size:46px;color:#ebebee;line-height:1}
.reel.lit .sym.hit{color:#fff;text-shadow:0 0 18px rgba(217,21,44,.65)}
.winline{position:absolute;left:0;right:0;top:50%;height:0;border-top:1.5px solid rgba(217,21,44,.85)}
.winline span{position:absolute;top:-6px;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent}
.winline span:first-child{left:-2px;border-left:7px solid #d9152c}
.winline span:last-child{right:-2px;border-right:7px solid #d9152c}
`

const ITEMS = [
  { slug: "gifted-sub", icon: "gift", value: "Gifted Sub", title: "Kick subscription", sub: "Gifted to you on stream" },
  { slug: "vip", icon: "vip", value: "VIP", title: "Kick VIP badge", sub: "Stand out in chat" },
  ...[20, 40, 60, 80, 100].map((n) => ({ slug: `bonus-buy-${n}`, icon: "bonus", value: `$${n}`, title: "Bonus Buy", sub: "Slot of your choice", note: "We split whatever it pays" })),
  ...[5, 10, 20, 50].map((n) => ({ slug: `tip-${n}`, icon: "tip", value: `$${n}`, title: "Tip", sub: "Sent straight to you" })),
]

// Inter, embedded so the render never depends on the network.
const INTER = fs
  .readFileSync(require.resolve("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"))
  .toString("base64")

const page = (item) => `<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${INTER}) format("woff2");font-weight:100 900}
*{box-sizing:border-box;margin:0}
html,body{width:334px;height:465px;background:transparent;font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.card{position:relative;width:334px;height:465px;border-radius:14px;overflow:hidden;background:#0f0f11;border:1px solid rgba(255,255,255,.07);color:#ebebee;display:flex;flex-direction:column}
.warmth{position:absolute;inset:0;background:radial-gradient(120% 60% at 50% 115%,rgba(120,10,24,.38),transparent 70%);pointer-events:none}
.head{display:flex;align-items:center;gap:9px;padding:22px 24px 0;font-size:10px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#85858d}
.dot{width:6px;height:6px;border-radius:50%;background:#d9152c}
/* Fixed height, so the centrepiece sits at the same spot on every card whatever the text below. */
.art{flex:none;height:236px;margin-top:6px;display:grid;place-items:center;position:relative}
.ring{width:132px;height:132px;border-radius:50%;border:1px solid rgba(255,255,255,.07);background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.035),transparent 70%);display:grid;place-items:center}
svg{width:68px;height:68px;fill:none;stroke:#ebebee;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
svg .accent{stroke:#d9152c}
svg .accent-fill{fill:#d9152c;stroke:none}
svg .faint{stroke:rgba(255,255,255,.18);stroke-width:1.4}
.foot{position:relative;margin-top:auto;padding:0 24px 26px}
${ART_CSS}
.value{font-size:${item.value.length > 5 ? 40 : 58}px;font-weight:800;letter-spacing:-.03em;line-height:1}
.title{font-size:19px;font-weight:600;margin-top:10px}
.line{height:1px;background:rgba(255,255,255,.07);margin:18px 0 14px}
.sub{font-size:13px;color:#85858d;letter-spacing:.01em}
.note{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:14px;font-weight:600;color:#ebebee}
.note::before{content:"";width:6px;height:6px;border-radius:50%;background:#d9152c;flex:none}
</style></head><body><div class="card"><div class="warmth"></div>
<div class="head"><span class="dot"></span>Soul Stealer · Store</div>
<div class="art">${ART[item.icon] ? ART[item.icon]() : `<div class="ring"><svg viewBox="0 0 64 64">${ICONS[item.icon]}</svg></div>`}</div>
<div class="foot"><div class="value">${item.value}</div><div class="title">${item.title}</div><div class="line"></div><div class="sub">${item.sub}</div>${item.note ? `<div class="note">${item.note}</div>` : ""}</div>
</div></body></html>`

;(async () => {
  const wanted = process.argv.slice(2)
  const items = wanted.length ? ITEMS.filter((item) => wanted.includes(item.slug)) : ITEMS
  const out = path.join(__dirname, "images")
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch()
  for (const scale of [1, 2]) {
    const tab = await browser.newPage({ viewport: { width: 334, height: 465 }, deviceScaleFactor: scale })
    for (const item of items) {
      await tab.setContent(page(item), { waitUntil: "networkidle" })
      await tab.evaluate(() => document.fonts.ready)
      await tab.screenshot({ path: path.join(out, `${item.slug}${scale === 2 ? "@2x" : ""}.png`), omitBackground: true })
    }
    await tab.close()
  }
  await browser.close()
  console.log(items.map((item) => item.slug).join(", "))
})()
