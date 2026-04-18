import { useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { User, MapPin, Award, BookOpen, GraduationCap, ArrowRight, LogOut, Check, Navigation } from "lucide-react";
import SkillPicker from "../components/SkillPicker";

export default function Profile({ user }) {
  const [offering, setOffering] = useState([]);
  const [wanting, setWanting] = useState([]);
  const [bio, setBio] = useState("");
  const [noSkills, setNoSkills] = useState(false);
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("Intermediate");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setSaving(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state || "";
        if (city) setLocation(city);
      } catch (err) {
        console.error("Location error:", err);
      }
      setSaving(false);
    }, (err) => {
      console.error(err);
      setSaving(false);
    });
  };

  const toggleSkill = (skill, list, setList) => {
    if (list.includes(skill)) {
      setList(list.filter(s => s !== skill));
    } else if (list.length < 5) {
      setList([...list, skill]);
    }
  };

  const handleSubmit = async () => {
    if (!noSkills && offering.length === 0) {
      alert("Please select at least 1 skill to offer!");
      return;
    }
    if (wanting.length === 0) {
      alert("Please select at least 1 skill you want to learn!");
      return;
    }
    if (!location.trim()) {
      alert("Please enter your location!");
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || user.email || user.phoneNumber,
        email: user.email || "",
        photo: user.photoURL || "",
        bio,
        location,
        experience,
        offering: noSkills ? [] : offering,
        wanting,
        noSkills,
        rating: 5.0,
        ratingCount: 0,
        createdAt: new Date()
      });
      console.log("Profile created successfully, navigating to dashboard...");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error saving profile!");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 group">
         <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full animate-pulse"></div>
         <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-pink-600/5 blur-[140px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-2xl animate-fade-in py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-pink-600"></div>
          
          <header className="text-center mb-14">
             <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="relative w-28 h-28 rounded-3xl mx-auto border-2 border-slate-800 shadow-2xl object-cover p-1 bg-slate-950" />
                ) : (
                  <div className="relative w-28 h-28 rounded-3xl mx-auto bg-slate-950 flex items-center justify-center text-4xl text-blue-400 font-black border border-slate-800 shadow-2xl">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter leading-tight">Create Profile</h1>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] italic opacity-60">Complete your profile to start bartering skills.</p>
          </header>

          <div className="space-y-10">
            
            {/* Location & Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 italic flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MapPin size={12} className="text-blue-600" /> Your Location
                      </span>
                      <button 
                        onClick={getLocation}
                        type="button"
                        className="text-[10px] text-blue-500 hover:text-white transition-colors flex items-center gap-1 bg-blue-600/10 px-2 py-1 rounded-lg border border-blue-600/20 active:scale-95"
                      >
                         📍 Get Current Location
                      </button>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                    <input 
                      type="text" 
                      value={location} 
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. London / Global"
                      className="input-field w-full h-14 pl-14 font-bold" 
                    />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 italic flex items-center gap-2">
                      <Award size={12} className="text-blue-600" /> Skill Level
                  </label>
                  <div className="relative">
                    <Award className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                    <select 
                      value={experience} 
                      onChange={e => setExperience(e.target.value)}
                      className="input-field w-full h-14 pl-14 appearance-none cursor-pointer font-bold"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Expert</option>
                    </select>
                  </div>
               </div>
            </div>

            {/* Bio */}
            <div className="space-y-3">
               <label className="text-xs font-bold text-slate-500 italic flex items-center gap-2">
                  Tell us about yourself
               </label>
               <textarea 
                 value={bio} 
                 onChange={e => setBio(e.target.value)}
                 rows={4}
                 placeholder="Share your skills and what you want to learn..."
                 className="input-field w-full resize-none leading-relaxed py-5 font-bold"
               />
            </div>

            {/* Beginner Toggle */}
            <button 
              onClick={() => { setNoSkills(!noSkills); if (!noSkills) { setOffering([]); setExperience("Beginner"); } }}
              className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between group overflow-hidden relative
                ${noSkills ? 'bg-blue-600/5 border-blue-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
            >
               <div className="flex items-center gap-5 text-left relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${noSkills ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 text-slate-700 border border-slate-800'}`}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base uppercase italic tracking-tight">I just want to learn</h4>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black italic opacity-60">I am here to learn and don't have skills to offer yet.</p>
                  </div>
               </div>
               <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all relative z-10 ${noSkills ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-transparent'}`}>
                  <Check size={16} strokeWidth={4} />
               </div>
            </button>

            {/* Teaching Section */}
            {!noSkills && (
              <div className="animate-fade-in p-8 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3 mb-6 text-white">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <BookOpen size={20} />
                   </div>
                   <h3 className="text-lg font-black uppercase italic tracking-tighter">Skills I can teach</h3>
                </div>
                <SkillPicker 
                  selected={offering} 
                  onToggle={(s) => toggleSkill(s, offering, setOffering)} 
                  color="blue" 
                />
              </div>
            )}

            {/* Learning Section */}
            <div className="animate-fade-in p-8 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3 mb-6 text-white">
                 <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-600/20">
                    <GraduationCap size={20} />
                 </div>
                 <h3 className="text-lg font-black uppercase italic tracking-tighter">What I want to learn</h3>
              </div>
              <SkillPicker 
                selected={wanting} 
                onToggle={(s) => toggleSkill(s, wanting, setWanting)} 
                color="blue" 
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-10 flex flex-col gap-6">
               <button 
                 onClick={handleSubmit} 
                 disabled={saving}
                 className="w-full btn-primary h-20 flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-blue-600/40"
               >
                  {saving ? "Setting up..." : "Go to Dashboard"}
                  <ArrowRight size={20} strokeWidth={3} />
               </button>
               <button onClick={() => signOut(auth)} className="w-full h-12 flex items-center justify-center gap-2 text-slate-700 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.4em] italic group">
                  <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:bg-slate-800 transition-colors"><LogOut size={14} /></span> Log Out 
               </button>
            </div>

          </div>
        </div>
        
        <p className="mt-12 text-center text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] italic opacity-40">
           Skill Barter // Profile Version 1.0
        </p>
      </div>
    </div>
  );
}
