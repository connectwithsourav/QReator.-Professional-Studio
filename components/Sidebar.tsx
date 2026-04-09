import React, { useState, useEffect } from 'react';
import { 
  QRCodeConfig, QRType, DotType, CornerType, GradientType, ErrorCorrectionLevel
} from '../types';
import { ColorPicker } from './ColorPicker';
import { 
  Globe, FileText, UserSquare2, Briefcase, 
  Facebook, Instagram, MessageCircle, Youtube, Wifi, 
  Layers, Palette, Image as ImageIcon, ArrowRight, CircleDot, UploadCloud, X,
  Phone, MapPin, Calendar, ShieldCheck, PaintBucket
} from 'lucide-react';

interface Props {
  config: QRCodeConfig;
  setConfig: React.Dispatch<React.SetStateAction<QRCodeConfig>>;
}

export default function Sidebar({ config, setConfig }: Props) {
  // Form states for complex types
  const [wifiState, setWifiState] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [vcardState, setVcardState] = useState({ firstName: '', lastName: '', phone: '', email: '', org: '', title: '' });
  const [whatsappState, setWhatsappState] = useState({ phone: '', message: '' });
  
  // New States
  const [phoneState, setPhoneState] = useState('');
  const [locationState, setLocationState] = useState({ lat: '', long: '' });
  const [calendarState, setCalendarState] = useState({ title: '', start: '', end: '', location: '', description: '' });
  const [socialState, setSocialState] = useState({ facebook: '', instagram: '' });
  const [youtubeState, setYoutubeState] = useState('');
  
  // Business State
  const [businessState, setBusinessState] = useState({
    name: '',
    slogan: '',
    description: '',
    about: '',
    location: '',
    contactName: '',
    phone: '',
    email: '',
    website: '',
    hours: {
      Mon: '09:00 - 17:00',
      Tue: '09:00 - 17:00',
      Wed: '09:00 - 17:00',
      Thu: '09:00 - 17:00',
      Fri: '09:00 - 17:00',
      Sat: 'Closed',
      Sun: 'Closed'
    }
  });

  // Complex inputs effect
  useEffect(() => {
    if (config.type === QRType.WIFI) {
      setConfig(c => ({...c, value: `WIFI:S:${wifiState.ssid};T:${wifiState.encryption};P:${wifiState.password};;`}));
    } else if (config.type === QRType.VCARD) {
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${vcardState.lastName};${vcardState.firstName}\nFN:${vcardState.firstName} ${vcardState.lastName}\nORG:${vcardState.org}\nTITLE:${vcardState.title}\nTEL:${vcardState.phone}\nEMAIL:${vcardState.email}\nEND:VCARD`;
      setConfig(c => ({...c, value: vcard}));
    } else if (config.type === QRType.WHATSAPP) {
      setConfig(c => ({...c, value: `https://wa.me/${whatsappState.phone}?text=${encodeURIComponent(whatsappState.message)}`}));
    } else if (config.type === QRType.PHONE) {
      setConfig(c => ({...c, value: `tel:${phoneState}`}));
    } else if (config.type === QRType.LOCATION) {
      // Using geo URI standard: geo:lat,long
      setConfig(c => ({...c, value: `geo:${locationState.lat},${locationState.long}`}));
    } else if (config.type === QRType.CALENDAR) {
      // Basic iCalendar format
      const formatTime = (t: string) => t.replace(/[-:]/g, ''); 
      const event = `BEGIN:VEVENT
SUMMARY:${calendarState.title}
DTSTART:${formatTime(calendarState.start)}
DTEND:${formatTime(calendarState.end)}
LOCATION:${calendarState.location}
DESCRIPTION:${calendarState.description}
END:VEVENT`;
      setConfig(c => ({...c, value: event}));
    } else if (config.type === QRType.BUSINESS) {
      const { name, slogan, description, about, location, contactName, phone, email, website, hours } = businessState;
      const hoursText = Object.entries(hours).map(([day, time]) => `  ${day}: ${time}`).join('\n');
      const text = `${name.toUpperCase()}
${slogan}
--------------------------------
${description}

📍 LOCATION
${location}

🕒 OPENING HOURS
${hoursText}

📞 CONTACT
${contactName}
Phone: ${phone}
Email: ${email}
Web: ${website}

ℹ️ ABOUT US
${about}`;
      setConfig(c => ({...c, value: text.trim()}));
    } else if (config.type === QRType.FACEBOOK) {
      setConfig(c => ({...c, value: `https://www.facebook.com/${socialState.facebook}`}));
    } else if (config.type === QRType.INSTAGRAM) {
      setConfig(c => ({...c, value: `https://www.instagram.com/${socialState.instagram}`}));
    } else if (config.type === QRType.YOUTUBE) {
      // Handle logic: ensure it starts with @ if missing, unless empty
      let handle = youtubeState.trim();
      if (handle && !handle.startsWith('@')) {
        handle = '@' + handle;
      }
      setConfig(c => ({...c, value: `https://youtube.com/${handle}`}));
    }
  }, [wifiState, vcardState, whatsappState, phoneState, locationState, calendarState, businessState, socialState, youtubeState, config.type, setConfig]);

  const types = [
    { id: QRType.WEBSITE, icon: Globe, label: 'Website' },
    { id: QRType.TEXT, icon: FileText, label: 'Text' },
    { id: QRType.BUSINESS, icon: Briefcase, label: 'Business' },
    { id: QRType.PHONE, icon: Phone, label: 'Phone' },
    { id: QRType.LOCATION, icon: MapPin, label: 'Location' },
    { id: QRType.CALENDAR, icon: Calendar, label: 'Calendar' },
    { id: QRType.VCARD, icon: UserSquare2, label: 'vCard' },
    { id: QRType.WIFI, icon: Wifi, label: 'WiFi' },
    { id: QRType.WHATSAPP, icon: MessageCircle, label: 'WhatsApp' },
    { id: QRType.FACEBOOK, icon: Facebook, label: 'Facebook' },
    { id: QRType.INSTAGRAM, icon: Instagram, label: 'Instagram' },
    { id: QRType.YOUTUBE, icon: Youtube, label: 'Youtube' },
  ];

  const renderContentInputs = () => {
    const inputClass = "w-full bg-white border border-slate-200 text-slate-800 text-sm font-medium rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 p-3.5 outline-none transition-all placeholder:font-normal";
    const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";

    switch(config.type) {
        case QRType.BUSINESS:
            return (
                <div className="space-y-4">
                    <div className="space-y-3">
                        <label className={labelClass}>Company Info</label>
                        <input placeholder="Company Name" className={inputClass} value={businessState.name} onChange={e => setBusinessState({...businessState, name: e.target.value})} />
                        <input placeholder="Slogan / Tagline" className={inputClass} value={businessState.slogan} onChange={e => setBusinessState({...businessState, slogan: e.target.value})} />
                        <textarea placeholder="Short Description" rows={2} className={inputClass} value={businessState.description} onChange={e => setBusinessState({...businessState, description: e.target.value})} />
                    </div>

                    <div>
                        <label className={labelClass}>About Company</label>
                        <textarea placeholder="Detailed About Us..." rows={3} className={inputClass} value={businessState.about} onChange={e => setBusinessState({...businessState, about: e.target.value})} />
                    </div>
                    
                    <div>
                         <label className={labelClass}>Location</label>
                         <textarea placeholder="Full Address" rows={2} className={inputClass} value={businessState.location} onChange={e => setBusinessState({...businessState, location: e.target.value})} />
                    </div>

                    <div className="space-y-3">
                         <label className={labelClass}>Contact Details</label>
                         <input placeholder="Contact Person Name" className={inputClass} value={businessState.contactName} onChange={e => setBusinessState({...businessState, contactName: e.target.value})} />
                         <div className="grid grid-cols-2 gap-3">
                            <input placeholder="Phone" className={inputClass} value={businessState.phone} onChange={e => setBusinessState({...businessState, phone: e.target.value})} />
                            <input placeholder="Email" className={inputClass} value={businessState.email} onChange={e => setBusinessState({...businessState, email: e.target.value})} />
                         </div>
                         <input placeholder="Website URL" className={inputClass} value={businessState.website} onChange={e => setBusinessState({...businessState, website: e.target.value})} />
                    </div>

                    <div>
                         <label className={labelClass}>Opening Hours</label>
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                            {Object.keys(businessState.hours).map((day) => (
                                <div key={day} className="flex items-center gap-3">
                                    <span className="w-8 text-[10px] font-bold text-slate-500 uppercase">{day}</span>
                                    <input 
                                        className="flex-1 text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-brand-500 bg-white"
                                        value={businessState.hours[day as keyof typeof businessState.hours]}
                                        onChange={(e) => setBusinessState({
                                            ...businessState, 
                                            hours: { ...businessState.hours, [day]: e.target.value }
                                        })}
                                    />
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            );
        case QRType.WIFI:
            return (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Network Name</label>
                        <input type="text" className={inputClass} placeholder="SSID" value={wifiState.ssid} onChange={e => setWifiState({...wifiState, ssid: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Password</label>
                        <input type="text" className={inputClass} placeholder="Password" value={wifiState.password} onChange={e => setWifiState({...wifiState, password: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Security</label>
                        <select className={inputClass} value={wifiState.encryption} onChange={e => setWifiState({...wifiState, encryption: e.target.value})}>
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">No Password</option>
                        </select>
                    </div>
                </div>
            );
        case QRType.VCARD:
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>First Name</label>
                            <input type="text" className={inputClass} value={vcardState.firstName} onChange={e => setVcardState({...vcardState, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Last Name</label>
                            <input type="text" className={inputClass} value={vcardState.lastName} onChange={e => setVcardState({...vcardState, lastName: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Phone</label>
                        <input type="tel" className={inputClass} value={vcardState.phone} onChange={e => setVcardState({...vcardState, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input type="email" className={inputClass} value={vcardState.email} onChange={e => setVcardState({...vcardState, email: e.target.value})} />
                    </div>
                </div>
            );
        case QRType.PHONE:
             return (
                <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="tel" className={inputClass} placeholder="+1 555 123 4567" value={phoneState} onChange={e => setPhoneState(e.target.value)} />
                </div>
             );
        case QRType.LOCATION:
             return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Latitude</label>
                            <input type="text" className={inputClass} placeholder="40.7128" value={locationState.lat} onChange={e => setLocationState({...locationState, lat: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Longitude</label>
                            <input type="text" className={inputClass} placeholder="-74.0060" value={locationState.long} onChange={e => setLocationState({...locationState, long: e.target.value})} />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Tip: You can get these coordinates from Google Maps.</p>
                </div>
             );
        case QRType.CALENDAR:
             return (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Event Title</label>
                        <input type="text" className={inputClass} placeholder="Meeting" value={calendarState.title} onChange={e => setCalendarState({...calendarState, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Start</label>
                            <input type="datetime-local" className={inputClass} value={calendarState.start} onChange={e => setCalendarState({...calendarState, start: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>End</label>
                            <input type="datetime-local" className={inputClass} value={calendarState.end} onChange={e => setCalendarState({...calendarState, end: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Location</label>
                        <input type="text" className={inputClass} placeholder="Office or Address" value={calendarState.location} onChange={e => setCalendarState({...calendarState, location: e.target.value})} />
                    </div>
                     <div>
                        <label className={labelClass}>Description</label>
                        <textarea className={inputClass} rows={2} placeholder="Details..." value={calendarState.description} onChange={e => setCalendarState({...calendarState, description: e.target.value})} />
                    </div>
                </div>
             );
        case QRType.WHATSAPP:
            return (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>WhatsApp Number</label>
                        <input type="tel" className={inputClass} placeholder="15551234567" value={whatsappState.phone} onChange={e => setWhatsappState({...whatsappState, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Message</label>
                        <textarea className={inputClass} rows={3} placeholder="Hello!" value={whatsappState.message} onChange={e => setWhatsappState({...whatsappState, message: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Templates</label>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setWhatsappState(prev => ({...prev, message: 'Greetings, I would like to inquire about your services.'}))}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            >
                                Formal Hello
                            </button>
                            <button 
                                onClick={() => setWhatsappState(prev => ({...prev, message: 'Hello, I am interested in learning more about your company.'}))}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            >
                                Professional Hello
                            </button>
                            <button 
                                onClick={() => setWhatsappState(prev => ({...prev, message: 'Hi! I saw your ad and would like to know more about the offer.'}))}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            >
                                Marketing
                            </button>
                            <button 
                                onClick={() => setWhatsappState(prev => ({...prev, message: 'Please send over the weekly analytics report.'}))}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            >
                                Analytics
                            </button>
                        </div>
                    </div>
                </div>
            );
        case QRType.FACEBOOK:
            return (
                <div>
                    <label className={labelClass}>Facebook Profile</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">facebook.com/</span>
                        <input 
                            type="text" 
                            className={`${inputClass} pl-[120px]`} 
                            placeholder="username" 
                            value={socialState.facebook} 
                            onChange={e => setSocialState({...socialState, facebook: e.target.value})} 
                        />
                    </div>
                </div>
            );
        case QRType.INSTAGRAM:
            return (
                <div>
                    <label className={labelClass}>Instagram Profile</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">instagram.com/</span>
                        <input 
                            type="text" 
                            className={`${inputClass} pl-[125px]`} 
                            placeholder="username" 
                            value={socialState.instagram} 
                            onChange={e => setSocialState({...socialState, instagram: e.target.value})} 
                        />
                    </div>
                </div>
            );
        case QRType.YOUTUBE:
            return (
                <div>
                    <label className={labelClass}>YouTube Handle</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">youtube.com/</span>
                        <input 
                            type="text" 
                            className={`${inputClass} pl-[110px]`} 
                            placeholder="@ChannelName" 
                            value={youtubeState} 
                            onChange={e => setYoutubeState(e.target.value)} 
                        />
                    </div>
                </div>
            );
        case QRType.TEXT:
            return (
                <div>
                     <label className={labelClass}>Your Text</label>
                     <textarea 
                        className={inputClass} 
                        rows={5}
                        value={config.value} 
                        onChange={e => setConfig({...config, value: e.target.value})}
                        placeholder="Enter text here..."
                     />
                </div>
            );
        default:
            return (
                <div>
                    <label className={labelClass}>Website URL</label>
                    <input 
                        type="text" 
                        className={inputClass} 
                        value={config.value} 
                        onChange={e => setConfig({...config, value: e.target.value})}
                        placeholder="https://example.com" 
                    />
                </div>
            );
    }
  };

  const StyleBtn = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-full py-3 rounded-xl text-xs font-bold transition-all border-2 
        ${active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 text-slate-500 hover:border-slate-300 bg-white'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
        
        {/* 1. Content Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <div className="bg-blue-100 text-blue-600 p-1 rounded-md"><Layers size={14}/></div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content</h2>
            </div>
            <div className="p-5">
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {types.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setConfig({...config, type: t.id})}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all h-20 
                            ${config.type === t.id ? 'border-brand-500 bg-brand-50 text-brand-600 ring-1 ring-brand-500' : 'border-slate-100 text-slate-400 hover:border-brand-200 hover:bg-slate-50'}`}
                        >
                            <t.icon size={20} className="mb-1.5" />
                            <span className="text-[10px] font-semibold truncate w-full text-center">{t.label}</span>
                        </button>
                    ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-inner">
                    {renderContentInputs()}
                </div>
            </div>
        </section>

        {/* 2. Design Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <div className="bg-purple-100 text-purple-600 p-1 rounded-md"><Palette size={14}/></div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Design</h2>
            </div>
            <div className="p-5 space-y-8">
                
                {/* Colors */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-slate-700">QR Color</span>
                        <div className="bg-slate-100 p-1 rounded-lg flex text-[10px] font-bold uppercase tracking-wide">
                            <button 
                                onClick={() => setConfig({...config, useGradient: false})}
                                className={`px-3 py-1.5 rounded-md transition-all ${!config.useGradient ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >Solid</button>
                            <button 
                                onClick={() => setConfig({...config, useGradient: true})}
                                className={`px-3 py-1.5 rounded-md transition-all ${config.useGradient ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >Gradient</button>
                        </div>
                    </div>
                    
                    {!config.useGradient ? (
                        <ColorPicker label="Hex Code" color={config.dotColor} onChange={(c) => setConfig({...config, dotColor: c})} />
                    ) : (
                        <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setConfig({...config, gradient: {...config.gradient, type: 'linear'}})}
                                    className={`flex flex-col items-center justify-center gap-1 border-2 py-3 rounded-xl transition-all ${config.gradient.type === 'linear' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-transparent bg-slate-50 text-slate-500'}`}
                                >
                                    <ArrowRight size={16} />
                                    <span className="text-[10px] font-bold uppercase">Linear</span>
                                </button>
                                <button 
                                    onClick={() => setConfig({...config, gradient: {...config.gradient, type: 'radial'}})}
                                    className={`flex flex-col items-center justify-center gap-1 border-2 py-3 rounded-xl transition-all ${config.gradient.type === 'radial' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-transparent bg-slate-50 text-slate-500'}`}
                                >
                                    <CircleDot size={16} />
                                    <span className="text-[10px] font-bold uppercase">Radial</span>
                                </button>
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                                <ColorPicker label="Start" color={config.gradient.color1} onChange={(c) => setConfig({...config, gradient: {...config.gradient, color1: c}})} />
                                <ColorPicker label="End" color={config.gradient.color2} onChange={(c) => setConfig({...config, gradient: {...config.gradient, color2: c}})} />
                             </div>
                             {config.gradient.type === 'linear' && (
                                 <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                     <div className="flex justify-between text-xs text-slate-500 font-medium mb-2">
                                         <span>Gradient Angle</span>
                                         <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">{config.gradient.rotation}°</span>
                                     </div>
                                     <input type="range" min="0" max="360" step="45" value={config.gradient.rotation} onChange={(e) => setConfig({...config, gradient: {...config.gradient, rotation: parseInt(e.target.value)}})} className="w-full" />
                                 </div>
                             )}
                        </div>
                    )}
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Background */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-slate-700">Background</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-medium">Transparent</span>
                            <button 
                                onClick={() => setConfig({...config, bgEnabled: !config.bgEnabled})}
                                className={`relative flex h-6 w-11 items-center rounded-full transition-colors ${!config.bgEnabled ? 'bg-brand-600' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!config.bgEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                    {config.bgEnabled && (
                        <div className="space-y-4">
                            {/* Background Type Toggle */}
                             <div className="bg-slate-100 p-1 rounded-lg flex text-[10px] font-bold uppercase tracking-wide w-full">
                                <button 
                                    onClick={() => setConfig({...config, bgType: 'color'})}
                                    className={`flex-1 px-3 py-1.5 rounded-md transition-all flex items-center justify-center gap-2 ${config.bgType === 'color' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <PaintBucket size={12} /> Color
                                </button>
                                <button 
                                    onClick={() => setConfig({...config, bgType: 'image'})}
                                    className={`flex-1 px-3 py-1.5 rounded-md transition-all flex items-center justify-center gap-2 ${config.bgType === 'image' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <ImageIcon size={12} /> Image
                                </button>
                            </div>

                            {config.bgType === 'color' ? (
                                <ColorPicker label="Hex Code" color={config.bgColor} onChange={(c) => setConfig({...config, bgColor: c})} />
                            ) : (
                                <div className="space-y-3">
                                     {!config.bgImage ? (
                                        <label className="block bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-white hover:border-brand-300 transition-all cursor-pointer group">
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    const r = new FileReader();
                                                    r.onload = (ev) => setConfig({...config, bgImage: ev.target?.result as string});
                                                    r.readAsDataURL(e.target.files[0]);
                                                }
                                            }} />
                                            <div className="bg-white p-2 rounded-full shadow-sm inline-block mb-2 group-hover:scale-105 transition-transform">
                                                <UploadCloud size={16} className="text-brand-500" />
                                            </div>
                                            <p className="text-xs text-slate-700 font-medium">Upload Background</p>
                                        </label>
                                     ) : (
                                         <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                                             <img src={config.bgImage} className="w-full h-24 object-cover" />
                                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                 <button 
                                                    onClick={() => setConfig({...config, bgImage: null})}
                                                    className="bg-white text-red-500 p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                                                 >
                                                     <X size={16} />
                                                 </button>
                                             </div>
                                         </div>
                                     )}
                                     
                                     {config.bgImage && (
                                         <div>
                                             <div className="flex justify-between text-xs text-slate-500 font-medium mb-2">
                                                 <span>Image Opacity</span>
                                                 <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{(config.bgOpacity * 100).toFixed(0)}%</span>
                                             </div>
                                             <input 
                                                type="range" min="0" max="1" step="0.05" 
                                                value={config.bgOpacity} 
                                                onChange={(e) => setConfig({...config, bgOpacity: parseFloat(e.target.value)})} 
                                                className="w-full" 
                                             />
                                         </div>
                                     )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-px bg-slate-100 w-full"></div>
                
                 {/* Error Correction */}
                 <div>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-1.5">
                             <ShieldCheck size={14} className="text-slate-400" />
                             <span className="text-sm font-semibold text-slate-700">Error Correction</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                         {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map(level => {
                             let label = '';
                             switch(level) {
                                 case 'L': label = 'Low (7%)'; break;
                                 case 'M': label = 'Med (15%)'; break;
                                 case 'Q': label = 'Qrt (25%)'; break;
                                 case 'H': label = 'High (30%)'; break;
                             }
                             return (
                                <button 
                                    key={level}
                                    onClick={() => setConfig({...config, errorCorrectionLevel: level})}
                                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all
                                    ${config.errorCorrectionLevel === level
                                        ? 'bg-brand-50 border-brand-500 text-brand-600' 
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-brand-200 hover:text-brand-600'}`}
                                >
                                    {label.split(' ')[0]}
                                </button>
                             );
                         })}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                        Higher levels allow the QR to be scanned even if damaged or covered by a logo, but make the QR code denser.
                    </p>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Patterns */}
                <div>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Pattern Style</span>
                     <div className="grid grid-cols-3 gap-2">
                         {(['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'] as DotType[]).map(s => (
                             <StyleBtn 
                                key={s} 
                                active={config.dotStyle === s} 
                                label={s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                                onClick={() => setConfig({...config, dotStyle: s})} 
                             />
                         ))}
                     </div>
                </div>

                <div>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Corners</span>
                     <div className="grid grid-cols-3 gap-2">
                         <StyleBtn active={config.cornerSquareStyle === 'square'} label="Square" onClick={() => setConfig({...config, cornerSquareStyle: 'square', cornerDotStyle: 'square'})} />
                         <StyleBtn active={config.cornerSquareStyle === 'dot'} label="Dot" onClick={() => setConfig({...config, cornerSquareStyle: 'dot', cornerDotStyle: 'dot'})} />
                         <StyleBtn active={config.cornerSquareStyle === 'extra-rounded'} label="Round" onClick={() => setConfig({...config, cornerSquareStyle: 'extra-rounded', cornerDotStyle: 'dot'})} />
                     </div>
                </div>

            </div>
        </section>

        {/* 3. Logo Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
             <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <div className="bg-orange-100 text-orange-600 p-1 rounded-md"><ImageIcon size={14}/></div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo</h2>
            </div>
            <div className="p-5">
                {!config.logoUrl ? (
                    <label className="block bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-white hover:border-brand-300 transition-all cursor-pointer group">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                             if (e.target.files?.[0]) {
                                 const r = new FileReader();
                                 r.onload = (ev) => setConfig({...config, logoUrl: ev.target?.result as string});
                                 r.readAsDataURL(e.target.files[0]);
                             }
                        }} />
                        <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-3 group-hover:scale-105 transition-transform">
                            <UploadCloud className="text-brand-500" />
                        </div>
                        <p className="text-sm text-slate-700 font-medium">Tap to upload logo</p>
                    </label>
                ) : (
                    <div className="flex flex-col items-center relative">
                        <img src={config.logoUrl} className="w-16 h-16 object-contain mb-3 rounded-lg shadow-sm bg-white border border-slate-200 p-2" />
                        <button 
                            onClick={() => setConfig({...config, logoUrl: null})}
                            className="text-[10px] font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                        >
                            <X size={12} /> Remove
                        </button>
                    </div>
                )}
            </div>
        </section>

    </div>
  );
}