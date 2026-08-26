import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight, MapPin, Phone, ArrowUpRight, MessageCircle } from 'lucide-react';
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
  const [withPT, setWithPT] = useState(false);
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
          <button className="md:hidden text-text-primary z-50 p-2 -mr-2 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-7 h-7 font-light" strokeWidth={1.5} /> : <Menu className="w-7 h-7 font-light" strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#0a0a0b]/98 backdrop-blur-xl z-40 transition-all duration-500 flex flex-col justify-center px-12 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
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
            src="/FrosterGym/hero-section.mp4" 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-[0.35] grayscale" 
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
              <button onClick={() => scrollToSection('memberships')} className="bg-primary-500 text-background px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-primary-400 transition-colors flex items-center justify-center gap-2">
                Explore Memberships <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollToSection('contact')} className="border border-surface-highlight hover:border-text-muted text-text-primary px-8 py-4 font-medium uppercase tracking-widest text-sm transition-colors flex items-center justify-center">
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
            <img src="/FrosterGym/gallery1.jpg" alt="Gym Equipment" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700 border border-surface-highlight shadow-2xl" />
            <div className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 bg-background p-6 md:p-8 border border-surface-highlight max-w-xs shadow-xl">
              <div className="text-3xl md:text-4xl font-display font-bold text-primary-500 mb-2">100%</div>
              <div className="text-xs md:text-sm uppercase tracking-widest text-text-muted">Dedicated to your transformation</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Memberships */}
      <section id="memberships" className="py-32 bg-background border-t border-surface-highlight overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary mb-6">Membership Plans</h2>
            
            <div className="inline-flex bg-surface p-1 border border-surface-highlight shadow-lg">
              <button onClick={() => setWithPT(false)} className={`px-6 md:px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors ${!withPT ? 'bg-primary-500 text-background' : 'text-text-muted hover:text-text-primary'}`}>Standard Access</button>
              <button onClick={() => setWithPT(true)} className={`px-6 md:px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors ${withPT ? 'bg-primary-500 text-background' : 'text-text-muted hover:text-text-primary'}`}>With Training</button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PRICING_PLANS.map((plan, idx) => (
              <div key={idx} className={`relative bg-surface border flex flex-col ${plan.name === 'Premium' ? 'border-primary-500/40 md:scale-105 z-10 shadow-[0_0_30px_rgba(201,151,62,0.05)]' : 'border-surface-highlight'} p-8 reveal opacity-0 translate-y-8 transition-all duration-1000`} style={{ transitionDelay: `${idx * 150}ms` }}>
                {plan.name === 'Premium' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-background text-xs font-bold uppercase tracking-widest px-4 py-1">Recommended</div>
                )}
                
                <div className="h-48 -mx-8 -mt-8 mb-8 overflow-hidden bg-black border-b border-surface-highlight">
                  <img src={plan.img} alt={plan.name} className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-700" />
                </div>
                
                <h3 className="font-display text-3xl font-bold uppercase text-text-primary mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-bold text-primary-500">{withPT ? plan.pricePT : plan.price}</span>
                  <span className="text-text-muted text-sm uppercase tracking-widest">/mo</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-text-muted">
                      <ArrowRight className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>
                
                <a href={`https://wa.me/919409478823?text=Hi, I'm interested in the ${plan.name} plan (${withPT ? 'With Training' : 'Standard Access'}).`} target="_blank" rel="noreferrer" className={`block text-center py-4 text-sm font-bold uppercase tracking-widest transition-colors ${plan.name === 'Premium' ? 'bg-primary-500 text-background hover:bg-primary-400' : 'bg-surface-highlight text-text-primary hover:bg-white hover:text-black'}`}>
                  Join Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trainers */}
      <section id="trainers" className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 reveal opacity-0 translate-y-8 transition-all duration-1000">
            <div>
              <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary">Expert Guidance</h2>
            </div>
            <p className="max-w-md text-text-muted mt-6 md:mt-0 leading-relaxed font-light">
              Our trainers are certified professionals dedicated to fixing your mechanics and ensuring you hit your targets safely.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative overflow-hidden border border-surface-highlight reveal opacity-0 translate-y-8 transition-all duration-1000">
              <img src="/FrosterGym/gallery2.jpg" alt="Alex Sharma" className="w-full aspect-[3/4] object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <p className="text-primary-500 text-xs font-bold uppercase tracking-widest mb-2">Head Coach • ACE Certified</p>
                <h3 className="text-3xl font-display font-bold uppercase text-text-primary">Alex Sharma</h3>
              </div>
            </div>
            
            <div className="group relative overflow-hidden border border-surface-highlight reveal opacity-0 translate-y-8 transition-all duration-1000 delay-[150ms]">
              <img src="/FrosterGym/gallery3.png" alt="Rahul Patel" className="w-full aspect-[3/4] object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <p className="text-primary-500 text-xs font-bold uppercase tracking-widest mb-2">Strength Specialist • ISSA Certified</p>
                <h3 className="text-3xl font-display font-bold uppercase text-text-primary">Rahul Patel</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Premium Editorial Gallery */}
      <section id="gallery" className="relative py-24 md:py-40 bg-background border-t border-surface-highlight overflow-hidden">
        {/* Giant Background Number */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-[5%] md:-right-[10%] text-[50vw] md:text-[40vw] font-display font-black text-surface-highlight opacity-30 select-none pointer-events-none transition-all duration-700 leading-none">
          {GALLERY_ITEMS[activeGallery].id}
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 flex flex-col md:flex-row gap-12 lg:gap-24 items-center md:items-stretch">
          
          {/* Main Visual Stage (approx 65%) */}
          <div className="w-full md:w-[60%] lg:w-[65%] relative flex justify-center md:justify-end items-center">
            <div className="relative w-full aspect-[4/5] max-w-2xl overflow-hidden border border-surface-highlight bg-surface">
              {GALLERY_ITEMS.map((item, idx) => (
                <div 
                  key={item.id}
                  className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${idx === activeGallery ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'}`}
                >
                  <img 
                    src={`/FrosterGym/${item.img}`} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent md:hidden"></div>
                  
                  {/* Compact Mobile Metadata (Hidden on Desktop) */}
                  <div className="md:hidden absolute bottom-8 left-8 right-8">
                    <p className="text-primary-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{item.label}</p>
                    <h3 className="text-4xl font-display font-black uppercase text-text-primary tracking-tight mb-3 leading-none">{item.title}</h3>
                    <p className="text-text-muted text-xs font-light max-w-[250px] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography & Navigation (approx 35%) */}
          <div className="w-full md:w-[40%] lg:w-[35%] flex flex-col justify-center">
            
            {/* Desktop Typography */}
            <div className="hidden md:block relative min-h-[180px] lg:min-h-[220px] mb-8 lg:mb-12">
              {GALLERY_ITEMS.map((item, idx) => (
                <div 
                  key={item.id}
                  className={`absolute top-0 left-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${idx === activeGallery ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
                >
                  <p className="text-primary-500 text-xs font-bold uppercase tracking-[0.25em] mb-4">{item.label}</p>
                  <h3 className="text-5xl lg:text-7xl font-display font-black uppercase text-text-primary leading-[0.9] tracking-tighter mb-6">{item.title}</h3>
                  <p className="text-text-muted text-sm font-light leading-relaxed max-w-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Vertical Navigation */}
            <div className="flex flex-col gap-2 mt-4 md:mt-0 w-full relative z-20">
              {GALLERY_ITEMS.map((item, idx) => {
                const isActive = idx === activeGallery;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveGallery(idx)}
                    className="group flex items-center gap-6 py-4 w-full text-left"
                  >
                    <span className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-primary-500' : 'text-text-muted/50 group-hover:text-primary-500/80'}`}>
                      {item.id}
                    </span>
                    <span className={`text-sm lg:text-base font-bold uppercase tracking-widest relative transition-all duration-500 ${isActive ? 'text-text-primary translate-x-2' : 'text-text-muted group-hover:text-text-primary'}`}>
                      {item.label}
                      {/* Active indicator line */}
                      <span className={`absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-primary-500 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}></span>
                    </span>
                  </button>
                );
              })}
            </div>
            
          </div>
        </div>
      </section>

      {/* 7. Contact / Location */}
      <section id="contact" className="py-32 bg-surface border-t border-surface-highlight">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-5xl md:text-7xl font-display font-bold uppercase text-text-primary mb-8">Ready to Start?</h2>
            <p className="text-lg text-text-muted font-light mb-12">
              Your transformation starts with the first step. Visit us or reach out today.
            </p>
            
            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-text-primary font-bold uppercase tracking-widest mb-1">Location</h4>
                  <p className="text-text-muted leading-relaxed">Dudhimati River Bridge, Desaiwad<br/>Dahod, Gujarat 389151</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-text-primary font-bold uppercase tracking-widest mb-1">Contact</h4>
                  <a href="tel:9409478823" className="text-text-muted hover:text-primary-500 transition-colors">+91 94094 78823</a>
                </div>
              </div>
            </div>
            
            <a href="https://wa.me/919409478823" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-primary-500 text-background px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-primary-400 transition-colors">
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>
          
          <div className="h-[400px] md:h-[500px] border border-surface-highlight grayscale hover:grayscale-0 transition-all duration-1000 reveal opacity-0 translate-y-8 delay-[200ms] shadow-2xl">
            <iframe 
              src="https://maps.google.com/maps?q=Froaster%20Fitness,%20Govindnagar,%20Dahod,%20Gujarat&t=&z=16&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy"
              title="Location Map"
            />
          </div>
        </div>
      </section>

      {/* 8. Premium Footer */}
      <footer className="relative bg-[#050505] pt-32 overflow-hidden border-t border-surface-highlight flex flex-col">
        {/* Subtle Radial Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary-500/[0.02] rounded-[100%] blur-[120px] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full z-10">
          
          {/* Top Section: Statement & Brand Element */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-16 mb-20 md:mb-24 reveal opacity-0 translate-y-8 transition-all duration-1000">
            {/* Massive Statement */}
            <h2 className="text-[12vw] md:text-[7vw] lg:text-[6.5vw] font-display font-black leading-[0.9] uppercase text-text-primary tracking-tight">
              YOUR NEXT<br />
              LEVEL STARTS<br />
              <span className="text-primary-500">HERE.</span>
            </h2>

            {/* Visual Brand Element - Large Vertical Typography */}
            <div 
              className="hidden md:flex flex-col items-center gap-2 opacity-[0.15] hover:opacity-[0.35] transition-opacity duration-700 select-none cursor-default"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              <span className="text-5xl lg:text-6xl font-display font-black uppercase tracking-tight">Froaster</span>
              <span className="text-lg lg:text-xl font-display font-bold uppercase text-primary-500 tracking-[0.4em]">Gym</span>
            </div>
          </div>

          {/* Middle Section: Navigation, Brand, Location */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-24 reveal opacity-0 translate-y-8 transition-all duration-1000 delay-[100ms]">
            
            {/* Editorial Navigation */}
            <div className="md:col-span-5 flex flex-wrap gap-x-8 gap-y-6 md:gap-y-4 items-start">
              {[
                { num: '01', name: 'About' },
                { num: '02', name: 'Memberships' },
                { num: '03', name: 'Trainers' },
                { num: '04', name: 'Gallery' },
                { num: '05', name: 'Contact' }
              ].map((item) => (
                <button 
                  key={item.name}
                  onClick={() => scrollToSection(item.name.toLowerCase())} 
                  className="group flex items-center gap-3 hover:text-text-primary text-text-muted transition-colors duration-300"
                >
                  <span className="text-[10px] font-bold text-primary-500/50 group-hover:text-primary-500 transition-colors">{item.num}</span>
                  <span className="text-sm font-bold uppercase tracking-widest relative">
                    {item.name}
                    <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-primary-500 group-hover:w-full transition-all duration-300 ease-out" />
                  </span>
                </button>
              ))}
            </div>

            {/* Brand / Social */}
            <div className="md:col-span-4 flex flex-col items-start">
              <p className="text-sm text-text-muted font-light leading-relaxed max-w-[280px] mb-6">
                More than a gym. A place built around discipline, strength and progress.
              </p>
              <a href="https://www.instagram.com/froaster_fitness/" target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-text-muted hover:text-primary-500 transition-colors">
                <div className="w-10 h-10 rounded-full border border-surface-highlight group-hover:border-primary-500/50 flex items-center justify-center transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Instagram</span>
              </a>
            </div>

            {/* Location */}
            <div className="md:col-span-3 flex flex-col items-start md:items-end md:text-right">
              <h4 className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em] mb-4">Location</h4>
              <p className="text-sm text-text-muted font-light leading-relaxed mb-5">
                Dudhimati River Bridge<br/>
                Desaiwad, Dahod, Gujarat
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

          </div>
        </div>

        {/* Giant Brand Wordmark */}
        <div className="w-full overflow-hidden flex justify-center mb-8 px-4 select-none pointer-events-none reveal opacity-0 translate-y-12 transition-all duration-[1500ms]">
          <h1 className="text-[20vw] md:text-[18vw] font-display font-black uppercase text-[#111111] leading-[0.75] tracking-tighter hover:tracking-tight transition-all duration-1000 ease-out whitespace-nowrap">
            FROASTER
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="w-full border-t border-surface-highlight bg-background relative z-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 text-[10px] sm:text-xs font-medium text-text-muted tracking-wider">
              <img src="/FrosterGym/logo.png" alt="Froaster" className="w-4 h-4 opacity-40 grayscale group-hover:scale-110 transition-transform duration-500" />
              <span>&copy; {new Date().getFullYear()} FROASTER GYM</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-primary-500/80">
              Built for Discipline.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
