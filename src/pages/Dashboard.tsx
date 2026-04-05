import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../api/client';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';

type TopType = 'tracks' | 'artists';
type TimeRangeType = 'short_term' | 'medium_term' | 'long_term';

const TIME_RANGES: { value: TimeRangeType; label: string }[] = [
  { value: 'short_term', label: 'Last Month' },
  { value: 'medium_term', label: 'Last 6 Months' },
  { value: 'long_term', label: 'All Time' }
];

interface PlaylistItem {
  name: string;
  subtitle: string;
  image: string;
  genres?: string[];
}

interface TopResponse {
  type: string;
  items: PlaylistItem[];
}

const AutoScrollText = ({ text, className = '' }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setIsOverflowing(textRef.current.offsetWidth > containerRef.current.clientWidth);
    }
  }, [text]);

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap w-full ${isOverflowing ? 'text-left' : 'text-right'}`}>
      <div 
        className={`inline-block ${className} ${isOverflowing ? 'animate-marquee' : ''}`}
        style={{ paddingLeft: isOverflowing ? '100%' : '0' }}
      >
        <span ref={textRef}>{text}</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [type, setType] = useState<TopType>('tracks');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('medium_term');
  const [limit, setLimit] = useState<5 | 10>(5);
  const [data, setData] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [type, timeRange, limit]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<TopResponse>(`/api/top?type=${type}&timeRange=${timeRange}&limit=${limit}`);
      setData(response.items);
      setActiveIndex(0);
      
      if (listRef.current) {
        gsap.fromTo(listRef.current.children, 
          { opacity: 0, x: 20 }, 
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
        );
      }
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('spotify_access');
      localStorage.removeItem('spotify_refresh');
      navigate('/', { replace: true });
    }
  };

  const handleGenerate = () => {
    navigate(`/generate?type=${type}&timeRange=${timeRange}&limit=${limit}`);
  };

  const activeItem = data[activeIndex];

  return (
    <div className="h-screen bg-brand-cream text-[#2D2A2A] font-sans relative overflow-hidden flex flex-col lg:flex-row selection:bg-brand-lavender/30">

      {/* ========== MOBILE / TABLET VIEW (< lg) ========== */}
      <div className="lg:hidden flex flex-col h-screen relative z-0">
        {/* Background Image / Decorative Blur */}
        {activeItem?.image ? (
          <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
            <img src={activeItem.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-125 blur-lg transition-all duration-1000 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
          </div>
        ) : (
          <div className="absolute inset-0 -z-10 bg-[#121212]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-lavender/10 rounded-full blur-[100px]"></div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="relative z-20 flex items-center justify-between px-6 pt-8 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border border-white/20 rounded-full flex flex-col items-center justify-center space-y-[2px] shadow-sm backdrop-blur-md bg-white/5">
              <div className="w-[16px] h-[2px] bg-white rounded-full mt-0.5 translate-x-0.5 rotate-[-5deg]"></div>
              <div className="w-[18px] h-[2px] bg-white rounded-full"></div>
              <div className="w-[16px] h-[2px] bg-white rounded-full mb-0.5 -translate-x-0.5 rotate-[5deg]"></div>
            </div>
            <span className="font-black tracking-tighter text-white text-2xl uppercase">Spotively</span>
          </div>
          
          {/* Hamburger Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center space-y-1.5 transition-all active:scale-90"
          >
            <div className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}></div>
            <div className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}></div>
          </button>
        </div>

        {/* Slide-down Menu */}
        <div className={`relative z-30 overflow-hidden transition-all duration-500 ease-out ${menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="mx-4 mb-4 p-6 rounded-[32px] glass-card">
            {/* Filter */}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2D2A2A]/40 mb-3">Filter</h3>
            <div className="flex gap-2 mb-5">
              {(['tracks', 'artists'] as TopType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setMenuOpen(false); }}
                  className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${type === t ? 'bg-brand-purple text-white shadow-md' : 'bg-white/40 text-[#2D2A2A]/60 hover:bg-white/60'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Time Range */}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Time Range</h3>
            <div className="flex gap-2 mb-8">
              {TIME_RANGES.map((tr) => (
                <button
                  key={tr.value}
                  onClick={() => { setTimeRange(tr.value); setMenuOpen(false); }}
                  className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === tr.value ? 'bg-brand-teal text-[#2D2A2A] shadow-md' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  {tr.label}
                </button>
              ))}
            </div>

            {/* Count */}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Count</h3>
            <div className="flex gap-2 mb-8">
              {([5, 10] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLimit(l); setMenuOpen(false); }}
                  className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${limit === l ? 'bg-brand-lavender text-white shadow-md' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  {l.toString().padStart(2, '0')}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#2D2A2A]/5">
              <button onClick={handleGenerate} className="flex-1 py-4 bg-brand-purple text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                Share Poster
              </button>
              <button onClick={handleLogout} className="py-4 px-6 rounded-full glass-button text-[#2D2A2A]/60 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 flex flex-col px-6 pb-24 overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white animate-spin rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="mt-12 mb-10 flex flex-col items-start px-2">
                <h2 className="font-black text-[3.5rem] leading-none text-left text-white uppercase tracking-tighter">
                  Most<br/>Played
                </h2>
              </div>

              <ul ref={listRef} className="space-y-4">
                {data.map((item, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <li 
                      key={index} 
                      className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/10 backdrop-blur-2xl shadow-2xl' : 'bg-transparent'}`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <span className="text-white/30 font-black text-xs w-6 text-center">{(index + 1).toString().padStart(2, '0')}</span>
                      <div className="flex-1 overflow-hidden flex items-center gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden shadow-lg transition-transform ${isActive ? 'scale-110' : 'opacity-60'}`}>
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className={`font-black text-sm truncate uppercase tracking-tight ${isActive ? 'text-white' : 'text-white/60'}`}>{item.name}</p>
                          <p className={`text-[10px] font-bold truncate uppercase tracking-widest ${isActive ? 'text-brand-purple/80' : 'text-white/30'}`}>{item.subtitle}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* ========== DESKTOP VIEW (lg+) ========== */}
      {/* Background Decorative Circles */}
      <div className="hidden lg:block absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-brand-teal/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="hidden lg:block absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-brand-lavender/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Left Column — Desktop Only */}
      <div className="hidden lg:flex w-[380px] p-12 flex-col z-10 justify-between min-h-screen glass-card !bg-white/30 !border-r !border-white/40 !rounded-none">
        <div>
          <div className="flex items-center space-x-3 mb-24">
            <div className="w-10 h-10 bg-brand-purple rounded-full flex flex-col items-center justify-center space-y-[3px] shadow-lg border-2 border-white/20">
                <div className="w-[18px] h-[3px] bg-white rounded-full mt-1 translate-x-0.5 rotate-[-5deg]"></div>
                <div className="w-[20px] h-[3px] bg-white rounded-full"></div>
                <div className="w-[18px] h-[3px] bg-white rounded-full mb-1 -translate-x-0.5 rotate-[5deg]"></div>
            </div>
            <span className="font-black tracking-tighter text-2xl uppercase">Spotively</span>
          </div>

          <h1 className="text-[4rem] font-black leading-[0.9] tracking-tighter mb-4 uppercase text-[#2D2A2A]">
            The<br/>Vibe
          </h1>
          <p className="text-xs font-black uppercase tracking-widest text-brand-purple/60 mb-20">Aesthetic Music Stats</p>

          <div className="space-y-12">
            <div>
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D2A2A]/40 mb-6 border-b border-[#2D2A2A]/5 pb-3">Selection</h3>
               <div className="space-y-4">
                 {(['tracks', 'artists'] as TopType[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`w-full text-left font-black text-2xl flex justify-between items-center transition-all uppercase tracking-tighter ${type === t ? 'text-[#2D2A2A]' : 'text-[#2D2A2A]/20 hover:text-[#2D2A2A]/40'}`}
                    >
                        <span>Top {t}</span>
                        <div className={`w-2 h-2 rounded-full ${type === t ? 'bg-brand-purple' : 'bg-transparent'}`}></div>
                    </button>
                 ))}
               </div>
            </div>
            
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2D2A2A]/40 mb-6 border-b border-[#2D2A2A]/5 pb-3">Time Range</h3>
                <div className="space-y-4">
                 {TIME_RANGES.map((tr) => (
                    <button
                        key={tr.value}
                        onClick={() => setTimeRange(tr.value)}
                        className={`w-full text-left font-black text-xl flex justify-between items-center transition-all uppercase tracking-tight ${timeRange === tr.value ? 'text-[#2D2A2A]' : 'text-[#2D2A2A]/20 hover:text-[#2D2A2A]/40'}`}
                    >
                        <span>{tr.label}</span>
                        <div className={`w-2 h-2 rounded-full ${timeRange === tr.value ? 'bg-brand-teal' : 'bg-transparent'}`}></div>
                    </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 pt-12">
            <button onClick={handleGenerate} className="bg-brand-purple text-white rounded-full py-5 px-8 font-black tracking-widest text-[10px] uppercase shadow-xl hover:scale-[1.05] active:scale-95 transition-all text-center">
              Share Poster
            </button>
            <button onClick={handleLogout} className="text-[#2D2A2A]/40 hover:text-brand-purple font-black text-[10px] tracking-widest uppercase transition-colors text-center">
                Logout
            </button>
        </div>
      </div>

      {/* Center Column — Desktop Only */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-8 z-10">
        {loading ? (
            <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent animate-spin rounded-full"></div>
        ) : activeItem ? (
            <div className="flex flex-col items-center w-full max-w-lg">
                <div className="relative group">
                  {/* Glass Background Behind Image */}
                  <div className="absolute -inset-8 bg-white/20 blur-2xl rounded-full group-hover:bg-brand-teal/20 transition-all duration-1000"></div>
                  
                  <div className="relative w-80 h-80 lg:w-[480px] lg:h-[480px] rounded-[64px] shadow-2xl overflow-hidden border-8 border-white/60 hover:-translate-y-4 transition-all duration-700 ease-out">
                      {activeItem.image ? (
                          <img src={activeItem.image} alt={activeItem.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full bg-brand-teal/20 flex items-center justify-center">
                              <span className="text-8xl">🎵</span>
                          </div>
                      )}
                  </div>
                </div>
                
                <div className="mt-16 text-center max-w-md">
                   <h2 className="text-4xl font-black uppercase tracking-tighter text-[#2D2A2A] mb-2">{activeItem.name}</h2>
                   <p className="text-sm font-black uppercase tracking-[0.3em] text-brand-purple">{activeItem.subtitle}</p>
                </div>
            </div>
        ) : null}
      </div>

      {/* Right Column — Desktop Only */}
      <div className="hidden lg:flex w-[340px] pt-12 px-10 pb-10 z-10 glass-card !bg-white/20 !border-l !border-white/40 !rounded-none flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-10 flex-shrink-0">
          <h3 className="font-black text-[10px] tracking-[0.2em] uppercase text-[#2D2A2A]/40">
            Playback History
          </h3>
          <div className="flex items-center space-x-3 text-[10px] font-black text-[#2D2A2A]/40">
            <button onClick={() => setLimit(5)} className={`transition-all px-2 py-1 rounded-md ${limit === 5 ? 'bg-white/60 text-[#2D2A2A] shadow-sm' : 'hover:text-[#2D2A2A]'}`}>05</button>
            <button onClick={() => setLimit(10)} className={`transition-all px-2 py-1 rounded-md ${limit === 10 ? 'bg-white/60 text-[#2D2A2A] shadow-sm' : 'hover:text-[#2D2A2A]'}`}>10</button>
          </div>
        </div>
        
        {loading || data.length === 0 ? null : (
            <div className="relative flex-1 overflow-y-auto scrollbar-hide">
                <ul ref={listRef} className="space-y-6">
                {data.map((item, index) => {
                    const isActive = activeIndex === index;
                    return (
                    <li 
                        key={index} 
                        className={`group flex items-center gap-3 p-1 rounded-md cursor-pointer transition-all duration-500 ${isActive ? 'glass-card !border-none shadow-sm translate-x-[-3px]' : 'hover:bg-white/30'}`}
                        onMouseEnter={() => setActiveIndex(index)}
                    >
                        <span className={`text-[10px] font-black w-6 text-center ${isActive ? 'text-brand-purple' : 'text-[#2D2A2A]/20'}`}>{(index + 1)}</span>
                        
                        <div className="flex-1 overflow-hidden">
                            <p className={`font-black text-xs truncate uppercase tracking-tight transition-colors ${isActive ? 'text-[#2D2A2A]' : 'text-[#2D2A2A]/40 group-hover:text-[#2D2A2A]/60'}`}>
                                {item.name}
                            </p>
                            <p className={`text-[9px] font-bold truncate uppercase tracking-widest mt-0.5 transition-colors ${isActive ? 'text-brand-purple/60' : 'text-[#2D2A2A]/20 group-hover:text-[#2D2A2A]/30'}`}>
                                {item.subtitle}
                            </p>
                        </div>
                    </li>
                    )
                })}
                </ul>
            </div>
        )}
        
        <div className="mt-12 pt-8 border-t border-[#2D2A2A]/5">
            <div className="flex items-center justify-between text-[#2D2A2A]/30 font-black text-[9px] uppercase tracking-widest">
                <span>Ref: SP-{(activeIndex + 1).toString().padStart(3, '0')}</span>
                <span>Vibe Level: A+</span>
            </div>
        </div>
      </div>
    </div>
  );
}
