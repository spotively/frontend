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
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleGenerate = () => {
    navigate(`/generate?type=${type}&timeRange=${timeRange}&limit=${limit}`);
  };

  const activeItem = data[activeIndex];

  return (
    <div className="h-screen bg-[#FAF9F6] text-black font-sans relative overflow-hidden flex flex-col md:flex-row selection:bg-[#F4CCCC]">

      {/* ========== MOBILE / TABLET VIEW (< lg) ========== */}
      <div className="lg:hidden flex flex-col h-screen relative">
        {/* Background Image */}
        {activeItem?.image && (
          <div className="absolute inset-0 z-0">
            <img src={activeItem.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90"></div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="relative z-20 flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-white rounded-full flex flex-col items-center justify-center space-y-[2px]">
              <div className="w-[14px] h-[2px] bg-black rounded-full mt-0.5 translate-x-0.5 rotate-[-5deg]"></div>
              <div className="w-[16px] h-[2px] bg-black rounded-full"></div>
              <div className="w-[14px] h-[2px] bg-black rounded-full mb-0.5 -translate-x-0.5 rotate-[5deg]"></div>
            </div>
            <span className="font-bold tracking-tight text-white text-lg">Spotively</span>
          </div>
          
          {/* Hamburger Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center space-y-1.5 transition-all hover:bg-white/25"
          >
            <div className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}></div>
            <div className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}></div>
          </button>
        </div>

        {/* Slide-down Menu */}
        <div className={`relative z-30 overflow-hidden transition-all duration-500 ease-out ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="mx-6 mb-4 p-6 rounded-[24px] bg-black/50 backdrop-blur-xl border border-white/10">
            {/* Filter */}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Filter</h3>
            <div className="flex gap-2 mb-5">
              {(['tracks', 'artists'] as TopType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setMenuOpen(false); }}
                  className={`flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${type === t ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Time Range */}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Time Range</h3>
            <div className="flex gap-2 mb-5">
              {TIME_RANGES.map((tr) => (
                <button
                  key={tr.value}
                  onClick={() => { setTimeRange(tr.value); setMenuOpen(false); }}
                  className={`flex-1 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === tr.value ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  {tr.label}
                </button>
              ))}
            </div>

            {/* Count */}
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Count</h3>
            <div className="flex gap-2 mb-5">
              {([5, 10] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => { setLimit(n); setMenuOpen(false); }}
                  className={`flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${limit === n ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  Top {n}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-white/10">
              <button onClick={handleGenerate} className="flex-1 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform">
                Share Poster
              </button>
              <button onClick={handleLogout} className="py-3 px-5 rounded-full text-white/50 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors border border-white/10">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Item List — overlaid on the background image */}
        <div className="relative z-10 flex-1 flex flex-col px-6 pb-20 overflow-y-auto pt-4">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-white border-t-transparent animate-spin rounded-full"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-xl font-black text-white/40 tracking-tight">No {type} found</div>
            </div>
          ) : (
            <>
              {/* Title */}
              <h2 className="text-white font-black text-3xl tracking-tight mb-6 drop-shadow-lg">
                {type === 'tracks' ? 'Most Played' : 'Top Artists'}
              </h2>

              <ul ref={listRef} className="space-y-3">
                {data.map((item, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <li 
                      key={index} 
                      className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-white/20 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.2)]' : 'hover:bg-white/10'}`}
                      onClick={() => setActiveIndex(index)}
                    >
                      {/* Rank Number */}
                      <span className="text-white/30 font-black text-sm w-6 text-center flex-shrink-0">{(index + 1).toString().padStart(2, '0')}</span>
                      
                      {/* Thumbnail */}
                      {item.image ? (
                        <img src={item.image} alt={item.name} className={`w-12 h-12 rounded-xl object-cover flex-shrink-0 transition-all duration-300 ${isActive ? 'shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : ''}`} />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🎵</span>
                        </div>
                      )}

                      {/* Text */}
                      <div className="flex-1 overflow-hidden">
                        <p className={`font-bold text-sm truncate transition-colors ${isActive ? 'text-white' : 'text-white/70'}`}>{item.name}</p>
                        <p className={`text-xs font-semibold truncate transition-colors ${isActive ? 'text-white/60' : 'text-white/40'}`}>{item.subtitle}</p>
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
      {/* Background SVG Gradient */}
      <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] pointer-events-none z-0 opacity-80 mix-blend-multiply">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full drop-shadow-2xl">
            <path d="M 0 100 Q 50 -20 100 100 Z" fill="#E6EEF6" opacity="0.6" />
            <path d="M 10 100 Q 50 10 90 100 Z" fill="#E5D9F2" opacity="0.8" />
            <path d="M 20 100 Q 50 40 80 100 Z" fill="#F4CCCC" opacity="0.9" />
        </svg>
      </div>

      {/* Left Column — Desktop Only */}
      <div className="hidden lg:flex w-[350px] p-10 flex-col z-10 justify-between min-h-screen border-r border-gray-200/50 bg-[#FAF9F6]/80 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 mb-20">
            <div className="w-8 h-8 bg-black rounded-full flex flex-col items-center justify-center space-y-[3px]">
                <div className="w-[18px] h-[3px] bg-white rounded-full mt-1 translate-x-0.5 rotate-[-5deg]"></div>
                <div className="w-[20px] h-[3px] bg-white rounded-full"></div>
                <div className="w-[18px] h-[3px] bg-white rounded-full mb-1 -translate-x-0.5 rotate-[5deg]"></div>
            </div>
            <span className="font-bold tracking-tight text-xl">Spotively</span>
          </div>

          <h1 className="text-[3.5rem] font-sans font-black leading-[1.05] tracking-tight mb-4">
            Your Vibe<br/>Wrapped
          </h1>
          <p className="text-sm font-semibold text-gray-800 mb-16">Relive the music that made your period</p>

          <div className="space-y-10">
            <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-300 pb-2">Filter</h3>
               <div className="space-y-3">
                 {(['tracks', 'artists'] as TopType[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`w-full text-left font-bold text-xl flex justify-between items-center transition-colors ${type === t ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <span className="capitalize">Top {t}</span>
                        <span className="text-2xl font-light leading-none">{type === t ? '-' : '+'}</span>
                    </button>
                 ))}
               </div>
            </div>
            
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-300 pb-2">Time Range</h3>
                <div className="space-y-3">
                 {TIME_RANGES.map((tr) => (
                    <button
                        key={tr.value}
                        onClick={() => setTimeRange(tr.value)}
                        className={`w-full text-left font-bold text-xl flex justify-between items-center transition-colors ${timeRange === tr.value ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <span>{tr.label}</span>
                        <span className="text-2xl font-light leading-none">{timeRange === tr.value ? '-' : '+'}</span>
                    </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 pt-12">
            <button onClick={handleGenerate} className="bg-black text-white rounded-full py-4 px-8 font-black tracking-widest text-[10px] uppercase hover:scale-[1.02] transition-transform text-center shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              Share Poster
            </button>
            <button onClick={handleLogout} className="text-gray-400 hover:text-black font-bold text-xs tracking-wider uppercase transition-colors">
                Logout
            </button>
        </div>
      </div>

      {/* Center Column — Desktop Only */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-8 z-10 min-h-[50vh]">
        {loading ? (
            <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin rounded-full"></div>
        ) : data.length === 0 ? (
            <div className="text-2xl font-black text-gray-300 tracking-tight">No {type} found</div>
        ) : activeItem ? (
            <div className="flex flex-col items-center w-full max-w-sm fade-in">
                {/* Album Cover Wrapper */}
                <div className="w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden mb-12 hover:-translate-y-2 transition-transform duration-500 ease-out">
                    {activeItem.image ? (
                        <img src={activeItem.image} alt={activeItem.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-6xl text-gray-400">🎵</span>
                        </div>
                    )}
                </div>
            </div>
        ) : null}
      </div>

      {/* Right Column — Desktop Only */}
      <div className="hidden lg:flex w-[320px] pt-10 px-10 pb-0 z-10 bg-white/40 backdrop-blur-md border-l border-gray-200/50 h-screen flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h3 className="font-extrabold text-xs tracking-wide uppercase text-right leading-none">
            {type === 'tracks' ? 'Most Played' : 'Top Artists'}
          </h3>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 border border-[#E0E0E0] rounded-full px-2 py-0.5">
            <button onClick={() => setLimit(5)} className={`transition-colors ${limit === 5 ? 'text-black' : 'hover:text-gray-600'}`}>5</button>
            <span className="text-gray-300">/</span>
            <button onClick={() => setLimit(10)} className={`transition-colors ${limit === 10 ? 'text-black' : 'hover:text-gray-600'}`}>10</button>
          </div>
        </div>
        
        {loading || data.length === 0 ? null : (
            <div className="relative pt-4 pb-20 flex-1 overflow-y-auto scrollbar-hide">
                {/* Connecting Line */}
                <div className="absolute right-[7px] top-6 bottom-6 w-[2px] bg-gray-200 -z-10 rounded-full"></div>

                <ul ref={listRef} className="space-y-8 relative z-10">
                {data.map((item, index) => {
                    const isActive = activeIndex === index;
                    return (
                    <li 
                        key={index} 
                        className="flex justify-end items-center cursor-pointer group"
                        onMouseEnter={() => setActiveIndex(index)}
                    >
                        <div className="text-right mr-6 max-w-[220px]">
                            <AutoScrollText 
                                text={item.name} 
                                className={`font-bold transition-colors text-sm ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-gray-800'}`} 
                            />
                            <AutoScrollText 
                                text={item.subtitle} 
                                className={`text-xs font-semibold transition-colors mt-0.5 ${isActive ? 'text-gray-600' : 'text-gray-300 group-hover:text-gray-500'}`} 
                            />
                        </div>
                        {/* Dot */}
                        <div className={`w-4 h-4 rounded-full border-[3px] transition-all duration-300 ${isActive ? 'bg-[#F4CCCC] border-white shadow-[0_0_10px_rgba(244,204,204,0.8)] scale-[1.3]' : 'bg-white border-gray-200 group-hover:border-gray-400'} flex-shrink-0 z-10`}></div>
                    </li>
                    )
                })}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
}
