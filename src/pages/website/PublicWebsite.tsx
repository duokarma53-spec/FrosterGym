import { useEffect, useState, useRef } from 'react';
import { Menu, X, ArrowRight, ArrowLeft } from 'lucide-react';
import EditorialLoader from '../../components/website/EditorialLoader';

const PRICING_PLANS = [
  {
    name: 'Basic',
    price: '₹1,500',
    pricePT: '₹3,500',
    features: ['Access to all modern equipment', 'Locker room access', '1 group class per month'],
    img: '/FrosterGym/basic-plan.jpeg'
  },
  {
    name: 'Standard',
    price: '₹2,500',
    pricePT: '₹4,500',
    features: ['Access to all modern equipment', 'Locker room access', '4 group classes per month', 'Free diet consultation'],
    img: '/FrosterGym/stnd-plan.jpeg'
  },
  {
    name: 'Premium',
    price: '₹3,500',
    pricePT: '₹6,000',
    features: ['Access to all modern equipment', 'Locker room access', 'Unlimited group classes', 'Customised diet plan'],
    img: '/FrosterGym/pro-plan.jpeg'
  }
];

const GALLERY_ITEMS = [
  { id: '01', title: 'THE SPACE.', desc: 'FROASTER GYM\nDAHOD, GUJARAT', img: 'new_gallery_1.png' },
  { id: '02', title: 'THE WORK.', desc: 'NO EXCUSES\nJUST PROGRESS', img: 'new_gallery_2.jpg' },
  { id: '03', title: 'THE PEOPLE.', desc: 'BUILT ON\nDISCIPLINE', img: 'new_gallery_3.png' },
  { id: '04', title: 'THE RESULT.', desc: 'ENGINEERED FOR\nPERFORMANCE', img: 'new_gallery_4.png' },
  { id: '05', title: 'THE IRON.', desc: 'HEAVY WEIGHTS\nONLY', img: 'gallery2.jpg' },
  { id: '06', title: 'THE FOCUS.', desc: 'PURE\nDEDICATION', img: 'new_gallery_6.png' },
  { id: '07', title: 'THE ENERGY.', desc: 'ENDLESS\nDRIVE', img: 'new_gallery_5.png' },
  { id: '08', title: 'THE GRIT.', desc: 'PUSH PAST\nLIMITS', img: 'new_gallery_7.jpg' },
  { id: '09', title: 'THE POWER.', desc: 'UNSTOPPABLE\nFORCE', img: 'new_gallery_8.png' },
  { id: '10', title: 'THE STAMINA.', desc: 'GO THE\nDISTANCE', img: 'new_gallery_9.png' },
  { id: '11', title: 'THE ZONE.', desc: 'ZERO\nDISTRACTIONS', img: 'gallery1.jpg' },
  { id: '12', title: 'THE PRIDE.', desc: 'EARN IT\nEVERYDAY', img: 'gallery3.png' }
];

const BG_POSITIONS = [
  { x: -35, y: -15, z: -400, rY: 20, rX: 5, s: 0.8 },
  { x: 35, y: 15, z: -450, rY: -25, rX: -5, s: 0.75 },
  { x: -25, y: 35, z: -500, rY: 15, rX: -10, s: 0.7 },
  { x: 30, y: -35, z: -550, rY: -15, rX: 10, s: 0.85 },
  { x: -10, y: 40, z: -600, rY: 10, rX: -15, s: 0.65 },
  { x: 10, y: -45, z: -650, rY: -10, rX: 15, s: 0.6 },
  { x: -45, y: -5, z: -700, rY: 25, rX: 8, s: 0.7 },
  { x: 45, y: -10, z: -750, rY: -20, rX: -12, s: 0.65 },
  { x: -20, y: -40, z: -800, rY: 12, rX: 15, s: 0.6 },
  { x: 25, y: 35, z: -850, rY: -18, rX: -8, s: 0.55 },
  { x: -5, y: 45, z: -900, rY: 5, rX: -20, s: 0.5 },
  { x: 5, y: -50, z: -950, rY: -5, rX: 20, s: 0.5 },
];

const Gallery3D = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [smoothedMouse, setSmoothedMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const renderLoop = () => {
      setSmoothedMouse(prev => ({
        x: prev.x + (mousePos.x - prev.x) * 0.05,
        y: prev.y + (mousePos.y - prev.y) * 0.05
      }));
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  return (
    <section 
      id="gallery"
      ref={containerRef}
      className="relative w-full h-[100svh] min-h-[700px] md:min-h-[900px] bg-[#020202] overflow-hidden flex items-center justify-center border-t border-white/5"
      style={{ perspective: '1200px' }}
    >
      {/* Huge Background Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <h1 className="text-[25vw] font-display font-black text-white/[0.015] select-none whitespace-nowrap">
          FROASTER
        </h1>
      </div>

      {/* Editorial Text Overlay */}
      <div className="absolute top-12 left-6 md:top-16 md:left-12 z-40 pointer-events-none">
        <p className="text-[#d9a952] text-[0.65rem] md:text-xs font-bold tracking-[0.3em] uppercase mb-4">
          Froaster / The Experience
        </p>
        <h2 className="text-4xl md:text-6xl font-display font-black text-white uppercase leading-[0.9] tracking-tight">
          Built<br/>To<br/>Move.
        </h2>
      </div>
      
      {/* Image Metadata Overlay */}
      <div className="absolute bottom-12 left-6 md:bottom-16 md:left-12 z-40 pointer-events-none flex flex-col gap-1">
        <span className="text-[#d9a952] text-[0.65rem] md:text-xs font-bold tracking-[0.2em]">{GALLERY_ITEMS[activeIdx].id} / {GALLERY_ITEMS.length}</span>
        <h3 className="text-white text-xl md:text-3xl font-display font-bold uppercase tracking-widest">{GALLERY_ITEMS[activeIdx].title.replace('.', '')}</h3>
        <p className="text-white/50 text-[0.65rem] md:text-xs font-medium uppercase tracking-[0.3em] mt-1">{GALLERY_ITEMS[activeIdx].desc.split('\n')[0]}</p>
      </div>

      {/* 3D Scene Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center z-10"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${smoothedMouse.y * -5}deg) rotateY(${smoothedMouse.x * 5}deg)`
        }}
      >
        {GALLERY_ITEMS.map((item, idx) => {
          const isActive = idx === activeIdx;
          
          let bgIdx = idx >= activeIdx ? idx - 1 : idx;
          if (bgIdx < 0) bgIdx = 0;
          const pos = isActive 
            ? { x: 0, y: 0, z: 150, rY: 0, rX: 0, s: 1 }
            : BG_POSITIONS[bgIdx % BG_POSITIONS.length];
            
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
          
          const translateX = isMobile ? pos.x * 0.4 : pos.x;
          const translateY = isMobile ? pos.y * 0.4 : pos.y;
          
          const transform = `translate3d(${translateX}vw, ${translateY}vh, ${pos.z}px) rotateX(${pos.rX}deg) rotateY(${pos.rY}deg) scale(${pos.s})`;

          return (
            <div
              key={item.id}
              onClick={() => setActiveIdx(idx)}
              className={`absolute group cursor-pointer transition-all ease-[cubic-bezier(0.25,1,0.1,1)] origin-center`}
              style={{
                width: isMobile ? '65vw' : '400px',
                aspectRatio: '3/4',
                transform,
                transitionDuration: isActive ? '1000ms' : '1500ms',
                zIndex: isActive ? 30 : 10,
                filter: isActive ? 'brightness(1.1) blur(0px)' : `brightness(0.3) blur(${Math.abs(pos.z) / 250}px)`,
              }}
            >
              <div 
                className={`absolute inset-0 bg-[#d9a952] rounded-sm transition-opacity duration-1000 blur-2xl ${isActive ? 'opacity-15' : 'opacity-0 group-hover:opacity-10'}`} 
                style={{ transform: 'translateZ(-10px)' }}
              />
              
              <img 
                src={`/FrosterGym/${item.img}`}
                alt={item.title}
                className="w-full h-full object-cover rounded-sm shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 group-hover:border-[#d9a952]/30 transition-colors duration-500"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export function PublicWebsite() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePlan, setActivePlan] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary-500 selection:text-background">
      {isLoading && <EditorialLoader onComplete={() => setIsLoading(false)} />}
      
      {/* 1. Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ease-out ${scrolled ? 'py-4 bg-[#0a0a0b]/85 backdrop-blur-md border-b border-white/5' : 'py-8 bg-transparent'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Brand Logo & Name */}
          <div className="cursor-pointer flex items-center gap-4 z-50 group" onClick={() => window.scrollTo(0, 0)}>
            <img src="/FrosterGym/logo.png" alt="Froaster Gym" className="h-10 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="hidden sm:flex flex-col justify-center">
              <span className="font-display font-bold text-xl tracking-[0.15em] leading-none text-text-primary uppercase">Froaster</span>
              <span className="text-[0.65rem] tracking-[0.3em] text-primary-500 uppercase mt-1 opacity-80 font-medium">Athletic Club</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10 text-[0.8rem] uppercase tracking-[0.15em] font-medium text-[#9c9c9a]">
            {['About', 'Memberships', 'Gallery', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())} 
                className="relative group hover:text-[#d9a952] transition-colors duration-300 py-2"
              >
                {item}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#d9a952] group-hover:w-full transition-all duration-300 ease-out opacity-0 group-hover:opacity-100"></span>
              </button>
            ))}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-text-primary z-50 p-2 -mr-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-7 h-7 font-light" strokeWidth={1.5} /> : <Menu className="w-7 h-7 font-light" strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-[#0a0a0b] z-40 transition-all duration-500 ease-in-out flex flex-col justify-center px-12 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`flex flex-col gap-8 transition-all duration-700 delay-100 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          {['About', 'Memberships', 'Gallery', 'Contact'].map((item) => (
            <button 
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())} 
              className="text-4xl font-display uppercase tracking-[0.1em] text-text-primary hover:text-primary-500 transition-colors text-left flex items-center gap-6 group"
            >
              <span className="w-8 h-[1px] bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative min-h-[100svh] flex items-center bg-background overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src="/FrosterGym/hero-new-bg-2.jpg" alt="Premium Gym Environment" className="w-full h-full object-cover opacity-[0.35]" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl reveal opacity-0 translate-y-8 transition-all duration-1000 ease-out">
            <h2 className="text-primary-500 font-display uppercase tracking-[0.2em] text-sm md:text-base mb-6 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-primary-500"></span> Premium Athletic Club
            </h2>
            <h1 className="text-[4.5rem] leading-[0.9] md:text-8xl font-display font-bold text-text-primary mb-8 uppercase drop-shadow-2xl">
              TRAIN HARD.<br/>
              <span className="text-text-muted">LIVE STRONG.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted mb-12 font-light leading-relaxed max-w-lg">
              Froaster is a serious gym for people serious about training. 
              Where discipline meets luxury. Join Dahod's finest fitness facility.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <button onClick={() => scrollToSection('memberships')} className="bg-primary-500 text-background rounded-full px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-primary-400 transition-colors flex items-center justify-center gap-2">
                Explore Memberships <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollToSection('contact')} className="border border-surface-highlight hover:border-primary-500 rounded-full text-text-primary px-8 py-4 font-medium uppercase tracking-widest text-sm transition-colors flex items-center justify-center">
                Visit Froaster
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Section */}
      <section id="about" className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="reveal opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="font-display text-5xl md:text-6xl uppercase font-bold mb-8 text-text-primary leading-[0.9]">
              Built for <br/> <span className="text-primary-500">Results.</span>
            </h2>
            <div className="space-y-6 text-text-muted font-light leading-relaxed text-lg">
              <p>
                I opened Froaster Gym because Dahod needed a space for people who actually wanted to train. Not a social club, not a place flooded with neon lights and gimmicks, but a proper athletic environment.
              </p>
              <p>
                We made a choice: invest in the best equipment, hire trainers who actually correct form, and build a culture of accountability. If you're serious about your progress, this is your gym.
              </p>
            </div>
          </div>
          
                    <div className="relative reveal opacity-0 translate-y-8 transition-all duration-1000 delay-[200ms] group/img">
              <img src="/FrosterGym/gallery1.jpg" alt="Gym Equipment" className="w-full h-auto transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 md:-bottom-8 md:-left-8 bg-black/70 backdrop-blur-xl p-5 sm:p-6 md:p-10 border border-white/10 max-w-[200px] sm:max-w-[240px] md:max-w-[280px] shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#d9a952] to-transparent opacity-80"></div>
                <div className="flex items-baseline gap-1 mb-2 md:mb-4">
                  <span className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#f2d088] via-[#d9a952] to-[#a37c35]">100</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[#d9a952]">%</span>
                </div>
                <div className="text-[0.55rem] sm:text-[0.65rem] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed text-white/80 font-medium">
                  Dedicated to your<br />transformation
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* 4. Memberships */}
      <section id="memberships" className="py-32 bg-background border-t border-surface-highlight overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary mb-6">Membership Plans</h2>
          </div>
          
          <div className="w-full max-w-5xl mx-auto relative reveal opacity-0 translate-y-8 transition-all duration-1000 h-[400px] sm:h-[600px] flex items-center justify-center">
            {PRICING_PLANS.map((plan, idx) => {
              const isActive = idx === activePlan;
              const isPrev = idx === (activePlan - 1 + PRICING_PLANS.length) % PRICING_PLANS.length;
              const isNext = idx === (activePlan + 1) % PRICING_PLANS.length;
              
              let styles = "opacity-0 scale-75 z-0 pointer-events-none"; 
              let blur = "blur-md";
              let translateX = "translate-x-0";
              
              if (isActive) {
                styles = "opacity-100 scale-100 z-30 shadow-[0_30px_60px_rgba(0,0,0,0.6)]";
                blur = "blur-none";
                translateX = "translate-x-0";
              } else if (isPrev) {
                styles = "opacity-40 scale-[0.85] z-10 cursor-pointer pointer-events-auto shadow-2xl";
                blur = "blur-[4px]";
                translateX = "-translate-x-[60%] sm:-translate-x-[75%]";
              } else if (isNext) {
                styles = "opacity-40 scale-[0.85] z-10 cursor-pointer pointer-events-auto shadow-2xl";
                blur = "blur-[4px]";
                translateX = "translate-x-[60%] sm:translate-x-[75%]";
              }

              return (
                <div 
                  key={idx} 
                  className={`absolute top-1/2 -translate-y-1/2 w-[260px] sm:w-[400px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${styles} ${blur} ${translateX}`}
                  onClick={() => !isActive && setActivePlan(idx)}
                >
                  <img src={plan.img} alt={plan.name} className="w-full h-auto object-contain rounded-xl" />
                  {!isActive && <div className="absolute inset-0 bg-black/20 rounded-xl"></div>}
                </div>
              );
            })}
            
            <button 
              onClick={() => setActivePlan(p => (p - 1 + PRICING_PLANS.length) % PRICING_PLANS.length)}
              className="absolute top-1/2 left-2 sm:left-12 -translate-y-1/2 p-3 sm:p-4 bg-black/50 backdrop-blur-md border border-white/10 text-primary-500 rounded-full hover:bg-black/80 hover:scale-110 transition-all z-40"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button 
              onClick={() => setActivePlan(p => (p + 1) % PRICING_PLANS.length)}
              className="absolute top-1/2 right-2 sm:right-12 -translate-y-1/2 p-3 sm:p-4 bg-black/50 backdrop-blur-md border border-white/10 text-primary-500 rounded-full hover:bg-black/80 hover:scale-110 transition-all z-40"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          <div className="flex justify-center gap-2 mt-4 sm:mt-8">
            {PRICING_PLANS.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActivePlan(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === activePlan ? 'bg-primary-500 w-8' : 'bg-surface-highlight hover:bg-surface-highlight/80'}`}
              />
            ))}
          </div>
        </div>
      </section>



      <Gallery3D />

      {/* 8. Cinematic Premium Footer */}
      <footer id="contact" className="relative bg-[#050505] pt-32 pb-8 overflow-hidden border-t border-white/5">
        
        {/* Subtle Background Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          
          {/* SECTION 1 & 2 — Massive Statement & Brand Element */}
          <div className="mb-24 md:mb-32">
            <h2 className="text-[3.5rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[8rem] font-display font-black uppercase leading-[0.9] tracking-tight text-white/90">
              Show Up.<br/>
              <span className="text-[#d9a952]">Put in the Work.</span>
            </h2>
          </div>

          {/* SECTION 3 — Horizontal Editorial Navigation */}
          <div className="border-y border-white/10 py-8 mb-20 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-12 md:gap-24 min-w-max pr-6">
              {[
                { id: '01', name: 'About' },
                { id: '02', name: 'Memberships' },
                { id: '03', name: 'Gallery' },
                { id: '04', name: 'Contact' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => scrollToSection(item.name.toLowerCase())} 
                  className="group flex flex-col items-start text-left"
                >
                  <span className="text-[#d9a952] text-xs font-bold tracking-[0.2em] mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{item.id}</span>
                  <span className="relative text-xl md:text-2xl font-display uppercase tracking-[0.15em] text-[#9c9c9a] group-hover:text-white transition-colors duration-300">
                    {item.name}
                    <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#d9a952] group-hover:w-full transition-all duration-500 ease-out"></span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 4 & 5 — Brand / Social & Location */}
          <div className="grid md:grid-cols-2 gap-16 mb-24 md:mb-32">
            <div className="max-w-sm">
              <p className="text-lg md:text-xl font-light text-[#9c9c9a] leading-relaxed mb-8">
                More than a gym.<br/>A place built around discipline, strength and progress.
              </p>
              <a href="https://www.instagram.com/froaster_fitness/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/10 text-white/50 hover:text-[#d9a952] hover:border-[#d9a952] transition-all duration-300 group">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform duration-300"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            </div>
            
            <div className="md:text-right">
              <h4 className="text-[#d9a952] text-xs font-bold uppercase tracking-[0.2em] mb-4">Location</h4>
              <p className="text-[#9c9c9a] text-lg font-light leading-relaxed mb-6">
                Dudhimati River Bridge<br/>Desaiwad, Dahod, Gujarat
              </p>
              <a href="https://maps.google.com/?q=Froaster+Fitness,+Govindnagar,+Dahod,+Gujarat" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-bold text-white hover:text-[#d9a952] transition-colors duration-300 group">
                View on Map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>

        </div>

        {/* SECTION 6 — Giant Brand Wordmark */}
        <div className="w-full overflow-hidden flex justify-center mt-auto select-none pointer-events-none group">
          <h1 className="text-[20vw] md:text-[16vw] lg:text-[15vw] font-display font-black uppercase text-[#111111] leading-[0.75] tracking-tight group-hover:tracking-normal transition-all duration-[2000ms] ease-out whitespace-nowrap px-4">
            FROASTER
          </h1>
        </div>

        {/* BOTTOM BAR */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 relative z-10">
          <p className="text-[#555555] text-xs font-medium tracking-[0.2em] uppercase">&copy; {new Date().getFullYear()} Froaster Gym</p>
          <p className="text-[#555555] text-xs font-medium tracking-[0.2em] uppercase">Built For Discipline.</p>
        </div>

      </footer>
    </div>
  );
}
