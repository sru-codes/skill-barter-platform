import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Zap, Sparkles, Search, ArrowRight } from "lucide-react";

export default function Messages() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q1 = query(
      collection(db, "requests"),
      where("status", "==", "accepted"),
      where("fromUid", "==", user.uid)
    );
    const q2 = query(
      collection(db, "requests"),
      where("status", "==", "accepted"),
      where("toUid", "==", user.uid)
    );

    const unsub1 = onSnapshot(q1, (snap) => {
      const sent = snap.docs.map(doc => ({
        id: doc.id,
        partnerId: doc.data().toUid,
        partnerName: doc.data().toName,
        ...doc.data()
      }));
      updateChats(sent, "sent");
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      const received = snap.docs.map(doc => ({
        id: doc.id,
        partnerId: doc.data().fromUid,
        partnerName: doc.data().fromName,
        ...doc.data()
      }));
      updateChats(received, "received");
    });

    return () => { unsub1(); unsub2(); };
  }, [user]);

  const updateChats = (newChats, type) => {
    setChats(prev => {
      const otherType = type === "sent" ? "received" : "sent";
      const otherChats = prev.filter(c => c._source === otherType);
      const combined = [...otherChats, ...newChats.map(c => ({ ...c, _source: type }))];
      
      const unique = [];
      const map = new Map();
      for (const item of combined) {
        if (!map.has(item.partnerId)) {
          map.set(item.partnerId, true);
          unique.push(item);
        }
      }
      return unique;
    });
    setLoading(false);
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      
      {/* Header with Background Glow */}
      <div className="relative mb-16 p-12 bg-slate-900 border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none strike-indigo">
            Barter <span className="text-indigo-600">Messages</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] italic opacity-70">
            Secure communication channels with your learning partners.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {chats.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-dashed border-slate-800 rounded-[4rem] p-32 text-center group hover:border-indigo-500/30 transition-all">
            <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
               <MessageSquare className="text-slate-700 group-hover:text-indigo-500 transition-colors" size={40} />
            </div>
            <h3 className="text-white font-black text-3xl mb-4 uppercase italic tracking-tighter">No Active Signals</h3>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] italic mb-12 max-w-sm mx-auto opacity-60 leading-relaxed">
              Initialize a trade request to open a neural communication channel.
            </p>
            <button 
              onClick={() => navigate("/dashboard")}
              className="px-12 py-5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl italic hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/40"
            >
              Scan For Partners
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {chats.map((chat) => (
              <div 
                key={chat.partnerId}
                onClick={() => navigate(`/chat/${chat.partnerId}/${encodeURIComponent(chat.partnerName)}`)}
                className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all hover:scale-[1.01] shadow-xl overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center gap-8 z-10 w-full md:w-auto">
                  <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-3xl font-black text-indigo-500 shadow-2xl group-hover:border-indigo-500/40 transition-all italic">
                    {chat.partnerName?.[0]?.toUpperCase() || "X"}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2 group-hover:text-indigo-400 transition-colors">
                      {chat.partnerName}
                    </h3>
                    <div className="flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                       <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] italic opacity-60">Neural Link Stable</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-10 z-10 w-full md:w-auto justify-between md:justify-end border-t border-slate-800 pt-6 md:pt-0 md:border-t-0">
                  <div className="hidden lg:block text-right">
                     <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] italic mb-1">Status</p>
                     <p className="text-white font-black text-xs uppercase italic tracking-widest text-indigo-400">READY TO BARTER</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xl group-hover:rotate-12">
                     <ArrowRight size={24} strokeWidth={3} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
