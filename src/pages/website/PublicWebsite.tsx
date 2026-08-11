import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight, MapPin, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import EditorialLoader from '../../components/website/EditorialLoader';

export function PublicWebsite() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePlan, setActivePlan] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 font-sans selection:bg-[#ff5722] selection:text-white">
      {isLoading && <EditorialLoader onComplete={() => setIsLoading(false)} />}
      
      {/* 1. Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-4 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5' : 'py-6 bg-transparent'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="cursor-pointer z-50"
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            >
              <img src="/FrosterGym/logo.png" alt="Froaster Gym" className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-white object-contain p-2 shadow-lg" />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10 bg-white/5 px-8 py-3 rounded-full border border-white/5 shadow-2xl backdrop-blur-sm">
              <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-xs uppercase tracking-widest font-medium text-white hover:text-[#ff5722] transition-colors">Home</button>
              <button onClick={() => scrollToSection('about')} className="text-xs uppercase tracking-widest font-medium text-gray-400 hover:text-white transition-colors">About</button>
              <button onClick={() => scrollToSection('services')} className="text-xs uppercase tracking-widest font-medium text-gray-400 hover:text-white transition-colors">Services</button>
              <button onClick={() => scrollToSection('memberships')} className="text-xs uppercase tracking-widest font-medium text-gray-400 hover:text-white transition-colors">Memberships</button>
              <button onClick={() => scrollToSection('gallery')} className="text-xs uppercase tracking-widest font-medium text-gray-400 hover:text-white transition-colors">Gallery</button>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <button 
                onClick={() => scrollToSection('contact')}
                className="bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-widest py-3 px-8 rounded-full transition-all duration-300"
              >
                Contact Us
              </button>
            </div>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden text-white z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-[#0a0a0a] z-40 transition-all duration-500 ease-in-out md:hidden flex flex-col justify-center items-center gap-8 ${isMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <button onClick={() => { window.scrollTo({top: 0, behavior: 'smooth'}); setIsMenuOpen(false); }} className="text-2xl font-bebas uppercase tracking-widest text-white">Home</button>
        <button onClick={() => scrollToSection('about')} className="text-2xl font-bebas uppercase tracking-widest text-white">About</button>
        <button onClick={() => scrollToSection('services')} className="text-2xl font-bebas uppercase tracking-widest text-white">Services</button>
        <button onClick={() => scrollToSection('memberships')} className="text-2xl font-bebas uppercase tracking-widest text-white">Memberships</button>
        <button onClick={() => scrollToSection('gallery')} className="text-2xl font-bebas uppercase tracking-widest text-white">Gallery</button>
        <button onClick={() => scrollToSection('contact')} className="text-2xl font-bebas uppercase tracking-widest text-white hover:text-gray-300 transition-colors">Contact Us</button>
      </div>

      {/* 2. Hero Section - Redesigned */}
      <section className="relative min-h-[100svh] w-full flex items-center overflow-hidden bg-[#0a0a0a]">
        
        {/* Absolute Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[url('/FrosterGym/hero-new-bg-2.jpg')] bg-cover bg-center transform scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>
        
        {/* FROASTER watermark */}
        <div className="absolute bottom-0 right-0 opacity-[0.02] pointer-events-none overflow-hidden mix-blend-overlay z-0">
          <h1 className="text-[15rem] lg:text-[25rem] font-bebas leading-none whitespace-nowrap -mb-12 lg:-mb-24">
            FROASTER
          </h1>
        </div>

        {/* Content */}
        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-20">
          <div className="w-full lg:w-[60%] animate-in slide-in-from-left duration-1000 fill-mode-both" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[2px] bg-[#ff5722]"></span>
              <span className="text-[#ff5722] font-oswald uppercase tracking-[0.3em] text-xs md:text-sm font-bold">Premium Fitness Destination</span>
            </div>
            
            <h1 className="text-[5rem] lg:text-[7rem] xl:text-[8rem] font-bebas font-bold leading-[0.85] tracking-tight text-white mb-6">
              DEFINE YOUR<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">LEGACY.</span>
            </h1>
            
            <p className="text-gray-200 font-bold text-lg md:text-2xl max-w-lg leading-relaxed mb-12 lg:border-l-2 lg:border-white/20 lg:pl-6">
              Where fat meets its fate. Train harder, move stronger, and become the version of yourself you were meant to be at Dahod's finest facility.
            </p>
            
            
          </div>
        </div>
      </section>

      {/* 3. About Section */}
      <section id="about" className="py-32 bg-[#0d0d0d] relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-[#ff5722] text-xs font-bold uppercase tracking-widest">
                <span className="w-12 h-[1px] bg-[#ff5722]"></span>
                About Froaster
              </div>
              <h2 className="text-5xl md:text-7xl font-bebas font-bold leading-[0.9] tracking-wide">
                MORE THAN<br/>A GYM.
              </h2>
              <p className="text-gray-400 font-light leading-relaxed max-w-lg">
                Located in Dahod, Gujarat, Froaster Gym is a premium fitness environment strictly focused on training, discipline, and absolute transformation. We provide an experienced, supportive atmosphere equipped with modern machinery.
              </p>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-gray-300"><span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" /> Modern Equipment</div>
                <div className="flex items-center gap-3 text-sm text-gray-300"><span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" /> Open Gym Access</div>
                <div className="flex items-center gap-3 text-sm text-gray-300"><span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" /> Strength Training</div>
                <div className="flex items-center gap-3 text-sm text-gray-300"><span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" /> Cardio Area</div>
                <div className="flex items-center gap-3 text-sm text-gray-300"><span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" /> Purified Water</div>
                <div className="flex items-center gap-3 text-sm text-gray-300"><span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" /> Dedicated Workout Space</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-10 rounded-2xl border border-[#d4af37]/20 shadow-[0_0_40px_rgba(212,175,55,0.05)] relative overflow-hidden group hover:border-[#d4af37]/40 transition-colors duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white/5 rounded-full blur-[60px] pointer-events-none" />
              <h3 className="text-3xl text-center font-bebas tracking-wide mb-10 text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37]">Batch Timings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Gents Category */}
                <div className="bg-[#111] border border-[#d4af37]/20 rounded-2xl p-8 hover:border-[#d4af37]/50 transition-colors duration-300 shadow-lg text-center">
                  <div className="text-xs text-[#d4af37]/60 uppercase tracking-widest mb-2">Category</div>
                  <div className="text-2xl font-oswald text-white drop-shadow-md mb-6 pb-4 border-b border-[#d4af37]/10">Gents Batch</div>
                  
                  <div className="space-y-4">
                    <div className="text-lg font-medium text-[#d4af37] tracking-wider">
                      <span className="text-white/50 text-sm block mb-1">Morning</span>
                      5:30 AM – 10:00 AM
                    </div>
                    <div className="text-lg font-medium text-[#d4af37] tracking-wider">
                      <span className="text-white/50 text-sm block mb-1">Evening</span>
                      5:00 PM – 10:00 PM
                    </div>
                  </div>
                </div>

                {/* Ladies Category */}
                <div className="bg-[#111] border border-[#d4af37]/20 rounded-2xl p-8 hover:border-[#d4af37]/50 transition-colors duration-300 shadow-lg text-center">
                  <div className="text-xs text-[#d4af37]/60 uppercase tracking-widest mb-2">Category</div>
                  <div className="text-2xl font-oswald text-white drop-shadow-md mb-6 pb-4 border-b border-[#d4af37]/10">Ladies Batch</div>
                  
                  <div className="space-y-4">
                    <div className="text-lg font-medium text-[#d4af37] tracking-wider">
                      <span className="text-white/50 text-sm block mb-1">Morning</span>
                      10:00 AM – 12:00 PM
                    </div>
                    <div className="text-lg font-medium text-[#d4af37] tracking-wider">
                      <span className="text-white/50 text-sm block mb-1">Afternoon</span>
                      3:00 PM – 5:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Services Section */}
      <section id="services" className="py-32 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <div className="flex items-center gap-4 text-[#ff5722] text-xs font-bold uppercase tracking-widest mb-4">
                <span className="w-12 h-[1px] bg-[#ff5722]"></span>
                Core Offerings
              </div>
              <h2 className="text-5xl md:text-7xl font-bebas font-bold leading-[0.9] tracking-wide">
                AUTHENTIC TRAINING.
              </h2>
            </div>
            <p className="text-gray-200 font-bold max-w-sm text-sm md:text-base">
              We focus purely on what works. No gimmicks. Just heavy weights, quality machines, and expert guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Service Cards */}
            {[
              { title: "Gym Training", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop" },
              { title: "Personal Training", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop" },
              { title: "Strength Training", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" },
              { title: "Cardio Focus", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop" }
            ].map((service, idx) => (
              <div key={idx} className="group relative h-[450px] overflow-hidden bg-[#111]">
                <img 
                  src={service.img} 
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-40 filter grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-8 h-1 bg-[#ff5722] mb-4 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                  <h3 className="text-3xl font-bebas tracking-wide text-white uppercase">{service.title}</h3>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* 5. Memberships */}
      <section id="memberships" className="py-24 bg-[#0d0d0d] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bebas font-bold leading-[0.9] tracking-wide mb-4">
              INVEST IN YOURSELF.
            </h2>
            <div className="text-lg md:text-xl font-oswald text-[#ff5722] mb-6 uppercase tracking-[0.2em]">
               STRONGER BODY. STRONGER MIND. BETTER YOU.
            </div>

          </div>

          {/* Desktop Layout (Hidden on Mobile) */}
          <div className="hidden lg:flex justify-center items-center w-full max-w-6xl mx-auto gap-8 px-4 py-10">
            <div className="w-full max-w-[350px] transition-all duration-500 hover:scale-105">
              <img src="/FrosterGym/basic-plan.jpeg" alt="Basic Plan" className="w-full rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-500/20" />
            </div>
            <div className="w-full max-w-[350px] transition-all duration-500 hover:scale-105 relative -mt-12 z-10">
              <img src="/FrosterGym/premium-plan.jpeg" alt="Premium Plan" className="w-full rounded-2xl shadow-[0_20px_50px_rgba(212,175,55,0.15)] border-2 border-[#d4af37]" />
            </div>
            <div className="w-full max-w-[350px] transition-all duration-500 hover:scale-105">
              <img src="/FrosterGym/stnd-plan.jpeg" alt="Standard Plan" className="w-full rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#689f38]/30" />
            </div>
          </div>

          {/* Mobile 3D Stacked Layout */}
          <div className="lg:hidden relative w-full flex justify-center mt-10 perspective-[1000px]">
             {/* Placeholder to give container height */}
             <div className="absolute inset-0 bg-[#0d0d0d] flex items-center justify-center opacity-0 pointer-events-none">
                <img src="/FrosterGym/premium-plan.jpeg" className="w-full" alt="Placeholder" />
             </div>
             
             {[
               { id: 0, src: "/FrosterGym/basic-plan.jpeg", alt: "Basic Plan", border: "border-slate-500/20" },
               { id: 1, src: "/FrosterGym/premium-plan.jpeg", alt: "Premium Plan", border: "border-[#d4af37] border-2" },
               { id: 2, src: "/FrosterGym/stnd-plan.jpeg", alt: "Standard Plan", border: "border-[#689f38]/30" }
             ].map((plan, index) => {
                const isActive = activePlan === index;
                const isPrev = activePlan === (index + 1) % 3;
                const isNext = activePlan === (index + 2) % 3;
                
                let transform = '';
                let zIndex = 10;
                let opacity = 1;
                
                if (isActive) {
                  transform = 'scale(1) translateZ(0px) translateX(0%)';
                  zIndex = 30;
                  opacity = 1;
                } else if (isPrev) {
                  transform = 'scale(0.85) translateZ(-100px) translateX(-40%) rotateY(15deg)';
                  zIndex = 20;
                  opacity = 0.5;
                } else if (isNext) {
                  transform = 'scale(0.85) translateZ(-100px) translateX(40%) rotateY(-15deg)';
                  zIndex = 20;
                  opacity = 0.5;
                }

                return (
                  <div 
                    key={plan.id}
                    onClick={() => setActivePlan(index)}
                    className="absolute top-0 transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer"
                    style={{ 
                      transform,
                      zIndex,
                      opacity,
                      width: '75%',
                      maxWidth: '320px',
                    }}
                  >
                    <img 
                      src={plan.src} 
                      alt={plan.alt} 
                      className={`w-full rounded-2xl shadow-2xl border ${plan.border} transition-all duration-700 ${!isActive ? 'blur-[3px] grayscale-[30%]' : 'grayscale-0 blur-0'}`}
                    />
                  </div>
                )
             })}
          </div>
        </div>
      </section>

      {/* 6. Gallery Section */}
      <section id="gallery" className="py-32 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          <div className="mb-16">
             <h2 className="text-5xl md:text-7xl font-bebas font-bold leading-[0.9] tracking-wide mb-2 uppercase">
                INSIDE FROASTER
             </h2>
             <div className="text-[#ff5722] text-sm font-bold uppercase tracking-widest">
                TRAIN. SWEAT. TRANSFORM.
             </div>
          </div>

          {/* Scrolling Marquee Gallery */}
          <div className="relative w-full overflow-hidden flex -mx-6 md:-mx-12 px-6 md:px-12 pb-10">
             {/* Gradient fade edges */}
             <div className="absolute top-0 left-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-20 pointer-events-none" />
             <div className="absolute top-0 right-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-20 pointer-events-none" />
             
             <div className="flex gap-4 animate-scroll-marquee w-max hover:[animation-play-state:paused]">
               {[
                 'new_gallery_1.png', 'new_gallery_2.jpg', 'new_gallery_3.png',
                 'new_gallery_4.png', 'new_gallery_5.png', 'new_gallery_6.png',
                 'new_gallery_7.jpg', 'new_gallery_8.png', 'new_gallery_9.png',
                 'new_gallery_1.png', 'new_gallery_2.jpg', 'new_gallery_3.png',
                 'new_gallery_4.png', 'new_gallery_5.png', 'new_gallery_6.png',
                 'new_gallery_7.jpg', 'new_gallery_8.png', 'new_gallery_9.png'
               ].map((img, idx) => (
                 <div key={idx} className="relative group overflow-hidden bg-black flex-shrink-0 w-[280px] h-[350px] md:w-[400px] md:h-[500px] rounded-xl border border-white/5">
                    <img src={`/FrosterGym/${img}`} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" alt={`Gym Gallery ${idx + 1}`} loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                       <span className="text-[#ff5722] font-bebas text-xl tracking-wider">Froaster Fitness</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </section>

      {/* 7. Transformation */}
      <section className="py-40 bg-black relative flex items-center justify-center overflow-hidden">
         <div className="absolute inset-0 bg-[url('/FrosterGym/transformation_bg.png')] bg-cover bg-fixed bg-[center_top] opacity-40" />
         <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-black/50 to-[#0a0a0a]" />
         
         <div className="relative z-10 text-center flex flex-col items-center">
            <div className="text-xl md:text-3xl font-oswald text-[#ff5722] mb-6 uppercase tracking-[0.3em]">
               Your Stronger Self
            </div>
            <h2 className="text-[4rem] md:text-[8rem] font-bebas font-bold leading-[0.85] text-white opacity-90 drop-shadow-2xl">
               TRAIN HARD.<br/>STAY CONSISTENT.<br/>TRANSFORM.
            </h2>
         </div>
      </section>

      {/* 8. Contact & Location */}
      <section id="contact" className="py-32 bg-[#0d0d0d]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
           
           <div className="flex flex-col justify-center">
              <h2 className="text-6xl md:text-8xl font-bebas font-bold leading-[0.9] tracking-wide mb-6">
                READY TO START?
              </h2>
              <p className="text-gray-400 font-light max-w-sm text-lg mb-12">
                Your transformation starts with the first step. Visit us or reach out today.
              </p>
              
               <div className="flex flex-col sm:flex-row gap-5 mb-12 max-w-xl">
                 <a href="tel:+918866445862" className="group relative flex items-center justify-between flex-1 bg-[#0B0B0A] border border-[#d4af37]/20 hover:border-[#d4af37]/50 h-[56px] px-6 sm:px-8 rounded-md transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 hover:shadow-[0_4px_20px_rgba(212,175,55,0.08)] overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                   
                   <Phone className="w-4 h-4 text-[#d4af37] relative z-10" />
                   
                   <span className="text-[13px] font-oswald text-[#F4F1E8] tracking-[0.15em] font-medium uppercase absolute left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                     Call Now
                   </span>
                   
                   <ChevronRight className="w-4 h-4 text-[#d4af37]/50 group-hover:text-[#d4af37] transition-all duration-200 group-hover:translate-x-1 relative z-10" />
                 </a>
                 <a href="https://wa.me/918866445862" target="_blank" rel="noreferrer" className="group relative flex items-center justify-between flex-1 bg-[#0B0B0A] border border-[#d4af37]/20 hover:border-[#d4af37]/40 h-[56px] px-6 sm:px-8 rounded-md transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 hover:shadow-[0_4px_20px_rgba(47,99,75,0.12)] overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                   
                   <MessageCircle className="w-4 h-4 text-[#3a7c5c] group-hover:text-[#4c956c] transition-colors duration-200 relative z-10" />
                   
                   <span className="text-[13px] font-oswald text-[#F4F1E8] tracking-[0.15em] font-medium uppercase absolute left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                     WhatsApp Us
                   </span>
                   
                   <ChevronRight className="w-4 h-4 text-[#d4af37]/50 group-hover:text-[#d4af37] transition-all duration-200 group-hover:translate-x-1 relative z-10" />
                 </a>
               </div>

           </div>

           {/* Google Maps Embed */}
           <div className="relative h-[500px] lg:h-auto bg-[#111] p-2 border border-white/5 grayscale hover:grayscale-0 transition-all duration-700">
              <iframe 
                src="https://maps.google.com/maps?q=Froaster%20Fitness,%20Govindnagar,%20Dahod,%20Gujarat&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover"
                title="Froaster Gym Location"
              />
              <a 
                href="https://maps.google.com/?q=Froaster+Fitness,+Govindnagar,+Dahod,+Gujarat" 
                target="_blank" 
                rel="noreferrer"
                className="absolute bottom-8 right-8 bg-[#ff5722] text-white text-xs font-bold uppercase tracking-widest py-4 px-8 shadow-2xl hover:bg-white hover:text-black transition-colors"
              >
                Get Directions
              </a>
           </div>

        </div>
      </section>

      {/* 9. Premium Footer */}
      <footer className="bg-[#000000] pt-24 relative overflow-hidden border-t border-white/5">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/10 pb-16">
             {/* Brand Column */}
             <div className="md:col-span-5 pr-0 md:pr-12">
                <img src="/FrosterGym/logo.png" alt="Froaster Gym" className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white object-contain p-2 shadow-lg mb-4" />
                <div className="text-[#ff5722] text-xs font-bold uppercase tracking-widest mb-6">
                  Where fat meets its fate.
                </div>
                <p className="text-gray-400 text-sm font-light leading-relaxed mb-8 max-w-sm">
                  We are more than just a gym. We are a community built on discipline, strength, and transformation. Located in the heart of Dahod.
                </p>
                <div className="flex gap-4">
                  <a href="https://www.instagram.com/froaster_fitness/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#ff5722] hover:border-[#ff5722] transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                  <a href="https://wa.me/919409478823" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#ff5722] hover:border-[#ff5722] transition-colors group">
                    <Phone className="w-[18px] h-[18px] text-white" />
                  </a>
                </div>
             </div>

             {/* Links Column */}
             <div className="md:col-span-3">
                <h4 className="text-white text-lg font-bebas tracking-widest mb-6 uppercase">Navigation</h4>
                <ul className="space-y-3 text-sm font-medium text-gray-400">
                  <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-[#ff5722] transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#ff5722]"/> Home</button></li>
                  <li><button onClick={() => scrollToSection('about')} className="hover:text-[#ff5722] transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#ff5722]"/> About Us</button></li>
                  <li><button onClick={() => scrollToSection('services')} className="hover:text-[#ff5722] transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#ff5722]"/> Our Services</button></li>
                  <li><button onClick={() => scrollToSection('memberships')} className="hover:text-[#ff5722] transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#ff5722]"/> Memberships</button></li>
                  <li><button onClick={() => scrollToSection('gallery')} className="hover:text-[#ff5722] transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#ff5722]"/> Gallery</button></li>
                </ul>
             </div>

             {/* Contact Column */}
             <div className="md:col-span-4">
                <h4 className="text-white text-lg font-bebas tracking-widest mb-6 uppercase">Visit Us</h4>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                     <MapPin className="text-[#ff5722] w-5 h-5 shrink-0" />
                     <p className="text-sm font-light text-gray-400 leading-relaxed">
                       Dudhimati River Bridge, Near Road,<br/>Desaiwad, Dahod, Gujarat 389151
                     </p>
                  </div>
                  <div className="flex items-center gap-4">
                     <Phone className="text-[#ff5722] w-5 h-5 shrink-0" />
                     <a href="tel:9409478823" className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-widest">
                       +91 94094 78823
                     </a>
                  </div>
                  <button 
                    onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                    className="mt-6 border border-white/20 text-white text-xs font-bold uppercase tracking-widest py-3 px-8 rounded-full hover:bg-white hover:text-black transition-colors"
                  >
                    Back to Top
                  </button>
                </div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center py-6 text-xs font-medium text-gray-600 uppercase tracking-widest relative z-10">
             <div>© {new Date().getFullYear()} Froaster Gym. All rights reserved.</div>
             <div className="mt-4 md:mt-0">Forge Your Legacy.</div>
          </div>
        </div>

        {/* Huge Typographic Background */}
        <div className="w-full overflow-hidden flex justify-center pointer-events-none select-none opacity-5 mt-[-40px]">
          <span className="font-bebas text-[20vw] font-bold text-white leading-none whitespace-nowrap">
            FROASTER
          </span>
        </div>
      </footer>
    </div>
  );
}
