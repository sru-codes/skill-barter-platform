import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Trophy, Star, Medal, User, Zap, Sparkles, TrendingUp, Shield, Rocket } from "lucide-react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaders = async () => {
      const q = query(
        collection(db, "users"),
        orderBy("rating", "desc"),
        orderBy("ratingCount", "desc"),
        limit(10)
      );
      const snap = await getDocs(q);
      setLeaders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    loadLeaders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 min-h-screen">
      
      <div className="text-center mb-24 animate-fade-in">
        <div className="relative inline-block mb-10">
           <div className="absolute inset-0 bg-yellow-500 blur-[80px] opacity-10 animate-pulse"></div>
           <div className="w-24 h-24 bg-slate-900 border-2 border-slate-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl relative z-10 rotate-12 group hover:rotate-0 transition-transform duration-500">
              <Trophy size={48} className="text-yellow-500" />
           </div>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">
          Mastery <span className="text-indigo-600">Ranks</span>
        </h1>
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] italic opacity-60 max-w-lg mx-auto leading-relaxed">
          The grid's most efficient knowledge nodes, ranked by neural validation and sync frequency.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
           <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {leaders.map((leader, i) => (
            <div key={leader.id} 
              className={`bg-slate-900 border rounded-[2.5rem] p-8 md:p-10 flex items-center gap-6 md:gap-10 animate-fade-in relative overflow-hidden transition-all group
                ${i === 0 ? "border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.05)]" : 
                  i === 1 ? "border-slate-400/30" : 
                  i === 2 ? "border-orange-600/30" : "border-slate-800 shadow-2xl"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
               {i === 0 && <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] -z-10"></div>}
               
               <div className="flex flex-col items-center">
                  <div className={`text-4xl font-black italic tracking-tighter transition-all group-hover:scale-110
                    ${i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-600" : "text-slate-800"}`}>
                    {(i + 1).toString().padStart(2, '0')}
                  </div>
                  {i < 3 && <Medal size={18} className={`mt-2 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : "text-orange-600"}`} />}
               </div>

               <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover:border-indigo-600">
                  {leader.photo ? <img src={leader.photo} className="w-full h-full object-cover rounded-xl" /> : <User className="text-slate-800" />}
               </div>

               <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase truncate group-hover:text-indigo-400 transition-colors leading-none mb-2">{leader.name}</h3>
                  <div className="flex flex-wrap gap-4 items-center">
                     <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-2">
                        <Rocket size={12} className="text-indigo-600" /> {leader.experience || "INTERMEDIATE"} TIER
                     </span>
                     <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
                        <Star size={12} fill="currentColor" className="text-yellow-500" />
                        <span className="text-[10px] font-black text-white italic tracking-tighter">{leader.rating?.toFixed(1) || "5.0"}</span>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic ml-1 opacity-50">/{leader.ratingCount || 0} LOGS</span>
                     </div>
                  </div>
               </div>

               <div className="hidden lg:flex flex-col items-end gap-3 shrink-0">
                  <div className="flex flex-wrap gap-2 justify-end">
                     {leader.offering?.slice(0, 2).map(s => (
                       <span key={s} className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-indigo-400 rounded-lg text-[8px] font-black uppercase tracking-widest italic">
                          {s}
                       </span>
                     ))}
                  </div>
                  <div className="w-32 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                     <div className="h-full bg-indigo-600 animate-pulse" style={{ width: `${(leader.rating / 5) * 100}%` }}></div>
                  </div>
               </div>
               
               <div className="absolute top-8 right-8 text-slate-800/10 group-hover:text-indigo-500/10 transition-colors pointer-events-none">
                  {i === 0 ? <Zap size={80} /> : <Shield size={80} />}
               </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-24 p-12 bg-slate-900/50 border border-slate-800 rounded-[3rem] text-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-indigo-600/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <Sparkles className="text-indigo-600/20 mx-auto mb-6" size={40} />
         <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] italic leading-relaxed">
           ELEVATE YOUR MASTERY STATUS BY COMPLETING <br /> SUCCESSFUL BARTER CYCLES IN THE GRID.
         </p>
      </div>

    </div>
  );
}
