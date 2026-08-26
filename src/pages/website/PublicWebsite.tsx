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
      className="relative w-full min-h-[100svh] bg-background border-t border-surface-highlight flex flex-col items-center justify-center overflow-hidden py-24"
    >
      {/* Subtle Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[600px] bg-primary-500/[0.03] rounded-full blur-[150px] pointer-events-none"></div>

      <div className="text-center z-20 mb-12 md:mb-20">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-primary-500 font-display font-bold">02</span>
          <span className="text-text-muted text-xs uppercase tracking-[0.2em]">/ The Space</span>
        </div>
        <h2 className="text-[3.5rem] md:text-[5rem] font-display font-black uppercase leading-[0.9] text-white">
          THE <span className="text-primary-500">FLOOR</span>
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
              <div className="w-full h-full bg-surface rounded-3xl border border-white/10 overflow-hidden relative flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
                {/* Image Section */}
                <div className="h-[65%] w-full relative overflow-hidden">
                   <img 
                     src={`/FrosterGym/${item.img}`} 
                     alt={item.title} 
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
                </div>
                
                {/* Text Section */}
                <div className="h-[35%] w-full px-6 md:px-8 pb-8 flex flex-col justify-end relative z-10">
                   <div className="absolute -top-6 right-6 w-12 h-12 rounded-xl bg-background border border-white/10 flex items-center justify-center shadow-lg">
                     <span className="text-primary-500 font-display font-bold">{item.id}</span>
                   </div>
                   <h3 className="text-xl md:text-2xl text-text-primary font-display font-bold uppercase tracking-wide mb-2">{item.title}</h3>
                   <p className="text-text-muted text-sm md:text-base font-light whitespace-pre-line leading-relaxed">{item.desc}</p>
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
              className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-8 bg-primary-500' : 'w-2 bg-white/20'}`}
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
          <div className="hidden md:flex items-center gap-10 text-[0.8rem] uppercase tracking-[0.15em] font-medium text-text-muted">
            {['About', 'Memberships', 'Trainers', 'Gallery', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())} 
                className="relative group hover:text-primary-500 transition-colors duration-300 py-2"
              >
                {item}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary-500 group-hover:w-full transition-all duration-300 ease-out opacity-0 group-hover:opacity-100"></span>
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
      <div className={`fixed inset-0 bg-background z-40 transition-all duration-500 ease-in-out flex flex-col justify-center px-12 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`flex flex-col gap-8 transition-all duration-700 delay-100 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          {['About', 'Memberships', 'Trainers', 'Gallery', 'Contact'].map((item) => (
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
              BUILT FOR<br/>
              <span className="text-text-muted">THE SERIOUS.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted mb-12 font-light leading-relaxed max-w-lg">
              A serious training environment built around discipline, proper equipment and measurable progress.
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
            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary-500 font-display font-bold">01</span>
              <span className="text-text-muted text-xs uppercase tracking-[0.2em]">/ The Standard</span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl uppercase font-bold mb-8 text-text-primary leading-[0.9]">
              Built for <br/> <span className="text-primary-500">Results.</span>
            </h2>
            <div className="space-y-6 text-text-muted font-light leading-relaxed text-lg">
              <p>
                Not a social club. Not a room full of distractions.
              </p>
              <p>
                Just serious equipment, proper coaching, and an environment built around progress.
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
      <section id="memberships" className="py-32 bg-background border-t border-surface-highlight overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-[500px] bg-primary-500/[0.02] blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20 reveal opacity-0 translate-y-8 transition-all duration-1000">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-primary-500 font-display font-bold">03</span>
              <span className="text-text-muted text-xs uppercase tracking-[0.2em]">/ The Plans</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary mb-6 leading-[0.9]">
              NO EXCUSES.<br/><span className="text-primary-500">JUST COMMITMENT.</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 reveal opacity-0 translate-y-8 transition-all duration-1000 delay-200">
            {PRICING_PLANS.map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative flex flex-col p-8 lg:p-10 bg-surface rounded-2xl border transition-all duration-500 hover:-translate-y-2 ${plan.name === 'Premium' ? 'border-primary-500/50 shadow-[0_20px_40px_rgba(200,154,61,0.1)] scale-100 md:scale-105 z-10' : 'border-surface-highlight hover:border-white/20'}`}
              >
                {plan.name === 'Premium' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-background px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
                    Recommended
                  </div>
                )}
                
                <h3 className="font-display text-2xl uppercase font-bold text-text-primary mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl lg:text-5xl font-display font-bold text-primary-500">{plan.price}</span>
                  <span className="text-text-muted text-sm uppercase tracking-wider">/ mo</span>
                </div>
                
                <div className="w-full h-[1px] bg-surface-highlight mb-8"></div>
                
                <ul className="flex-1 space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-muted font-light text-sm">
                      <svg className={`w-5 h-5 shrink-0 ${plan.name === 'Premium' ? 'text-primary-500' : 'text-white/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-4 rounded-xl uppercase tracking-widest text-xs font-bold transition-all ${plan.name === 'Premium' ? 'bg-primary-500 text-background hover:bg-primary-400' : 'border border-surface-highlight text-text-primary hover:border-primary-500 hover:text-primary-500'}`}>
                  Select {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>



      <CurvedGallery />

      {/* 5. Trainers */}
      <section id="trainers" className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 reveal opacity-0 translate-y-8 transition-all duration-1000">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-primary-500 font-display font-bold">04</span>
              <span className="text-text-muted text-xs uppercase tracking-[0.2em]">/ The Coaches</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary mb-6 leading-[0.9]">
              TRAINERS<br/><span className="text-primary-500">WHO DEMAND MORE.</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 reveal opacity-0 translate-y-8 transition-all duration-1000 delay-200">
            {[
              { name: 'John Doe', spec: 'Strength & Conditioning', img: 'new_gallery_3.png' },
              { name: 'Marcus Chen', spec: 'Olympic Weightlifting', img: 'new_gallery_4.png' },
              { name: 'Sarah Jenkins', spec: 'Functional Fitness', img: 'new_gallery_6.png' }
            ].map((trainer, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="w-full aspect-[3/4] overflow-hidden bg-background mb-6">
                  <img src={`/FrosterGym/${trainer.img}`} alt={trainer.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
                <h3 className="font-display text-2xl uppercase font-bold text-text-primary mb-1">{trainer.name}</h3>
                <p className="text-primary-500 text-sm uppercase tracking-widest">{trainer.spec}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Modern Multi-Column Footer */}
      <footer id="contact" className="relative bg-background pt-24 pb-8 overflow-hidden border-t border-surface-highlight">
        {/* Subtle Background Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-primary-500/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 flex flex-col min-h-[60vh] justify-between">
          
          {/* Top Section - 4 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-24">
            {/* Col 1 */}
            <div>
              <h3 className="text-3xl font-display font-bold text-text-primary mb-6">Come by</h3>
              <p className="text-text-muted font-light leading-relaxed mb-6">
                Froaster Gym<br/>
                Dudhimati River Bridge<br/>
                Desaiwad, Dahod,<br/>
                Gujarat
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h3 className="text-3xl font-display font-bold text-text-primary mb-6">Say hello</h3>
              <a href="mailto:contact@froastergym.com" className="block text-text-muted hover:text-primary-500 transition-colors mb-4">Email us</a>
              <a href="https://www.instagram.com/froaster_fitness/" target="_blank" rel="noreferrer" className="inline-block text-text-muted hover:text-primary-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            </div>

            {/* Col 3 */}
            <div>
              <h3 className="text-3xl font-display font-bold text-text-primary mb-6">Explore</h3>
              <ul className="space-y-3 font-light">
                {['Home', 'About', 'Memberships', 'Trainers', 'Gallery'].map(link => (
                  <li key={link}>
                    <button 
                      onClick={() => link === 'Home' ? window.scrollTo({top: 0, behavior: 'smooth'}) : scrollToSection(link.toLowerCase())} 
                      className="text-text-muted hover:text-primary-500 transition-colors"
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
                <p className="text-xl lg:text-3xl font-display font-bold text-text-primary leading-[1.1] uppercase">
                  READY TO<br/>TRAIN?
                </p>
                <div className="text-primary-500">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
                  </svg>
                </div>
              </div>
              <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-surface border border-surface-highlight text-text-primary rounded-full px-8 py-3.5 font-bold text-sm tracking-widest uppercase hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center gap-2">
                Visit Froaster <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Middle Section (Giant Text) */}
          <div className="w-full overflow-hidden flex justify-center mb-12 select-none pointer-events-none group">
            <h1 className="text-[18vw] md:text-[14vw] lg:text-[13vw] font-display font-black uppercase text-surface-highlight leading-[0.75] tracking-tight group-hover:tracking-normal transition-all duration-[2000ms] ease-out whitespace-nowrap opacity-50">
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
