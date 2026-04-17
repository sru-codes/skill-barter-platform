import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  User, Shield, BookOpen, Save, LogOut, 
  Globe, CheckCircle2, Camera, MapPin, Mail, Sparkles, Search, Briefcase, GraduationCap, Clock, Trash2,
  FolderGit2, Code, PenTool, ExternalLink
} from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const POPULAR_CITIES = ["New York, NY", "London, UK", "Tokyo, Japan", "Paris, France", "Berlin, Germany", "San Francisco, CA", "Toronto, Canada", "Singapore", "Sydney, Australia", "Mumbai, India", "Dubai, UAE", "Los Angeles, CA"];

const SKILL_CATEGORIES = {
  Technology: ["Web Development", "Python", "Data Science", "Machine Learning", "Mobile Apps", "Cloud Computing"],
  Design: ["UI/UX Design", "Graphic Design", "Logo Design", "Illustration", "Figma", "Video Editing"],
  Business: ["Digital Marketing", "SEO", "Sales", "Entrepreneurship", "Copywriting", "Project Management"],
  Languages: ["English", "Spanish", "French", "Japanese", "Mandarin", "German"],
  Arts: ["Music Production", "Photography", "Creative Writing", "Drawing", "Acting", "Vocals"]
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "", bio: "", location: "", offering: [], wanting: [],
    github: "", linkedin: "", website: "", photo: "",
    userType: "Professional", workOrSchool: "", age: "", experienceYears: "",
    personalWebsite: "", techBlog: "", designPortfolio: "", projectHighlights: ""
  });

  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [activeOfferCat, setActiveOfferCat] = useState(null);
  const [offerSearch, setOfferSearch] = useState("");
  const [activeWantCat, setActiveWantCat] = useState(null);
  const [wantSearch, setWantSearch] = useState("");
  const [showToast, setShowToast] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data();
            setProfile(prev => ({ ...prev, ...data }));
            setLocationQuery(data.location || "");
          }
        } catch (err) { console.error(err); }
        setLoading(false);
      } else { navigate("/"); }
    });
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { unsub(); document.removeEventListener("mousedown", handleClickOutside); };
  }, [navigate]);

  const handleLocationChange = (val) => {
    setLocationQuery(val);
    setProfile(prev => ({ ...prev, location: val }));
    if (val.trim().length > 1) {
      setSuggestions(POPULAR_CITIES.filter(city => city.toLowerCase().includes(val.toLowerCase())));
      setShowSuggestions(true);
    } else setShowSuggestions(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    setImageLoading(true);
    try {
      const storageRef = ref(storage, `profiles/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfile(prev => ({ ...prev, photo: url }));
      await updateDoc(doc(db, "users", auth.currentUser.uid), { photo: url });
    } catch (err) { console.error(err); }
    setImageLoading(false);
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const cleanProfile = { ...profile };
      // optional: strip out any unwanted nulls if needed, though they act fine here
      await updateDoc(doc(db, "users", auth.currentUser.uid), cleanProfile);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will permanently remove your skills and profile.")) return;
    try {
      await auth.currentUser.delete();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Please re-authenticate to delete your account.");
    }
  };

  const toggleSkill = (type, skill) => {
    setProfile(prev => {
      const list = prev[type] || [];
      if (list.includes(skill)) return { ...prev, [type]: list.filter(s => s !== skill) };
      return { ...prev, [type]: [...list, skill] };
    });
  };

  const handleCustomSkill = (type, e, queryState, setQueryState) => {
    if (e.key === 'Enter' && queryState.trim()) {
      e.preventDefault();
      setProfile(prev => {
        const list = prev[type] || [];
        if (!list.includes(queryState.trim())) {
          return { ...prev, [type]: [...list, queryState.trim()] };
        }
        return prev;
      });
      setQueryState("");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#09090b]">
      <div className="w-10 h-10 border-2 border-slate-800 border-t-slate-300 rounded-full animate-spin"></div>
    </div>
  );

  const inputClasses = "w-full h-12 px-4 bg-slate-900 border border-white/5 focus:border-slate-500/50 focus:bg-slate-900/80 rounded-xl shadow-inner text-sm text-slate-200 transition-all outline-none placeholder:text-slate-600";
  const labelClasses = "text-xs font-semibold text-slate-400 mb-2.5 block tracking-wide";

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-slate-300 pb-24 relative overflow-x-hidden">
      
      <div className="max-w-[1240px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-12 md:gap-20">
        
        {/* LEFT COLUMN (Sticky) */}
        <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-8 md:sticky md:top-12 h-max z-10">
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Account settings</h1>
          
          <div className="space-y-6">
            {/* Identity Card Mini */}
            <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center gap-5 relative z-10">
                <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-xl transition-transform group-hover:scale-105">
                   {profile.photo ? <img src={profile.photo} className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-slate-400 bg-gradient-to-br from-slate-800 to-slate-900 w-full h-full flex items-center justify-center">{profile.name?.charAt(0) || "U"}</span>}
                   <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-all backdrop-blur-sm">
                     <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                     {imageLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Camera size={18} className="text-white drop-shadow-md" />}
                   </label>
                </div>
                <div className="overflow-hidden">
                   <h2 className="text-lg font-bold text-slate-200 truncate">{profile.name || "Member"}</h2>
                   <p className="text-xs font-medium text-slate-500 mt-0.5 uppercase tracking-wide">{profile.userType}</p>
                </div>
              </div>
              
              <div className="space-y-3.5 pt-6 mt-6 border-t border-white/5 text-sm relative z-10">
                 <div className="flex items-center gap-3 text-slate-400">
                    <MapPin size={16} className="text-slate-500 shrink-0" /> <span className="truncate font-medium">{profile.location || "Location not set"}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-400">
                    <Mail size={16} className="text-slate-500 shrink-0" /> <span className="truncate font-medium">{auth.currentUser?.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-400">
                    {profile.userType === "Student" ? <GraduationCap size={16} className="text-slate-500 shrink-0" /> : <Briefcase size={16} className="text-slate-500 shrink-0" />}
                    <span className="truncate font-medium">{profile.workOrSchool || "Role not set"}</span>
                 </div>
              </div>
            </div>

            {/* Main Nav */}
            <nav className="flex flex-col gap-1.5">
              {[
                { id: "profile", icon: User, label: "Profile Details" },
                { id: "portfolio", icon: FolderGit2, label: "Portfolios & Projects" },
                { id: "skills", icon: BookOpen, label: "Career & Skills" },
                { id: "account", icon: Shield, label: "Security & Access" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${activeTab === tab.id ? "bg-slate-800 text-slate-200 shadow-sm border border-white/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"}`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? "text-slate-300" : ""} /> {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* RIGHT COLUMN (Scrollable) */}
        <div className="flex-1 w-full relative z-10">
          {activeTab === "profile" && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Personal Section */}
                <section className="bg-slate-900 border border-white/5 rounded-3xl p-10 shadow-2xl">
                   <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-300 shadow-inner">
                        <User size={18} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-200 tracking-tight">Personal Details</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                      <div className="md:col-span-1">
                          <label className={labelClasses}>Display Name</label>
                          <input type="text" value={profile.name || ""} onChange={e => setProfile(prev => ({...prev, name: e.target.value}))} className={inputClasses} placeholder="Your public name" />
                      </div>
                      
                      <div className="md:col-span-1 relative" ref={dropdownRef}>
                         <label className={labelClasses}>Primary Location</label>
                         <div className="relative w-full">
                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input type="text" value={locationQuery} onChange={e => handleLocationChange(e.target.value)} onFocus={() => locationQuery.length > 1 && setShowSuggestions(true)} className={`${inputClasses} pl-11`} placeholder="Search city..." />
                         </div>
                         {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-slate-800 border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                               {suggestions.map((city, idx) => (
                                  <button key={idx} onClick={() => { setLocationQuery(city); setProfile(prev => ({ ...prev, location: city })); setShowSuggestions(false); }} className="w-full px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl text-left transition-colors flex items-center gap-3"><MapPin size={14} className="text-slate-400 opacity-60" /> {city}</button>
                               ))}
                            </div>
                         )}
                      </div>

                      <div className="md:col-span-2">
                         <label className={labelClasses}>Your Story</label>
                         <textarea value={profile.bio || ""} onChange={e => setProfile(prev => ({...prev, bio: e.target.value}))} className={`${inputClasses} h-auto py-5 min-h-[160px] resize-y`} placeholder="Describe your background, what makes you tick, and what you aim to achieve..." />
                      </div>
                   </div>
                </section>

                {/* Professional Section */}
                <section className="bg-slate-900 border border-white/5 rounded-3xl p-10 shadow-2xl">
                   <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-300 shadow-inner">
                        <Briefcase size={18} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-200 tracking-tight">Professional Config</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                      <div>
                          <label className={labelClasses}>Current Status</label>
                          <div className="flex p-1.5 bg-slate-950 border border-white/5 rounded-[1rem] shadow-inner h-12">
                             {["Student", "Professional"].map(type => (
                               <button 
                                  key={type} 
                                  onClick={() => setProfile(prev => ({...prev, userType: type}))} 
                                  className={`flex-1 flex items-center justify-center text-sm font-semibold transition-all rounded-xl ${profile.userType === type ? 'bg-slate-800 text-slate-200 shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                               >
                                  {type}
                               </button>
                             ))}
                          </div>
                      </div>

                      <div>
                          <label className={labelClasses}>Experience (Years)</label>
                          <input type="number" value={profile.experienceYears || ""} onChange={e => setProfile(prev => ({...prev, experienceYears: e.target.value}))} className={inputClasses} placeholder="e.g. 5" />
                      </div>

                      <div className="md:col-span-2">
                          <label className={labelClasses}>{profile.userType === "Student" ? "University / College Name" : "Company / Organization Name"}</label>
                          <input type="text" value={profile.workOrSchool || ""} onChange={e => setProfile(prev => ({...prev, workOrSchool: e.target.value}))} className={inputClasses} placeholder={profile.userType === "Student" ? "e.g. Harvard University" : "e.g. Apple Inc."} />
                      </div>
                   </div>
                </section>

                {/* Social Section */}
                <section className="bg-slate-900 border border-white/5 rounded-3xl p-10 shadow-2xl">
                   <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-300 shadow-inner">
                        <Globe size={18} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-200 tracking-tight">Social Accounts</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-white/5 rounded-md text-slate-400">
                             <Globe size={12} />
                         </div>
                         <input type="text" value={profile.github || ""} onChange={e => setProfile(prev => ({...prev, github: e.target.value}))} placeholder="GitHub Profile URL" className={`${inputClasses} pl-12 bg-slate-950/80`} />
                      </div>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-white/5 rounded-md text-slate-400">
                             <Globe size={12} />
                         </div>
                         <input type="text" value={profile.linkedin || ""} onChange={e => setProfile(prev => ({...prev, linkedin: e.target.value}))} placeholder="LinkedIn Profile URL" className={`${inputClasses} pl-12 bg-slate-950/80`} />
                      </div>
                   </div>
                </section>
             </div>
          )}

          {activeTab === "portfolio" && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-slate-900 border border-white/5 rounded-3xl p-10 shadow-2xl">
                   <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-300 shadow-inner">
                        <FolderGit2 size={18} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-200 tracking-tight">Project Showcase & Portfolios</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-10">
                      <div className="space-y-8">
                         <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest text-opacity-80">Portfolio Destinations</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative">
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-800 rounded-md text-slate-400">
                                   <ExternalLink size={12} />
                               </div>
                               <input type="text" value={profile.personalWebsite || ""} onChange={e => setProfile(prev => ({...prev, personalWebsite: e.target.value}))} placeholder="Personal Website URL" className={`${inputClasses} pl-12 bg-slate-950/80`} />
                            </div>
                            <div className="relative">
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-800 rounded-md text-slate-400">
                                   <Code size={12} />
                               </div>
                               <input type="text" value={profile.techBlog || ""} onChange={e => setProfile(prev => ({...prev, techBlog: e.target.value}))} placeholder="Technical Blog (Medium/Hashnode)" className={`${inputClasses} pl-12 bg-slate-950/80`} />
                            </div>
                            <div className="relative">
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-800 rounded-md text-slate-400">
                                   <PenTool size={12} />
                               </div>
                               <input type="text" value={profile.designPortfolio || ""} onChange={e => setProfile(prev => ({...prev, designPortfolio: e.target.value}))} placeholder="Design Portfolio (Behance/Dribbble)" className={`${inputClasses} pl-12 bg-slate-950/80`} />
                            </div>
                         </div>
                      </div>

                      <div className="pt-8 border-t border-white/5">
                         <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest text-opacity-80 mb-6">Key Achievements & Highlights</h4>
                         <label className={labelClasses}>Top 3 Projects / Achievements</label>
                         <textarea value={profile.projectHighlights || ""} onChange={e => setProfile(prev => ({...prev, projectHighlights: e.target.value}))} className={`${inputClasses} h-auto py-5 min-h-[160px] resize-y`} placeholder="e.g.&#10;1. Built a high-frequency trading bot that yielded 12% in a month.&#10;2. Designed the landing page for a YC-backed startup.&#10;3. Authored an open-source library with 2k+ stars." />
                      </div>
                   </div>
                </section>
             </div>
          )}

          {activeTab === "skills" && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Offering Section */}
                <section className="bg-slate-900 border border-blue-500/20 rounded-3xl p-10 shadow-2xl relative">
                   <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                           <Briefcase size={18} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-200 tracking-tight">I can mentor in...</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 min-h-[52px] p-2 bg-slate-950/50 rounded-xl border border-white/5">
                         {(profile.offering?.length || 0) === 0 ? <span className="text-slate-500 text-sm italic px-2 py-1 flex items-center">No skills selected</span> : null}
                         {profile.offering?.map(s => (
                            <span key={s} className="pl-3 pr-2 py-1.5 bg-blue-600 border border-blue-500 text-white rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 shadow-md">
                               {s} <button onClick={() => toggleSkill('offering', s)} className="text-white/70 hover:text-white hover:bg-black/20 p-0.5 rounded-md transition-colors"><Trash2 size={12}/></button>
                            </span>
                         ))}
                      </div>
                      
                      <div className="relative">
                         <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/>
                         <input type="text" value={offerSearch} onChange={e => setOfferSearch(e.target.value)} onKeyDown={e => handleCustomSkill('offering', e, offerSearch, setOfferSearch)} placeholder="Search or type a custom skill and press Enter..." className="w-full h-12 pl-11 pr-4 bg-slate-950 border border-white/5 focus:border-blue-500/50 rounded-xl text-sm text-slate-200 outline-none placeholder:text-slate-600" />
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-2">
                         {Object.keys(SKILL_CATEGORIES).map(cat => (
                            <button key={cat} onClick={() => setActiveOfferCat(activeOfferCat === cat ? null : cat)} className={`py-4 rounded-xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${activeOfferCat === cat ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'}`}>
                               {cat}
                            </button>
                         ))}
                      </div>

                      {activeOfferCat && (
                         <div className="p-6 bg-slate-950/80 border border-blue-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 mt-2">
                            <h4 className="text-sm font-bold text-slate-300 mb-5 pb-3 border-b border-white/5">{activeOfferCat} Specializations</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                               {SKILL_CATEGORIES[activeOfferCat].map(skill => {
                                  const isSelected = profile.offering?.includes(skill);
                                  return (
                                     <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 flex-shrink-0 rounded-[4px] border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white shadow-md' : 'bg-slate-900 border-white/10 group-hover:border-blue-500/50'}`}>
                                           {isSelected && <CheckCircle2 size={12}/>}
                                        </div>
                                        <span className={`text-sm font-semibold truncate transition-colors ${isSelected ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-200'}`}>{skill}</span>
                                     </label>
                                  )
                               })}
                            </div>
                         </div>
                      )}
                   </div>
                </section>
                
                {/* Wanting Section */}
                <section className="bg-slate-900 border border-purple-500/20 rounded-3xl p-10 shadow-2xl relative">
                   <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                           <Sparkles size={18} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-200 tracking-tight">I want to learn...</h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 min-h-[52px] p-2 bg-slate-950/50 rounded-xl border border-white/5">
                         {(profile.wanting?.length || 0) === 0 ? <span className="text-slate-500 text-sm italic px-2 py-1 flex items-center">No skills selected</span> : null}
                         {profile.wanting?.map(s => (
                            <span key={s} className="pl-3 pr-2 py-1.5 bg-purple-600 border border-purple-500 text-white rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 shadow-md">
                               {s} <button onClick={() => toggleSkill('wanting', s)} className="text-white/70 hover:text-white hover:bg-black/20 p-0.5 rounded-md transition-colors"><Trash2 size={12}/></button>
                            </span>
                         ))}
                      </div>
                      
                      <div className="relative">
                         <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/>
                         <input type="text" value={wantSearch} onChange={e => setWantSearch(e.target.value)} onKeyDown={e => handleCustomSkill('wanting', e, wantSearch, setWantSearch)} placeholder="Search or type a custom skill and press Enter..." className="w-full h-12 pl-11 pr-4 bg-slate-950 border border-white/5 focus:border-purple-500/50 rounded-xl text-sm text-slate-200 outline-none placeholder:text-slate-600" />
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-2">
                         {Object.keys(SKILL_CATEGORIES).map(cat => (
                            <button key={cat} onClick={() => setActiveWantCat(activeWantCat === cat ? null : cat)} className={`py-4 rounded-xl border transition-all text-sm font-bold flex items-center justify-center gap-2 ${activeWantCat === cat ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'}`}>
                               {cat}
                            </button>
                         ))}
                      </div>

                      {activeWantCat && (
                         <div className="p-6 bg-slate-950/80 border border-purple-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 mt-2">
                            <h4 className="text-sm font-bold text-slate-300 mb-5 pb-3 border-b border-white/5">{activeWantCat} Specializations</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                               {SKILL_CATEGORIES[activeWantCat].map(skill => {
                                  const isSelected = profile.wanting?.includes(skill);
                                  return (
                                     <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 flex-shrink-0 rounded-[4px] border flex items-center justify-center transition-all ${isSelected ? 'bg-purple-500 border-purple-500 text-white shadow-md' : 'bg-slate-900 border-white/10 group-hover:border-purple-500/50'}`}>
                                           {isSelected && <CheckCircle2 size={12}/>}
                                        </div>
                                        <span className={`text-sm font-semibold truncate transition-colors ${isSelected ? 'text-purple-100' : 'text-slate-400 group-hover:text-slate-200'}`}>{skill}</span>
                                     </label>
                                  )
                               })}
                            </div>
                         </div>
                      )}
                   </div>
                </section>
             </div>
          )}

          {activeTab === "account" && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="bg-slate-900 border border-white/5 rounded-3xl p-10 shadow-2xl relative">
                   <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-slate-300 shadow-inner">
                        <Shield size={18} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-200 tracking-tight">Security & Account</h3>
                   </div>
                   
                   <div className="p-8 bg-slate-950 border border-white/5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-inner">
                      <div>
                         <p className="text-xs font-semibold text-slate-500 mb-1 tracking-wide uppercase">Registered Email</p>
                         <p className="text-sm font-semibold text-slate-200">{auth.currentUser?.email}</p>
                      </div>
                      <button onClick={() => signOut(auth).then(() => navigate("/"))} className="px-6 h-12 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-200 text-sm font-semibold rounded-xl transition-all shadow-sm">Log Out</button>
                   </div>
                </section>

                <section className="bg-slate-900 border border-white/5 rounded-3xl p-10 shadow-2xl relative">
                   <div className="p-8 bg-black/20 border border-red-500/10 rounded-2xl flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between shadow-inner">
                      <div>
                         <h4 className="text-base font-bold text-red-400">Danger Zone</h4>
                         <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm leading-relaxed">Permanently delete your account and remove all data associated with it. This action cannot be reversed.</p>
                      </div>
                      <button onClick={handleDeleteAccount} className="px-6 h-12 shrink-0 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm">
                         <Trash2 size={16} /> Delete Account
                      </button>
                   </div>
                </section>
             </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-10 duration-500 transition-all">
           <div className="bg-slate-900 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] flex items-center gap-4">
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold tracking-wide">Profile updated successfully!</span>
           </div>
        </div>
      )}

      {/* Floating Save Button */}
      <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in zoom-in-95 duration-500">
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="h-14 px-8 bg-slate-200 hover:bg-white disabled:opacity-50 text-slate-900 text-sm font-bold rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.2)] border border-white/50 transition-all hover:-translate-y-1"
        >
          <Save size={18} className={saving ? "animate-spin" : ""} />
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
