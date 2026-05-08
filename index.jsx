import { useState, useEffect, useRef } from "react"
import * as THREE from "three"

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ROLES = ["Front-End Developer","Creative Coder","UI Craftsman","3D Web Builder","React Specialist"]

const SKILLS = [
  { name:"HTML5 & CSS3",      pct:95, color:"#ff6b35" },
  { name:"JavaScript ES6+",   pct:88, color:"#f7c948" },
  { name:"React.js",          pct:85, color:"#61dafb" },
  { name:"Tailwind CSS",      pct:92, color:"#38bdf8" },
  { name:"Three.js / WebGL",  pct:72, color:"#a78bfa" },
  { name:"Git & GitHub",      pct:83, color:"#f97316" },
  { name:"Responsive Design", pct:94, color:"#34d399" },
  { name:"UI/UX Principles",  pct:79, color:"#fb7185" },
  { name:"Node.js",           pct:65, color:"#86efac" },
  { name:"Figma",             pct:76, color:"#c084fc" },
]

const PROJECTS = [
  { id:1, title:"Truistt", sub:"Banking Platform",
    desc:"A fully-branded banking web app — custom navy-blue design system, multi-page architecture, and clean product hierarchy. Deployed on Netlify.",
    tech:["HTML","CSS","JavaScript","Tailwind","Lucide Icons"],
    grad:"linear-gradient(135deg,#071428 0%,#0f2d5e 100%)", accent:"#38bdf8", emoji:"🏦" },
  { id:2, title:"3D Portfolio", sub:"Creative Showcase",
    desc:"React + Three.js particle nebula, live wireframe geometry, mouse-reactive 3D scene, glassmorphism UI, and scroll-triggered reveals.",
    tech:["React","Three.js","WebGL","CSS3","JavaScript"],
    grad:"linear-gradient(135deg,#160b2e 0%,#2e1065 100%)", accent:"#a78bfa", emoji:"🌌" },
  { id:3, title:"Project Tracker", sub:"Engineering Dashboard",
    desc:"Excel-powered budget & contribution tracker for a 20-member civil engineering team. Full variance analysis in Nigerian Naira.",
    tech:["Excel","Data Viz","Analytics","Budget Modelling"],
    grad:"linear-gradient(135deg,#082010 0%,#14532d 100%)", accent:"#34d399", emoji:"📊" },
]

const NAV_IDS = ["home","about","skills","projects","contact"]

// ─── SCROLL OFFSETS (approximate) ─────────────────────────────────────────────
const OFFSETS = { home:0, about:520, skills:1250, projects:2080, contact:3100 }

export default function Portfolio() {
  const canvasRef = useRef(null)
  const scrollRef = useRef(null)
  const m3d       = useRef({ x:0, y:0, tx:0, ty:0 })

  // viewport
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 800)
  const mob  = vw < 640
  const tab  = vw < 900

  // state
  const [sy,       setSy]      = useState(0)
  const [roleIdx,  setRoleIdx] = useState(0)
  const [typed,    setTyped]   = useState("")
  const [del,      setDel]     = useState(false)
  const [sent,     setSent]    = useState(false)
  const [cur,      setCur]     = useState({ x:-99, y:-99 })
  const [navSec,   setNavSec]  = useState("home")
  const [menuOpen, setMenuOpen]= useState(false)

  // reveal flags
  const [rA, setRA] = useState(false)
  const [rS, setRS] = useState(false)
  const [rP, setRP] = useState(false)
  const [rC, setRC] = useState(false)

  // resize
  useEffect(() => {
    const fn = () => setVw(window.innerWidth)
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])

  // mouse cursor (desktop only)
  useEffect(() => {
    if (mob) return
    const fn = e => {
      setCur({ x:e.clientX, y:e.clientY })
      m3d.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      m3d.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener("mousemove", fn)
    return () => window.removeEventListener("mousemove", fn)
  }, [mob])

  // touch → Three.js reaction
  useEffect(() => {
    if (!mob) return
    const fn = e => {
      const t = e.touches[0]
      if (!t) return
      m3d.current.x =  (t.clientX / window.innerWidth)  * 2 - 1
      m3d.current.y = -(t.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener("touchmove", fn, { passive:true })
    return () => window.removeEventListener("touchmove", fn)
  }, [mob])

  // typewriter
  useEffect(() => {
    const role = ROLES[roleIdx]; let t
    if (!del && typed === role)    t = setTimeout(() => setDel(true), 2200)
    else if (del && typed === "") { setDel(false); setRoleIdx(i => (i+1) % ROLES.length) }
    else t = setTimeout(() => setTyped(del ? role.slice(0, typed.length-1) : role.slice(0, typed.length+1)), del ? 40 : 88)
    return () => clearTimeout(t)
  }, [typed, del, roleIdx])

  // scroll handler
  const onScroll = e => {
    const v = e.currentTarget.scrollTop; setSy(v)
    // active nav
    if      (v < 480)  setNavSec("home")
    else if (v < 1180) setNavSec("about")
    else if (v < 2000) setNavSec("skills")
    else if (v < 3000) setNavSec("projects")
    else               setNavSec("contact")
    // reveals — trigger earlier on mobile
    const offset = mob ? 120 : 200
    if (!rA && v > offset)        setRA(true)
    if (!rS && v > offset + 700)  setRS(true)
    if (!rP && v > offset + 1500) setRP(true)
    if (!rC && v > offset + 2500) setRC(true)
  }

  const go = id => {
    scrollRef.current?.scrollTo({ top: OFFSETS[id] ?? 0, behavior:"smooth" })
    setMenuOpen(false)
  }

  // ── Three.js scene ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    const W = canvasRef.current.clientWidth  || 400
    const H = canvasRef.current.clientHeight || 700

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(65, W/H, 0.1, 200)
    camera.position.z = mob ? 9 : 7

    const renderer = new THREE.WebGLRenderer({ canvas:canvasRef.current, alpha:true, antialias:!mob })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(devicePixelRatio, mob ? 1.5 : 2))

    // fewer particles on mobile for performance
    const N = mob ? 900 : 1600
    const pos = new Float32Array(N*3)
    const col = new Float32Array(N*3)
    for (let i=0; i<N; i++) {
      const r  = 8 + Math.random()*14
      const th = Math.random()*Math.PI*2
      const ph = Math.acos(2*Math.random()-1)
      pos[i*3]   = r*Math.sin(ph)*Math.cos(th)
      pos[i*3+1] = r*Math.sin(ph)*Math.sin(th)
      pos[i*3+2] = r*Math.cos(ph)
      const t = Math.random()
      if      (t < .35) { col[i*3]=.65; col[i*3+1]=.55; col[i*3+2]=1.0 }
      else if (t < .68) { col[i*3]=.22; col[i*3+1]=.74; col[i*3+2]=.98 }
      else              { col[i*3]=.98; col[i*3+1]=.42; col[i*3+2]=.52 }
    }
    const pg = new THREE.BufferGeometry()
    pg.setAttribute("position", new THREE.BufferAttribute(pos,3))
    pg.setAttribute("color",    new THREE.BufferAttribute(col,3))
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size:.046, vertexColors:true, transparent:true, opacity:.78 }))
    scene.add(pts)

    // wireframes — smaller on mobile, positioned better
    const wf = (geo, hex, x, y, z, op=.27) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color:hex, wireframe:true, transparent:true, opacity:op }))
      m.position.set(x, y, z); scene.add(m); return m
    }
    const S = mob ? 0.72 : 1  // scale factor
    const tk  = wf(new THREE.TorusKnotGeometry(1.1*S, .32*S, 130, 16), 0xa78bfa,  mob?1.8:3.2,  .5, -1)
    const ico = wf(new THREE.IcosahedronGeometry(.9*S, 1),              0x38bdf8,  mob?-1.8:-3.4, .8, -.5)
    const oct = wf(new THREE.OctahedronGeometry(.68*S),                 0xfb7185,  mob?-1.0:-1.6, -2.4, .2, .36)
    const tet = wf(new THREE.TetrahedronGeometry(.56*S),                0x34d399,  mob?1.0:2.6,  -2.0, .3, .36)

    const resize = () => {
      const w = canvasRef.current?.clientWidth||400
      const h = canvasRef.current?.clientHeight||700
      camera.aspect = w/h; camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", resize)

    const clk = new THREE.Clock(); const m = m3d.current; let raf
    const loop = () => {
      raf = requestAnimationFrame(loop); const t = clk.getElapsedTime()
      m.tx += (m.x - m.tx) * .04; m.ty += (m.y - m.ty) * .04
      pts.rotation.y = t*.016 + m.tx*.2;  pts.rotation.x = t*.009 + m.ty*.12
      tk.rotation.x  = t*.3;  tk.rotation.y  = t*.38 + m.tx*.36; tk.position.y  = .5 + Math.sin(t*.46)*.26
      ico.rotation.x = t*.4;  ico.rotation.z = t*.25 + m.ty*.26; ico.position.y = .8 + Math.cos(t*.4)*.22
      oct.rotation.y = t*.52; oct.rotation.x = t*.3;             oct.position.y = -2.4 + Math.sin(t*.6)*.18
      tet.rotation.x = t*.65; tet.rotation.z = t*.42;            tet.position.y = -2.0 + Math.cos(t*.5)*.18
      renderer.render(scene, camera)
    }
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose() }
  }, [mob])

  // card tilt (desktop only)
  const tilt = e => {
    if (mob) return
    const el=e.currentTarget, r=el.getBoundingClientRect()
    el.style.transform=`perspective(900px) rotateX(${((e.clientY-r.top)/r.height-.5)*18}deg) rotateY(${((e.clientX-r.left)/r.width-.5)*-18}deg) translateZ(14px) scale(1.02)`
  }
  const untilt = e => {
    if (mob) return
    e.currentTarget.style.transform="perspective(900px) rotateX(0) rotateY(0) translateZ(0) scale(1)"
  }

  // ── Shared style objects ───────────────────────────────────────────────────
  const F = {
    background:"rgba(255,255,255,.035)",
    border:"1px solid rgba(255,255,255,.08)",
    borderRadius:10, padding:"13px 15px",
    color:"#e2e8f0", fontSize:14,
    fontFamily:"'Syne',sans-serif",
    width:"100%", display:"block",
    WebkitAppearance:"none",
  }

  const label = {
    fontFamily:"'Space Mono',monospace", color:"#7c3aed",
    fontSize:10, fontWeight:700, letterSpacing:5,
    marginBottom:14, textTransform:"uppercase",
    display:"block",
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background:"#04050f", fontFamily:"'Syne',system-ui,sans-serif",
      color:"#e2e8f0", width:"100%", height:"100vh",
      position:"relative", overflow:"hidden",
      cursor: mob ? "auto" : "none" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.88)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes drift  { 0%{opacity:0;transform:translateY(-4px)} 55%{opacity:1} 100%{opacity:0;transform:translateY(40px)} }
        @keyframes glow   { 0%,100%{box-shadow:0 0 20px #7c3aed33} 50%{box-shadow:0 0 45px #7c3aed66} }
        @keyframes orb    { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.07)} }
        @keyframes slideD { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        * { margin:0; padding:0; box-sizing:border-box; }
        ::-webkit-scrollbar { width:2px }
        ::-webkit-scrollbar-track { background:#04050f }
        ::-webkit-scrollbar-thumb { background:#7c3aed; border-radius:2px }
        ::placeholder { color:#2e3858 !important }
        input, textarea { outline:none !important; transition:border-color .25s, box-shadow .25s !important; -webkit-appearance:none; }
        input:focus, textarea:focus {
          border-color:rgba(167,139,250,.55) !important;
          box-shadow:0 0 0 3px rgba(167,139,250,.1) !important;
        }
        button { font-family:inherit; -webkit-tap-highlight-color:transparent; }
        /* prevent zoom on input focus iOS */
        @media (max-width:640px) {
          input, textarea, select { font-size:16px !important; }
        }
      `}</style>

      {/* ── Canvas ── */}
      <canvas ref={canvasRef} style={{
        position:"absolute", inset:0, width:"100%", height:"100%",
        zIndex:0, pointerEvents:"none",
      }}/>

      {/* ── Vignette ── */}
      <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
        background:"radial-gradient(ellipse at center,transparent 25%,rgba(4,5,15,.9) 100%)" }}/>

      {/* ── Custom cursor (desktop only) ── */}
      {!mob && <>
        <div style={{ position:"fixed", zIndex:9999, pointerEvents:"none",
          left:cur.x-5, top:cur.y-5, width:10, height:10, borderRadius:"50%",
          background:"#a78bfa", boxShadow:"0 0 10px #a78bfa,0 0 24px #a78bfa88",
          transition:"left .04s linear, top .04s linear" }}/>
        <div style={{ position:"fixed", zIndex:9998, pointerEvents:"none",
          left:cur.x-20, top:cur.y-20, width:40, height:40, borderRadius:"50%",
          border:"1px solid rgba(167,139,250,.38)",
          transition:"left .12s, top .12s" }}/>
      </>}

      {/* ══════════════════ SCROLL CONTAINER ══════════════════════════════════ */}
      <div ref={scrollRef} onScroll={onScroll}
        style={{ position:"absolute", inset:0, overflowY:"auto", overflowX:"hidden", zIndex:2 }}>

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <nav style={{
          position:"sticky", top:0, zIndex:200,
          height:60, display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:`0 ${mob ? "16px" : "clamp(16px,4vw,46px)"}`,
          background: sy>30 || menuOpen ? "rgba(4,5,15,.96)" : "transparent",
          backdropFilter: sy>30 || menuOpen ? "blur(28px)" : "none",
          borderBottom: sy>30 || menuOpen ? "1px solid rgba(167,139,250,.08)" : "none",
          transition:"all .3s",
        }}>
          {/* Logo */}
          <div style={{ fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:15,
            background:"linear-gradient(135deg,#a78bfa,#38bdf8)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            flexShrink:0 }}>
            &lt;Akolis /&gt;
          </div>

          {/* Desktop links */}
          {!tab && (
            <div style={{ display:"flex", gap:22 }}>
              {NAV_IDS.map(id => (
                <button key={id} onClick={() => go(id)} style={{
                  background:"none", border:"none", cursor:"none",
                  color: navSec===id ? "#a78bfa" : "#334155",
                  fontFamily:"'Space Mono',monospace", fontSize:9,
                  fontWeight:700, letterSpacing:2.5, textTransform:"uppercase",
                  position:"relative", padding:"4px 0", transition:"color .25s",
                }}>
                  {id.toUpperCase()}
                  <div style={{ position:"absolute", bottom:-1, left:0, right:0,
                    height:1.5, background:"linear-gradient(90deg,#a78bfa,#38bdf8)",
                    borderRadius:1, transformOrigin:"left",
                    transform: navSec===id ? "scaleX(1)" : "scaleX(0)",
                    transition:"transform .3s" }}/>
                </button>
              ))}
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Hire Me — always visible */}
            {!mob && (
              <button onClick={() => go("contact")} style={{
                background:"linear-gradient(135deg,#7c3aed,#0ea5e9)",
                border:"none", borderRadius:22, padding:"8px 18px",
                color:"#fff", fontSize:9, fontWeight:700,
                cursor: mob ? "auto" : "none",
                fontFamily:"'Space Mono',monospace", letterSpacing:.8,
                boxShadow:"0 0 18px rgba(124,58,237,.4)", transition:"opacity .2s",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = ".82"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >HIRE ME →</button>
            )}

            {/* Hamburger (tablet + mobile) */}
            {tab && (
              <button onClick={() => setMenuOpen(o => !o)} style={{
                background:"rgba(124,58,237,.12)",
                border:"1px solid rgba(124,58,237,.25)",
                borderRadius:9, width:40, height:40,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:5,
                cursor:"pointer", padding:0, flexShrink:0,
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:18, height:1.5, background:"#a78bfa", borderRadius:1,
                    transition:"all .3s",
                    transform: menuOpen
                      ? i===0 ? "rotate(45deg) translate(4.5px,4.5px)"
                        : i===2 ? "rotate(-45deg) translate(4.5px,-4.5px)"
                        : "scaleX(0)"
                      : "none",
                    opacity: menuOpen && i===1 ? 0 : 1,
                  }}/>
                ))}
              </button>
            )}
          </div>
        </nav>

        {/* ── Mobile/Tablet Dropdown Menu ── */}
        {tab && menuOpen && (
          <div style={{
            position:"sticky", top:60, zIndex:199,
            background:"rgba(4,5,15,.97)", backdropFilter:"blur(28px)",
            borderBottom:"1px solid rgba(167,139,250,.08)",
            animation:"slideD .25s ease",
          }}>
            {NAV_IDS.map(id => (
              <button key={id} onClick={() => go(id)} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                width:"100%", padding:"16px 20px",
                background:"none", border:"none", borderBottom:"1px solid rgba(255,255,255,.04)",
                color: navSec===id ? "#a78bfa" : "#475569",
                fontFamily:"'Space Mono',monospace", fontSize:11,
                fontWeight:700, letterSpacing:2.5, textTransform:"uppercase",
                cursor:"pointer", transition:"color .2s",
              }}>
                <span>{id.toUpperCase()}</span>
                {navSec===id && <span style={{ color:"#a78bfa", fontSize:14 }}>●</span>}
              </button>
            ))}
            <div style={{ padding:"16px 20px" }}>
              <button onClick={() => go("contact")} style={{
                width:"100%", background:"linear-gradient(135deg,#7c3aed,#0ea5e9)",
                border:"none", borderRadius:10, padding:"13px 0",
                color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer",
                fontFamily:"'Space Mono',monospace", letterSpacing:1,
                boxShadow:"0 0 20px rgba(124,58,237,.35)",
              }}>HIRE ME →</button>
            </div>
          </div>
        )}

        {/* ══ HERO ════════════════════════════════════════════════════════════ */}
        <section id="home" style={{
          minHeight:"100svh",
          display:"flex", flexDirection:"column",
          justifyContent:"center", alignItems:"center", textAlign:"center",
          padding: mob ? "72px 20px 60px" : "80px clamp(20px,5vw,52px) 72px",
          position:"relative",
        }}>
          {/* ambient orb */}
          <div style={{
            position:"absolute", top:"44%", left:"50%",
            width: mob ? "260px" : "min(560px,76vw)",
            height: mob ? "260px" : "min(560px,76vw)",
            borderRadius:"50%", pointerEvents:"none",
            background:"radial-gradient(circle,rgba(124,58,237,.07) 0%,transparent 70%)",
            animation:"orb 8s ease-in-out infinite",
          }}/>

          {/* badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(52,211,153,.07)", border:"1px solid rgba(52,211,153,.3)",
            borderRadius:20, padding: mob ? "5px 14px" : "6px 16px",
            marginBottom: mob ? 24 : 30,
            fontSize: mob ? 9 : 10, color:"#34d399",
            fontFamily:"'Space Mono',monospace", letterSpacing:1.5,
          }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#34d399",
              animation:"pulse 2s ease infinite", flexShrink:0 }}/>
            AVAILABLE FOR FREELANCE
          </div>

          {/* name */}
          <h1 style={{
            fontSize: mob ? "clamp(46px,14vw,72px)" : "clamp(48px,9vw,104px)",
            fontWeight:900, lineHeight:1, letterSpacing:"-.048em",
            margin:`0 0 ${mob?14:18}px`,
          }}>
            <span style={{ color:"#e2e8f0" }}>Hi, I'm </span><br style={{ display: mob ? "block" : "none" }}/>
            <span style={{
              background:"linear-gradient(135deg,#a78bfa 0%,#38bdf8 55%,#fb7185 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>Akolis</span>
          </h1>

          {/* typewriter */}
          <div style={{
            fontFamily:"'Space Mono',monospace",
            fontSize: mob ? "clamp(11px,3.8vw,16px)" : "clamp(12px,2.5vw,21px)",
            color:"#1e293b", marginBottom: mob ? 20 : 24,
            minHeight: mob ? 24 : 30,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"0 8px",
          }}>
            <span style={{ color:"#38bdf8", fontWeight:700 }}>{typed}</span>
            <span style={{ color:"#a78bfa", animation:"blink 1s step-end infinite" }}>█</span>
          </div>

          {/* sub */}
          <p style={{
            maxWidth: mob ? "100%" : 480, color:"#334155",
            fontSize: mob ? 13.5 : 14, lineHeight:1.84,
            marginBottom: mob ? 36 : 46,
            padding: mob ? "0 4px" : 0,
          }}>
            Crafting immersive web experiences with clean code and bold design —
            from banking platforms to 3D interactive sites. I turn ideas into pixels that perform.
          </p>

          {/* CTAs */}
          <div style={{
            display:"flex",
            flexDirection: mob ? "column" : "row",
            gap: mob ? 10 : 12,
            width: mob ? "100%" : "auto",
            maxWidth: mob ? 320 : "none",
            marginBottom: mob ? 52 : 68,
          }}>
            <button onClick={() => go("projects")} style={{
              background:"linear-gradient(135deg,#7c3aed,#0ea5e9)",
              border:"none", borderRadius:26, padding: mob ? "15px 0" : "13px 32px",
              color:"#fff", fontSize: mob ? 13 : 12, fontWeight:700,
              cursor: mob ? "pointer" : "none",
              fontFamily:"'Space Mono',monospace", letterSpacing:.4,
              boxShadow:"0 0 30px rgba(124,58,237,.5),0 8px 30px rgba(0,0,0,.5)",
              transition:"transform .2s",
              width: mob ? "100%" : "auto",
              WebkitTapHighlightColor:"transparent",
            }}>VIEW WORK ↓</button>

            <button onClick={() => go("contact")} style={{
              background:"transparent",
              border:"1px solid rgba(167,139,250,.35)",
              borderRadius:26, padding: mob ? "15px 0" : "13px 32px",
              color:"#e2e8f0", fontSize: mob ? 13 : 12, fontWeight:700,
              cursor: mob ? "pointer" : "none",
              fontFamily:"'Space Mono',monospace", letterSpacing:.4,
              transition:"all .25s",
              width: mob ? "100%" : "auto",
              WebkitTapHighlightColor:"transparent",
            }}>LET'S TALK →</button>
          </div>

          {/* scroll cue */}
          {!mob && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <span style={{ fontFamily:"'Space Mono',monospace", color:"#1e293b", fontSize:8, letterSpacing:4 }}>SCROLL</span>
              <div style={{ width:1, height:46, background:"linear-gradient(to bottom,#a78bfa,transparent)", animation:"drift 2s ease infinite" }}/>
            </div>
          )}
        </section>

        {/* ══ ABOUT ═══════════════════════════════════════════════════════════ */}
        <section id="about" style={{ padding: mob ? "72px 20px" : "100px clamp(16px,5vw,50px)", maxWidth:1100, margin:"0 auto" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns: tab ? "1fr" : "1fr 1fr",
            gap: tab ? 44 : 64,
            alignItems:"center",
          }}>
            {/* Text */}
            <div style={{
              opacity: rA ? 1 : 0,
              transform: rA ? "none" : "translateY(28px)",
              transition:"all .85s cubic-bezier(.4,0,.2,1)",
            }}>
              <span style={label}>◈ About Me</span>
              <h2 style={{
                fontSize: mob ? "clamp(26px,7vw,38px)" : "clamp(24px,3.8vw,44px)",
                fontWeight:900, lineHeight:1.12, letterSpacing:"-.04em", margin:"0 0 22px",
              }}>
                Building the web,<br/>
                <span style={{ background:"linear-gradient(135deg,#a78bfa,#38bdf8)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  one pixel at a time
                </span>
              </h2>
              <p style={{ color:"#475569", lineHeight:1.84, marginBottom:15, fontSize: mob ? 13.5 : 14 }}>
                I'm a front-end developer with a sharp eye for design and a deep passion for creative,
                interactive web experiences. Based in Akure, Nigeria — working remotely worldwide.
              </p>
              <p style={{ color:"#475569", lineHeight:1.84, marginBottom:34, fontSize: mob ? 13.5 : 14 }}>
                From pixel-perfect UI components to immersive 3D experiences, I bridge design and
                engineering — finishing a B.Eng in Civil Engineering while shipping real web products.
              </p>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: mob ? 8 : 10 }}>
                {[["3+","Years Coding"],["10+","Projects"],["100%","Dedication"]].map(([n,l]) => (
                  <div key={l} style={{
                    background:"rgba(124,58,237,.07)", border:"1px solid rgba(124,58,237,.18)",
                    borderRadius:12, padding: mob ? "14px 6px" : "16px 8px", textAlign:"center",
                  }}>
                    <div style={{
                      fontSize: mob ? 20 : 22, fontWeight:900, lineHeight:1,
                      background:"linear-gradient(135deg,#a78bfa,#38bdf8)",
                      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                    }}>{n}</div>
                    <div style={{ color:"#334155", fontSize: mob ? 8 : 9, letterSpacing:1.6,
                      textTransform:"uppercase", marginTop:5 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ID Card */}
            <div style={{
              opacity: rA ? 1 : 0,
              transform: rA ? "none" : "translateY(28px)",
              transition:"all .85s cubic-bezier(.4,0,.2,1) .18s",
              display:"flex", justifyContent:"center",
            }}>
              <div style={{
                width: mob ? "100%" : 280, maxWidth:320,
                background:"linear-gradient(135deg,rgba(124,58,237,.14),rgba(14,165,233,.07))",
                border:"1px solid rgba(124,58,237,.22)",
                borderRadius:22, padding: mob ? 22 : 26,
                position:"relative", backdropFilter:"blur(24px)",
                animation:"glow 4s ease infinite",
                boxShadow:"inset 0 1px 0 rgba(255,255,255,.04)",
              }}>
                <div style={{ position:"absolute", top:0, right:0, width:60, height:60,
                  background:"linear-gradient(225deg,rgba(124,58,237,.24),transparent)",
                  borderRadius:"0 22px 0 60px", pointerEvents:"none" }}/>
                <div style={{ fontSize:38, marginBottom:12 }}>💻</div>
                <div style={{ fontSize: mob ? 16 : 18, fontWeight:900, marginBottom:3 }}>Akolis</div>
                <div style={{ color:"#7c3aed", fontSize:10, fontFamily:"'Space Mono',monospace", marginBottom:16 }}>
                  Front-End Developer
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:16 }}>
                  {["React","Three.js","Tailwind","JavaScript","Git"].map(s => (
                    <span key={s} style={{ background:"rgba(124,58,237,.14)",
                      border:"1px solid rgba(124,58,237,.28)", borderRadius:20,
                      padding:"2px 9px", fontSize:9, color:"#a78bfa" }}>{s}</span>
                  ))}
                </div>
                <div style={{ padding:"10px 12px", background:"rgba(52,211,153,.08)",
                  border:"1px solid rgba(52,211,153,.24)", borderRadius:9,
                  display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", flexShrink:0 }}/>
                  <span style={{ color:"#34d399", fontSize:10, fontFamily:"'Space Mono',monospace" }}>
                    Open to opportunities
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SKILLS ══════════════════════════════════════════════════════════ */}
        <section id="skills" style={{ padding: mob ? "72px 20px" : "100px clamp(16px,5vw,50px)", maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom: mob ? 40 : 56 }}>
            <span style={label}>◎ What I Do</span>
            <h2 style={{
              fontSize: mob ? "clamp(26px,7vw,38px)" : "clamp(24px,3.8vw,44px)",
              fontWeight:900, letterSpacing:"-.04em",
            }}>
              Skills &{" "}
              <span style={{ background:"linear-gradient(135deg,#a78bfa,#38bdf8)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Expertise
              </span>
            </h2>
          </div>

          <div style={{
            display:"grid",
            gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
            gap: mob ? 10 : 12,
          }}>
            {SKILLS.map((s,i) => (
              <div key={s.name} style={{
                opacity: rS ? 1 : 0,
                transform: rS ? "none" : "translateY(18px)",
                transition:`all .6s cubic-bezier(.4,0,.2,1) ${i*.06}s`,
                background:"rgba(255,255,255,.016)",
                border:"1px solid rgba(255,255,255,.052)",
                borderRadius:12, padding: mob ? "15px 17px" : "17px 19px",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontWeight:700, fontSize: mob ? 12.5 : 12 }}>{s.name}</span>
                  <span style={{ color:s.color, fontWeight:800, fontSize:12,
                    fontFamily:"'Space Mono',monospace" }}>{s.pct}%</span>
                </div>
                <div style={{ height:4, background:"rgba(255,255,255,.05)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius:2,
                    background:`linear-gradient(90deg,${s.color},${s.color}88)`,
                    width: rS ? `${s.pct}%` : "0%",
                    transition:`width 1.4s cubic-bezier(.4,0,.2,1) ${i*.08}s`,
                    boxShadow:`0 0 10px ${s.color}55`,
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ PROJECTS ════════════════════════════════════════════════════════ */}
        <section id="projects" style={{ padding: mob ? "72px 20px" : "100px clamp(16px,5vw,50px)", maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom: mob ? 40 : 56 }}>
            <span style={label}>◆ Portfolio</span>
            <h2 style={{
              fontSize: mob ? "clamp(26px,7vw,38px)" : "clamp(24px,3.8vw,44px)",
              fontWeight:900, letterSpacing:"-.04em",
            }}>
              Featured{" "}
              <span style={{ background:"linear-gradient(135deg,#a78bfa,#38bdf8)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Projects
              </span>
            </h2>
          </div>

          <div style={{
            display:"grid",
            gridTemplateColumns: mob ? "1fr" : tab ? "1fr 1fr" : "repeat(3,1fr)",
            gap: mob ? 14 : 18,
          }}>
            {PROJECTS.map((p,i) => (
              <div key={p.id} style={{
                opacity: rP ? 1 : 0,
                transition:`opacity .7s ease ${i*.13}s`,
              }}>
                <div onMouseMove={tilt} onMouseLeave={untilt} style={{
                  background:p.grad,
                  border:`1px solid ${p.accent}28`,
                  borderRadius:20, padding: mob ? 22 : 26,
                  position:"relative", overflow:"hidden",
                  boxShadow:`0 16px 50px ${p.accent}0e`,
                  willChange:"transform",
                  transition:"transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s",
                  // active state for touch
                  WebkitTapHighlightColor:"transparent",
                }}>
                  <div style={{ position:"absolute", top:-44, right:-44, width:160, height:160,
                    borderRadius:"50%", background:`radial-gradient(circle,${p.accent}20,transparent 70%)`,
                    pointerEvents:"none" }}/>

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <span style={{ fontSize: mob ? 30 : 32 }}>{p.emoji}</span>
                    <div style={{ width:28, height:28, borderRadius:"50%",
                      background:`${p.accent}18`, border:`1px solid ${p.accent}44`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:p.accent, fontSize:12, fontWeight:700, flexShrink:0 }}>↗</div>
                  </div>

                  <div style={{ color:p.accent, fontFamily:"'Space Mono',monospace",
                    fontSize:8, fontWeight:700, letterSpacing:2.8, textTransform:"uppercase", marginBottom:6 }}>
                    {p.sub}
                  </div>
                  <h3 style={{ fontSize: mob ? 18 : 19, fontWeight:900, marginBottom:9, letterSpacing:"-.03em" }}>
                    {p.title}
                  </h3>
                  <p style={{ color:"#94a3b8", fontSize: mob ? 12.5 : 12, lineHeight:1.72, marginBottom:18 }}>
                    {p.desc}
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {p.tech.map(t => (
                      <span key={t} style={{ background:`${p.accent}12`,
                        border:`1px solid ${p.accent}28`, borderRadius:20,
                        padding:"3px 9px", fontSize:9, color:p.accent,
                        fontFamily:"'Space Mono',monospace" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CONTACT ═════════════════════════════════════════════════════════ */}
        <section id="contact" style={{
          padding: mob ? "72px 20px 60px" : "100px clamp(16px,5vw,50px) 72px",
          maxWidth:660, margin:"0 auto", textAlign:"center",
        }}>
          <span style={label}>✉ Get In Touch</span>
          <h2 style={{
            fontSize: mob ? "clamp(26px,7vw,38px)" : "clamp(24px,3.8vw,44px)",
            fontWeight:900, letterSpacing:"-.04em", marginBottom:15,
          }}>
            Let's Build Something{" "}
            <span style={{ background:"linear-gradient(135deg,#a78bfa,#38bdf8)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Remarkable
            </span>
          </h2>
          <p style={{ color:"#475569", fontSize: mob ? 13.5 : 14, lineHeight:1.82,
            maxWidth:400, margin:"0 auto 40px" }}>
            Have a project in mind? Let's collaborate and build something that makes a real impact.
          </p>

          <div style={{
            opacity: rC ? 1 : 0,
            transform: rC ? "none" : "translateY(24px)",
            transition:"all .9s cubic-bezier(.4,0,.2,1)",
          }}>
            {sent ? (
              <div style={{ padding: mob ? "44px 24px" : "50px 34px",
                background:"rgba(52,211,153,.07)",
                border:"1px solid rgba(52,211,153,.22)",
                borderRadius:20, textAlign:"center" }}>
                <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
                <div style={{ fontSize: mob ? 17 : 18, fontWeight:900, marginBottom:6 }}>Message sent!</div>
                <div style={{ color:"#475569", fontSize:14 }}>I'll get back to you as soon as possible.</div>
              </div>
            ) : (
              <div style={{
                background:"rgba(255,255,255,.015)",
                border:"1px solid rgba(124,58,237,.16)",
                borderRadius:22, padding: mob ? 20 : "clamp(20px,5vw,42px)",
                backdropFilter:"blur(22px)", textAlign:"left",
              }}>
                {/* Name + Email: stack on mobile */}
                <div style={{
                  display:"grid",
                  gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
                  gap:11, marginBottom:11,
                }}>
                  <input placeholder="Your Name"  style={F}/>
                  <input placeholder="Your Email" style={F} type="email"/>
                </div>
                <input placeholder="Subject" style={{ ...F, marginBottom:11 }}/>
                <textarea placeholder="Tell me about your project…" rows={mob ? 4 : 5}
                  style={{ ...F, resize:"vertical", marginBottom:18 }}/>
                <button onClick={() => setSent(true)} style={{
                  width:"100%",
                  background:"linear-gradient(135deg,#7c3aed,#0ea5e9)",
                  border:"none", borderRadius:10, padding: mob ? 16 : 14,
                  color:"#fff", fontSize: mob ? 13 : 12, fontWeight:700,
                  cursor: mob ? "pointer" : "none",
                  fontFamily:"'Space Mono',monospace", letterSpacing:.8,
                  boxShadow:"0 0 26px rgba(124,58,237,.4)",
                  WebkitTapHighlightColor:"transparent",
                  transition:"opacity .2s",
                }}
                  onMouseEnter={e => !mob && (e.currentTarget.style.opacity = ".82")}
                  onMouseLeave={e => !mob && (e.currentTarget.style.opacity = "1")}
                >SEND MESSAGE →</button>
              </div>
            )}
          </div>

          {/* Socials */}
          <div style={{ display:"flex", justifyContent:"center", gap: mob ? 20 : 28,
            marginTop: mob ? 36 : 44, flexWrap:"wrap" }}>
            {[["GitHub","⌥"],["LinkedIn","◈"],["Twitter","◎"],["Email","✉"]].map(([label,icon]) => (
              <div key={label} style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                color:"#1e293b", fontSize:9, letterSpacing:2,
                fontFamily:"'Space Mono',monospace",
                cursor: mob ? "pointer" : "none",
                transition:"color .25s",
                padding: mob ? "6px" : 0,
              }}
                onMouseEnter={e => !mob && (e.currentTarget.style.color = "#a78bfa")}
                onMouseLeave={e => !mob && (e.currentTarget.style.color = "#1e293b")}
              >
                <span style={{ fontSize: mob ? 22 : 19 }}>{icon}</span>
                {label.toUpperCase()}
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer style={{
          borderTop:"1px solid rgba(255,255,255,.04)",
          padding: mob ? "16px 20px" : "18px clamp(14px,4vw,46px)",
          display:"flex",
          flexDirection: mob ? "column" : "row",
          justifyContent:"space-between", alignItems:"center",
          gap: mob ? 6 : 10, textAlign:"center",
        }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:13,
            background:"linear-gradient(135deg,#a78bfa,#38bdf8)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            &lt;Akolis /&gt;
          </div>
          <div style={{ color:"#1e293b", fontSize:10, fontFamily:"'Space Mono',monospace" }}>
            Built with React & Three.js · © 2025
          </div>
          <div style={{ color:"#1e293b", fontSize:10, fontFamily:"'Space Mono',monospace" }}>
            Akure, Nigeria 🇳🇬
          </div>
        </footer>

      </div>{/* end scroll container */}
    </div>
  )
}
