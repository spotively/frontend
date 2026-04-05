import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
    )
    .fromTo(subtitleRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 
      '-=0.8'
    )
    .fromTo(buttonRef.current, 
      { opacity: 0, scale: 0.9 }, 
      { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, 
      '-=0.6'
    );
  }, []);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'}/auth/login`;
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative overflow-hidden bg-brand-cream">
      {/* Background Pastel Spots */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-teal/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-lavender/30 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse transition-all delay-700"></div>
      
      <div className="z-10 flex flex-col items-center">
        <h1 ref={titleRef} className="text-6xl md:text-[8rem] font-sans font-black tracking-tighter mb-6 text-[#2D2A2A] uppercase leading-[0.9]">
          Spotively
        </h1>
        <p ref={subtitleRef} className="text-lg md:text-2xl text-[#2D2A2A]/60 mb-16 max-w-2xl font-medium">
          A minimalist aesthetic visualization of your top music.
          Relive the vibe that made your period.
        </p>
        <button
          ref={buttonRef}
          onClick={handleLogin}
          className="px-12 py-5 glass-button rounded-full font-black uppercase tracking-widest text-sm text-[#2D2A2A] cute-shadow transition-all hover:scale-105 active:scale-95 border-brand-lavender/20"
        >
          Connect Spotify
        </button>
      </div>
    </div>
  );
}
