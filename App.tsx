
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExpertProfile, AdviceResponse, UserProfile } from './types';
import { PRESET_EXPERTS } from './constants';
import { fetchCyberAdvice } from './services/geminiService';
import { MarkdownRenderer } from './components/MarkdownRenderer';

const App: React.FC = () => {
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile>(PRESET_EXPERTS[0]);
  const [customName, setCustomName] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: "13",
    gender: "男孩",
    dream: "网络安全与黑客技术"
  });

  const [adviceCache, setAdviceCache] = useState<Record<string, AdviceResponse>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for auto-scrolling
  const buttonRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    
    const customProfile: ExpertProfile = {
      id: `custom-${Date.now()}`,
      name: customName,
      title: "Custom Expert Persona",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName)}&background=random&color=fff`,
      gradient: "from-gray-700 to-gray-900",
      icon: "fa-user-secret",
      isCustom: true
    };
    
    setIsCustomMode(true);
    setSelectedExpert(customProfile);
  };

  const loadAdvice = useCallback(async (expert: ExpertProfile, profile: UserProfile) => {
    const cacheKey = `${expert.name}-${profile.age}-${profile.gender}-${profile.dream}`;
    
    // If we already have advice for this specific combo in cache, use it
    if (adviceCache[cacheKey]) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCyberAdvice(expert.name, profile, expert.description);
      setAdviceCache(prev => ({ ...prev, [cacheKey]: data }));
    } catch (err) {
      setError("无法生成计划，请检查网络连接或稍后重试。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adviceCache]);

  // Trigger load when selected expert changes (we also listen to manual updates)
  useEffect(() => {
    loadAdvice(selectedExpert, userProfile);
  }, [selectedExpert, loadAdvice]); // Intentionally omitting userProfile to prevent auto-reload on every keystroke

  // Auto-scroll to selected preset
  useEffect(() => {
    if (!isCustomMode && selectedExpert.id) {
      const el = buttonRefs.current.get(selectedExpert.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedExpert.id, isCustomMode]);

  const cacheKey = `${selectedExpert.name}-${userProfile.age}-${userProfile.gender}-${userProfile.dream}`;
  const currentAdvice = adviceCache[cacheKey];

  const handleProfileUpdate = () => {
     // Force reload by clearing cache for this key or just calling loadAdvice
     // Since loadAdvice checks cache, we can just call it.
     // But if we want to force refresh despite cache (e.g. slight text change), we might need to handle that.
     // For now, let's assume if the user clicks "Update Plan", they changed something that made the key unique.
     loadAdvice(selectedExpert, userProfile);
  };

  const copyToClipboard = () => {
    if (currentAdvice) {
      navigator.clipboard.writeText(currentAdvice.content);
      alert("计划已复制到剪贴板！");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="max-w-5xl w-full text-center mb-8">
        <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          Dream Architect v2.0
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-emerald-500">
          Cyber Dream Architect
        </h1>
      </header>

      {/* User Profile Context Section */}
      <div className="max-w-4xl w-full bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-10 shadow-2xl backdrop-blur-sm">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <i className="fa-solid fa-id-card"></i> 你的档案
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-gray-500 text-sm whitespace-nowrap">我今年</span>
            <input 
              type="number" 
              value={userProfile.age}
              onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 w-20 text-center font-bold focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-gray-500 text-sm whitespace-nowrap">岁，是一个</span>
          </div>
          
          <div className="w-full md:w-32">
             <select 
               value={userProfile.gender}
               onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})}
               className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 font-bold focus:border-indigo-500 focus:outline-none appearance-none"
             >
               <option value="男孩">男孩</option>
               <option value="女孩">女孩</option>
               <option value="学生">学生 (不限)</option>
             </select>
          </div>

          <div className="flex items-center gap-3 w-full">
             <span className="text-gray-500 text-sm whitespace-nowrap">我的梦想是</span>
             <input 
               type="text" 
               value={userProfile.dream}
               onChange={(e) => setUserProfile({...userProfile, dream: e.target.value})}
               className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 font-bold focus:border-indigo-500 focus:outline-none"
               placeholder="例如：成为顶尖黑客、AI科学家..."
             />
          </div>
          
          <button 
             onClick={handleProfileUpdate}
             className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors shadow-lg shadow-indigo-500/20"
          >
            更新计划
          </button>
        </div>
      </div>

      {/* Input for Custom Expert */}
      <div className="max-w-xl w-full mb-12 relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 ${isCustomMode ? 'opacity-75' : ''}`}></div>
        <form 
          onSubmit={handleCustomSubmit} 
          className={`relative flex items-center bg-gray-900 rounded-lg p-1 border transition-all duration-300 ${isCustomMode ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-gray-700'}`}
        >
           <div className={`pl-4 transition-colors ${isCustomMode ? 'text-pink-400' : 'text-gray-400'}`}>
             <i className="fa-solid fa-wand-magic-sparkles"></i>
           </div>
           <input 
             type="text" 
             value={customName}
             onChange={(e) => setCustomName(e.target.value)}
             placeholder="邀请导师 (例如: 乔布斯, 图灵...)"
             className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder-gray-500 font-medium"
           />
           <button 
             type="submit"
             className={`px-6 py-2 rounded-md font-bold transition-colors text-white ${isCustomMode ? 'bg-pink-600 hover:bg-pink-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
           >
             咨询导师
           </button>
        </form>
      </div>

      {/* Preset Experts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 max-w-6xl w-full">
        {PRESET_EXPERTS.map((p) => (
          <button
            key={p.id}
            ref={(el) => buttonRefs.current.set(p.id, el)}
            onClick={() => {
              setIsCustomMode(false);
              setSelectedExpert(p);
            }}
            className={`relative flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 border text-left overflow-hidden group scroll-m-2
              ${!isCustomMode && selectedExpert.id === p.id 
                ? `bg-gray-800 border-indigo-500/60 ring-1 ring-indigo-500/60 shadow-lg shadow-indigo-500/10` 
                : 'bg-gray-900/40 border-gray-800/60 opacity-60 hover:opacity-100 hover:border-gray-600 hover:bg-gray-800'}`}
          >
            {!isCustomMode && selectedExpert.id === p.id && (
              <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-10`} />
            )}
            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" />
            <div className="min-w-0">
              <div className="font-bold text-gray-200 text-sm truncate">{p.name}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider truncate">{p.title.split(' ')[0]}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="max-w-4xl w-full bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden min-h-[500px] flex flex-col relative mb-16">
        {/* Custom Persona Header Indicator (if custom) */}
        {isCustomMode && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"></div>
        )}

        {loading && (!currentAdvice || selectedExpert.name !== currentAdvice.expertName) ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-12">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-indigo-500/20 rounded-full animate-ping absolute inset-0"></div>
              <div className="w-20 h-20 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-indigo-400 font-mono text-sm tracking-widest uppercase mb-2">Connecting to {selectedExpert.name}...</p>
              <p className="text-gray-500 text-xs">Customizing plan for a {userProfile.age}-year-old {userProfile.dream} enthusiast</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
             <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl mb-4"></i>
            <p className="text-red-400 mb-6 font-medium">{error}</p>
            <button 
              onClick={() => loadAdvice(selectedExpert, userProfile)}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
            >
              Retry
            </button>
          </div>
        ) : currentAdvice ? (
          <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-800/50 pb-6">
              <div className="flex items-center gap-4">
                <img src={selectedExpert.avatar} className="w-16 h-16 rounded-2xl ring-4 ring-gray-800" alt={selectedExpert.name} />
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white">{selectedExpert.name}</h2>
                  <p className="text-indigo-400 text-sm font-medium uppercase tracking-wide">
                    {selectedExpert.isCustom ? 'Custom Mentor Profile' : selectedExpert.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={copyToClipboard}
                className="self-start md:self-center text-gray-500 hover:text-white transition-colors p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800"
                title="Copy Roadmap"
              >
                <i className="fa-solid fa-copy mr-2"></i>
                <span className="text-xs font-bold">COPY PLAN</span>
              </button>
            </div>
            
            <MarkdownRenderer content={currentAdvice.content} />

            {/* Grounding Sources */}
            {currentAdvice.sources && currentAdvice.sources.length > 0 && (
              <div className="mt-12 pt-6 border-t border-gray-800/50">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-earth-asia"></i> 
                  Verified Sources
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentAdvice.sources.map((src, i) => (
                    src.web && (
                      <a 
                        key={i} 
                        href={src.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gray-800/50 hover:bg-indigo-900/30 border border-gray-700/50 hover:border-indigo-500/30 px-3 py-1.5 rounded text-[10px] text-gray-400 hover:text-indigo-300 transition-all flex items-center gap-2 truncate max-w-[250px]"
                      >
                         <i className="fa-solid fa-link text-[8px]"></i>
                        <span className="truncate">{src.web.title}</span>
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>

      <footer className="text-gray-600 text-[10px] flex flex-col items-center gap-2 pb-8">
        <div className="flex items-center gap-1.5">
          <i className="fa-brands fa-google"></i>
          <span>Powered by Gemini 3 Flash + Google Search</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
