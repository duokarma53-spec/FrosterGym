import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';
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
  {
    title: 'THE SPACE.',
    id: '01',
    img: 'new_gallery_1.png',
    label: 'THE ENVIRONMENT',
    desc: 'Uncompromising architecture built for serious training.'
  },
  {
    title: 'THE WORK.',
    id: '02',
    img: 'new_gallery_3.png',
    label: 'THE DISCIPLINE',
    desc: 'Every repetition demands absolute precision.'
  },
  {
    title: 'THE RESULT.',
    id: '03',
    img: 'new_gallery_4.png',
    label: 'THE TRANSFORMATION',
    desc: 'Forged through consistency and relentless effort.'
  },
  {
    title: 'THE FOCUS.',
    id: '04',
    img: 'new_gallery_5.png',
    label: 'THE INTENSITY',
    desc: 'Zero distractions. Complete commitment.'
  }
];

export function PublicWebsite() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePlan, setActivePlan] = useState(1);

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
      <nav className={`fixed w-full z-50 transition-all duration-500 ease-out ${scrolled ? 'py-4 bg-[#0a0a0b]/85 backdrop-blur-md border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'py-8 bg-transparent'}`}>
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
            {['About', 'Memberships', 'Gallery', 'Contact'].map((item) => (
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
          <button className="md:hidden text-text-primary z-50 p-2 -mr-2 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-7 h-7 font-light" strokeWidth={1.5} /> : <Menu className="w-7 h-7 font-light" strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#0a0a0b]/98 backdrop-blur-xl z-40 transition-all duration-500 flex flex-col justify-center px-12 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
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
            src="/FrosterGym/hero-section.mp4" 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-[0.7]" 
          />
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
              <button onClick={() => scrollToSection('memberships')} className="bg-primary-500 text-background px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-primary-400 transition-colors flex items-center justify-center gap-2">
                Explore Memberships <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollToSection('contact')} className="border border-surface-highlight hover:border-text-muted text-text-primary px-8 py-4 rounded-full font-medium uppercase tracking-widest text-sm transition-colors flex items-center justify-center">
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
          
          <div className="relative reveal opacity-0 translate-y-8 transition-all duration-1000 delay-[200ms]">
            <img src="/FrosterGym/gallery1.jpg" alt="Gym Equipment" className="w-full h-auto transition-all duration-700 border border-surface-highlight shadow-2xl rounded-2xl" />
            <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-background/80 backdrop-blur-xl p-4 md:p-6 border border-primary-500/20 max-w-[160px] md:max-w-[200px] shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl">
              <div className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300 mb-1 drop-shadow-sm">100%</div>
              <div className="text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] text-text-primary font-medium leading-tight">Dedicated to your transformation</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Memberships */}
      <section id="memberships" className="py-32 bg-background border-t border-surface-highlight overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-20 reveal opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary mb-6">Membership Plans</h2>
          </div>
          
          <div className="relative h-[250px] sm:h-[350px] md:h-[450px] flex items-center justify-center max-w-[1200px] mx-auto w-full perspective-[2000px] overflow-visible reveal opacity-0 translate-y-8 transition-all duration-1000">
            {PRICING_PLANS.map((plan, idx) => {
              const isActive = activePlan === idx;
              const isLeft = (activePlan - 1 + PRICING_PLANS.length) % PRICING_PLANS.length === idx;
              const isRight = (activePlan + 1) % PRICING_PLANS.length === idx;

              let positionClass = '';
              let zIndex = 0;

              if (isActive) {
                positionClass = 'translate-x-0 translate-z-0 scale-100 opacity-100 brightness-100 shadow-[0_30px_60px_rgba(0,0,0,0.6)] shadow-primary-500/10 ring-1 ring-primary-500/30';
                zIndex = 30;
              } else if (isLeft) {
                positionClass = '-translate-x-[20%] md:-translate-x-[30%] -translate-z-[200px] scale-[0.85] opacity-40 brightness-[0.3] hover:opacity-60 hover:brightness-50 cursor-pointer shadow-2xl ring-1 ring-white/5';
                zIndex = 20;
              } else if (isRight) {
                positionClass = 'translate-x-[20%] md:translate-x-[30%] -translate-z-[200px] scale-[0.85] opacity-40 brightness-[0.3] hover:opacity-60 hover:brightness-50 cursor-pointer shadow-2xl ring-1 ring-white/5';
                zIndex = 20;
              } else {
                positionClass = 'opacity-0 scale-50 -z-10 pointer-events-none';
              }

              return (
                <div 
                  key={idx}
                  onClick={() => setActivePlan(idx)}
                  className={`absolute w-[80%] sm:w-[60%] md:w-[45%] max-w-[400px] transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] rounded-2xl md:rounded-[2rem] overflow-hidden bg-background ${positionClass}`}
                  style={{ zIndex, transformStyle: 'preserve-3d' }}
                >
                  <img src={plan.img} alt={plan.name} className="w-full h-auto object-cover" />
                  
                  {isActive && (
                    <div className="absolute inset-0 flex items-end justify-center pb-6 md:pb-10 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500">
                       <a href={`https://wa.me/919409478823?text=Hi, I'm interested in the ${plan.name} plan.`} target="_blank" rel="noreferrer" className="bg-primary-500 text-background px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-primary-400 hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(201,151,62,0.3)]">
                        Join Now
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Gallery */}
      <section id="gallery" className="relative py-24 md:py-40 bg-surface border-t border-surface-highlight overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center">
          <div className="text-center mb-16 md:mb-24 reveal opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary mb-6">The Gallery</h2>
            <p className="text-text-muted max-w-2xl mx-auto font-light">Uncompromising architecture built for serious training.</p>
          </div>

          <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center reveal opacity-0 translate-y-12 transition-all duration-1000 perspective-[1200px]">
            {[GALLERY_ITEMS[0], GALLERY_ITEMS[1], GALLERY_ITEMS[2]].map((item, idx) => {
              let rotation = 0;
              let translationY = 0;
              let translationX = 0;
              let zIndex = 20;

              if (idx === 0) {
                rotation = -12;
                translationY = 60;
                translationX = -105;
                zIndex = 10;
              } else if (idx === 1) {
                rotation = 0;
                translationY = -20;
                translationX = 0;
                zIndex = 30;
              } else if (idx === 2) {
                rotation = 12;
                translationY = 60;
                translationX = 105;
                zIndex = 10;
              }

              return (
                <div 
                  key={idx}
                  className="absolute w-[75%] sm:w-[350px] md:w-[320px] lg:w-[400px] aspect-[3/4] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-all duration-700 hover:-translate-y-6 hover:shadow-[0_40px_80px_rgba(0,0,0,0.9)] hover:z-40 overflow-hidden ring-1 ring-white/10"
                  style={{
                    transform: `translateX(${translationX}%) translateY(${translationY}px) rotate(${rotation}deg)`,
                    zIndex: zIndex
                  }}
                >
                  <img src={`/FrosterGym/${item.img}`} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" />
                  
                  {/* Subtle gradient overlay to make it look premium */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60"></div>
                  
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{item.label}</p>
                    <h3 className="text-3xl font-display font-black uppercase text-text-primary tracking-tight leading-none">{item.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* 8. Premium Footer */}
      <footer id="contact" className="relative bg-[#050505] pt-24 pb-8 overflow-hidden border-t border-surface-highlight flex flex-col">
        {/* Subtle Radial Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary-500/[0.02] rounded-[100%] blur-[120px] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-24 reveal opacity-0 translate-y-8 transition-all duration-1000">
            
            {/* Col 1: Come by (Location) */}
            <div className="flex flex-col items-start">
              <h3 className="text-2xl font-display font-bold text-text-primary mb-6">Come by</h3>
              <p className="text-sm text-text-muted font-light leading-relaxed mb-4">
                Froaster Fitness<br/>
                Dudhimati River Bridge, Near<br/>
                Desaiwad, Dahod,<br/>
                Gujarat 389151
              </p>
              <a 
                href="https://maps.google.com/maps?q=Froaster%20Fitness,%20Govindnagar,%20Dahod,%20Gujarat" 
                target="_blank" 
                rel="noreferrer" 
                className="group flex items-center gap-2 text-xs font-bold text-text-primary hover:text-primary-500 uppercase tracking-widest transition-colors"
              >
                View on Map <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Col 2: Say hello (Contact) */}
            <div className="flex flex-col items-start">
              <h3 className="text-2xl font-display font-bold text-text-primary mb-6">Say hello</h3>
              <a href="tel:+919409478823" className="text-sm text-text-muted hover:text-primary-500 transition-colors mb-4 block">+91 94094 78823</a>
              <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/froaster_fitness/" target="_blank" rel="noreferrer" className="text-text-muted hover:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="https://wa.me/919409478823" target="_blank" rel="noreferrer" className="text-text-muted hover:text-primary-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Col 3: Explore (Nav) */}
            <div className="flex flex-col items-start">
              <h3 className="text-2xl font-display font-bold text-text-primary mb-6">Explore</h3>
              <div className="flex flex-col gap-3">
                {['About', 'Memberships', 'Gallery', 'Contact'].map((item) => (
                  <button 
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())} 
                    className="text-sm text-text-muted hover:text-primary-500 transition-colors text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Col 4: Tagline & CTA */}
            <div className="flex flex-col items-start md:items-end md:text-right">
              <h3 className="text-xl md:text-2xl font-display font-medium text-text-primary italic mb-2">More than a gym.</h3>
              <h3 className="text-xl md:text-2xl font-display font-medium text-text-primary italic mb-6">Built for discipline.</h3>
              <a href="https://wa.me/919409478823" target="_blank" rel="noreferrer" className="bg-primary-500 text-background px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-primary-400 transition-colors mb-6 shadow-xl">
                Join Now
              </a>
              <img src="/FrosterGym/logo.png" alt="Froaster" className="w-12 h-12 opacity-80" />
            </div>
            
          </div>
        </div>

        {/* Giant Brand Wordmark */}
        <div className="w-full overflow-hidden flex justify-center mb-8 px-4 select-none pointer-events-none reveal opacity-0 translate-y-12 transition-all duration-[1500ms]">
          <h1 className="text-[18vw] md:text-[16vw] font-display font-black uppercase text-[#111111] leading-[0.75] tracking-tighter hover:tracking-tight transition-all duration-1000 ease-out whitespace-nowrap">
            FROASTER
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="w-full border-t border-surface-highlight bg-background relative z-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-[10px] sm:text-xs text-text-muted">
              &copy; {new Date().getFullYear()} Froaster Gym. All rights reserved.
            </span>
            <div className="flex items-center gap-6 text-[10px] sm:text-xs font-medium text-text-muted">
              <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
