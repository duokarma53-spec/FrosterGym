import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const ambientLightRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLDivElement>(null);
  const athleticClubRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  const [isFadingOut, setIsFadingOut] = useState(false);

  // Determine extrusion based on screen size (keeps it performant on mobile)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const EXTRUSION_LAYERS = isMobile ? 12 : 20;

  useEffect(() => {
    // Lock body scroll while loading
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        setIsFadingOut(true);
        // Wait for the CSS fade-out transition to complete before unmounting
        setTimeout(() => {
          document.body.style.overflow = '';
          onComplete();
        }, 700); 
      }
    });

    // 1. Initial State
    gsap.set(sceneRef.current, { scale: 0.25, rotationX: 25, rotationY: -15, opacity: 0 });
    gsap.set(ambientLightRef.current, { opacity: 0 });
    gsap.set(flashRef.current, { opacity: 0 });
    gsap.set([athleticClubRef.current, taglineRef.current], { opacity: 0, y: 20 });
    gsap.set(sweepRef.current, { backgroundPosition: '-100% 0', opacity: 0 });

    // 2. Darkness & Emergence (Slow push in)
    tl.to(sceneRef.current, {
      opacity: 1,
      scale: 0.65,
      rotationX: 12,
      rotationY: -5,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0);

    tl.to(ambientLightRef.current, {
      opacity: 0.2,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0);

    // 3. Impact / Boom (Rapid approach)
    tl.to(sceneRef.current, {
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      duration: 0.35,
      ease: "power4.in"
    }, 1.5);

    // 4. Exact impact moment
    tl.add(() => {
      // Screen shake (vertical slam)
      gsap.fromTo(containerRef.current, 
        { y: 15 },
        { y: 0, duration: 0.6, ease: "elastic.out(1, 0.2)" }
      );
      
      // Impact flash
      gsap.fromTo(flashRef.current,
        { opacity: 0.25 },
        { opacity: 0, duration: 0.5, ease: "power2.out" }
      );

      // Dust burst particles
      const dustNodes = dustRef.current?.children;
      if (dustNodes) {
        gsap.to(dustNodes, {
          x: () => (Math.random() - 0.5) * window.innerWidth * 0.7,
          y: () => (Math.random() - 0.5) * window.innerHeight * 0.5,
          opacity: () => Math.random() * 0.6 + 0.2,
          scale: () => Math.random() * 2.5 + 0.5,
          duration: () => Math.random() * 0.8 + 0.5,
          ease: "power3.out",
          onComplete: function() {
            gsap.to(this.targets(), { opacity: 0, duration: 0.4 });
          }
        });
      }
    }, 1.85);

    // Light pulse on impact
    tl.to(ambientLightRef.current, {
      opacity: 0.5,
      scale: 1.2,
      duration: 0.6,
      ease: "power2.out"
    }, 1.85);

    // Brand Reveal (Text)
    tl.to([athleticClubRef.current, taglineRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1
    }, 1.95);

    // Metallic Sweep across logo
    tl.to(sweepRef.current, {
      backgroundPosition: '200% 0',
      opacity: 1,
      duration: 1.2,
      ease: "power2.inOut"
    }, 1.85);

    // Continuous subtle scale push after impact
    tl.to(sceneRef.current, {
      scale: 1.05,
      duration: 1.5,
      ease: "none"
    }, 1.85);

    // 5. Exit Transition
    tl.to(sceneRef.current, {
      scale: 3.5,
      opacity: 0,
      rotationX: -10, // slight tilt as we pass through
      duration: 0.6,
      ease: "power3.in"
    }, 3.35);

    tl.to([ambientLightRef.current, athleticClubRef.current, taglineRef.current], {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in"
    }, 3.35);

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[9999] bg-[#050505] overflow-hidden flex flex-col items-center justify-center transition-opacity duration-700 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ perspective: '1200px' }}
    >
      {/* Background Ambient Light */}
      <div 
        ref={ambientLightRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[1000px] max-h-[1000px] rounded-full blur-[100px] pointer-events-none mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(5,5,5,0) 60%)'
        }}
      />

      {/* The 3D Scene */}
      <div 
        ref={sceneRef}
        className="relative flex flex-col items-center text-center z-10 w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative w-full flex justify-center" style={{ transformStyle: 'preserve-3d' }}>
           {/* Extrusion layers */}
           {Array.from({ length: EXTRUSION_LAYERS }).map((_, i) => {
             const isFront = i === EXTRUSION_LAYERS - 1;
             return (
               <div 
                 key={i}
                 className={`font-bebas text-[12vw] sm:text-[10vw] md:text-[9vw] lg:text-[7rem] tracking-[0.1em] leading-none select-none flex items-center justify-center ${isFront ? 'relative' : 'absolute inset-0'}`}
                 style={{
                   transform: `translateZ(${i * 1.5}px)`,
                   WebkitTextStroke: isFront ? '1px rgba(212,175,55,0.9)' : '2px rgba(10,10,10,1)',
                   color: isFront ? 'transparent' : '#050505',
                   backgroundImage: isFront ? 'linear-gradient(135deg, #777 0%, #111 30%, #555 50%, #111 70%, #444 100%)' : 'none',
                   WebkitBackgroundClip: isFront ? 'text' : 'none',
                   filter: !isFront ? `brightness(${0.15 + (i/EXTRUSION_LAYERS)*0.7})` : 'none',
                 }}
               >
                 FROASTER
               </div>
             );
           })}
           
           {/* Sweep Layer overlay */}
           <div 
             ref={sweepRef}
             className="absolute inset-0 font-bebas text-[12vw] sm:text-[10vw] md:text-[9vw] lg:text-[7rem] tracking-[0.1em] leading-none select-none flex items-center justify-center pointer-events-none"
             style={{
                transform: `translateZ(${EXTRUSION_LAYERS * 1.5 + 1}px)`,
                backgroundImage: 'linear-gradient(110deg, transparent 0%, rgba(212,175,55,0) 40%, rgba(255,255,255,0.8) 50%, rgba(212,175,55,0) 60%, transparent 100%)',
                backgroundSize: '200% 100%',
                backgroundPosition: '-100% 0',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
             }}
           >
             FROASTER
           </div>
        </div>
        
        {/* Subtitles */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-1 sm:gap-2 relative z-20" style={{ transform: 'translateZ(30px)' }}>
          <h2 
            ref={athleticClubRef}
            className="text-[#D4AF37] font-bebas text-xl sm:text-2xl md:text-3xl tracking-[0.4em] opacity-0"
          >
            ATHLETIC CLUB
          </h2>
          <p 
            ref={taglineRef}
            className="text-[#A7A39A] font-oswald text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] font-light opacity-0"
          >
            Where fat meets its fate.
          </p>
        </div>
      </div>

      {/* Dust Particles */}
      <div ref={dustRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none z-30">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute top-0 left-0 rounded-full"
            style={{ 
              width: Math.random() > 0.85 ? '4px' : '2px',
              height: Math.random() > 0.85 ? '4px' : '2px',
              backgroundColor: Math.random() > 0.6 ? '#D4AF37' : '#A7A39A',
              opacity: 0, 
              boxShadow: '0 0 6px rgba(212,175,55,0.4)' 
            }}
          />
        ))}
      </div>

      {/* Flash Overlay */}
      <div 
        ref={flashRef}
        className="absolute inset-0 bg-[#D4AF37] pointer-events-none mix-blend-screen z-50 opacity-0"
      />
    </div>
  );
}
