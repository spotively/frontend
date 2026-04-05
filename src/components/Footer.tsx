import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full py-16 px-6 bg-brand-cream border-t border-[#2D2A2A]/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex flex-col items-center md:items-start gap-3">
          <span className="text-2xl font-black uppercase tracking-tighter text-[#2D2A2A]">Spotively</span>
          <p className="text-[#2D2A2A]/40 text-[10px] font-black uppercase tracking-[0.2em]">© {new Date().getFullYear()} Spotively. All rights reserved.</p>
        </div>
        
        <nav className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-[#2D2A2A]/40">
          <Link to="/terms" className="hover:text-brand-purple transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-brand-purple transition-colors">Privacy</Link>
          <a href="mailto:hello@spotively.app" className="hover:text-brand-purple transition-colors">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
