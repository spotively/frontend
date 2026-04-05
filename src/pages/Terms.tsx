import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream text-[#2D2A2A] px-6 py-24 md:px-12 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <Link to="/" className="inline-block mb-16 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-purple transition-colors">
          ← Back Home
        </Link>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-16 leading-none">Terms of Service</h1>
        
        <div className="space-y-12 text-[#2D2A2A]/70 font-medium leading-relaxed">
          <section className="p-8 rounded-[40px] glass-card">
            <h2 className="text-xs font-black text-[#2D2A2A] uppercase tracking-widest mb-4">1. Acceptance of Terms</h2>
            <p className="text-sm">By using Spotively, you agree to these terms. If you do not agree, please do not use the service.</p>
          </section>

          <section className="p-8 rounded-[40px] glass-card">
            <h2 className="text-xs font-black text-[#2D2A2A] uppercase tracking-widest mb-4">2. Description of Service</h2>
            <p className="text-sm">Spotively provides a minimalist aesthetic visualization of your Spotify listening habits. We are not affiliated with Spotify AB.</p>
          </section>

          <section className="p-8 rounded-[40px] glass-card">
            <h2 className="text-xs font-black text-[#2D2A2A] uppercase tracking-widest mb-4">3. Data Usage</h2>
            <p className="text-sm">We use your Spotify data solely to generate visualizations. We do not sell your data to third parties.</p>
          </section>

          <section className="p-8 rounded-[40px] glass-card">
            <h2 className="text-xs font-black text-[#2D2A2A] uppercase tracking-widest mb-4">4. Limitation of Liability</h2>
            <p className="text-sm">Spotively is provided "as is" without any warranties. We are not responsible for any data loss or account issues.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
