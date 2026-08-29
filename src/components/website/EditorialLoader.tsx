import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

/* ═══════════════════════════════════════════════════════════════
   PREMIUM CINEMATIC DUMBBELL → FROASTER LOADING SCREEN
   
   Luxury-grade loading animation:
   Scene 1: Dark studio → heavy dumbbell materializes
   Scene 2: Cinematic rotation + push-in + gold rim lighting
   Scene 3: Gravity drop with tension buildup
   Scene 4: Powerful impact — flash, shake, shockwaves, debris
   Scene 5: Controlled metallic fragment transformation
   Scene 6: FROASTER forged-metal wordmark assembly
   Scene 7: Hold → cinematic fade to website
   ═══════════════════════════════════════════════════════════════ */

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;
const FRAGMENT_COUNT = IS_MOBILE ? 24 : 40;
const DUST_COUNT = IS_MOBILE ? 8 : 14;
const SPARK_COUNT = IS_MOBILE ? 12 : 22;
const AMBIENT_PARTICLE_COUNT = IS_MOBILE ? 8 : 16;
const FALLBACK_TIMEOUT = 9000;

const GOLD = '#D4AF37';
const GOLD_BRIGHT = '#F0D060';
const GOLD_DIM = '#8B7435';
const GOLD_DARK = '#705A20';

// ─── Premium Dumbbell Renderer ──────────────────────────────

function drawDumbbellScene(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  cx: number, cy: number,
  scale: number,
  rotY: number,
  rimLight: number,
  opacity: number
) {
  ctx.clearRect(0, 0, w, h);
  if (opacity <= 0.01) return;

  // ── Studio environment ──
  // Subtle overhead volumetric cone
  const coneGrad = ctx.createRadialGradient(cx, cy - h * 0.3, 0, cx, cy, Math.max(w, h) * 0.55);
  coneGrad.addColorStop(0, `rgba(35,30,22,${0.35 * opacity})`);
  coneGrad.addColorStop(0.3, `rgba(18,16,12,${0.2 * opacity})`);
  coneGrad.addColorStop(0.6, `rgba(6,6,5,${0.1 * opacity})`);
  coneGrad.addColorStop(1, 'rgba(2,2,2,0)');
  ctx.fillStyle = coneGrad;
  ctx.fillRect(0, 0, w, h);

  // Warm floor surface hint
  const floorY = cy + (IS_MOBILE ? 70 : 90) * scale;
  const floorGrad = ctx.createLinearGradient(0, floorY - 30, 0, floorY + 80);
  floorGrad.addColorStop(0, 'rgba(0,0,0,0)');
  floorGrad.addColorStop(0.3, `rgba(12,11,9,${0.3 * opacity})`);
  floorGrad.addColorStop(0.7, `rgba(8,7,6,${0.2 * opacity})`);
  floorGrad.addColorStop(1, 'rgba(2,2,2,0)');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY - 30, w, 120);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const perspF = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const absP = Math.abs(perspF);
  const leftNear = sinY < 0;

  // Proportions – heavy, professional dumbbell
  const barLen = 135;
  const barH = 13;
  const outerR = IS_MOBILE ? 50 : 58;
  const innerR = IS_MOBILE ? 38 : 44;
  const outerW = IS_MOBILE ? 18 : 22;
  const innerW = IS_MOBILE ? 14 : 18;
  const collarW = IS_MOBILE ? 8 : 10;
  const collarR = IS_MOBILE ? 20 : 24;
  const shift = sinY * 18;

  const nearS = 1 + Math.abs(sinY) * 0.06;
  const farS = 1 - Math.abs(sinY) * 0.06;

  // ── Ground shadow beneath dumbbell ──
  const shGrad = ctx.createRadialGradient(shift, outerR + 12, 0, shift, outerR + 12, barLen * 1.4);
  shGrad.addColorStop(0, 'rgba(0,0,0,0.45)');
  shGrad.addColorStop(0.4, 'rgba(0,0,0,0.2)');
  shGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shGrad;
  ctx.beginPath();
  ctx.ellipse(shift, outerR + 14, barLen * 1.2 * absP, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Draw handle bar ──
  const bL = -barLen * absP + shift;
  const bR = barLen * absP + shift;
  const bW = bR - bL;

  // Premium chrome gradient
  const chromeGrad = ctx.createLinearGradient(0, -barH, 0, barH);
  chromeGrad.addColorStop(0, '#999');
  chromeGrad.addColorStop(0.1, '#bbb');
  chromeGrad.addColorStop(0.25, '#aaa');
  chromeGrad.addColorStop(0.4, '#777');
  chromeGrad.addColorStop(0.55, '#555');
  chromeGrad.addColorStop(0.7, '#444');
  chromeGrad.addColorStop(0.85, '#666');
  chromeGrad.addColorStop(1, '#555');
  ctx.fillStyle = chromeGrad;
  ctx.beginPath();
  ctx.rect(bL, -barH / 2, bW, barH);
  ctx.fill();

  // Top edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(bL + 4, -barH / 2 + 0.5);
  ctx.lineTo(bR - 4, -barH / 2 + 0.5);
  ctx.stroke();

  // Bottom shadow edge
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bL + 4, barH / 2 - 0.5);
  ctx.lineTo(bR - 4, barH / 2 - 0.5);
  ctx.stroke();

  // Grip center section (darker knurled area)
  const gL = bL + bW * 0.3;
  const gR = bR - bW * 0.3;
  const gripGrad = ctx.createLinearGradient(0, -barH, 0, barH);
  gripGrad.addColorStop(0, 'rgba(50,50,50,0.6)');
  gripGrad.addColorStop(0.5, 'rgba(25,25,25,0.7)');
  gripGrad.addColorStop(1, 'rgba(50,50,50,0.6)');
  ctx.fillStyle = gripGrad;
  ctx.fillRect(gL, -barH / 2, gR - gL, barH);

  // Knurling pattern (diamond cross-hatch)
  ctx.lineWidth = 0.5;
  for (let x = gL + 2; x < gR - 2; x += 2.5) {
    ctx.strokeStyle = `rgba(255,255,255,${0.03 + Math.sin(x * 0.5) * 0.01})`;
    ctx.beginPath();
    ctx.moveTo(x, -barH / 2 + 2);
    ctx.lineTo(x + 1.5, barH / 2 - 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 1.5, -barH / 2 + 2);
    ctx.lineTo(x, barH / 2 - 2);
    ctx.stroke();
  }

  // ── Plate drawing helper ──
  const drawPlate = (posX: number, face: number, oR: number, iR: number, oW: number, iW: number, sFactor: number) => {
    const px = posX * absP + shift;
    const ew = oW * absP * sFactor;
    const eiw = iW * absP * sFactor;
    const eor = oR * sFactor;
    const eir = iR * sFactor;
    const plateX = px + face * ew * 0.3;
    const innerX = px + face * eiw * 0.2;

    // Outer plate — dark metallic
    const pGrad = ctx.createRadialGradient(plateX + face * 10 * sFactor, -eor * 0.22, eor * 0.08, plateX, 0, eor);
    pGrad.addColorStop(0, '#3a3a3a');
    pGrad.addColorStop(0.25, '#2a2a2a');
    pGrad.addColorStop(0.5, '#1e1e1e');
    pGrad.addColorStop(0.75, '#141414');
    pGrad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(plateX, 0, ew, eor, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer plate — beveled top edge
    ctx.strokeStyle = `rgba(255,255,255,${0.14 * sFactor})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(plateX, 0, ew, eor, 0, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();

    // Outer plate — bottom edge shadow
    ctx.strokeStyle = `rgba(0,0,0,${0.6 * sFactor})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(plateX, 0, ew, eor, 0, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();

    // Inner plate (recessed, lighter)
    const ipGrad = ctx.createRadialGradient(innerX + face * 6 * sFactor, -eir * 0.18, eir * 0.05, innerX, 0, eir);
    ipGrad.addColorStop(0, '#444');
    ipGrad.addColorStop(0.35, '#333');
    ipGrad.addColorStop(0.65, '#242424');
    ipGrad.addColorStop(1, '#181818');
    ctx.fillStyle = ipGrad;
    ctx.beginPath();
    ctx.ellipse(innerX, 0, eiw, eir, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner plate top bevel
    ctx.strokeStyle = `rgba(255,255,255,${0.08 * sFactor})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(innerX, 0, eiw, eir, 0, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    // Weight ring groove (concentric detail)
    ctx.strokeStyle = `rgba(255,255,255,${0.03 * sFactor})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(innerX, 0, eiw * 0.7, eir * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Center hub / bore hole
    const hubR = eir * 0.22;
    const hubGrad = ctx.createRadialGradient(innerX, 0, 0, innerX, 0, hubR);
    hubGrad.addColorStop(0, '#0a0a0a');
    hubGrad.addColorStop(0.6, '#151515');
    hubGrad.addColorStop(1, '#1e1e1e');
    ctx.fillStyle = hubGrad;
    ctx.beginPath();
    ctx.ellipse(innerX, 0, eiw * 0.15, hubR, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gold rim light
    if (rimLight > 0) {
      ctx.save();
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = 30 * rimLight * sFactor;
      ctx.strokeStyle = `rgba(212,175,55,${0.22 * rimLight * sFactor})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(plateX, 0, ew + 3, eor + 3, 0, -Math.PI * 0.8, Math.PI * 0.05);
      ctx.stroke();
      ctx.restore();
    }
  };

  // ── Gold collar helper ──
  const drawCollar = (posX: number) => {
    const px = posX * absP + shift;
    const cw = collarW * absP;

    // Premium gold gradient
    const cGrad = ctx.createLinearGradient(px - cw * 1.5, 0, px + cw * 1.5, 0);
    cGrad.addColorStop(0, GOLD_DARK);
    cGrad.addColorStop(0.15, GOLD_DIM);
    cGrad.addColorStop(0.3, GOLD);
    cGrad.addColorStop(0.5, GOLD_BRIGHT);
    cGrad.addColorStop(0.7, GOLD);
    cGrad.addColorStop(0.85, GOLD_DIM);
    cGrad.addColorStop(1, GOLD_DARK);
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.ellipse(px, 0, cw, collarR, 0, 0, Math.PI * 2);
    ctx.fill();

    // Collar specular
    ctx.strokeStyle = 'rgba(255,240,180,0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(px, 0, cw * 0.85, collarR * 0.8, 0, -Math.PI * 0.7, -Math.PI * 0.3);
    ctx.stroke();

    // Collar glow
    if (rimLight > 0) {
      ctx.save();
      ctx.shadowColor = GOLD_BRIGHT;
      ctx.shadowBlur = 20 * rimLight;
      ctx.strokeStyle = `rgba(240,208,96,${0.12 * rimLight})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(px, 0, cw + 2, collarR + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };

  // Plate positions along bar
  const leftOuter = -barLen + 12;
  const leftInner = -barLen + 32;
  const leftCollar = -barLen + 50;
  const rightOuter = barLen - 12;
  const rightInner = barLen - 32;
  const rightCollar = barLen - 50;

  // ── Draw order: far → bar → near ──
  const drawSide = (outer: number, inner: number, collar: number, face: number, sFact: number) => {
    drawPlate(outer, face, outerR, innerR, outerW, innerW, sFact);
    drawPlate(inner, face, innerR * 0.82, innerR * 0.6, innerW * 0.75, innerW * 0.55, sFact);
    drawCollar(collar);
  };

  if (leftNear) {
    drawSide(rightOuter, rightInner, rightCollar, 1, farS);
    drawSide(leftOuter, leftInner, leftCollar, -1, nearS);
  } else {
    drawSide(leftOuter, leftInner, leftCollar, -1, farS);
    drawSide(rightOuter, rightInner, rightCollar, 1, nearS);
  }

  // ── Key-light specular wash ──
  const keyGrad = ctx.createRadialGradient(shift, -outerR * 0.5, 0, shift, 0, outerR * 1.4);
  keyGrad.addColorStop(0, 'rgba(255,255,255,0.05)');
  keyGrad.addColorStop(0.4, 'rgba(255,255,255,0.02)');
  keyGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = keyGrad;
  ctx.fillRect(-barLen * 1.5, -outerR * 1.5, barLen * 3, outerR * 3);

  // ── Floor reflection (very subtle mirror) ──
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.translate(0, outerR * 2.4);
  ctx.scale(1, -0.35);

  // Simplified reflected bar
  ctx.fillStyle = '#222';
  ctx.fillRect(bL, -barH / 2, bW, barH);

  // Simplified reflected plates (just ellipses)
  ctx.fillStyle = '#1a1a1a';
  const reflectPlate = (posX: number, face: number, r: number, w2: number) => {
    const rpx = posX * absP + shift;
    ctx.beginPath();
    ctx.ellipse(rpx + face * w2 * absP * 0.3, 0, w2 * absP, r, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  reflectPlate(leftOuter, -1, outerR, outerW);
  reflectPlate(rightOuter, 1, outerR, outerW);

  ctx.restore();

  ctx.restore(); // main save
}

// ─── Component ──────────────────────────────────────────────

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fragmentsRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<HTMLDivElement>(null);
  const shockwave1Ref = useRef<HTMLDivElement>(null);
  const shockwave2Ref = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const logoGroupRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);

  const [isDone, setIsDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const animState = useRef({
    rotY: 0,
    scale: 1,
    rimLight: 0,
    dbY: 0,
    dbOpacity: 0,
    alive: true,
  });

  const finishLoading = useCallback(() => {
    if (!animState.current.alive) return;
    animState.current.alive = false;
    setIsDone(true);
    setIsFadingOut(true);
    setTimeout(() => {
      document.body.style.overflow = '';
      onComplete();
    }, 1000);
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) { finishLoading(); return; }

    // Canvas setup
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h * 0.42; // Slightly above center for composition
    const baseScale = IS_MOBILE ? Math.min(w / 420, 1.1) : Math.min(w / 600, 1.4);

    const st = animState.current;

    // Render loop
    let frameId = 0;
    let renderActive = true;

    const render = () => {
      if (!renderActive) return;
      drawDumbbellScene(ctx, w, h, cx, cy + st.dbY, baseScale * st.scale, st.rotY, st.rimLight, st.dbOpacity);
      frameId = requestAnimationFrame(render);
    };

    // DOM elements
    const fragments = Array.from(fragmentsRef.current?.children || []) as HTMLElement[];
    const dustEls = Array.from(dustRef.current?.children || []) as HTMLElement[];
    const sparkEls = Array.from(sparksRef.current?.children || []) as HTMLElement[];
    const ambientEls = Array.from(ambientRef.current?.children || []) as HTMLElement[];

    // Initial states
    gsap.set(fragments, { opacity: 0, scale: 0 });
    gsap.set(dustEls, { opacity: 0, scale: 0 });
    gsap.set(sparkEls, { opacity: 0, scale: 0 });
    gsap.set([shockwave1Ref.current, shockwave2Ref.current], { opacity: 0, scale: 0 });
    gsap.set(flashRef.current, { opacity: 0 });
    gsap.set(logoGroupRef.current, { opacity: 0, scale: 0.85, y: 15 });
    gsap.set(sweepRef.current, { x: '-160%' });

    // Ambient studio dust — slow ethereal float
    ambientEls.forEach((el, i) => {
      const startX = (Math.random() - 0.5) * w * 0.7;
      const startY = (Math.random() - 0.5) * h * 0.6;
      gsap.set(el, { x: startX, y: startY, opacity: 0 });
      gsap.to(el, {
        opacity: 0.15 + Math.random() * 0.2,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
        ease: 'sine.inOut',
      });
      gsap.to(el, {
        y: startY - 40 - Math.random() * 60,
        x: startX + (Math.random() - 0.5) * 30,
        duration: 6 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 3,
      });
    });

    // ═══ GSAP Master Timeline ═══
    const tl = gsap.timeline({ onComplete: finishLoading });

    // SCENE 1: Dumbbell materializes from darkness (0 → 1s)
    tl.to(st, { dumbbellTarget: 1, duration: 0 }, 0); // dummy
    tl.to(st, {
      dbOpacity: 1,
      duration: 1.0,
      ease: 'power2.inOut',
    }, 0);

    // SCENE 2: Rotation + push-in + rim light (0.8 → 2.8s)
    tl.to(st, {
      rotY: 0.32,
      duration: 2.2,
      ease: 'sine.inOut',
    }, 0.6);

    tl.to(st, {
      scale: 1.2,
      duration: 2.2,
      ease: 'power1.inOut',
    }, 0.6);

    tl.to(st, {
      rimLight: 1,
      duration: 1.8,
      ease: 'power2.in',
    }, 1.0);

    // Tension beat before drop
    tl.to(st, {
      scale: 1.18,
      duration: 0.15,
      ease: 'sine.inOut',
    }, 2.8);

    // SCENE 3: GRAVITY DROP (2.95 → 3.55s)
    tl.to(st, {
      dbY: h * 0.25,
      duration: 0.55,
      ease: 'power4.in',
    }, 2.95);

    // ─── SCENE 4: IMPACT @ 3.5s ───
    const impT = 3.5;

    // Impact flash
    tl.to(flashRef.current, {
      opacity: 0.18,
      duration: 0.06,
      ease: 'power4.out',
    }, impT);
    tl.to(flashRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
    }, impT + 0.06);

    // Camera shake (powerful, short)
    tl.to(innerRef.current, {
      x: -10, duration: 0.04, ease: 'power2.inOut',
    }, impT);
    tl.to(innerRef.current, {
      x: 12, duration: 0.04, ease: 'power2.inOut',
    }, impT + 0.04);
    tl.to(innerRef.current, {
      x: -8, duration: 0.04, ease: 'power2.inOut',
    }, impT + 0.08);
    tl.to(innerRef.current, {
      x: 6, duration: 0.04, ease: 'power2.inOut',
    }, impT + 0.12);
    tl.to(innerRef.current, {
      x: -4, duration: 0.04, ease: 'power2.inOut',
    }, impT + 0.16);
    tl.to(innerRef.current, {
      x: 2, duration: 0.04, ease: 'power2.inOut',
    }, impT + 0.20);
    tl.to(innerRef.current, {
      x: 0, duration: 0.06, ease: 'power2.out',
    }, impT + 0.24);

    // Vertical shake component
    tl.to(innerRef.current, {
      y: -6, duration: 0.05, yoyo: true, repeat: 3, ease: 'power2.inOut',
    }, impT);

    // Shockwave rings
    [shockwave1Ref, shockwave2Ref].forEach((ref, i) => {
      const delay = i * 0.12;
      tl.to(ref.current, {
        opacity: 0.5 - i * 0.15,
        scale: 1,
        duration: 0.08,
        ease: 'power2.out',
      }, impT + delay);
      tl.to(ref.current, {
        scale: 3.5 + i * 1.5,
        opacity: 0,
        duration: 0.7 + i * 0.2,
        ease: 'power2.out',
      }, impT + delay + 0.08);
    });

    // Dust / smoke
    dustEls.forEach((el, i) => {
      const angle = (i / dustEls.length) * Math.PI + (Math.random() - 0.5) * 0.6;
      const dist = 50 + Math.random() * 120;

      tl.to(el, {
        opacity: 0.35 + Math.random() * 0.3,
        scale: 1.5 + Math.random() * 2,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist * 0.35 - Math.random() * 25,
        duration: 0.2,
        ease: 'power3.out',
      }, impT);
      tl.to(el, {
        opacity: 0,
        y: `-=${35 + Math.random() * 50}`,
        x: `+=${(Math.random() - 0.5) * 20}`,
        scale: `+=${1}`,
        duration: 1.0 + Math.random() * 0.5,
        ease: 'power1.out',
      }, impT + 0.2);
    });

    // Metallic sparks
    sparkEls.forEach((el, i) => {
      const angle = (i / sparkEls.length) * Math.PI * 2;
      const dist = 60 + Math.random() * 150;

      tl.to(el, {
        opacity: 0.8 + Math.random() * 0.2,
        scale: 1,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist * 0.45 - 30,
        duration: 0.25,
        ease: 'power4.out',
      }, impT);
      tl.to(el, {
        opacity: 0,
        y: `+=${50 + Math.random() * 40}`,
        duration: 0.6 + Math.random() * 0.4,
        ease: 'power1.in',
      }, impT + 0.25);
    });

    // Dumbbell vanishes
    tl.to(st, {
      dbOpacity: 0,
      duration: 0.25,
      ease: 'power3.in',
    }, impT + 0.08);

    // Stop canvas after dumbbell gone
    tl.add(() => {
      renderActive = false;
      cancelAnimationFrame(frameId);
      ctx.clearRect(0, 0, w * dpr, h * dpr);
    }, impT + 0.5);

    // ─── SCENE 5: FRAGMENT TRANSFORMATION (3.55 → 5.2s) ───
    const fragStart = impT + 0.08;

    // Fragments burst outward from impact point
    fragments.forEach((frag, i) => {
      const bAngle = (i / fragments.length) * Math.PI * 2;
      const bDist = 80 + Math.random() * 200;
      const bX = Math.cos(bAngle) * bDist;
      const bY = Math.sin(bAngle) * bDist * 0.55;

      tl.to(frag, {
        opacity: 1,
        scale: 0.7 + Math.random() * 0.8,
        x: bX,
        y: bY + (IS_MOBILE ? h * 0.1 : h * 0.12), // offset from impact point
        rotation: Math.random() * 540 - 270,
        duration: 0.4,
        ease: 'power3.out',
      }, fragStart);
    });

    // Brief hang / float
    // Then converge toward center (where FROASTER will be)
    const convergeStart = fragStart + 0.6;
    const wordW = IS_MOBILE ? 220 : 400;
    const wordH = IS_MOBILE ? 24 : 40;

    fragments.forEach((frag, i) => {
      const tX = (Math.random() - 0.5) * wordW;
      const tY = (Math.random() - 0.5) * wordH;
      const delay = (i / fragments.length) * 0.35;

      tl.to(frag, {
        x: tX,
        y: tY,
        rotation: (Math.random() - 0.5) * 30,
        scale: 0.2 + Math.random() * 0.5,
        duration: 0.9 + Math.random() * 0.3,
        ease: 'power3.inOut',
      }, convergeStart + delay);
    });

    // Fragments dissolve as text materializes
    tl.to(fragments, {
      opacity: 0,
      scale: 0,
      duration: 0.5,
      stagger: { amount: 0.25, from: 'center' },
      ease: 'power2.in',
    }, convergeStart + 1.1);

    // ─── SCENE 6: FROASTER REVEAL (4.8 → 5.8s) ───
    const revealTime = convergeStart + 0.9;

    tl.to(logoGroupRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, revealTime);

    // Metallic light sweep
    tl.to(sweepRef.current, {
      x: '300%',
      duration: 1.4,
      ease: 'power2.inOut',
    }, revealTime + 0.3);

    // ─── SCENE 7: HOLD + FADE OUT ───
    // Timeline ends ~7.5s → onComplete fires

    // Start render
    render();

    // Safety fallback
    const fallback = setTimeout(finishLoading, FALLBACK_TIMEOUT);

    return () => {
      clearTimeout(fallback);
      renderActive = false;
      cancelAnimationFrame(frameId);
      tl.kill();
      // Kill ambient dust tweens
      ambientEls.forEach(el => gsap.killTweensOf(el));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isDone && !isFadingOut) return null;

  // Impact point offset
  const impactOffset = IS_MOBILE ? '16vh' : '20vh';

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] bg-[#020202] overflow-hidden transition-opacity duration-1000 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ── Cinematic letterbox bars ── */}
      <div className="absolute top-0 left-0 right-0 h-[3.5vh] bg-black z-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[3.5vh] bg-black z-50 pointer-events-none" />

      {/* ── Vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[45]"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      <div ref={innerRef} className="absolute inset-0 flex items-center justify-center">
        {/* ── Canvas: Dumbbell Scene ── */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

        {/* ── Ambient Studio Dust ── */}
        <div
          ref={ambientRef}
          className="absolute pointer-events-none"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}
        >
          {Array.from({ length: AMBIENT_PARTICLE_COUNT }).map((_, i) => (
            <div
              key={`amb-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${1 + Math.random() * 1.5}px`,
                height: `${1 + Math.random() * 1.5}px`,
                background: i % 3 === 0 ? `rgba(212,175,55,0.6)` : `rgba(200,195,180,0.5)`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </div>

        {/* ── Impact Flash ── */}
        <div
          ref={flashRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 3,
            background: `radial-gradient(ellipse 60% 40% at 50% calc(42% + ${impactOffset}), rgba(212,175,55,0.4) 0%, rgba(255,250,230,0.2) 30%, transparent 70%)`,
          }}
        />

        {/* ── Shockwave Rings ── */}
        {[shockwave1Ref, shockwave2Ref].map((ref, i) => (
          <div
            key={`sw-${i}`}
            ref={ref}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: IS_MOBILE ? '100px' : '160px',
              height: IS_MOBILE ? '50px' : '80px',
              borderWidth: `${2 - i * 0.5}px`,
              borderStyle: 'solid',
              borderColor: i === 0 ? `${GOLD}55` : `rgba(180,170,150,0.25)`,
              top: '42%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              marginTop: impactOffset,
              zIndex: 4,
              boxShadow: i === 0
                ? `0 0 25px ${GOLD}22, inset 0 0 15px ${GOLD}15`
                : '0 0 15px rgba(180,170,150,0.1)',
            }}
          />
        ))}

        {/* ── Dust / Smoke ── */}
        <div
          ref={dustRef}
          className="absolute pointer-events-none"
          style={{ top: '42%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: impactOffset, zIndex: 5 }}
        >
          {Array.from({ length: DUST_COUNT }).map((_, i) => (
            <div
              key={`d-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${18 + Math.random() * 35}px`,
                height: `${18 + Math.random() * 35}px`,
                background: `radial-gradient(circle, rgba(50,45,35,0.5) 0%, rgba(25,22,18,0.3) 50%, transparent 100%)`,
                filter: `blur(${5 + Math.random() * 4}px)`,
              }}
            />
          ))}
        </div>

        {/* ── Metallic Sparks ── */}
        <div
          ref={sparksRef}
          className="absolute pointer-events-none"
          style={{ top: '42%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: impactOffset, zIndex: 6 }}
        >
          {Array.from({ length: SPARK_COUNT }).map((_, i) => {
            const isGold = i % 3 === 0;
            const size = 1.5 + Math.random() * 3;
            return (
              <div
                key={`s-${i}`}
                className="absolute"
                style={{
                  width: `${size}px`,
                  height: `${size * (0.5 + Math.random() * 1)}px`,
                  background: isGold ? GOLD : (i % 2 === 0 ? '#bbb' : '#888'),
                  borderRadius: '0.5px',
                  boxShadow: isGold
                    ? `0 0 8px ${GOLD}, 0 0 3px ${GOLD_BRIGHT}`
                    : '0 0 4px rgba(220,220,220,0.4)',
                }}
              />
            );
          })}
        </div>

        {/* ── Metallic Fragments ── */}
        <div
          ref={fragmentsRef}
          className="absolute pointer-events-none"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 7 }}
        >
          {Array.from({ length: FRAGMENT_COUNT }).map((_, i) => {
            const fw = 3 + Math.random() * 12;
            const fh = 3 + Math.random() * 10;
            const isGold = i % 6 === 0;
            const isLight = i % 4 === 0;
            return (
              <div
                key={`f-${i}`}
                className="absolute"
                style={{
                  width: `${fw}px`,
                  height: `${fh}px`,
                  background: isGold
                    ? `linear-gradient(${120 + Math.random() * 60}deg, ${GOLD_DIM}, ${GOLD}, ${GOLD_BRIGHT})`
                    : isLight
                    ? `linear-gradient(${Math.random() * 180}deg, #4a4a4a, #777, #555)`
                    : `linear-gradient(${Math.random() * 180}deg, #222, #444, #2a2a2a)`,
                  borderRadius: '0.5px',
                  boxShadow: isGold
                    ? `0 0 10px ${GOLD}66, 0 0 4px ${GOLD}44`
                    : isLight
                    ? '0 0 6px rgba(150,150,150,0.25)'
                    : '0 0 3px rgba(80,80,80,0.2)',
                }}
              />
            );
          })}
        </div>

        {/* ── FROASTER Wordmark Group ── */}
        <div
          ref={logoGroupRef}
          className="absolute flex flex-col items-center justify-center"
          style={{ zIndex: 10 }}
        >
          {/* Ambient glow behind text */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: IS_MOBILE ? '280px' : '500px',
              height: IS_MOBILE ? '100px' : '140px',
              background: `radial-gradient(ellipse, ${GOLD}08 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />

          {/* Shield emblem from existing logo */}
          <img
            src="/FrosterGym/new-froaster-logo.png"
            alt=""
            className="drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
            style={{
              width: IS_MOBILE ? '100px' : '155px',
              height: 'auto',
              filter: 'brightness(1.2) contrast(1.5) invert(1)',
              mixBlendMode: 'screen',
              marginBottom: IS_MOBILE ? '4px' : '6px',
            }}
          />

          {/* FROASTER — 3-layer premium metallic text */}
          <div className="relative" style={{ lineHeight: 1 }}>
            {/* Layer 1: 3D extrusion shadow (behind) */}
            <h1
              className="font-display font-bold uppercase select-none"
              style={{
                fontSize: IS_MOBILE ? '2.6rem' : '5rem',
                letterSpacing: IS_MOBILE ? '0.06em' : '0.1em',
                color: '#1a1a1a',
                textShadow: `
                  0 1px 0 #232323,
                  0 2px 0 #1f1f1f,
                  0 3px 0 #1b1b1b,
                  0 4px 0 #171717,
                  0 5px 0 #131313,
                  0 6px 0 #0f0f0f,
                  0 7px 0 #0b0b0b,
                  0 8px 0 #080808,
                  0 9px 0 #040404,
                  0 10px 0 #000000,
                  0 12px 20px rgba(0,0,0,0.95),
                  0 20px 40px rgba(0,0,0,0.8),
                  0 30px 60px rgba(0,0,0,0.5)
                `,
              }}
            >
              FROASTER
            </h1>

            {/* Layer 2: Metallic gradient surface (on top) */}
            <h1
              className="absolute inset-0 font-display font-bold uppercase select-none pointer-events-none"
              aria-hidden="true"
              style={{
                fontSize: IS_MOBILE ? '2.6rem' : '5rem',
                letterSpacing: IS_MOBILE ? '0.06em' : '0.1em',
                background: `linear-gradient(
                  168deg,
                  #2a2a2a 0%,
                  #555 8%,
                  #383838 16%,
                  #777 28%,
                  #444 40%,
                  #999 52%,
                  #555 62%,
                  #888 74%,
                  #3a3a3a 86%,
                  #666 100%
                )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))',
              }}
            >
              FROASTER
            </h1>

            {/* Layer 3: Gold edge lighting (on top of everything) */}
            <h1
              className="absolute inset-0 font-display font-bold uppercase select-none pointer-events-none"
              aria-hidden="true"
              style={{
                fontSize: IS_MOBILE ? '2.6rem' : '5rem',
                letterSpacing: IS_MOBILE ? '0.06em' : '0.1em',
                WebkitTextStroke: `0.5px rgba(212,175,55,0.18)`,
                WebkitTextFillColor: 'transparent',
                textShadow: `0 0 30px ${GOLD}0a, 0 -1px 2px rgba(255,240,200,0.06)`,
              }}
            >
              FROASTER
            </h1>

            {/* Light sweep across text */}
            <div
              ref={sweepRef}
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '-20%',
                  width: '30%',
                  background: `linear-gradient(90deg, transparent 0%, ${GOLD}20 40%, rgba(255,250,230,0.15) 50%, ${GOLD}20 60%, transparent 100%)`,
                  filter: 'blur(6px)',
                  transform: 'skewX(-20deg)',
                }}
              />
            </div>
          </div>

          {/* FITNESS subtitle */}
          <p
            className="font-display uppercase select-none"
            style={{
              fontSize: IS_MOBILE ? '0.5rem' : '0.75rem',
              letterSpacing: IS_MOBILE ? '0.3em' : '0.4em',
              color: '#555',
              marginTop: IS_MOBILE ? '3px' : '5px',
              textShadow: `0 0 15px ${GOLD}08`,
            }}
          >
            FITNESS
          </p>
        </div>
      </div>
    </div>
  );
}
