import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, addDoc } from "firebase/firestore";
import { Handshake, User, Check, X, Send, Inbox, ArrowRight } from "lucide-react";

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received"); // 'received' or 'sent'
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    fetchRequests();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const fetchRequests = async () => {
    try {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      
      const inQ = query(collection(db, "barter_requests"), where("toUser", "==", uid));
      const inSnap = await getDocs(inQ);
      setIncoming(inSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b?.createdAt - a?.createdAt));

      const outQ = query(collection(db, "barter_requests"), where("fromUser", "==", uid));
      const outSnap = await getDocs(outQ);
      setOutgoing(outSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b?.createdAt - a?.createdAt));

    } catch (err) { console.error("Error fetching requests", err); }
    setLoading(false);
  };

  const handleUpdate = async (reqId, status, targetUid) => {
    try {
      await updateDoc(doc(db, "barter_requests", reqId), { status });
      // Remove or update from UI
      setIncoming(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
      
      if (status === 'accepted') {
         await addDoc(collection(db, "notifications"), {
            toUid: targetUid,
            fromUid: auth.currentUser.uid,
            title: "Request Accepted!",
            message: `${auth.currentUser.displayName || "Someone"} accepted your barter request!`,
            type: "success",
            category: "BARTER_ACCEPTED",
            read: false,
            createdAt: serverTimestamp()
         });
         showToast("Barter connection accepted successfully!");
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return (
     <div className="flex justify-center items-center h-[60vh]">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  return (
    <div className="max-w-4xl mx-auto min-h-screen relative">
      
      {/* Dynamic Toast Notification */}
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.2)] flex items-center gap-3 animate-fade-in backdrop-blur-md">
          <Check size={20} />
          <span className="text-xs font-black tracking-widest uppercase italic">{toast.message}</span>
        </div>
      )}

      <div className="mb-12 animate-fade-in flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4 flex items-center gap-3 leading-none">
          <Handshake className="text-blue-600" size={48} />
          Barter <span className="text-blue-500">Requests</span>
        </h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.4em] italic pl-2 mb-10">Manage your connections</p>
        
        {/* Sleek Tabbed Interface */}
        <div className="bg-slate-900 border border-slate-800 p-2 rounded-3xl flex w-full max-w-sm shadow-xl">
           <button 
             onClick={() => setActiveTab("received")}
             className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase italic transition-all ${activeTab === 'received' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
             <Inbox size={14}/> Incoming
           </button>
           <button 
             onClick={() => setActiveTab("sent")}
             className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase italic transition-all ${activeTab === 'sent' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
             <Send size={14}/> Outgoing
           </button>
        </div>
      </div>

      <div className="animate-fade-in w-full pb-32">
         {/* Received View */}
         {activeTab === 'received' && (
            <div className="space-y-6">
               {incoming.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-16 text-center shadow-inner mt-4">
                     <p className="text-slate-600 font-bold italic text-[10px] tracking-[0.4em] uppercase">No incoming requests</p>
                  </div>
               ) : incoming.map((req, i) => (
                  <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all" style={{animationDelay: `${i*0.05}s`}}>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] -z-10 group-hover:bg-blue-600/10 transition-colors"></div>
                     
                     <div className="flex-1 flex items-start gap-5">
                        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex-shrink-0 border-2 border-slate-800 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-blue-500 transition-colors">
                           {req.fromPhoto ? <img src={req.fromPhoto} className="w-full h-full object-cover" /> : <User className="text-slate-700 w-full h-full p-3"/> }
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className="text-2xl font-black text-white italic leading-none mb-1 group-hover:text-blue-400 transition-colors truncate">{req.fromName}</h3>
                           <p className="text-[9px] font-black text-blue-500 tracking-[0.2em] uppercase italic mb-4">Wants to barter skills</p>
                           <p className="text-slate-400 text-xs italic font-bold leading-relaxed bg-slate-950/80 rounded-2xl p-5 border border-slate-800 shadow-inner break-words break-all">"{req.message}"</p>
                        </div>
                     </div>

                     <div className="w-full md:w-64 flex flex-col justify-center">
                        {req.status === 'pending' ? (
                           <div className="flex flex-col gap-3">
                              <button onClick={() => handleUpdate(req.id, 'accepted', req.fromUser)} className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] text-[10px] uppercase font-black italic tracking-widest transition-all flex items-center justify-center gap-2">
                                 <Check size={16} strokeWidth={3}/> Accept Barter
                              </button>
                              <button onClick={() => handleUpdate(req.id, 'declined', req.fromUser)} className="w-full h-14 bg-transparent hover:bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-slate-400 text-[10px] uppercase font-black italic tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-inner hover:text-white">
                                 <X size={16} strokeWidth={3}/> Decline
                              </button>
                           </div>
                        ) : (
                           <div className="h-14 w-full bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-[10px] font-black italic tracking-widest shadow-inner">
                              {req.status === 'accepted' ? <span className="text-emerald-500 flex items-center gap-2"><Check size={16} strokeWidth={3}/> ACCEPTED</span> : <span className="text-red-500 flex items-center gap-2"><X size={16} strokeWidth={3}/> DECLINED</span>}
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Sent View */}
         {activeTab === 'sent' && (
            <div className="space-y-6">
               {outgoing.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-16 text-center shadow-inner mt-4 opacity-50">
                     <p className="text-slate-600 font-bold italic text-[10px] tracking-[0.4em] uppercase">No outgoing requests</p>
                  </div>
               ) : outgoing.map((req, i) => (
                  <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col shadow-inner relative overflow-hidden hover:border-slate-700 transition-all">
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <p className="text-[9px] font-black text-slate-600 tracking-[0.2em] uppercase italic mb-1">Sent Proposal To</p>
                           <h3 className="text-xl font-black text-white italic leading-none">{req.toName}</h3>
                        </div>
                        <span className={`px-5 py-2.5 rounded-xl text-[9px] font-black italic tracking-widest uppercase border shadow-inner
                           ${req.status === 'pending' ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/20' : 
                             req.status === 'accepted' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 
                             'bg-red-500/5 text-red-500 border-red-500/20'}`}>
                           {req.status}
                        </span>
                     </div>
                     <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/50 break-words">
                        <p className="text-slate-500 text-[10px] italic font-bold leading-relaxed">"{req.message}"</p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

    </div>
  );
}
