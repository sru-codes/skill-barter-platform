import { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, getDoc, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, MessageSquare, Handshake, Sparkles, User, Rocket, Brain, ChevronLeft, ChevronRight, Briefcase, Check } from "lucide-react";

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function getAIMatch(currentUser, matchUser) {
  if (!GROQ_KEY) return { reason: "Exceptional synergy potential based on your mutual interests.", score: 85 };
  try {
    const prompt = `User 1 offers [${(currentUser?.offering || []).join(", ")}] and wants [${(currentUser?.wanting || []).join(", ")}]. User 2 offers [${(matchUser?.offering || []).join(", ")}] and wants [${(matchUser?.wanting || []).join(", ")}]. Give a compatibility score 0-100 and explain why they match in 2 sentences. Respond ONLY with a valid JSON object with keys "score" (number) and "reason" (string). No markdown, no extra text.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY.trim()}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 150,
      })
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanJson);

    return {
      reason: result?.reason || "Your goals align perfectly for a high-value skill swap.",
      score: result?.score || 75
    };
  } catch (err) {
    console.error("Neural Match Error:", err);
    return { reason: "Exceptional synergy potential.", score: 80 };
  }
}

function RequestButton({ match, currentUser, navigate }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const sendRequest = async () => {
    if (!auth?.currentUser) return;
    setSending(true);
    try {
      const q = query(collection(db, "barter_requests"),
        where("fromUser", "==", auth.currentUser.uid),
        where("toUser", "==", match?.uid));
      const existing = await getDocs(q);
      
      if (!existing.empty) { setSent(true); setSending(false); return; }
      
      await addDoc(collection(db, "barter_requests"), {
        fromUser: auth.currentUser.uid,
        fromName: currentUser?.name || "Someone",
        fromPhoto: currentUser?.photo || "",
        toUser: match?.uid,
        toName: match?.name || "Someone",
        message: `Hi ${match?.name}! I'd love to share skills with you.`,
        status: "pending",
        createdAt: serverTimestamp()
      });

      // Notify Target
      await addDoc(collection(db, "notifications"), {
        toUid: match?.uid,
        fromUid: auth.currentUser.uid,
        title: "New Request",
        message: `${currentUser?.name || "Someone"} wants to share skills with you.`,
        type: "success",
        category: "BARTER_REQUEST",
        read: false,
        createdAt: serverTimestamp()
      });

      setSent(true);
    } catch (err) { console.error("Request Error:", err); }
    setSending(false);
  };

  return (
    <div className="flex gap-4 mt-12">
      <button onClick={sendRequest} disabled={sent || sending}
        className={`flex-1 flex items-center justify-center gap-3 h-16 rounded-2xl font-black text-[11px] tracking-[0.2em] transition-all italic border shadow-2xl
          ${sent
            ? "bg-slate-900 text-blue-400 border-slate-800"
            : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-blue-600/30"}`}>
        {sent ? "Request Sent" : sending ? "Sending..." : "Request Skills"}
      </button>
      <button
        onClick={() => navigate(`/chat`)}
        className="h-16 w-16 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white transition-all italic flex items-center justify-center gap-2 group shrink-0"
      >
        <MessageSquare size={22} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}

export default function Dashboard({ user }) {
  const [profile, setProfile] = useState({ offering: [], wanting: [] });
  const [needsProfile, setNeedsProfile] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [aiInsights, setAiInsights] = useState({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [toast, setToast] = useState({ show: false, message: "" });
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 4000);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categories = ["All Categories", "Tech", "Design", "Finance", "Marketing", "Creative", "Life Skills"];

  useEffect(() => {
    if (!auth?.currentUser) return;
    loadDashboard();
    // Show Welcome Toast
    showToast(`Welcome back, ${auth.currentUser.displayName || "Trader"}!`);
  }, [user]);

  const loadDashboard = async () => {
    try {
      if (!auth?.currentUser) {
        setLoading(false);
        return;
      }
      
      const myDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      
      if (!myDoc.exists()) {
        setProfile({ name: auth.currentUser?.displayName || "Member", uid: auth.currentUser.uid, offering: [], wanting: [] });
        setNeedsProfile(true);
        setLoading(false);
        return;
      }
      
      const myData = myDoc.data();
      const safeProfile = { 
         ...myData, 
         uid: auth.currentUser.uid,
         offering: Array.isArray(myData?.offering) ? myData.offering : [],
         wanting: Array.isArray(myData?.wanting) ? myData.wanting : []
      };
      
      setProfile(safeProfile);

      // Real-time Pending Requests Count
      const pendingSnap = await getDocs(query(collection(db, "barter_requests"), 
          where("toUser", "==", auth.currentUser.uid), 
          where("status", "==", "pending")));
      setPendingCount(pendingSnap.size);

      if (safeProfile.offering.length === 0 && safeProfile.wanting.length === 0) {
        setNeedsProfile(true);
        setLoading(false);
        return;
      }

      const usersSnap = await getDocs(collection(db, "users"));
      const matchedList = [];

      usersSnap.forEach(d => {
        if (d.id === auth.currentUser.uid) return;
        const other = d.data();
        const otherOffering = Array.isArray(other?.offering) ? other.offering : [];
        const otherWanting = Array.isArray(other?.wanting) ? other.wanting : [];

        const hasMatch = otherOffering.some(s => safeProfile.wanting.includes(s)) ||
                         otherWanting.some(s => safeProfile.offering.includes(s));

        if (hasMatch) {
          matchedList.push({ ...other, uid: d.id, offering: otherOffering, wanting: otherWanting });
        }
      });

      matchedList.sort((a, b) => (b?.rating || 5) - (a?.rating || 5));
      setMatches(matchedList);
      setLoading(false);

      const top3 = matchedList.slice(0, 3);
      const insights = {};
      for (const m of top3) {
        insights[m.uid] = await getAIMatch(safeProfile, m);
      }
      setAiInsights(insights);
      
    } catch (err) { 
      console.error(err); 
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(m => {
    const lowerSearch = search.toLowerCase();
    const matchesSearch = search === "" ||
      (m?.name || "").toLowerCase().includes(lowerSearch) ||
      (m?.offering || []).some(s => s.toLowerCase().includes(lowerSearch));

    const matchesCategory = categoryFilter === "All Categories" || (m?.categories && m.categories.includes(categoryFilter));
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center p-20 text-center">
      <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-blue-600/20"></div>
      <p className="text-slate-500 font-bold text-xs italic animate-pulse">Loading command center...</p>
    </div>
  );

  if (needsProfile) return (
    <div className="max-w-7xl mx-auto min-h-screen pt-10 px-6">
      <div className="h-[70vh] flex flex-col items-center justify-center p-10 text-center animate-fade-in bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5"></div>
        <div className="w-24 h-24 bg-slate-950 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-slate-800 shadow-2xl"><User className="text-slate-600" size={48} /></div>
        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4 relative z-10">Profile incomplete</h2>
        <button onClick={() => navigate("/settings")} className="bg-blue-600 px-12 py-5 rounded-2xl flex items-center gap-4 text-xs font-black tracking-[0.2em] uppercase italic shadow-2xl shadow-blue-600/30 relative z-10 hover:scale-105 transition-transform"><Rocket size={20} />Go to Settings</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto min-h-screen relative">
      
      {/* Dynamic Toast Notification */}
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-blue-500/10 border border-blue-500/50 text-blue-400 px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(59,130,246,0.2)] flex items-center gap-3 animate-fade-in backdrop-blur-md">
          <Check size={20} />
          <span className="text-[10px] font-black tracking-widest uppercase italic">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-16 animate-fade-in flex flex-col lg:flex-row gap-8">
        <div className="flex-1 py-10 px-10 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[100px] -z-10"></div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight text-white italic max-w-lg">
            Welcome back, <br/><span className="text-blue-600">{(profile?.name || "Trader").split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-700 font-black text-[10px] uppercase italic tracking-[0.6em]">COMMAND CENTER</p>
        </div>

        <div className="w-full lg:w-96 py-8 px-10 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl flex flex-col justify-center">
          <div className="flex items-center gap-5 mb-5">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-1 shrink-0">
              {profile?.photo ? <img src={profile.photo} className="w-full h-full object-cover rounded-xl" /> : <User className="text-slate-800" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white italic tracking-widest leading-none truncate">{profile?.name || "Member"}</p>
              <p className="text-[10px] text-blue-500 font-bold italic mt-2 truncate">{profile?.workOrSchool || "Member since 2026"}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate("/settings")} className="flex-1 h-12 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 rounded-xl italic">Settings</button>
            <button onClick={() => navigate("/settings")} className="flex-1 h-12 bg-blue-600 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-xl italic shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"><Rocket size={14} /> Update</button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fade-in">
        {[
          { label: "Skills You Offer", value: profile?.offering?.length || 0, icon: Briefcase, color: "text-blue-500" },
          { label: "Learning Goals", value: profile?.wanting?.length || 0, icon: Sparkles, color: "text-purple-500" },
          { label: "Pending Requests", value: pendingCount, icon: Handshake, color: "text-emerald-500", link: "/requests" }
        ].map((stat, i) => (
          <div key={i} onClick={() => stat.link && navigate(stat.link)} className={`bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-slate-700 transition-all ${stat.link ? 'cursor-pointer hover:bg-slate-900/80' : ''}`}>
            <div>
              <p className="text-[10px] font-bold text-slate-700 italic mb-2 uppercase tracking-wide">{stat.label}</p>
              <p className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}><stat.icon size={20} /></div>
          </div>
        ))}
      </div>

      {/* Expertise */}
      <div className="mb-16 animate-fade-in">
         <h2 className="text-2xl font-black text-white italic tracking-tighter mb-6">Your Expertise</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] -z-10"></div>
               <p className="text-[10px] font-black text-blue-500 italic mb-6 tracking-widest uppercase flex items-center gap-2"><Briefcase size={12}/> Offering</p>
               <div className="flex flex-wrap gap-3">
                  {profile?.offering?.length > 0 ? profile.offering.map(skill => (
                     <span key={skill} className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black tracking-widest italic">{skill}</span>
                  )) : <p className="text-[10px] text-slate-600 italic font-bold">No skills added.</p>}
               </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[80px] -z-10"></div>
               <p className="text-[10px] font-black text-purple-500 italic mb-6 tracking-widest uppercase flex items-center gap-2"><Sparkles size={12}/> Goals</p>
               <div className="flex flex-wrap gap-3">
                  {profile?.wanting?.length > 0 ? profile.wanting.map(skill => (
                     <span key={skill} className="px-4 py-2 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-xl text-[10px] font-black tracking-widest italic">{skill}</span>
                  )) : <p className="text-[10px] text-slate-600 italic font-bold">No goals added.</p>}
               </div>
            </div>
         </div>
      </div>

      {/* Search & Tabs */}
      <div className="sticky top-6 z-[40] mb-16 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-600 transition-colors" size={24} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for matches..." className="input-field w-full h-20 pl-16 pr-8 text-sm font-black tracking-widest italic" />
          </div>
          <div className="relative flex items-center group/nav w-full lg:w-auto overflow-hidden">
            <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar bg-slate-950 p-2 rounded-2xl border border-slate-900 shadow-inner scroll-smooth">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-6 h-12 rounded-xl text-[10px] font-black italic tracking-widest transition-all border whitespace-nowrap ${categoryFilter === cat ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-700"}`}>{cat}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-32 text-center animate-fade-in relative overflow-hidden">
          <div className="w-24 h-24 bg-slate-950 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-slate-800"><Sparkles className="text-blue-600" size={48} /></div>
          <h3 className="text-3xl font-black text-white italic tracking-tighter">No Matches Yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-10 pb-20">
          {filteredMatches.map((match, i) => {
            const insight = aiInsights[match?.uid] || null;
            return (
              <div key={match?.uid || i} className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col group relative overflow-hidden animate-fade-in hover:border-blue-500/50 transition-all shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] -z-10 group-hover:bg-blue-600/10 transition-colors"></div>
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center overflow-hidden group-hover:border-blue-600 transition-all p-1">
                    {match?.photo ? <img src={match.photo} className="w-full h-full object-cover rounded-xl" /> : <User size={32} className="text-slate-800" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-black text-white truncate mb-1 italic tracking-tighter group-hover:text-blue-400 leading-none">{match?.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-emerald-500 font-black text-[9px] tracking-widest italic">{insight?.score || 85}% MATCH</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6 flex-1">
                   {insight && <p className="text-slate-400 text-[11px] font-bold italic leading-relaxed border-l-2 border-blue-600 pl-4 py-1 italic">"{insight.reason}"</p>}
                   <div className="flex flex-wrap gap-2">
                      {match?.offering?.slice(0,3).map(s => <span key={s} className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg text-[9px] font-black tracking-widest italic">{s}</span>)}
                   </div>
                </div>
                <RequestButton match={match} currentUser={profile} navigate={navigate} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}