import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight, ArrowLeft, MapPin, Phone, MessageCircle } from 'lucide-react';
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
          
          <div className="relative reveal opacity-0 translate-y-8 transition-all duration-1000 delay-[200ms]">
            <img src="/FrosterGym/gallery1.jpg" alt="Gym Equipment" className="w-full h-auto transition-all duration-700 border border-surface-highlight shadow-2xl" />
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
          </div>
          
          <div className="max-w-[320px] sm:max-w-md mx-auto relative reveal opacity-0 translate-y-8 transition-all duration-1000">
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out" 
                style={{ transform: `translateX(-${activePlan * 100}%)` }}
              >
                {PRICING_PLANS.map((plan, idx) => (
                  <div key={idx} className="w-full shrink-0 flex items-center justify-center">
                    <img src={plan.img} alt={plan.name} className="w-full h-auto object-contain rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setActivePlan(p => Math.max(0, p - 1))}
              disabled={activePlan === 0}
              className="absolute top-1/2 -left-6 sm:-left-16 -translate-y-1/2 p-2 sm:p-3 bg-surface border border-surface-highlight text-primary-500 rounded-full hover:bg-surface-highlight transition-colors disabled:opacity-30 z-10"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button 
              onClick={() => setActivePlan(p => Math.min(PRICING_PLANS.length - 1, p + 1))}
              disabled={activePlan === PRICING_PLANS.length - 1}
              className="absolute top-1/2 -right-6 sm:-right-16 -translate-y-1/2 p-2 sm:p-3 bg-surface border border-surface-highlight text-primary-500 rounded-full hover:bg-surface-highlight transition-colors disabled:opacity-30 z-10"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="flex justify-center gap-2 mt-8">
              {PRICING_PLANS.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActivePlan(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === activePlan ? 'bg-primary-500 w-6' : 'bg-surface-highlight hover:bg-surface-highlight/80'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* 6. Gallery */}
      <section id="gallery" className="py-32 bg-background border-t border-surface-highlight overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 reveal opacity-0 translate-y-8 transition-all duration-1000">
          <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary mb-4">Inside Froaster</h2>
          <p className="text-text-muted uppercase tracking-[0.2em] text-sm">Train. Sweat. Transform.</p>
        </div>
        
        <div className="relative w-full overflow-hidden reveal opacity-0 translate-y-8 transition-all duration-1000 delay-[150ms]">
          <div className="flex gap-4 md:gap-6 animate-marquee w-max hover:animation-pause">
            {[
              'new_gallery_1.png', 'new_gallery_2.jpg', 'new_gallery_3.png', 
              'new_gallery_4.png', 'new_gallery_5.png', 'new_gallery_6.png',
              'new_gallery_1.png', 'new_gallery_2.jpg', 'new_gallery_3.png', 
              'new_gallery_4.png', 'new_gallery_5.png', 'new_gallery_6.png'
            ].map((img, i) => (
              <div key={i} className="w-[280px] md:w-[400px] h-[350px] md:h-[500px] shrink-0 border border-surface-highlight overflow-hidden group bg-surface">
                <img src={`/FrosterGym/${img}`} alt={`Gallery Image ${i+1}`} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" loading="lazy" />
              </div>
            ))}
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
      <footer className="bg-background py-16 border-t border-surface-highlight text-sm">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <img src="/FrosterGym/logo.png" alt="Froaster Gym" className="h-16 w-16 mb-6 bg-white rounded-full p-1.5" />
            <p className="text-text-muted max-w-sm leading-relaxed mb-6">
              We are more than just a gym. We are a community built on discipline, strength, and transformation.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/froaster_fitness/" className="w-10 h-10 flex items-center justify-center border border-surface-highlight rounded-full text-text-muted hover:text-primary-500 hover:border-primary-500 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-text-primary font-bold uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-4 text-text-muted font-light">
              <li><button onClick={() => scrollToSection('about')} className="hover:text-primary-500 transition-colors">About Us</button></li>
              <li><button onClick={() => scrollToSection('memberships')} className="hover:text-primary-500 transition-colors">Memberships</button></li>
              <li><button onClick={() => scrollToSection('trainers')} className="hover:text-primary-500 transition-colors">Trainers</button></li>
              <li><button onClick={() => scrollToSection('gallery')} className="hover:text-primary-500 transition-colors">Gallery</button></li>
            </ul>
          </div>
          
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-surface-highlight text-text-muted flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Froaster Gym. All rights reserved.</p>
          <p className="uppercase tracking-[0.2em] text-xs font-medium">Forge Your Legacy</p>
        </div>
      </footer>
    </div>
  );
}
