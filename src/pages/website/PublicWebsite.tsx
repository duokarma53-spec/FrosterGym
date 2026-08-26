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
  { id: '01', title: 'THE SPACE.', desc: 'FROASTER GYM\nDAHOD, GUJARAT', img: 'new_gallery_1.png' },
  { id: '02', title: 'THE WORK.', desc: 'NO EXCUSES\nJUST PROGRESS', img: 'new_gallery_2.jpg' },
  { id: '03', title: 'THE PEOPLE.', desc: 'BUILT ON\nDISCIPLINE', img: 'new_gallery_3.png' },
  { id: '04', title: 'THE RESULT.', desc: 'ENGINEERED FOR\nPERFORMANCE', img: 'new_gallery_4.png' }
];

export function PublicWebsite() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePlan, setActivePlan] = useState(0);
  const [activeGallery, setActiveGallery] = useState(0);

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



      {/* 6. Cinematic Editorial Gallery */}
      <section id="gallery" className="relative py-24 md:py-40 bg-background border-t border-surface-highlight overflow-hidden min-h-[850px] lg:min-h-[1000px] flex items-center">
        
        {/* Giant Background Number */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-center pointer-events-none select-none z-0">
          <span className="text-[40vw] md:text-[30vw] font-display font-black leading-none text-white/[0.03] tracking-tighter transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
            {GALLERY_ITEMS[activeGallery].id}
          </span>
        </div>

        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center h-full">
            
            {/* Left: Navigation & Typography */}
            <div className="order-2 lg:order-1 lg:col-span-4 flex flex-col justify-between h-full min-h-[300px]">
              
              <div className="mb-12 md:mb-24">
                <p className="text-[#d9a952] text-xs font-bold tracking-[0.3em] uppercase mb-4 md:mb-8">The Froaster Experience</p>
                <div className="relative h-[120px] sm:h-[140px] md:h-[180px]">
                  {GALLERY_ITEMS.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`absolute top-0 left-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full ${idx === activeGallery ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                    >
                      <h2 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-display font-black uppercase text-white leading-[0.9] tracking-tight mb-4 md:mb-6">
                        {item.title}
                      </h2>
                      <p className="text-[#9c9c9a] text-[0.65rem] md:text-xs font-medium tracking-[0.2em] uppercase leading-relaxed whitespace-pre-line">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 md:gap-6 mt-auto">
                {GALLERY_ITEMS.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveGallery(idx)}
                    className="group flex items-center gap-6 text-left"
                  >
                    <span className={`text-xs font-bold tracking-[0.2em] transition-colors duration-500 ${idx === activeGallery ? 'text-[#d9a952]' : 'text-white/30 group-hover:text-white/60'}`}>
                      {item.id}
                    </span>
                    <span className={`text-sm md:text-base font-display uppercase tracking-widest transition-all duration-500 relative ${idx === activeGallery ? 'text-white translate-x-3' : 'text-white/40 group-hover:text-white/70'}`}>
                      {item.title.replace('.', '')}
                      {idx === activeGallery && (
                        <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-[1px] bg-[#d9a952]"></span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Immersive Feature Image */}
            <div className="order-1 lg:order-2 lg:col-span-8 relative aspect-[4/5] sm:aspect-[4/5] lg:aspect-[4/3] lg:h-[750px] w-full bg-[#0a0a0b] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
              {GALLERY_ITEMS.map((item, idx) => (
                <div 
                  key={idx}
                  className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] origin-bottom ${idx === activeGallery ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03] pointer-events-none'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
                  <img 
                    src={`/FrosterGym/${item.img}`} 
                    alt={item.title} 
                    className="w-full h-full object-cover object-center"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
              
              {/* Subtle metadata overlay on image */}
              <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-20 text-right text-white/90">
                <p className="text-[0.55rem] md:text-[0.65rem] font-bold uppercase tracking-[0.3em]">Visual Campaign 26'</p>
                <p className="text-[0.5rem] md:text-[0.55rem] font-medium uppercase tracking-[0.2em] mt-1 text-[#d9a952]">Froaster Archival</p>
              </div>
            </div>

          </div>
        </div>
      </section>

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
