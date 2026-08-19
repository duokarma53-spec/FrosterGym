import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight, MapPin, Phone, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [withPT, setWithPT] = useState(false);

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
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-4 bg-background/95 backdrop-blur-md border-b border-surface-highlight shadow-xl shadow-black/50' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="cursor-pointer flex items-center z-50" onClick={() => window.scrollTo(0, 0)}>
            <img src="/FrosterGym/logo.png" alt="Froaster Gym" className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white object-contain p-1.5 shadow-lg" />
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-medium text-text-muted">
            <button onClick={() => scrollToSection('about')} className="hover:text-primary-500 transition-colors">About</button>
            <button onClick={() => scrollToSection('memberships')} className="hover:text-primary-500 transition-colors">Memberships</button>
            <button onClick={() => scrollToSection('trainers')} className="hover:text-primary-500 transition-colors">Trainers</button>
            <button onClick={() => scrollToSection('gallery')} className="hover:text-primary-500 transition-colors">Gallery</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-primary-500 transition-colors">Contact</button>
            
            <Link to="/login" className="text-primary-500 border border-primary-500/30 px-6 py-2.5 hover:bg-primary-500 hover:text-background transition-all ml-4 font-bold">
              Member Login
            </Link>
          </div>
          
          <button className="md:hidden text-text-primary z-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-background/95 backdrop-blur-xl z-40 transition-all duration-500 flex flex-col items-center justify-center gap-8 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={() => scrollToSection('about')} className="text-2xl font-display uppercase tracking-widest text-text-primary hover:text-primary-500 transition-colors">About</button>
        <button onClick={() => scrollToSection('memberships')} className="text-2xl font-display uppercase tracking-widest text-text-primary hover:text-primary-500 transition-colors">Memberships</button>
        <button onClick={() => scrollToSection('trainers')} className="text-2xl font-display uppercase tracking-widest text-text-primary hover:text-primary-500 transition-colors">Trainers</button>
        <button onClick={() => scrollToSection('gallery')} className="text-2xl font-display uppercase tracking-widest text-text-primary hover:text-primary-500 transition-colors">Gallery</button>
        <button onClick={() => scrollToSection('contact')} className="text-2xl font-display uppercase tracking-widest text-text-primary hover:text-primary-500 transition-colors">Contact</button>
        <Link to="/login" className="text-xl font-display uppercase tracking-widest text-primary-500 mt-4">Member Login</Link>
      </div>

      {/* 2. Hero Section */}
      <section className="relative min-h-[100svh] flex items-center bg-background overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src="/FrosterGym/hero-new-bg-2.jpg" alt="Premium Gym Environment" className="w-full h-full object-cover opacity-[0.35] grayscale" />
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

      {/* 6. Gallery */}
      <section id="gallery" className="py-32 bg-background border-t border-surface-highlight overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 reveal opacity-0 translate-y-8 transition-all duration-1000">
          <h2 className="text-5xl md:text-6xl font-display font-bold uppercase text-text-primary mb-4">Inside Froaster</h2>
          <p className="text-text-muted uppercase tracking-[0.2em] text-sm">Train. Sweat. Transform.</p>
        </div>
        
        <div className="flex gap-4 md:gap-6 px-6 overflow-x-auto pb-8 snap-x hide-scrollbar reveal opacity-0 translate-y-8 transition-all duration-1000 delay-[150ms]">
          {[
            'new_gallery_1.png', 'new_gallery_2.jpg', 'new_gallery_3.png', 
            'new_gallery_4.png', 'new_gallery_5.png', 'new_gallery_6.png'
          ].map((img, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[400px] h-[350px] md:h-[500px] snap-center shrink-0 border border-surface-highlight overflow-hidden group bg-surface">
              <img src={`/FrosterGym/${img}`} alt={`Gallery Image ${i+1}`} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" loading="lazy" />
            </div>
          ))}
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
          
          <div>
            <h4 className="text-text-primary font-bold uppercase tracking-widest mb-6">Members</h4>
            <ul className="space-y-4 text-text-muted font-light">
              <li>
                <Link to="/login" className="flex items-center gap-2 hover:text-primary-500 transition-colors">
                  Member Login <ArrowUpRight className="w-4 h-4" />
                </Link>
              </li>
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
