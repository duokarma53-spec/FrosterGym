import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight, ArrowUpRight, MessageCircle, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import EditorialLoader from '../../components/website/EditorialLoader';


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
  },
  {
    title: 'THE GRIND.',
    id: '05',
    img: 'new_gallery_6.png',
    label: 'THE DEDICATION',
    desc: 'Pushing past limits every single day.'
  },
  {
    title: 'THE STRENGTH.',
    id: '06',
    img: 'new_gallery_8.png',
    label: 'THE POWER',
    desc: 'Building resilience from the ground up.'
  }
];

const GOOGLE_REVIEWS = [
  { name: 'Hatim Jambu', date: 'Local Guide', text: 'The Gym is very well maintained. Gym staff is very supportive. Training session are impressive', rating: 5 },
  { name: 'Azim Knsara', date: '10 months ago', text: 'One of the best gyms around! The vibe here is always positive and full of energy. Trainers actually care and guide you properly.', rating: 5 },
  { name: 'Sabir Bandibar', date: '3 months ago', text: 'Very Supportive staff and excellent workout environment.❤️🔥', rating: 5 },
  { name: 'Faraz khan Pathan', date: 'a year ago', text: 'Nice work and peace place enjoy the workout and the gym area was also bright all things sounds good amazing gym , nice view', rating: 5 },
  { name: 'Arbaz Khatri', date: '3 months ago', text: 'Fantastic gym and best workout experience.', rating: 5 },
  { name: 'Yushra Shaikh', date: 'a year ago', text: 'What a great experience there I genuinely enjoyed the view while doing my workout... one of the best and safest gym for ladies💯❤️', rating: 5 },
  { name: 'Azhar Luhar', date: '11 months ago', text: 'Best Gym in town perfect atmosphere Great trainer Imran Sir And Kamran sir & Motivation vibe 100% Result', rating: 5 },
  { name: 'Aakib Pathan', date: '3 months ago', text: 'The best gym in dahod 👍🏻❤️', rating: 5 },
];

export function PublicWebsite() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes navbarReveal {
          from { opacity: 0; transform: translateY(-15px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-navbar-reveal {
          animation: navbarReveal 800ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
      `}</style>
      
      {/* 1. Navbar (Floating Pill) */}
      {!isLoading && (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-4 md:pt-6 px-4 md:px-8 pointer-events-none animate-navbar-reveal">
          <nav className={`pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] w-full max-w-[1200px] rounded-full border flex items-center justify-between px-6 md:px-10 ${
            scrolled 
              ? 'py-3 md:py-4 bg-[#0a0a0b]/85 backdrop-blur-xl border-[#D4AF37]/30 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)]' 
              : 'py-4 md:py-5 bg-[#050505]/40 backdrop-blur-md border-[#D4AF37]/15 shadow-lg'
          }`}>
          
          {/* Brand Logo */}
          <div className="cursor-pointer flex items-center z-50 group" onClick={() => window.scrollTo(0, 0)}>
            {/* The filter logic successfully handles the background */}
            <img 
              src="/FrosterGym/new-froaster-logo.png" 
              alt="Froaster Fitness" 
              className="h-16 md:h-20 lg:h-24 w-auto object-contain transition-all duration-500 group-hover:opacity-80 -my-2 md:-my-4" 
              style={{ filter: 'brightness(1.2) contrast(1.5) invert(1)', mixBlendMode: 'screen' }} 
              onError={(e) => { e.currentTarget.src = '/FrosterGym/logo.png' }}
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            {/* Tiny animated gold line divider */}
            <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent mx-2 hidden lg:block opacity-70"></div>
            
            {['About', 'Memberships', 'Trainers', 'Gallery', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())} 
                className="relative group py-2 text-[0.65rem] lg:text-[0.7rem] uppercase tracking-[0.25em] font-medium text-[#B8B8B8] hover:text-[#D4AF37] transition-colors duration-300"
              >
                {item}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#D4AF37] group-hover:w-full transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 shadow-[0_0_8px_rgba(212,175,55,0.6)]"></span>
              </button>
            ))}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden relative z-50 p-2.5 rounded-full border border-[#D4AF37]/30 bg-[#0A0A0A]/40 backdrop-blur-md focus:outline-none overflow-hidden group transition-all duration-300 hover:border-[#D4AF37]/80" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="absolute inset-0 bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isMenuOpen ? <X className="w-5 h-5 text-[#D4AF37] relative z-10" strokeWidth={1.5} /> : <Menu className="w-5 h-5 text-[#D4AF37] relative z-10" strokeWidth={1.5} />}
          </button>
        </nav>
      </div>
      )}

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#050505]/98 backdrop-blur-3xl z-40 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col justify-center items-center px-8 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Subtle decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-[radial-gradient(circle,rgba(212,175,55,0.03)_0%,transparent_60%)] pointer-events-none"></div>

        <div className={`flex flex-col items-center gap-10 transition-all duration-700 relative z-10 ${isMenuOpen ? 'translate-y-0 opacity-100 delay-100' : 'translate-y-16 opacity-0'}`}>
          {['About', 'Memberships', 'Trainers', 'Gallery', 'Contact'].map((item) => (
            <button 
              key={item}
              onClick={() => {
                setIsMenuOpen(false);
                scrollToSection(item.toLowerCase());
              }} 
              className="text-2xl sm:text-3xl font-display uppercase tracking-[0.25em] text-[#F5F5F5] hover:text-[#D4AF37] transition-colors relative group"
            >
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
          
          {isLoading && <EditorialLoader onComplete={() => setIsLoading(false)} />}
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl reveal opacity-0 translate-y-8 transition-all duration-1000 ease-out">
            <h1 className="text-[4.5rem] leading-[0.9] md:text-8xl font-display font-bold text-text-primary mb-8 uppercase drop-shadow-2xl">
              Where Fat<br/>
              <span className="text-text-muted">Meets its Fate.</span>
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
              Redefining <br/> <span className="text-primary-500">Excellence.</span>
            </h2>
            <div className="space-y-6 text-text-muted font-light leading-relaxed text-lg">
              <p>
                Froaster was conceived with a singular vision: to bring an unparalleled, elite fitness experience to Dahod. We transcend the standard gym model by offering a sanctuary of refined aesthetics, exclusivity, and uncompromising standards.
              </p>
              <p>
                Every detail is meticulously curated—from our world-class, state-of-the-art equipment to our bespoke personal training services. Step into a premium environment designed not just to transform your physique, but to elevate your entire lifestyle.
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
      <section id="memberships" className="py-24 md:py-40 bg-background overflow-hidden relative border-t border-surface-highlight">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-16 md:mb-24 reveal opacity-0 translate-y-8 transition-all duration-1000">
            <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary mb-6">Membership Cards</h2>
            <p className="text-text-muted text-lg font-light tracking-wide uppercase">Exclusive access to FROASTER FITNESS.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 w-full reveal opacity-0 translate-y-8 transition-all duration-1000 delay-200">
            
            {/* 01 BASIC CARD */}
            <div className="group relative w-full lg:w-1/3 rounded-2xl bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] border border-white/5 p-8 flex flex-col shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:brightness-110">
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-2xl border border-primary-500/0 group-hover:border-primary-500/30 transition-colors duration-700 pointer-events-none"></div>
              
              {/* Header */}
              <div className="relative flex justify-between items-center mb-12">
                <span className="text-[9px] text-white/50 tracking-[0.3em] font-light">FROASTER FITNESS</span>
                <span className="text-[9px] text-white/30 tracking-widest font-mono">01 / BASIC</span>
              </div>

              {/* Title */}
              <div className="relative mb-8 pb-8 border-b border-white/5">
                <h3 className="text-4xl font-display font-bold uppercase text-white mb-2 tracking-wide drop-shadow-md">Basic</h3>
                <p className="text-[10px] text-primary-500 tracking-[0.2em] uppercase font-light">Foundation Access</p>
              </div>

              {/* Features */}
              <div className="relative flex-1 flex flex-col">
                <p className="text-[9px] text-white/40 tracking-[0.2em] uppercase mb-4">Includes</p>
                <ul className="space-y-3 mb-8">
                  {['Modern Equipment', 'Cardio Zone', 'Workout Floor', 'Drinking Water', 'Open Gym Access'].map((feature, i) => (
                    <li key={i} className="text-xs text-white/70 flex items-start font-light">
                      <span className="text-primary-500 mr-3 mt-[1px] text-[10px]">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto pt-6 border-t border-white/5">
                  <p className="text-[9px] text-white/30 tracking-[0.2em] uppercase mb-2">Not Included</p>
                  <p className="text-xs text-white/50 font-light mb-4">Trainer / Workout Guidance</p>
                  
                  <p className="text-[9px] text-white/30 tracking-[0.2em] uppercase mb-2">Note</p>
                  <p className="text-xs text-white/50 font-light leading-relaxed">Bring your own:<br/>Shoes · Towel · Water Bottle</p>
                </div>
              </div>

              {/* Footer */}
              <div className="relative mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[8px] text-white/30 tracking-[0.2em] uppercase">FROASTER FITNESS</span>
                <div className="w-1.5 h-1.5 bg-white/20 rotate-45 group-hover:bg-primary-500/50 transition-colors duration-700"></div>
              </div>
            </div>

            {/* 02 STANDARD CARD */}
            <div className="group relative w-full lg:w-1/3 rounded-2xl bg-gradient-to-br from-[#1c1c1c] to-[#0a0a0a] border border-white/5 p-8 flex flex-col shadow-2xl transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:brightness-110" style={{ transitionDelay: '50ms' }}>
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-2xl border border-primary-500/0 group-hover:border-primary-500/30 transition-colors duration-700 pointer-events-none"></div>
              
              {/* Header */}
              <div className="relative flex justify-between items-center mb-12">
                <span className="text-[9px] text-white/50 tracking-[0.3em] font-light">FROASTER FITNESS</span>
                <span className="text-[9px] text-white/30 tracking-widest font-mono">02 / STANDARD</span>
              </div>

              {/* Title */}
              <div className="relative mb-8 pb-8 border-b border-white/5">
                <h3 className="text-4xl font-display font-bold uppercase text-white mb-2 tracking-wide drop-shadow-md">Standard</h3>
                <p className="text-[10px] text-primary-500 tracking-[0.2em] uppercase font-light">Performance Access</p>
              </div>

              {/* Features */}
              <div className="relative flex-1 flex flex-col">
                <p className="text-[9px] text-white/40 tracking-[0.2em] uppercase mb-4">Includes</p>
                <ul className="space-y-3 mb-8">
                  {['Modern Equipment', 'Cardio Zone', 'Workout Floor', 'Drinking Water', 'Open Gym Access', 'Basic Guidance', 'Certified Trainers', 'Workout Plans'].map((feature, i) => (
                    <li key={i} className="text-xs text-white/70 flex items-start font-light">
                      <span className="text-primary-500 mr-3 mt-[1px] text-[10px]">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="relative mt-8 pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                <span className="text-[8px] text-white/30 tracking-[0.2em] uppercase">FROASTER FITNESS</span>
                <div className="w-1.5 h-1.5 bg-white/20 rotate-45 group-hover:bg-primary-500/50 transition-colors duration-700"></div>
              </div>
            </div>

            {/* 03 PREMIUM CARD */}
            <div className="group relative w-full lg:w-1/3 rounded-2xl bg-gradient-to-br from-[#111111] to-[#000000] border border-primary-500/20 p-8 lg:p-10 lg:-mt-4 lg:-mb-4 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(201,151,62,0.1)] hover:brightness-110" style={{ transitionDelay: '100ms' }}>
              <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(201,151,62,0.2)] opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-2xl border border-primary-500/30 group-hover:border-primary-500/60 transition-colors duration-700 pointer-events-none"></div>
              
              {/* Header */}
              <div className="relative flex justify-between items-center mb-12">
                <span className="text-[9px] text-primary-500/80 tracking-[0.3em] font-light">FROASTER FITNESS</span>
                <span className="text-[9px] text-primary-500/50 tracking-widest font-mono">03 / PREMIUM</span>
              </div>

              {/* Title */}
              <div className="relative mb-8 pb-8 border-b border-primary-500/10 flex justify-between items-start">
                <div>
                  <h3 className="text-5xl font-display font-bold uppercase text-white mb-2 tracking-wide drop-shadow-md">Premium</h3>
                  <p className="text-[10px] text-primary-500 tracking-[0.2em] uppercase font-light">Signature Access</p>
                </div>
                <div className="border border-primary-500/30 px-2 py-1 rounded text-[7px] tracking-[0.3em] text-primary-500 uppercase">Signature</div>
              </div>

              {/* Features */}
              <div className="relative flex-1 flex flex-col">
                <p className="text-[9px] text-white/50 tracking-[0.2em] uppercase mb-4">Includes</p>
                <ul className="space-y-3.5 mb-8">
                  {['Premium Equipment', 'Cardio Zone', 'Spacious Locker Room', 'Clean Hygiene & Showers', 'Drinking Water', 'Personalized Training', 'Workout Plan', 'Diet Plan', 'Body Progress Tracking'].map((feature, i) => (
                    <li key={i} className="text-xs text-white/80 flex items-start font-light">
                      <span className="text-primary-500 mr-3 mt-[1px] text-[10px]">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="relative mt-8 pt-6 border-t border-primary-500/10 flex justify-between items-center mt-auto">
                <span className="text-[8px] text-primary-500/50 tracking-[0.2em] uppercase">FROASTER FITNESS</span>
                <div className="w-1.5 h-1.5 bg-primary-500/60 rotate-45 group-hover:bg-primary-500 transition-colors duration-700 shadow-[0_0_10px_rgba(201,151,62,0.5)]"></div>
              </div>
            </div>

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
            {/* Left Arrow */}
            <button 
              onClick={() => setActiveGallery((activeGallery - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length)}
              className="absolute left-2 md:left-8 z-50 p-3 rounded-full bg-background/80 backdrop-blur-md border border-white/10 text-white hover:bg-primary-500 hover:text-background transition-colors shadow-xl"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {GALLERY_ITEMS.map((item, idx) => {
              const isActive = activeGallery === idx;
              const isLeft = (activeGallery - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length === idx;
              const isRight = (activeGallery + 1) % GALLERY_ITEMS.length === idx;

              let positionClass = '';
              let zIndex = 20;

              if (isActive) {
                positionClass = 'translate-x-0 -translate-y-4 md:-translate-y-8 rotate-0 scale-100 opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/20';
                zIndex = 30;
              } else if (isLeft) {
                positionClass = '-translate-x-[55%] md:-translate-x-[105%] translate-y-8 md:translate-y-16 -rotate-6 md:-rotate-12 scale-[0.85] md:scale-95 opacity-60 hover:opacity-100 cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10';
                zIndex = 20;
              } else if (isRight) {
                positionClass = 'translate-x-[55%] md:translate-x-[105%] translate-y-8 md:translate-y-16 rotate-6 md:rotate-12 scale-[0.85] md:scale-95 opacity-60 hover:opacity-100 cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10';
                zIndex = 20;
              } else {
                positionClass = 'translate-x-0 translate-y-20 scale-75 opacity-0 pointer-events-none';
                zIndex = 10;
              }

              return (
                <div 
                  key={idx}
                  onClick={() => !isActive && setActiveGallery(idx)}
                  className={`absolute w-[70%] sm:w-[350px] md:w-[320px] lg:w-[400px] aspect-[3/4] rounded-[2rem] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden bg-surface ${positionClass}`}
                  style={{ zIndex }}
                >
                  <img src={`/FrosterGym/${item.img}`} alt={item.title} className="w-full h-full object-cover" />
                  
                  <div className={`absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-80' : 'opacity-100'}`}></div>
                  
                  <div className={`absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 md:opacity-100'}`}>
                    <p className="text-primary-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-1 md:mb-2">{item.label}</p>
                    <h3 className="text-2xl md:text-3xl font-display font-black uppercase text-text-primary tracking-tight leading-none">{item.title}</h3>
                  </div>
                </div>
              );
            })}

            {/* Right Arrow */}
            <button 
              onClick={() => setActiveGallery((activeGallery + 1) % GALLERY_ITEMS.length)}
              className="absolute right-2 md:right-8 z-50 p-3 rounded-full bg-background/80 backdrop-blur-md border border-white/10 text-white hover:bg-primary-500 hover:text-background transition-colors shadow-xl"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Reviews Marquee */}
      <section className="py-24 bg-background border-t border-surface-highlight overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="max-w-[1400px] mx-auto px-6 text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold uppercase text-text-primary mb-4 reveal opacity-0 translate-y-8 transition-all duration-1000">Word of Mouth</h2>
          <p className="text-text-muted max-w-xl mx-auto font-light reveal opacity-0 translate-y-8 transition-all duration-1000 delay-100">Real results. Real members. Real discipline.</p>
        </div>

        <div className="relative w-full flex overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex w-max animate-marquee whitespace-nowrap py-4 hover:[animation-play-state:paused]">
            {/* Double the array for seamless infinite scroll */}
            {[...GOOGLE_REVIEWS, ...GOOGLE_REVIEWS].map((review, idx) => (
              <div 
                key={idx} 
                className="w-[300px] md:w-[400px] bg-surface/50 backdrop-blur-sm border border-surface-highlight p-6 md:p-8 rounded-2xl mx-4 flex flex-col shrink-0 whitespace-normal shadow-lg transition-transform hover:-translate-y-2 hover:border-[#D4AF37]/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#111] border border-[#D4AF37]/20 flex items-center justify-center text-text-primary font-display font-bold text-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{review.name}</h4>
                      <p className="text-[10px] text-text-muted">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                    ))}
                  </div>
                </div>
                <p className="text-text-muted text-sm italic font-light leading-relaxed">"{review.text}"</p>
              </div>
            ))}
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
              <img 
                src="/FrosterGym/new-froaster-logo.png" 
                alt="Froaster" 
                className="w-40 md:w-56 lg:w-64 h-auto" 
                style={{ filter: 'brightness(1.2) contrast(1.5) invert(1)', mixBlendMode: 'screen' }} 
              />
            </div>
            
          </div>
        </div>

        {/* Giant Brand Wordmark (3D Metallic Effect) */}
        <div className="w-full overflow-hidden flex justify-center pb-12 pt-10 px-4 select-none pointer-events-none reveal opacity-0 translate-y-12 transition-all duration-[1500ms]" style={{ perspective: '1000px' }}>
          <h1 
            className="text-[16vw] font-display font-black uppercase leading-[0.8] tracking-tighter whitespace-nowrap text-[#333333]"
            style={{
              textShadow: `
                0 1px 0 #2a2a2a,
                0 2px 0 #252525,
                0 3px 0 #202020,
                0 4px 0 #1a1a1a,
                0 5px 0 #151515,
                0 6px 0 #111111,
                0 7px 0 #0d0d0d,
                0 8px 0 #0a0a0a,
                0 9px 0 #050505,
                0 10px 0 #000000,
                0 20px 30px rgba(0,0,0,0.95),
                0 40px 60px rgba(0,0,0,0.8)
              `,
              transform: 'rotateX(10deg)',
              WebkitTextStroke: '1px rgba(255,255,255,0.15)'
            }}
          >
            FROASTER
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="w-full border-t border-surface-highlight bg-background relative z-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 flex justify-center items-center">
            <span className="text-[10px] sm:text-xs text-text-muted text-center w-full">
              &copy; {new Date().getFullYear()} Froaster Gym. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
