import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import QRCodeRenderer, { QRCodeHandle } from './components/QRCodeRenderer';
import { QRCodeConfig, DEFAULT_CONFIG, FileExtension } from './types';
import { QrCode, Settings2, Download, ChevronDown, Monitor, Image as ImageIcon, Share2, Moon, Sun, Layers, Palette } from 'lucide-react';

const App = () => {
  const [config, setConfig] = useState<QRCodeConfig>(DEFAULT_CONFIG);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'preview'>('content');
  const qrRef = useRef<QRCodeHandle>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleDownload = () => {
    qrRef.current?.download();
  };

  const presetSizes = [350, 500, 1000, 1200];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-900 transition-colors duration-200">
       
       {/* App Header */}
       <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-brand-600 to-brand-500 text-white p-2.5 rounded-xl shadow-lg shadow-brand-500/20">
                   <QrCode size={22} strokeWidth={2.5} />
                </div>
                <div>
                   <h1 className="font-bold text-xl leading-none text-slate-900 dark:text-white tracking-tight">QReator<span className="text-brand-600">.</span></h1>
                   <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Professional Studio</p>
                </div>
             </div>
             <div className="flex gap-2">
                <button 
                    onClick={() => setIsDark(!isDark)}
                    className="flex items-center justify-center w-9 h-9 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Toggle Dark Mode"
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Share2 size={14} /> Share
                </button>
             </div>
          </div>
       </header>

       {/* Main Content Grid */}
       <div className="max-w-7xl mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-8 items-start w-full flex-grow">
          
          {/* Left Column: Settings */}
          <div className={`lg:col-span-7 w-full min-w-0 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
             <Sidebar config={config} setConfig={setConfig} activeTab={activeTab} />
          </div>

          {/* Right Column: Preview */}
          <div className={`lg:col-span-5 w-full min-w-0 lg:sticky lg:top-28 ${activeTab === 'preview' ? 'block' : 'hidden md:block'}`}>
             
             {/* Modern Preview Card */}
             <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden relative ring-1 ring-slate-100 dark:ring-slate-800 transition-colors duration-200">
                
                {/* Preview Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 transition-colors duration-200">
                   <div className="flex items-center gap-2">
                       <Monitor size={16} className="text-slate-400 dark:text-slate-500" />
                       <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Preview Output</span>
                   </div>
                   <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-colors duration-200">
                       {config.size} x {config.size} px
                   </span>
                </div>

                {/* Canvas Area with Checkerboard for Transparency */}
                <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-7 overflow-hidden group transition-colors duration-200">
                    {/* Checkerboard Pattern for Transparency */}
                    <div className="absolute inset-0 dark:opacity-20" 
                         style={{ 
                             backgroundColor: '#ffffff',
                             backgroundImage: 'conic-gradient(#e2e8f0 90deg, transparent 90deg 180deg, #e2e8f0 180deg 270deg, transparent 270deg)',
                             backgroundSize: '24px 24px' 
                         }}>
                    </div>

                    {/* QR Container */}
                    <div className={`relative z-10 w-full max-w-[400px] aspect-square transition-all duration-300 ease-out transform group-hover:scale-[1.02] 
                        ${config.bgEnabled 
                            ? 'shadow-2xl shadow-slate-900/10' 
                            : 'drop-shadow-xl'}
                    `}>
                        <QRCodeRenderer ref={qrRef} config={config} className="w-full h-full" />
                    </div>
                </div>

                {/* Export Controls */}
                <div className="p-6 bg-white dark:bg-slate-800 space-y-6 relative z-20 transition-colors duration-200">
                    
                    {/* Size Selection */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Resolution</label>
                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{config.size}px</span>
                        </div>
                        
                        {/* Custom Range Slider */}
                        <div className="relative h-6 flex items-center">
                             <input 
                                type="range" min="250" max="2000" step="50" 
                                value={config.size} 
                                onChange={(e) => setConfig({...config, size: parseInt(e.target.value)})}
                                className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
                             />
                             <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative z-10 transition-colors duration-200">
                                 <div 
                                    className="h-full bg-brand-500 transition-all duration-100 ease-out" 
                                    style={{width: `${((config.size - 250) / (2000 - 250)) * 100}%`}}
                                 ></div>
                             </div>
                             <div 
                                className="absolute h-5 w-5 bg-white dark:bg-slate-800 border-2 border-brand-500 rounded-full shadow-md z-10 pointer-events-none transition-all duration-100 ease-out"
                                style={{left: `calc(${((config.size - 250) / (2000 - 250)) * 100}% - 10px)`}}
                             ></div>
                        </div>

                        <div className="flex justify-between gap-2 pt-1">
                            {presetSizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setConfig({...config, size})}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all
                                    ${config.size === size 
                                        ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-700 w-full transition-colors duration-200"></div>

                    {/* Download Action */}
                    <div className="flex gap-3">
                         <div className="relative w-[35%] group">
                            <select 
                                value={config.fileExt}
                                onChange={(e) => setConfig({...config, fileExt: e.target.value as FileExtension})}
                                className="w-full h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 block px-3 outline-none appearance-none cursor-pointer transition-colors"
                            >
                                <option value="png">PNG</option>
                                <option value="jpeg">JPG</option>
                                <option value="svg">SVG</option>
                                <option value="webp">WEBP</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                                <ChevronDown size={14} />
                            </div>
                            <span className="absolute -top-2 left-2 bg-white dark:bg-slate-800 px-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-brand-500 transition-colors">Format</span>
                        </div>

                        <button 
                            onClick={handleDownload}
                            className="flex-1 h-12 bg-slate-900 dark:bg-brand-600 hover:bg-black dark:hover:bg-brand-500 text-white active:scale-[0.98] font-bold rounded-xl text-sm shadow-xl shadow-slate-900/20 dark:shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
                        >
                            <Download size={18} /> 
                            <span>Download QR</span>
                        </button>
                    </div>
                </div>

             </div>
             
             <div className="mt-6 flex justify-center gap-6 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors duration-200">
                 <span className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"><ShieldCheck size={12}/> Secure</span>
                 <span className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"><Monitor size={12}/> High Res</span>
                 <span className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"><ImageIcon size={12}/> Vector</span>
             </div>
          </div>

       </div>

       {/* Footer */}
       <footer className="w-full py-6 text-center text-sm text-slate-500 dark:text-slate-400 pb-28 md:pb-6 mt-auto">
           <p>
               Designed and developed by{' '}
               <a 
                   href="https://connectwithsourav.com/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition-colors"
               >
                   Sourav Dutta
               </a>
           </p>
       </footer>

       {/* Bottom Navigation Bar (Mobile Only) */}
       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 flex justify-around items-center pb-safe">
           <button onClick={() => setActiveTab('content')} className={`flex flex-col items-center py-3 px-4 flex-1 ${activeTab === 'content' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`}>
               <Layers size={20} className="mb-1" />
               <span className="text-[10px] font-bold uppercase tracking-wider">Content</span>
           </button>
           <button onClick={() => setActiveTab('design')} className={`flex flex-col items-center py-3 px-4 flex-1 ${activeTab === 'design' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`}>
               <Palette size={20} className="mb-1" />
               <span className="text-[10px] font-bold uppercase tracking-wider">Design</span>
           </button>
           <button onClick={() => setActiveTab('preview')} className={`flex flex-col items-center py-3 px-4 flex-1 ${activeTab === 'preview' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`}>
               <QrCode size={20} className="mb-1" />
               <span className="text-[10px] font-bold uppercase tracking-wider">Preview</span>
           </button>
       </div>
    </div>
  );
};

// Helper icon component for footer
const ShieldCheck = ({size, className}: {size: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default App;