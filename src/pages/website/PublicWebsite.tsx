import { useEffect, useState } from 'react';
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
  { id: '01', title: 'THE SPACE', desc: 'Training floor.\nBuilt for serious work.', img: 'new_gallery_1.png' },
  { id: '02', title: 'THE EQUIPMENT', desc: 'Strength.\nPrecision.\nProgress.', img: 'new_gallery_2.jpg' },
  { id: '03', title: 'THE PEOPLE', desc: 'A community built\non discipline.', img: 'new_gallery_3.png' },
  { id: '04', title: 'THE IRON', desc: 'Heavy weights only.\nNo distractions.', img: 'gallery2.jpg' },
  { id: '05', title: 'THE WORK', desc: 'Push past limits.\nEvery single day.', img: 'new_gallery_4.png' },
  { id: '06', title: 'THE RESULT', desc: 'Engineered for\nperformance.', img: 'new_gallery_6.png' }
];

const CurvedGallery = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNext = () => setActiveIndex(prev => Math.min(prev + 1, GALLERY_ITEMS.length - 1));
  const handlePrev = () => setActiveIndex(prev => Math.max(prev - 1, 0));

  // Swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    setTouchStart(null);
  };

  return (
    <section 
      id="gallery"
      className="relative w-full min-h-[100svh] bg-[#050505] border-t border-white/5 flex flex-col items-center justify-center overflow-hidden py-24"
    >
      {/* Subtle Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[600px] bg-[#d9a952]/[0.03] rounded-full blur-[150px] pointer-events-none"></div>

      <div className="text-center z-20 mb-12 md:mb-20">
        <h2 className="text-[3.5rem] md:text-[5rem] font-display font-black uppercase leading-[0.9] text-white">
          THE <span className="text-[#d9a952]">GALLERY</span>
        </h2>
      </div>
      
      <div 
        className="relative w-full max-w-7xl h-[450px] md:h-[550px] flex items-center justify-center z-10 perspective-[2000px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {GALLERY_ITEMS.map((item, i) => {
          const offset = i - activeIndex;
          
          const rotationAngle = isMobile ? 15 : 12; 
          const rotate = offset * rotationAngle; 
          const isActive = offset === 0;
          const zIndex = 50 - Math.abs(offset);
          
          // Fade out cards that are too far
          const opacity = Math.abs(offset) > (isMobile ? 1 : 2) ? 0 : 1 - (Math.abs(offset) * 0.15);
          const scale = isActive ? 1 : 0.9 - (Math.abs(offset) * 0.05);
          const translateY = Math.abs(offset) * (isMobile ? 10 : 20);

          return (
            <div
              key={item.id}
              className="absolute w-[280px] md:w-[360px] h-[400px] md:h-[500px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer"
              onClick={() => setActiveIndex(i)}
              style={{
                transformOrigin: '50% 150%',
                transform: `rotate(${rotate}deg) translateY(${translateY}px) scale(${scale})`,
                zIndex,
                opacity,
                pointerEvents: Math.abs(offset) > 2 ? 'none' : 'auto'
              }}
            >
              <div className="w-full h-full bg-[#111111] rounded-3xl border border-white/10 overflow-hidden relative flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
                {/* Image Section */}
                <div className="h-[65%] w-full relative overflow-hidden">
                   <img 
                     src={`/FrosterGym/${item.img}`} 
                     alt={item.title} 
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent"></div>
                </div>
                
                {/* Text Section */}
                <div className="h-[35%] w-full px-6 md:px-8 pb-8 flex flex-col justify-end relative z-10">
                   <div className="absolute -top-6 right-6 w-12 h-12 rounded-xl bg-[#0a0a0b] border border-white/10 flex items-center justify-center shadow-lg">
                     <span className="text-[#d9a952] font-display font-bold">{item.id}</span>
                   </div>
                   <h3 className="text-xl md:text-2xl text-white font-display font-bold uppercase tracking-wide mb-2">{item.title}</h3>
                   <p className="text-[#9c9c9a] text-sm md:text-base font-light whitespace-pre-line leading-relaxed">{item.desc}</p>
                </div>
                
                {/* Inactive Overlay */}
                {!isActive && <div className="absolute inset-0 bg-black/60 transition-opacity duration-700 group-hover:bg-black/40"></div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col items-center gap-6 mt-12 md:mt-20 z-20">
        <div className="flex gap-2 mb-4">
          {GALLERY_ITEMS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-8 bg-[#d9a952]' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrev} 
            disabled={activeIndex === 0}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/20 flex items-center justify-center text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
          </button>
          <button 
            onClick={handleNext} 
            disabled={activeIndex === GALLERY_ITEMS.length - 1}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/20 flex items-center justify-center text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
          >
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
          </button>
        </div>
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
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-[0.35]"
          >
            <source src="/FrosterGym/hero-section.mp4" type="video/mp4" />
          </video>
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



      <CurvedGallery />

      {/* 8. Modern Multi-Column Footer */}
      <footer id="contact" className="relative bg-[#050505] pt-24 pb-8 overflow-hidden border-t border-white/5">
        {/* Subtle Background Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 flex flex-col min-h-[60vh] justify-between">
          
          {/* Top Section - 4 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-24">
            {/* Col 1 */}
            <div>
              <h3 className="text-3xl font-display font-bold text-white mb-6">Come by</h3>
              <p className="text-[#9c9c9a] font-light leading-relaxed mb-6">
                Froaster Gym<br/>
                Dudhimati River Bridge<br/>
                Desaiwad, Dahod,<br/>
                Gujarat
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h3 className="text-3xl font-display font-bold text-white mb-6">Say hello</h3>
              <a href="mailto:contact@froastergym.com" className="block text-[#9c9c9a] hover:text-[#d9a952] transition-colors mb-4">Email us</a>
              <a href="https://www.instagram.com/froaster_fitness/" target="_blank" rel="noreferrer" className="inline-block text-[#9c9c9a] hover:text-[#d9a952] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            </div>

            {/* Col 3 */}
            <div>
              <h3 className="text-3xl font-display font-bold text-white mb-6">Explore</h3>
              <ul className="space-y-3 font-light">
                {['Home', 'About', 'Memberships', 'Gallery'].map(link => (
                  <li key={link}>
                    <button 
                      onClick={() => link === 'Home' ? window.scrollTo({top: 0, behavior: 'smooth'}) : scrollToSection(link.toLowerCase())} 
                      className="text-[#9c9c9a] hover:text-[#d9a952] transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 */}
            <div className="flex flex-col items-start relative">
              <div className="flex justify-between w-full items-start mb-8">
                <p className="text-xl lg:text-2xl italic font-display text-white/90">
                  Premium fitness.<br/>High intensity.
                </p>
                <div className="text-[#d9a952]">
                  {/* Decorative icon (similar placement to the flower in reference) */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
                  </svg>
                </div>
              </div>
              <button onClick={() => scrollToSection('memberships')} className="bg-[#111111] border border-white/20 text-white rounded-full px-8 py-3.5 font-medium hover:border-[#d9a952] hover:text-[#d9a952] transition-colors">
                Explore Memberships
              </button>
            </div>
          </div>

          {/* Middle Section (Giant Text) */}
          <div className="w-full overflow-hidden flex justify-center mb-12 select-none pointer-events-none group">
            <h1 className="text-[18vw] md:text-[14vw] lg:text-[13vw] font-display font-black uppercase text-white leading-[0.75] tracking-tight group-hover:tracking-normal transition-all duration-[2000ms] ease-out whitespace-nowrap">
              FROASTER
            </h1>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-light text-[#777777] border-t border-white/10 pt-8">
            <div className="text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} Froaster Gym Ltd. All rights reserved.</p>
              <p className="mt-1">Site credit</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Cancellation Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
