import { useState } from 'react';
import { Users, AlertCircle, Clock, UserMinus, MessageCircle, Sparkles, ExternalLink } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

type AudienceType = 'all' | 'expiring' | 'pending' | 'inactive';

const audiences = [
  { id: 'all', label: 'All Active', count: 0, icon: Users, color: 'text-[#E2C46B]', bg: 'bg-[#C9A24D]/10', border: 'border-[#D4AF37]/20', activeBorder: 'border-[#D4AF37]' },
  { id: 'expiring', label: 'Expiring Soon', count: 0, icon: Clock, color: 'text-[#8E7135]', bg: 'bg-[#8E7135]/20', border: 'border-amber-500/20', activeBorder: 'border-amber-500' },
  { id: 'pending', label: 'Pending Dues', count: 0, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', activeBorder: 'border-rose-500' },
  { id: 'inactive', label: 'Inactive/Past', count: 0, icon: UserMinus, color: 'text-[#A7A39A]', bg: 'bg-[#171613]', border: 'border-[rgba(255,255,255,0.12)]', activeBorder: 'border-zinc-400' },
];

const variables = [
  { label: 'Name', value: '{{name}}' },
  { label: 'Plan', value: '{{plan}}' },
  { label: 'Expiry Date', value: '{{expiry_date}}' },
  { label: 'Amount Due', value: '{{amount_due}}' },
  { label: 'Gym Name', value: '{{gym_name}}' },
];

export function WhatsAppCampaign() {
  const { toast } = useToast();
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>('all');
  const [message, setMessage] = useState('Hi {{name}},\n\nJust a quick reminder that your {{plan}} expires on {{expiry_date}}.\n\nPlease renew soon to keep enjoying your workouts at {{gym_name}}!');

  const insertVariable = (val: string) => {
    setMessage(prev => prev + val);
  };

  const getPreviewText = (text: string) => {
    if (!text) return 'Your message preview will appear here...';
    return text
      .replace(/\{\{name\}\}/g, 'John Doe')
      .replace(/\{\{plan\}\}/g, 'Pro Membership')
      .replace(/\{\{expiry_date\}\}/g, '25 Aug 2026')
      .replace(/\{\{amount_due\}\}/g, '$50.00')
      .replace(/\{\{gym_name\}\}/g, 'Froster Gym');
  };

  const handleSend = () => {
    if (!message.trim()) {
      return toast('error', 'Please enter a message to send');
    }
    
    // Simulate formatting a wa.me link
    const samplePhone = '1234567890';
    const textUrl = encodeURIComponent(getPreviewText(message));
    const url = `https://wa.me/${samplePhone}?text=${textUrl}`;
    
    window.open(url, '_blank');
    toast('success', 'Opening WhatsApp Web...');
  };

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      <PageHeader title="WhatsApp Campaign" />

      <div className="bg-[#4D6B5A]/20 border border-[#4D6B5A]/30 rounded-2xl p-4 mb-8 flex gap-3 text-[#4D6B5A] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-300">Boost Engagement with WhatsApp</p>
          <p className="text-sm leading-relaxed opacity-90">
            Reach your members directly. Select an audience, craft your message using variables, and preview it before sending.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          {/* Audience Selection */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-300 tracking-wide uppercase">1. Select Audience</h2>
            <div className="grid grid-cols-2 gap-3">
              {audiences.map((aud) => {
                const isSelected = selectedAudience === aud.id;
                const Icon = aud.icon;
                return (
                  <button
                    key={aud.id}
                    onClick={() => setSelectedAudience(aud.id as AudienceType)}
                    className={`relative p-4 rounded-xl border transition-all duration-200 text-left flex flex-col gap-2 overflow-hidden ${
                      isSelected ? aud.bg + ' ' + aud.activeBorder + ' shadow-lg' : 'bg-[#11110F] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.12)] hover:bg-[#171613]/50'
                    }`}
                  >
                    {isSelected && (
                      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-current opacity-10 rounded-bl-full`} style={{ color: 'inherit' }} />
                    )}
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? aud.color : 'text-[#706D66]'}`} />
                      <span className={`font-semibold ${isSelected ? 'text-[#F4F1E8]' : 'text-[#A7A39A]'}`}>
                        {aud.label}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[#F4F1E8] ml-6">
                      {aud.count}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Message Composition */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-300 tracking-wide uppercase">2. Compose Message</h2>
            
            <div className="bg-[#11110F] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
              <div className="p-3 border-b border-[rgba(255,255,255,0.08)] bg-[#0B0B0A]/50 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-[#706D66] mr-2 uppercase font-medium">Variables:</span>
                {variables.map(v => (
                  <button
                    key={v.value}
                    onClick={() => insertVariable(v.value)}
                    className="text-xs font-medium bg-[#171613] hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-md transition-colors border border-[rgba(255,255,255,0.12)]"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <textarea 
                className="w-full bg-transparent p-4 text-[#F4F1E8] resize-y min-h-[160px] focus:outline-none placeholder-zinc-600"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your promotional message or reminder here..."
              ></textarea>
            </div>
          </section>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-5 space-y-6">
          <section className="space-y-3 sticky top-6">
            <h2 className="text-sm font-medium text-zinc-300 tracking-wide uppercase">3. Preview & Send</h2>
            
            <div className="bg-[#0b141a] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]/50 shadow-lg shadow-black/20">
              {/* WhatsApp Header mock */}
              <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                  <UserMinus className="w-5 h-5 text-[#A7A39A]" />
                </div>
                <div>
                  <div className="text-[#F4F1E8] font-medium text-sm">John Doe</div>
                  <div className="text-[#A7A39A] text-xs">online</div>
                </div>
              </div>

              {/* Chat background */}
              <div className="bg-[#0b141a] p-4 min-h-[240px] relative" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 100%)' }}>
                <div className="bg-[#005c4b] text-[#e9edef] p-3 rounded-2xl rounded-tr-none max-w-[85%] ml-auto text-sm shadow-md whitespace-pre-wrap leading-relaxed relative">
                  {getPreviewText(message)}
                  <div className="text-[10px] text-[#8696a0] text-right mt-1.5 flex justify-end items-center gap-1">
                    <span>10:42 AM</span>
                    <svg viewBox="0 0 16 15" width="16" height="15" className="fill-[#53bdeb]"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              fullWidth 
              size="lg" 
              className="bg-emerald-600 hover:bg-emerald-500 text-[#F4F1E8] shadow-lg shadow-emerald-900/50 border-emerald-500 py-6 group mt-4 transition-all"
              onClick={handleSend}
            >
              <ExternalLink className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              <span className="font-semibold text-base">Send via WhatsApp Web</span>
            </Button>
            
            <p className="text-xs text-[#706D66] text-center mt-3 flex items-center justify-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Opens WhatsApp Web with the pre-filled message
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
