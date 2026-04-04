import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

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
    window.location.href = 'http://127.0.0.1:3000/auth/login';
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative overflow-hidden">
      {/* Background Pastel Spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F4CCCC]/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      <h1 ref={titleRef} className="text-6xl md:text-[8rem] font-sans font-black tracking-tighter mb-6 text-black uppercase leading-[0.9]">
        Spotively
      </h1>
      <p ref={subtitleRef} className="text-lg md:text-2xl text-gray-500 mb-16 max-w-2xl font-medium">
        A minimalist aesthetic visualization of your top music.
        Relive the vibe that made your period.
      </p>
      <button
        ref={buttonRef as any}
        onClick={handleLogin}
        className="px-12 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-sm shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] active:scale-95"
      >
        Connect Spotify
      </button>
    </div>
  );
}
