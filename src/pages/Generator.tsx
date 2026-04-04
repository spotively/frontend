import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { toPng } from 'html-to-image';

// @ts-ignore
import catBg from '../assets/cat.png';
// @ts-ignore
import heartBg from '../assets/heart.png';
// @ts-ignore
import skyBg from '../assets/sky.png';

interface PlaylistItem {
  name: string;
  subtitle: string;
  image: string;
}

export default function Generator() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'tracks';
  const timeRange = searchParams.get('timeRange') || 'medium_term';
  const limit = searchParams.get('limit') || '5';

  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [userProfile, setUserProfile] = useState<{name: string, image: string} | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string>(catBg);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  const [loading, setLoading] = useState(true);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [type, timeRange, limit]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [topRes, meRes] = await Promise.all([
        apiFetch<{ items: PlaylistItem[] }>(`/api/top?type=${type}&timeRange=${timeRange}&limit=${limit}`),
        apiFetch<{ name: string, image: string }>('/api/me').catch(() => null)
      ]);
      setItems(topRes.items);
      setUserProfile(meRes);
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateAIAesthetic = async () => {
    setGeneratingAi(true);
    try {
        const response = await apiFetch<{ success: boolean; base64: string }>(`/api/generate-image?type=${type}&timeRange=${timeRange}&limit=${limit}&raw=true`);
        setBackgroundUrl(response.base64);
    } catch(err) {
        console.error("AI Generation Error", err);
        alert("Failed to imagine AI Aesthetic. Try again later.");
    } finally {
        setGeneratingAi(false);
    }
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, 
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = `Spotively-Vibe-${orientation}-${type}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
        console.error("Download failed", err);
    } finally {
        setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-black font-sans px-4 py-8">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center border-b border-[#E0E0E0] pb-8 mb-12">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-black font-bold transition-colors uppercase text-xs tracking-widest"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-black">SHARE POSTER</h2>
        <div className="w-40"></div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full h-[60vh] space-y-6">
          <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin rounded-full"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Your Vibe...</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-16 pb-20">
          
          {/* LEFT: THE POSTER AND CARDS */}
          <div className={`w-full ${orientation === 'landscape' ? 'max-w-[720px]' : 'max-w-[360px]'} flex-shrink-0 transition-all duration-500 ease-out`}>
            {/* Download Target Container */}
            <div 
                ref={posterRef} 
                className={`w-full ${orientation === 'landscape' ? 'aspect-[16/9]' : 'aspect-[9/16]'} relative overflow-hidden rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.2)] bg-black transition-all duration-500`}
                style={{
                    backgroundImage: `url(${backgroundUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Skeuomorphic Glass Container */}
                <div className="absolute inset-5 rounded-[24px] border border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.2)] overflow-hidden">
                    {/* Blurred background layer — replaces backdrop-blur for export compatibility */}
                    <div 
                        className="absolute inset-0 scale-[1.1]"
                        style={{
                            backgroundImage: `url(${backgroundUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(16px)',
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-white/15"></div>
                <div className="relative p-6 flex flex-col h-full">
                    {/* User Profile */}
                    {userProfile && (
                        <div className="absolute bottom-6 right-6 flex items-center space-x-1.5 opacity-60 z-20">
                            <span className="text-[8px] font-bold text-white uppercase tracking-widest mt-0.5 mr-1 drop-shadow-sm">Made with <span className="text-red-400 opacity-80 mx-0.5 animate-pulse">♥</span> for</span>
                            <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none mt-0.5 drop-shadow-sm">{userProfile.name}</span>
                            {userProfile.image ? (
                                <img src={userProfile.image} alt={userProfile.name} className="w-4 h-4 rounded-full object-cover" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                                    <span className="text-[8px]">👤</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Header */}
                    <div className={`mb-4 border-b border-white/20 pb-3 text-white ${orientation === 'landscape' ? 'flex justify-between items-end' : ''}`}>
                        <div>
                            <h3 className="font-black text-[10px] tracking-[0.2em] uppercase opacity-70">SPOTIVELY RECEIPT</h3>
                            <h4 className="font-black text-2xl mt-1 tracking-tight leading-none drop-shadow-md flex items-baseline gap-2 flex-wrap">
                                <span>Top {limit} {type === 'tracks' ? 'Tracks' : 'Artists'}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                                    · {timeRange === 'short_term' ? 'Last Month' : timeRange === 'medium_term' ? 'Last 6 Months' : 'All Time'}
                                </span>
                            </h4>
                        </div>
                    </div>

                    {/* Data List */}
                    <div className={`flex-1 overflow-hidden ${orientation === 'landscape' && items.length > 5 ? 'grid grid-cols-2 gap-x-12 gap-y-2 content-start pt-2' : 'flex flex-col justify-center space-y-[10px]'} text-white`}>
                        {items.map((item, i) => (
                            <div key={i} className="flex items-center border-b border-white/10 pb-1.5 opacity-90 gap-2.5">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className={`${orientation === 'portrait' && items.length > 5 ? 'w-6 h-6' : 'w-8 h-8'} rounded-md object-cover flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.3)]`} />
                                ) : (
                                    <div className={`${orientation === 'portrait' && items.length > 5 ? 'w-6 h-6' : 'w-8 h-8'} rounded-md bg-white/10 flex-shrink-0 flex items-center justify-center`}>
                                        <span className="text-[8px]">🎵</span>
                                    </div>
                                )}
                                <div className="flex-1 overflow-hidden mr-2">
                                    <h5 className={`font-extrabold truncate drop-shadow-sm ${orientation === 'portrait' && items.length > 5 ? 'text-[11px]' : 'text-[13px]'}`}>{item.name}</h5>
                                    <p className={`font-semibold opacity-60 truncate uppercase leading-tight ${orientation === 'portrait' && items.length > 5 ? 'text-[8px] mt-0.5' : 'text-[9px]'}`}>{item.subtitle}</p>
                                </div>
                                <span className={`font-black opacity-30 flex-shrink-0 ${orientation === 'portrait' && items.length > 5 ? 'text-[9px]' : 'text-[10px]'}`}>{(i + 1).toString().padStart(2, '0')}</span>
                            </div>
                        ))}
                    </div>
                </div>
                </div>
            </div>
          </div>

          {/* RIGHT: THE CONTROLS */}
          <div className="flex-1 w-full max-w-sm flex flex-col space-y-12 shrink-0">
            <div className="hidden lg:block">
                <h3 className="font-bold text-xs tracking-widest uppercase mb-5 text-gray-400">Orientation</h3>
                <div className="flex bg-[#E0E0E0]/30 rounded-full p-1 relative">
                    <button 
                        onClick={() => setOrientation('portrait')}
                        className={`flex-1 py-3 px-6 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all z-10 ${orientation === 'portrait' ? 'text-black bg-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                    >
                        Portrait
                    </button>
                    <button 
                        onClick={() => setOrientation('landscape')}
                        className={`flex-1 py-3 px-6 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all z-10 ${orientation === 'landscape' ? 'text-black bg-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                    >
                        Landscape
                    </button>
                </div>
            </div>

            <div className="border-t border-[#E0E0E0] pt-8">
                <h3 className="font-bold text-xs tracking-widest uppercase mb-5 text-gray-400">Backdrop Selection</h3>
                <div className="flex gap-4">
                    <button onClick={() => setBackgroundUrl(catBg)} className={`w-[84px] h-[84px] rounded-[20px] overflow-hidden border-4 transition-all duration-300 ${backgroundUrl === catBg ? 'border-black scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={catBg} className="w-full h-full object-cover" />
                    </button>
                    <button onClick={() => setBackgroundUrl(heartBg)} className={`w-[84px] h-[84px] rounded-[20px] overflow-hidden border-4 transition-all duration-300 ${backgroundUrl === heartBg ? 'border-black scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={heartBg} className="w-full h-full object-cover" />
                    </button>
                    <button onClick={() => setBackgroundUrl(skyBg)} className={`w-[84px] h-[84px] rounded-[20px] overflow-hidden border-4 transition-all duration-300 ${backgroundUrl === skyBg ? 'border-black scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={skyBg} className="w-full h-full object-cover" />
                    </button>
                </div>
            </div>

            <div className="border-t border-[#E0E0E0] pt-8">
               <h3 className="font-bold text-xs tracking-widest uppercase mb-5 text-gray-400">Gemini AI Generation</h3>
               <button 
                  onClick={generateAIAesthetic} 
                  disabled={generatingAi}
                  className="w-full py-5 bg-[#E5D9F2] text-black border-2 border-black rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(229,217,242,0.6)] hover:bg-[#D4C4E4] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
               >
                 {generatingAi ? (
                     <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
                 ) : "Imagine Custom Backdrop"}
               </button>
            </div>

            <div className="border-t border-[#E0E0E0] pt-8 mt-auto">
               <button 
                  onClick={handleDownload} 
                  disabled={downloading}
                  className="w-full py-5 bg-black text-white rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
               >
                 {downloading ? (
                     <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                 ) : "Download Image"}
               </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
