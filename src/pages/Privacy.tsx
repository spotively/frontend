import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream text-[#2D2A2A] px-6 py-24 md:px-12 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-lavender/20 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <Link to="/" className="inline-block mb-16 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-purple transition-colors">
          ← Back Home
        </Link>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-16 leading-none">Privacy Policy</h1>
        
        <div className="space-y-12 text-[#2D2A2A]/70 font-medium leading-relaxed">
          <section className="p-8 rounded-[40px] glass-card">
            <h2 className="text-xs font-black text-[#2D2A2A] uppercase tracking-widest mb-4">1. Information We Collect</h2>
            <p className="text-sm">We access your Spotify username, top artists, and top tracks via the official Spotify API.</p>
          </section>

          <section className="p-8 rounded-[40px] glass-card">
            <h2 className="text-xs font-black text-[#2D2A2A] uppercase tracking-widest mb-4">2. How We Use Information</h2>
            <p className="text-sm">This information is used strictly to display your aesthetic dashboard. Your data is stored locally in your browser and is not uploaded to our servers.</p>
          </section>

          <section className="p-8 rounded-[40px] glass-card">
            <h2 className="text-xs font-black text-[#2D2A2A] uppercase tracking-widest mb-4">3. Third Party Services</h2>
            <p className="text-sm">We use Spotify's API. By using Spotively, you are also bound by Spotify's Privacy Policy.</p>
          </section>

          <section className="p-8 rounded-[40px] glass-card">
            <h2 className="text-xs font-black text-[#2D2A2A] uppercase tracking-widest mb-4">4. Data Retention</h2>
            <p className="text-sm">You can revoke access to your Spotify data at any time via your Spotify account settings.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
