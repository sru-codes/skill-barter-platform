import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import { Bell, Check, Trash2, Info, Zap, Shield, AlertTriangle } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("toUid", "in", [user.uid, "all"]),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Notifications Fetch Error:", err);
      setLoading(false); // Stop loading even on error
    });
    return () => unsub();
  }, [user]);

  const markRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="py-20 flex justify-center">
       <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      
      <div className="mb-16">
        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-4 leading-none">
          Notifications <span className="text-blue-600">Feed</span>
        </h1>
        <p className="text-slate-500 font-black text-[10px] tracking-[0.4em] italic opacity-60">
          Stay updated with your skill requests and system alerts.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-32 text-center">
           <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-800 italic">
              <Bell size={40} />
           </div>
            <h3 className="text-2xl font-black text-white mb-3 italic tracking-tighter">No Notifications</h3>
            <p className="text-slate-600 text-[10px] font-black tracking-[0.3em] italic">You don't have any notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {notifications.map(notif => (
            <div 
              key={notif.id}
              onClick={() => !notif.read && markRead(notif.id)}
              className={`bg-slate-900 border ${notif.read ? "border-slate-800 opacity-60" : "border-blue-500/50 shadow-[0_0_30px_rgba(79,70,229,0.05)]"} p-8 md:p-10 rounded-[2.5rem] flex items-start gap-6 transition-all group cursor-pointer hover:bg-slate-800/50 relative overflow-hidden`}
            >
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all 
                 ${notif.type === 'alert' ? "bg-red-600/10 text-red-500 border-red-500/20" : 
                   notif.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                   "bg-blue-600/10 text-blue-500 border-blue-600/20"}`}>
                  {notif.type === 'alert' ? <AlertTriangle size={24} /> : 
                   notif.type === 'success' ? <Check size={24} /> : <Zap size={24} />}
               </div>
               
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-[9px] font-black text-slate-600 tracking-widest italic">{notif.category || "General"}</p>
                     <p className="text-[8px] font-black text-slate-700 tracking-widest italic">{notif.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <h4 className="text-lg font-black text-white italic tracking-tighter mb-2 leading-none group-hover:text-blue-400 transition-colors">{notif.title}</h4>
                  <p className="text-slate-500 text-xs font-black tracking-wider italic leading-relaxed opacity-80">{notif.message}</p>
               </div>

               {!notif.read && (
                 <div className="absolute top-8 right-8 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,1)]"></div>
               )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-20 pt-10 border-t border-slate-900 flex justify-center">
         <button className="flex items-center gap-3 text-slate-700 hover:text-white transition-all text-[10px] font-black tracking-[0.4em] italic group">
            <Trash2 size={16} className="group-hover:text-red-500 transition-colors" /> Clear All
         </button>
      </div>
    </div>
  );
}
