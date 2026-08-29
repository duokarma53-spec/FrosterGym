import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const weightRef = useRef<HTMLDivElement>(null);
  const ambientGroupRef = useRef<HTMLDivElement>(null);
  const assemblyGroupRef = useRef<HTMLDivElement>(null);
  const finalLogoRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  const [isDone, setIsDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const finishLoading = () => {
      if (isDone) return;
      setIsDone(true);
      setIsFadingOut(true);
      setTimeout(() => {
        document.body.style.overflow = '';
        onComplete();
      }, 800);
    };

    const fallbackTimer = setTimeout(finishLoading, 6000);

    // Initial setup
    gsap.set(containerRef.current, { perspective: 1000 });
    gsap.set(floorRef.current, { rotationX: 70, scale: 3, y: 100, opacity: 0 });
    gsap.set(weightRef.current, { y: -window.innerHeight, rotationZ: 10, scale: 1.2, opacity: 0 });
    gsap.set(flashRef.current, { opacity: 0 });
    gsap.set(ambientGroupRef.current, { opacity: 0, scale: 1.1 });
    gsap.set(finalLogoRef.current, { opacity: 0, scale: 0.9, y: 20 });
    gsap.set(sweepRef.current, { x: '-100%' });

    const assemblyParts = Array.from(assemblyGroupRef.current?.children || []);
    assemblyParts.forEach((part, i) => {
      const angle = (i / assemblyParts.length) * Math.PI * 2;
      const dist = 500;
      gsap.set(part, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        rotationZ: Math.random() * 90 - 45,
        opacity: 0,
        scale: 0.5
      });
    });

    const tl = gsap.timeline({ onComplete: finishLoading });

    // Scene 1: Black screen with floor reveal
    tl.to(floorRef.current, { opacity: 0.8, duration: 0.5, ease: 'power2.out' }, 0);

    // Scene 2 & 3: Heavy Weight Drop & Impact
    tl.to(weightRef.current, {
      y: 0,
      rotationZ: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power4.in'
    }, 0.5)
    .to(flashRef.current, { opacity: 0.4, duration: 0.1, yoyo: true, repeat: 1 }, 0.9)
    .to(containerRef.current, { y: 15, duration: 0.05, yoyo: true, repeat: 5, ease: 'none' }, 0.9) // Screen shake
    .to(floorRef.current, { scale: 3.2, duration: 0.2, ease: 'power1.out' }, 0.9) // Floor vibration

    // Scene 4: Camera Moves (Push in) & Ambient Environment appears
    .to(containerRef.current, {
      scale: 1.2,
      duration: 2.5,
      ease: 'power2.inOut'
    }, 1.0)
    .to(ambientGroupRef.current, {
      opacity: 1,
      scale: 1,
      duration: 1.5,
      ease: 'power2.out'
    }, 1.0)
    .to(weightRef.current, {
      opacity: 0,
      scale: 0,
      duration: 0.4,
      ease: 'power2.in'
    }, 1.2)

    // Scene 5: Equipment Moves / Assembly
    .to(assemblyParts, {
      x: 0,
      y: 0,
      rotationZ: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: 0.05,
      ease: 'back.out(1.2)'
    }, 1.4)

    // Scene 6: Froaster Reveal (Forge into logo)
    .to(assemblyGroupRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      ease: 'power2.in'
    }, 2.4)
    .to(flashRef.current, { opacity: 0.5, duration: 0.1, yoyo: true, repeat: 1 }, 2.6)
    .to(finalLogoRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, 2.6)

    // Scene 7: Hero Moment (Light sweep)
    .to(sweepRef.current, {
      x: '200%',
      duration: 1.2,
      ease: 'power2.inOut'
    }, 3.0)
    .to(containerRef.current, {
      scale: 1.35,
      duration: 1.5,
      ease: 'power1.inOut'
    }, 3.0);

    return () => {
      clearTimeout(fallbackTimer);
      tl.kill();
    };
  }, [isDone]);

  if (isDone && !isFadingOut) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#020202] flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
        
        {/* Scene 1: Floor */}
        <div 
          ref={floorRef}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(40,40,40,0.5)_0%,rgba(5,5,5,1)_60%)]"
          style={{ transformOrigin: 'center center' }}
        >
          {/* Subtle grid to represent gym flooring */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
        </div>

        {/* Ambient Dark Gym Environment */}
        <div ref={ambientGroupRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {/* Abstract blurred shapes representing gym machines in the dark */}
           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#111] rounded-lg blur-3xl opacity-50 transform -rotate-12"></div>
           <div className="absolute bottom-1/4 right-1/4 w-80 h-40 bg-[#1a1a1a] rounded-full blur-3xl opacity-40 transform rotate-45"></div>
        </div>

        {/* Impact Flash */}
        <div ref={flashRef} className="absolute inset-0 bg-[#D4AF37] mix-blend-overlay z-10 pointer-events-none"></div>

        {/* Scene 2: The Weight Plate */}
        <div ref={weightRef} className="absolute z-20 shadow-[0_50px_100px_rgba(0,0,0,1)]">
          <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-[12px] border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#333] to-transparent opacity-20"></div>
            <div className="w-16 h-16 rounded-full border-8 border-[#111] flex items-center justify-center shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)]">
              <div className="w-6 h-6 rounded-full bg-black"></div>
            </div>
          </div>
        </div>

        {/* Scene 5: Mechanical Assembly Parts */}
        <div ref={assemblyGroupRef} className="absolute z-30 flex items-center justify-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-[#1a1a1a] border border-[#333] shadow-2xl"
              style={{
                width: i % 2 === 0 ? '120px' : '40px',
                height: i % 2 === 0 ? '40px' : '120px',
                borderRadius: i % 3 === 0 ? '50%' : '4px',
                background: 'linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%)'
              }}
            ></div>
          ))}
        </div>

        {/* Scene 6 & 7: Final Logo & Hero Light Sweep */}
        <div ref={finalLogoRef} className="absolute z-40 flex flex-col items-center justify-center">
          <div className="relative overflow-hidden group">
            {/* The Actual Logo */}
            <img 
              src="/FrosterGym/new-froaster-logo.png" 
              alt="Froaster Fitness" 
              className="w-64 md:w-80 lg:w-96 h-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
              style={{ filter: 'brightness(1.2) contrast(1.5) invert(1)', mixBlendMode: 'screen' }} 
            />
            {/* Gold light sweep */}
            <div 
              ref={sweepRef}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 skew-x-[-20deg]"
              style={{ filter: 'blur(8px)' }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}
