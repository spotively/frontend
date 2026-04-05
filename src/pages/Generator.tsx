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
  const [userProfile, setUserProfile] = useState<{ name: string, image: string } | null>(null);
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
    } catch (err) {
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
    <div className="min-h-screen bg-brand-cream text-[#2D2A2A] font-sans px-4 py-8 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-teal/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-brand-lavender/30 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <header className="w-full max-w-6xl mx-auto flex justify-between items-center border-b border-[#2D2A2A]/5 pb-8 mb-12 relative z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[#2D2A2A]/40 hover:text-brand-purple font-black transition-colors uppercase text-[10px] tracking-[0.2em]"
        >
          ← Back to Dashboard
        </button>
        <div className="w-40"></div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full h-[60vh] space-y-6 relative z-10">
          <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent animate-spin rounded-full shadow-lg"></div>
          <p className="text-[#2D2A2A]/40 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading Your Vibe...</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-16 pb-20 relative z-10">

          <div className={`w-full ${orientation === 'landscape' ? 'max-w-[720px]' : 'max-w-[360px]'} flex-shrink-0 transition-all duration-500 ease-out`}>
            
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
                      <span className="text-[8px] font-bold text-white uppercase tracking-widest mt-0.5 mr-1 drop-shadow-sm">Made with 💖 for</span>
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
                  <div className={`flex-1 overflow-hidden ${orientation === 'landscape' && items.length > 5 ? 'grid grid-cols-2 gap-x-12 gap-y-2 content-start pt-2' : 'flex flex-col justify-start space-y-[4px] pt-1'} text-white`}>
                    {items.map((item, i) => (
                      <div key={i} className={`flex items-center border-b border-white/10 ${items.length > 5 ? 'pb-1' : 'pb-1.5'} opacity-90 gap-2.5`}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} className={`${orientation === 'portrait' && items.length > 5 ? 'w-5 h-5' : 'w-8 h-8'} rounded-md object-cover flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.3)]`} />
                        ) : (
                          <div className={`${orientation === 'portrait' && items.length > 5 ? 'w-5 h-5' : 'w-8 h-8'} rounded-md bg-white/10 flex-shrink-0 flex items-center justify-center`}>
                            <span className="text-[6px]">🎵</span>
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden mr-2">
                          <h5 className={`font-extrabold truncate drop-shadow-sm ${orientation === 'portrait' && items.length > 5 ? 'text-[10px]' : 'text-[13px]'}`}>{item.name}</h5>
                          <p className={`font-semibold opacity-60 truncate uppercase leading-tight ${orientation === 'portrait' && items.length > 5 ? 'text-[7px] mt-0' : 'text-[9px]'}`}>{item.subtitle}</p>
                        </div>
                        <span className={`font-black opacity-30 flex-shrink-0 ${orientation === 'portrait' && items.length > 5 ? 'text-[8px]' : 'text-[10px]'}`}>{(i + 1).toString().padStart(2, '0')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-sm flex flex-col space-y-10 shrink-0 glass-card p-8 rounded-[40px]">
            
            <div className="hidden lg:block">
              <h3 className="font-black text-[10px] tracking-[0.2em] uppercase mb-4 text-[#2D2A2A]/40">Orientation</h3>
              <div className="flex bg-white/40 rounded-full p-1 border border-white/60 shadow-inner">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`flex-1 py-3 px-6 rounded-full font-black text-[9px] uppercase tracking-[0.2em] transition-all z-10 ${orientation === 'portrait' ? 'text-white bg-brand-purple shadow-md' : 'text-[#2D2A2A]/60 hover:text-[#2D2A2A]'}`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`flex-1 py-3 px-6 rounded-full font-black text-[9px] uppercase tracking-[0.2em] transition-all z-10 ${orientation === 'landscape' ? 'text-white bg-brand-purple shadow-md' : 'text-[#2D2A2A]/60 hover:text-[#2D2A2A]'}`}
                >
                  Landscape
                </button>
              </div>
            </div>

            <div className="border-t border-[#2D2A2A]/5 pt-8">
              <h3 className="font-black text-[10px] tracking-[0.2em] uppercase mb-4 text-[#2D2A2A]/40">Backdrop Selection</h3>
              <div className="flex gap-4">
                <button onClick={() => setBackgroundUrl(catBg)} className={`w-[84px] h-[84px] rounded-[24px] overflow-hidden border-4 transition-all duration-300 ${backgroundUrl === catBg ? 'border-brand-purple scale-105 shadow-xl' : 'border-white/60 opacity-60 hover:opacity-100 hover:border-white'}`}>
                  <img src={catBg} className="w-full h-full object-cover" />
                </button>
                <button onClick={() => setBackgroundUrl(heartBg)} className={`w-[84px] h-[84px] rounded-[24px] overflow-hidden border-4 transition-all duration-300 ${backgroundUrl === heartBg ? 'border-brand-purple scale-105 shadow-xl' : 'border-white/60 opacity-60 hover:opacity-100 hover:border-white'}`}>
                  <img src={heartBg} className="w-full h-full object-cover" />
                </button>
                <button onClick={() => setBackgroundUrl(skyBg)} className={`w-[84px] h-[84px] rounded-[24px] overflow-hidden border-4 transition-all duration-300 ${backgroundUrl === skyBg ? 'border-brand-purple scale-105 shadow-xl' : 'border-white/60 opacity-60 hover:opacity-100 hover:border-white'}`}>
                  <img src={skyBg} className="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            <div className="border-t border-[#2D2A2A]/5 pt-8">
              <h3 className="font-black text-[10px] tracking-[0.2em] uppercase mb-4 text-[#2D2A2A]/40">Gemini AI Generation</h3>
              <button
                onClick={generateAIAesthetic}
                disabled={generatingAi}
                className="w-full py-5 bg-brand-teal text-[#2D2A2A] rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center border border-white/60"
              >
                {generatingAi ? (
                  <div className="w-4 h-4 border-2 border-[#2D2A2A] border-t-transparent animate-spin rounded-full"></div>
                ) : "Imagine Custom Backdrop"}
              </button>
            </div>

            <div className="border-t border-[#2D2A2A]/5 pt-8 mt-auto">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-5 bg-brand-purple text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center border border-white/20"
              >
                {downloading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                ) : "Download Vibe"}
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
