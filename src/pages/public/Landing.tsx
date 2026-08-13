import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Dumbbell, MapPin, Phone, ArrowRight, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PRICING_PLANS = [
  {
    name: 'Basic',
    priceWithout: '₹1,500',
    priceWith: '₹3,500',
    features: ['Access to all modern equipment', 'Locker room access', '1 group class per month']
  },
  {
    name: 'Standard',
    priceWithout: '₹2,500',
    priceWith: '₹4,500',
    features: ['Access to all modern equipment', 'Locker room access', '4 group classes per month', 'Free diet consultation']
  },
  {
    name: 'Premium',
    priceWithout: '₹3,500',
    priceWith: '₹6,000',
    features: ['Access to all modern equipment', 'Locker room access', 'Unlimited group classes', 'Customised diet plan', 'Guest passes (2/month)']
  }
];

export function Landing() {
  const [withTraining, setWithTraining] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle fade ups for all major sections
      gsap.utils.toArray('.reveal').forEach((elem: any) => {
        gsap.fromTo(elem, 
          { autoAlpha: 0, y: 30 },
          { 
            autoAlpha: 1, 
            y: 0, 
            duration: 0.8, 
            ease: "power2.out", 
            scrollTrigger: {
              trigger: elem,
              start: "top 85%",
            }
          }
        );
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-text-primary selection:bg-primary-500/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-surface-highlight">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary-500" />
            <span className="font-display font-bold text-xl tracking-wider uppercase text-white">
              Froaster Gym
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#about" className="text-text-muted hover:text-white transition-colors">About</a>
            <a href="#pricing" className="text-text-muted hover:text-white transition-colors">Pricing</a>
            <a href="#trainers" className="text-text-muted hover:text-white transition-colors">Trainers</a>
            <Link to="/login" className="text-primary-500 hover:text-primary-400 transition-colors">Member Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 reveal">
          <p className="text-primary-500 font-medium tracking-widest uppercase text-xs mb-4">Dudhimati River Bridge, Desaiwad, Dahod</p>
          <h1 className="font-display font-bold text-6xl md:text-8xl uppercase leading-[0.9] tracking-tighter text-white mb-6">
            Real Work. <br />
            <span className="text-surface-highlight line-through decoration-primary-500">No Excuses.</span> <br />
            Real Results.
          </h1>
          <p className="text-lg text-text-muted max-w-md mb-8 leading-relaxed">
            A classic athletic club focused on proper form, serious training, and genuine progress. No gimmicks. Just the right equipment and the right atmosphere.
          </p>
          <a href="#pricing" className="inline-flex items-center gap-2 bg-primary-500 text-background font-semibold px-8 py-4 rounded-sm hover:bg-primary-400 transition-colors">
            View Memberships <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="flex-1 w-full aspect-square md:aspect-[3/4] bg-surface rounded-sm relative overflow-hidden reveal">
          {/* Text-only placeholder for real gym floor photo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-tr from-surface to-surface-highlight">
            <Dumbbell className="w-12 h-12 text-surface-highlight mb-4" />
            <p className="text-text-muted font-display uppercase tracking-widest text-sm">[ Real Gym Floor Photography ]</p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section id="about" className="py-24 px-6 bg-surface">
        <div className="max-w-4xl mx-auto reveal">
          <h2 className="font-display font-bold text-4xl uppercase tracking-tighter text-white mb-8">Why We Built Froaster</h2>
          <div className="space-y-6 text-lg text-text-muted leading-relaxed">
            <p>
              I opened Froaster Gym because Dahod needed a space for people who actually wanted to train. Not a social club, not a place flooded with neon lights and gimmicks, but a proper athletic environment.
            </p>
            <p>
              When we built this space by the Dudhimati River Bridge, we made a choice: invest in the best equipment, hire trainers who actually correct form, and build a culture of accountability. If you're serious about your progress, this is your gym.
            </p>
            <p className="font-medium text-white pt-4">
              — The Founder
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal">
          <h2 className="font-display font-bold text-5xl uppercase tracking-tighter text-white mb-6">Membership Plans</h2>
          
          <div className="inline-flex items-center bg-surface p-1 rounded-sm">
            <button 
              onClick={() => setWithTraining(false)}
              className={`px-6 py-2.5 text-sm font-medium rounded-sm transition-colors ${!withTraining ? 'bg-primary-500 text-background' : 'text-text-muted hover:text-white'}`}
            >
              Standard Access
            </button>
            <button 
              onClick={() => setWithTraining(true)}
              className={`px-6 py-2.5 text-sm font-medium rounded-sm transition-colors ${withTraining ? 'bg-primary-500 text-background' : 'text-text-muted hover:text-white'}`}
            >
              With Personal Training
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan) => {
            const isPremium = plan.name === 'Premium';
            const price = withTraining ? plan.priceWith : plan.priceWithout;
            
            // Generate WhatsApp deep link
            const waText = encodeURIComponent(`Hi, I'm interested in the ${plan.name} plan (${withTraining ? 'With Training' : 'Standard Access'}) at Froaster Gym.`);
            const waLink = `https://wa.me/919876543210?text=${waText}`;

            return (
              <div key={plan.name} className={`reveal relative p-8 flex flex-col bg-surface rounded-sm ${isPremium ? 'border border-primary-500/50 shadow-[0_0_30px_rgba(201,151,62,0.1)]' : 'border border-surface-highlight'}`}>
                {isPremium && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-background text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-sm">
                    Recommended
                  </div>
                )}
                
                <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold text-white tracking-tighter">{price}</span>
                  <span className="text-text-muted text-sm">/mo</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-text-muted">
                      <Check className="w-5 h-5 text-primary-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href={waLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-full text-center py-3 px-4 font-semibold rounded-sm transition-colors ${isPremium ? 'bg-primary-500 text-background hover:bg-primary-400' : 'bg-surface-highlight text-white hover:bg-[#2A2A2B]'}`}
                >
                  Join via WhatsApp
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trainers & Trust */}
      <section id="trainers" className="py-24 px-6 bg-surface border-t border-surface-highlight">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <h2 className="font-display font-bold text-4xl uppercase tracking-tighter text-white mb-6">Expert Guidance</h2>
              <p className="text-text-muted text-lg leading-relaxed mb-8">
                Our trainers aren't just here to count your reps. They are certified professionals dedicated to fixing your mechanics and ensuring you hit your targets safely.
              </p>
              
              <div className="space-y-6">
                <div className="border-l-2 border-primary-500 pl-4">
                  <h4 className="text-white font-bold mb-1">Alex Sharma</h4>
                  <p className="text-sm text-text-muted">Head Coach • ACE Certified</p>
                </div>
                <div className="border-l-2 border-surface-highlight pl-4">
                  <h4 className="text-white font-bold mb-1">Rahul Patel</h4>
                  <p className="text-sm text-text-muted">Strength Specialist • ISSA Certified</p>
                </div>
              </div>
            </div>
            
            <div className="bg-background border border-surface-highlight rounded-sm p-8 reveal">
              <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-white mb-6">Location & Hours</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-text-muted">
                  <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">Froaster Gym</p>
                    <p className="text-sm">Dudhimati River Bridge, Desaiwad<br/>Dahod, Gujarat</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-text-muted">
                  <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                  <p className="text-white font-medium">+91 98765 43210</p>
                </div>

                <div className="mt-8 pt-8 border-t border-surface-highlight">
                  <p className="text-sm text-text-muted mb-2">Morning Batch: <span className="text-white">5:30 AM - 10:00 AM</span></p>
                  <p className="text-sm text-text-muted">Evening Batch: <span className="text-white">4:30 PM - 10:00 PM</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 px-6 border-t border-surface-highlight text-center">
        <div className="flex justify-center mb-6 gap-4">
          <a href="#" className="text-text-muted hover:text-primary-500 transition-colors font-medium">
            Instagram
          </a>
        </div>
        <p className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Froaster Gym. All rights reserved.</p>
      </footer>
    </div>
  );
}
