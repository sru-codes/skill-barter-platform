import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { Calendar, Clock, Check, X, Bell, User, ArrowRight, Shield, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    // Listen for bookings where user is either sender or receiver
    const q = query(
      collection(db, "bookings"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(list.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleStatus = async (book, status) => {
    try {
      await updateDoc(doc(db, "bookings", book.id), { status });
      
      const targetUid = book.fromUid === user.uid ? book.toUid : book.fromUid;
      
      await addDoc(collection(db, "notifications"), {
        toUid: targetUid,
        fromUid: user.uid,
        title: `Booking ${status.toUpperCase()}`,
        message: `${user.displayName || user.email} has ${status} the sync session scheduled for ${new Date(book.date).toLocaleDateString()}.`,
        type: status === "confirmed" ? "success" : "info",
        category: "TEMPORAL_SYNC",
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err) { console.error(err); }
  };


  const filtered = bookings.filter(b => {
    if (activeTab === "upcoming") return b.status === "confirmed" || b.status === "pending";
    return b.status === "completed" || b.status === "cancelled";
  });

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      
      <div className="mb-16">
        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">
          Exchange <span className="text-blue-600">Scheduler</span>
        </h1>
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] italic opacity-60">
          Coordinate your temporal sync windows for maximum knowledge transfer.
        </p>
      </div>

      <div className="flex gap-4 mb-12 bg-slate-900 w-fit p-2 rounded-2xl border border-slate-800 shadow-2xl">
        {["upcoming", "history"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all
              ${activeTab === tab 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                : "text-slate-500 hover:text-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-32 text-center">
           <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-800 italic">
              <Calendar size={40} />
           </div>
           <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tighter">Temporal Grid Empty</h3>
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] italic">No active sync windows scheduled in this sector.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filtered.map(book => {
            const isTarget = book.toUid === user.uid;
            const partnerName = isTarget ? book.fromName : book.toName;
            
            return (
              <div key={book.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 flex flex-col group relative overflow-hidden animate-fade-in shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-blue-500 shadow-inner">
                         <User size={24} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1">PARTNER_NODE</p>
                         <h4 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">{partnerName}</h4>
                      </div>
                   </div>
                   <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic border
                      ${book.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        book.status === 'confirmed' ? 'bg-blue-600/10 text-blue-500 border-blue-600/20' : 
                        'bg-slate-950 text-slate-600 border-slate-800'}`}>
                      {book.status}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center gap-5 shadow-inner">
                      <Calendar size={20} className="text-blue-600" />
                      <div>
                         <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1 italic">DATE</p>
                         <p className="text-xs font-black text-white uppercase italic tracking-tighter">{new Date(book.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                   </div>
                   <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center gap-5 shadow-inner">
                      <Clock size={20} className="text-blue-600" />
                      <div>
                         <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1 italic">TIME_WINDOW</p>
                         <p className="text-xs font-black text-white uppercase italic tracking-tighter">{book.time}</p>
                      </div>
                   </div>
                </div>

                {book.status === 'pending' && isTarget && (
                  <div className="flex gap-4 mt-auto">
                    <button 
                      onClick={() => handleStatus(book, 'confirmed')}
                      className="flex-1 btn-primary h-14 text-[10px] font-black uppercase tracking-[0.2em] italic shadow-lg shadow-blue-600/20"
                    >
                      Authorize Sync
                    </button>
                    <button 
                      onClick={() => handleStatus(book, 'cancelled')}
                      className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-700 hover:text-red-500 transition-all shadow-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                {book.status === 'confirmed' && (
                  <div className="flex gap-4 mt-auto">
                     <button 
                        onClick={() => {
                          handleStatus(book, 'completed');
                          navigate(`/rate/${isTarget ? book.fromUid : book.toUid}/${encodeURIComponent(partnerName)}`);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 text-slate-500 hover:text-blue-500 h-14 text-[10px] font-black uppercase tracking-[0.2em] italic transition-all rounded-xl shadow-lg shadow-black/20"
                     >
                        Finalize Protokol
                     </button>
                     <button className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
                        <Rocket size={20} />
                     </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
