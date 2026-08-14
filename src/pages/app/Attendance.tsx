import { CalendarCheck } from 'lucide-react';

export function Attendance() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 max-w-lg mx-auto space-y-6">
      <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/20 animate-pulse">
        <CalendarCheck className="w-10 h-10" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Biometric & QR Attendance</h1>
        <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase rounded-full tracking-widest">
          Coming Soon
        </div>
      </div>

      <p className="text-gray-400 text-sm leading-relaxed">
        We are designing an automated check-in ecosystem. Gym owners will soon be able to track check-ins via local biometric scan hardware integrations and member-facing QR digital passes.
      </p>

      <div className="w-full bg-surface border border-surface-highlight rounded-xl p-5 text-left space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider text-amber-500">Upcoming Features</h3>
        <ul className="space-y-2.5 text-xs text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
            <span>Real-time QR scan check-in via Froster Member Pass</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
            <span>Biometric fingerprint reader SDK integration</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
            <span>Instant automated WhatsApp check-in alerts</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

