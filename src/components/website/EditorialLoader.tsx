import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

/* ───────────────────────────────────────────────────────────
   CINEMATIC DUMBBELL → FROASTER LOADING SCREEN
   
   Scene 1: Black → dumbbell appears in dark studio
   Scene 2: Slow rotation + camera push-in
   Scene 3: Dumbbell drops with gravity
   Scene 4: Impact — shake, shockwave, dust, sparks
   Scene 5: Dumbbell shatters → fragments converge
   Scene 6: Fragments assemble into FROASTER wordmark
   Scene 7: Hold → fade out → website
   ─────────────────────────────────────────────────────────── */

// ─── Constants ───────────────────────────────────────────

const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;
const FRAGMENT_COUNT = IS_MOBILE ? 18 : 32;
const DUST_COUNT = IS_MOBILE ? 6 : 10;
const SPARK_COUNT = IS_MOBILE ? 8 : 16;
const FALLBACK_TIMEOUT = 8000;

// Gold accent from the project's palette
const GOLD = '#D4AF37';
const GOLD_DIM = '#c9973e';

// ─── Canvas Dumbbell Renderer ────────────────────────────

function drawDumbbell(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  rotationY: number,
  rimLightIntensity: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Perspective foreshortening based on Y rotation
  const perspectiveFactor = Math.cos(rotationY);
  const absPersp = Math.abs(perspectiveFactor);

  // Dimensions
  const handleLen = 120;
  const handleH = 14;
  const plateRadius = 52;
  const plateWidth = 18;
  const innerPlateRadius = 38;
  const innerPlateWidth = 14;
  const collarWidth = 8;

  // Horizontal offset for 3D rotation illusion
  const shiftX = Math.sin(rotationY) * 20;

  // ── Draw handle (bar) ──
  const handleGrad = ctx.createLinearGradient(0, -handleH / 2, 0, handleH / 2);
  handleGrad.addColorStop(0, '#555');
  handleGrad.addColorStop(0.3, '#3a3a3a');
  handleGrad.addColorStop(0.5, '#2a2a2a');
  handleGrad.addColorStop(0.7, '#1a1a1a');
  handleGrad.addColorStop(1, '#111');

  ctx.fillStyle = handleGrad;
  ctx.beginPath();
  const barLeft = -handleLen * absPersp + shiftX;
  const barRight = handleLen * absPersp + shiftX;
  ctx.roundRect(barLeft, -handleH / 2, barRight - barLeft, handleH, 4);
  ctx.fill();

  // Knurling texture on handle
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = barLeft + 10; i < barRight - 10; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, -handleH / 2 + 2);
    ctx.lineTo(i, handleH / 2 - 2);
    ctx.stroke();
  }

  // ── Helper: draw one weight plate ──
  const drawPlate = (offsetX: number, facing: number) => {
    const px = offsetX * absPersp + shiftX;
    const pw = plateWidth * absPersp;
    const ipw = innerPlateWidth * absPersp;
    const cw = collarWidth * absPersp;

    // Gold collar ring
    const collarGrad = ctx.createLinearGradient(px - cw, 0, px + cw, 0);
    collarGrad.addColorStop(0, '#8B7435');
    collarGrad.addColorStop(0.3, GOLD);
    collarGrad.addColorStop(0.5, '#F0D060');
    collarGrad.addColorStop(0.7, GOLD);
    collarGrad.addColorStop(1, '#8B7435');

    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.ellipse(px, 0, cw, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer plate
    const plateGrad = ctx.createRadialGradient(
      px + facing * 8, -10, 5,
      px, 0, plateRadius
    );
    plateGrad.addColorStop(0, '#3a3a3a');
    plateGrad.addColorStop(0.4, '#222');
    plateGrad.addColorStop(0.7, '#151515');
    plateGrad.addColorStop(1, '#0a0a0a');

    ctx.fillStyle = plateGrad;
    ctx.beginPath();
    ctx.ellipse(px + facing * pw * 0.3, 0, pw, plateRadius, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner plate (slightly lighter)
    const innerGrad = ctx.createRadialGradient(
      px + facing * 6, -8, 3,
      px, 0, innerPlateRadius
    );
    innerGrad.addColorStop(0, '#444');
    innerGrad.addColorStop(0.5, '#2a2a2a');
    innerGrad.addColorStop(1, '#111');

    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.ellipse(px + facing * ipw * 0.2, 0, ipw, innerPlateRadius, 0, 0, Math.PI * 2);
    ctx.fill();

    // Plate edge highlight
    ctx.strokeStyle = `rgba(255,255,255,${0.06 * absPersp})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(px + facing * pw * 0.3, 0, pw, plateRadius, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rim light (gold, cinematic)
    if (rimLightIntensity > 0) {
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = 20 * rimLightIntensity;
      ctx.strokeStyle = `rgba(212,175,55,${0.15 * rimLightIntensity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px + facing * pw * 0.3, 0, pw + 2, plateRadius + 2, 0, -Math.PI * 0.7, Math.PI * 0.1);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  // Draw plates (left and right)
  drawPlate(-handleLen + 20, -1);
  drawPlate(handleLen - 20, 1);

  // ── Specular highlight on handle center ──
  const specGrad = ctx.createRadialGradient(shiftX, -3, 0, shiftX, 0, 40);
  specGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
  specGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = specGrad;
  ctx.fillRect(barLeft, -handleH / 2, barRight - barLeft, handleH);

  ctx.restore();
}

// ─── Component ───────────────────────────────────────────

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fragmentsRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);
  const logoGroupRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLImageElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  const [isDone, setIsDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Animation state refs (avoid re-renders)
  const animState = useRef({
    rotationY: 0,
    scale: 1,
    rimLight: 0,
    dumbbellY: 0,
    dumbbellOpacity: 0,
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
    }, 900);
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) { finishLoading(); return; }

    // ── Canvas sizing ──
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const baseScale = IS_MOBILE ? Math.min(w / 500, 1) : Math.min(w / 700, 1.3);

    const state = animState.current;

    // ── Render loop (runs only during dumbbell scenes) ──
    let frameId = 0;
    let renderActive = true;

    const render = () => {
      if (!renderActive) return;
      ctx.clearRect(0, 0, w, h);

      // Dark studio ambient
      const ambientGrad = ctx.createRadialGradient(cx, cy + state.dumbbellY, 0, cx, cy + state.dumbbellY, Math.max(w, h) * 0.6);
      ambientGrad.addColorStop(0, 'rgba(25,22,18,0.4)');
      ambientGrad.addColorStop(0.5, 'rgba(8,8,8,0.2)');
      ambientGrad.addColorStop(1, 'rgba(2,2,2,0)');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = state.dumbbellOpacity;
      drawDumbbell(
        ctx,
        cx,
        cy + state.dumbbellY,
        baseScale * state.scale,
        state.rotationY,
        state.rimLight
      );
      ctx.globalAlpha = 1;

      frameId = requestAnimationFrame(render);
    };

    // ── Gather DOM elements ──
    const fragments = Array.from(fragmentsRef.current?.children || []) as HTMLElement[];
    const dustParticles = Array.from(dustRef.current?.children || []) as HTMLElement[];
    const sparks = Array.from(sparksRef.current?.children || []) as HTMLElement[];

    // Hide everything initially
    gsap.set(fragments, { opacity: 0, scale: 0 });
    gsap.set(dustParticles, { opacity: 0, scale: 0 });
    gsap.set(sparks, { opacity: 0, scale: 0 });
    gsap.set(shockwaveRef.current, { opacity: 0, scale: 0 });
    gsap.set(logoGroupRef.current, { opacity: 0, scale: 0.9 });
    gsap.set(shieldRef.current, { opacity: 0, y: 20 });
    gsap.set(sweepRef.current, { x: '-150%' });

    // ── GSAP Master Timeline ──
    const tl = gsap.timeline({
      onComplete: finishLoading,
    });

    // SCENE 1: Dumbbell fades into existence (0 → 0.8s)
    tl.to(state, {
      dumbbellOpacity: 1,
      duration: 0.8,
      ease: 'power2.inOut',
    }, 0);

    // SCENE 2: Slow rotation + camera push-in + rim light (0.5 → 2.5s)
    tl.to(state, {
      rotationY: 0.35,
      duration: 2.0,
      ease: 'sine.inOut',
    }, 0.5);

    tl.to(state, {
      scale: 1.15,
      duration: 2.0,
      ease: 'power1.inOut',
    }, 0.5);

    tl.to(state, {
      rimLight: 1,
      duration: 1.5,
      ease: 'power2.in',
    }, 1.0);

    // SCENE 3: Dumbbell drops with gravity (2.5 → 3.1s)
    tl.to(state, {
      dumbbellY: h * 0.22,
      duration: 0.55,
      ease: 'power4.in',
    }, 2.5);

    // SCENE 4: Impact at 3.05s
    const impactTime = 3.05;

    // Camera shake
    tl.to(containerRef.current, {
      x: -8,
      duration: 0.05,
      yoyo: true,
      repeat: 7,
      ease: 'power2.inOut',
    }, impactTime);

    tl.to(containerRef.current, {
      y: -4,
      duration: 0.06,
      yoyo: true,
      repeat: 5,
      ease: 'power2.inOut',
    }, impactTime);

    // Shockwave ring
    tl.to(shockwaveRef.current, {
      opacity: 0.6,
      scale: 1,
      duration: 0.1,
      ease: 'power2.out',
    }, impactTime);

    tl.to(shockwaveRef.current, {
      scale: 4,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, impactTime + 0.1);

    // Dust / smoke burst
    dustParticles.forEach((dust, i) => {
      const angle = (i / dustParticles.length) * Math.PI - Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      const distance = 60 + Math.random() * 100;

      tl.to(dust, {
        opacity: 0.4 + Math.random() * 0.3,
        scale: 1 + Math.random() * 1.5,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance * 0.4 - Math.random() * 30,
        duration: 0.15,
        ease: 'power2.out',
      }, impactTime);

      tl.to(dust, {
        opacity: 0,
        y: `-=${30 + Math.random() * 40}`,
        scale: `+=${0.5}`,
        duration: 0.8 + Math.random() * 0.4,
        ease: 'power1.out',
      }, impactTime + 0.15);
    });

    // Metallic sparks
    sparks.forEach((spark, i) => {
      const angle = (i / sparks.length) * Math.PI * 2;
      const dist = 80 + Math.random() * 120;

      tl.to(spark, {
        opacity: 1,
        scale: 1,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist * 0.5 - 20,
        duration: 0.3,
        ease: 'power3.out',
      }, impactTime);

      tl.to(spark, {
        opacity: 0,
        y: `+=${40 + Math.random() * 30}`,
        duration: 0.5 + Math.random() * 0.3,
        ease: 'power1.in',
      }, impactTime + 0.3);
    });

    // Fade dumbbell canvas after impact
    tl.to(state, {
      dumbbellOpacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    }, impactTime + 0.1);

    // Stop canvas rendering after dumbbell fades
    tl.add(() => {
      renderActive = false;
      cancelAnimationFrame(frameId);
      ctx.clearRect(0, 0, w, h);
    }, impactTime + 0.5);

    // SCENE 5: Fragments burst outward then converge to form FROASTER (3.1 → 4.8s)
    const fragmentStartTime = impactTime + 0.05;

    // First: burst fragments outward from impact point
    fragments.forEach((frag, i) => {
      const burstAngle = (i / fragments.length) * Math.PI * 2;
      const burstDist = 100 + Math.random() * 180;
      const burstX = Math.cos(burstAngle) * burstDist;
      const burstY = Math.sin(burstAngle) * burstDist * 0.6;

      // Burst out
      tl.to(frag, {
        opacity: 1,
        scale: 0.8 + Math.random() * 0.6,
        x: burstX,
        y: burstY,
        rotation: Math.random() * 360,
        duration: 0.4,
        ease: 'power3.out',
      }, fragmentStartTime);
    });

    // Then: converge fragments toward center (forming the wordmark area)
    const convergeStart = fragmentStartTime + 0.5;

    fragments.forEach((frag, i) => {
      // Target: spread across the wordmark width, centered
      const wordmarkWidth = IS_MOBILE ? 240 : 420;
      const wordmarkHeight = IS_MOBILE ? 30 : 50;
      const targetX = (Math.random() - 0.5) * wordmarkWidth;
      const targetY = (Math.random() - 0.5) * wordmarkHeight;

      tl.to(frag, {
        x: targetX,
        y: targetY,
        rotation: 0,
        scale: 0.3 + Math.random() * 0.4,
        duration: 0.8 + Math.random() * 0.3,
        ease: 'power2.inOut',
      }, convergeStart + Math.random() * 0.3);
    });

    // Fade fragments out as the real text appears
    tl.to(fragments, {
      opacity: 0,
      scale: 0,
      duration: 0.4,
      stagger: { amount: 0.2, from: 'random' },
      ease: 'power2.in',
    }, convergeStart + 1.0);

    // SCENE 6: FROASTER wordmark reveal (4.3 → 5.2s)
    const logoRevealTime = convergeStart + 0.8;

    tl.to(logoGroupRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'power2.out',
    }, logoRevealTime);

    // Shield logo drops in from above
    tl.to(shieldRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'back.out(1.4)',
    }, logoRevealTime + 0.2);

    // Metallic light sweep across the wordmark
    tl.to(sweepRef.current, {
      x: '250%',
      duration: 1.2,
      ease: 'power2.inOut',
    }, logoRevealTime + 0.3);

    // SCENE 7: Hold for ~1s then will auto-complete via timeline end
    // Total timeline: ~6.5s (onComplete fires finishLoading)

    // Start the canvas render loop
    render();

    // Fallback safety timeout
    const fallbackTimer = setTimeout(finishLoading, FALLBACK_TIMEOUT);

    return () => {
      clearTimeout(fallbackTimer);
      renderActive = false;
      cancelAnimationFrame(frameId);
      tl.kill();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isDone && !isFadingOut) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] bg-[#020202] flex items-center justify-center overflow-hidden transition-opacity duration-[900ms] ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ── Canvas: Dumbbell Rendering ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* ── Shockwave Ring ── */}
      <div
        ref={shockwaveRef}
        className="absolute rounded-full border-2 pointer-events-none"
        style={{
          width: IS_MOBILE ? '120px' : '180px',
          height: IS_MOBILE ? '60px' : '90px',
          borderColor: `${GOLD}66`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          marginTop: IS_MOBILE ? '18vh' : '22vh',
          zIndex: 2,
          boxShadow: `0 0 30px ${GOLD}33, inset 0 0 20px ${GOLD}22`,
        }}
      />

      {/* ── Dust / Smoke Particles ── */}
      <div
        ref={dustRef}
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          marginTop: IS_MOBILE ? '18vh' : '22vh',
          zIndex: 3,
        }}
      >
        {Array.from({ length: DUST_COUNT }).map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              background: `radial-gradient(circle, rgba(60,55,45,0.6) 0%, rgba(30,28,22,0.3) 60%, transparent 100%)`,
              filter: 'blur(6px)',
            }}
          />
        ))}
      </div>

      {/* ── Metallic Sparks ── */}
      <div
        ref={sparksRef}
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          marginTop: IS_MOBILE ? '18vh' : '22vh',
          zIndex: 4,
        }}
      >
        {Array.from({ length: SPARK_COUNT }).map((_, i) => (
          <div
            key={`spark-${i}`}
            className="absolute"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: i % 3 === 0 ? GOLD : i % 3 === 1 ? '#aaa' : '#777',
              borderRadius: '1px',
              boxShadow: i % 3 === 0 ? `0 0 6px ${GOLD}` : '0 0 3px rgba(200,200,200,0.5)',
            }}
          />
        ))}
      </div>

      {/* ── Metallic Fragments (for transformation) ── */}
      <div
        ref={fragmentsRef}
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
        }}
      >
        {Array.from({ length: FRAGMENT_COUNT }).map((_, i) => {
          const w = 4 + Math.random() * 10;
          const h = 4 + Math.random() * 10;
          const isGold = i % 5 === 0;
          return (
            <div
              key={`frag-${i}`}
              className="absolute"
              style={{
                width: `${w}px`,
                height: `${h}px`,
                background: isGold
                  ? `linear-gradient(135deg, ${GOLD_DIM}, ${GOLD}, #F0D060)`
                  : `linear-gradient(135deg, #2a2a2a, #555, #3a3a3a)`,
                borderRadius: '1px',
                boxShadow: isGold
                  ? `0 0 8px ${GOLD}88`
                  : '0 0 4px rgba(100,100,100,0.3)',
              }}
            />
          );
        })}
      </div>

      {/* ── FROASTER Wordmark (Final Reveal) ── */}
      <div
        ref={logoGroupRef}
        className="absolute flex flex-col items-center justify-center"
        style={{ zIndex: 10 }}
      >
        {/* Shield emblem */}
        <img
          ref={shieldRef}
          src="/FrosterGym/new-froaster-logo.png"
          alt=""
          className="mb-2 drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
          style={{
            width: IS_MOBILE ? '120px' : '180px',
            height: 'auto',
            filter: 'brightness(1.2) contrast(1.5) invert(1)',
            mixBlendMode: 'screen',
          }}
        />

        {/* FROASTER Text */}
        <div className="relative overflow-hidden">
          <h1
            className="font-display font-bold uppercase tracking-[0.08em] leading-none select-none"
            style={{
              fontSize: IS_MOBILE ? '2.8rem' : '4.5rem',
              background: 'linear-gradient(135deg, #3a3a3a 0%, #666 25%, #4a4a4a 40%, #888 55%, #555 70%, #3a3a3a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))',
            }}
          >
            FROASTER
          </h1>

          {/* Gold edge glow overlay */}
          <h1
            className="absolute inset-0 font-display font-bold uppercase tracking-[0.08em] leading-none select-none pointer-events-none"
            aria-hidden="true"
            style={{
              fontSize: IS_MOBILE ? '2.8rem' : '4.5rem',
              WebkitTextStroke: `1px ${GOLD}30`,
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 20px ${GOLD}15, 0 2px 4px rgba(0,0,0,0.9)`,
            }}
          >
            FROASTER
          </h1>

          {/* Light sweep */}
          <div
            ref={sweepRef}
            className="absolute inset-0 w-1/3 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)`,
              filter: 'blur(8px)',
              transform: 'skewX(-25deg)',
            }}
          />
        </div>

        {/* FITNESS subtitle */}
        <p
          className="font-display uppercase tracking-[0.35em] mt-2 select-none"
          style={{
            fontSize: IS_MOBILE ? '0.55rem' : '0.8rem',
            color: '#666',
            textShadow: `0 0 10px ${GOLD}10`,
          }}
        >
          FITNESS
        </p>
      </div>
    </div>
  );
}
