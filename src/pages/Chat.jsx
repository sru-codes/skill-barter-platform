import { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { Send, User, MessageSquare, Briefcase, ArrowLeft } from "lucide-react";

export default function Chat() {
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // The selected user object
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch unique accepted barter connections
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!auth.currentUser) return;
        const uid = auth.currentUser.uid;
        
        // 1. Fetch barters I sent and were accepted
        const qFrom = query(collection(db, "barter_requests"), where("fromUser", "==", uid), where("status", "==", "accepted"));
        // 2. Fetch barters sent to me that I accepted
        const qTo = query(collection(db, "barter_requests"), where("toUser", "==", uid), where("status", "==", "accepted"));

        const [snapFrom, snapTo] = await Promise.all([getDocs(qFrom), getDocs(qTo)]);
        
        const uniqueIds = new Set();
        snapFrom.forEach(d => uniqueIds.add(d.data().toUser));
        snapTo.forEach(d => uniqueIds.add(d.data().fromUser));

        if (uniqueIds.size === 0) {
          setLoading(false);
          return;
        }

        // Fetch precise data payload for all partners
        const userProfiles = [];
        for (const targetId of uniqueIds) {
           const userSnap = await getDoc(doc(db, "users", targetId));
           if (userSnap.exists()) {
               userProfiles.push({ uid: targetId, ...userSnap.data() });
           }
        }

        setContacts(userProfiles);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchContacts();
  }, []);

  // Sync real-time messages with exact activeChat
  useEffect(() => {
    if (!activeChat || !auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const partnerId = activeChat.uid;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(partnerId)) {
          msgs.push({ id: doc.id, ...data });
        }
      });
      // Safety sort by native firestore timestamps
      msgs.sort((a,b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
      setMessages(msgs);
    });

    return () => unsub();
  }, [activeChat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const text = newMessage.trim();
    setNewMessage("");

    try {
      await addDoc(collection(db, "chats"), {
        participants: [auth.currentUser.uid, activeChat.uid],
        text: text,
        senderId: auth.currentUser.uid,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
     <div className="flex justify-center items-center h-[60vh]">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.4)]"></div>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-20">
      <div className="max-w-6xl mx-auto min-h-[calc(100vh-160px)] h-[84vh] flex bg-slate-900/60 backdrop-blur-3xl border border-slate-700/50 rounded-[3rem] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.6)] relative animate-fade-in ring-1 ring-white/5">
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[100px] pointer-events-none"></div>

         {/* Left Sidebar - Contacts List */}
         <div className="w-full md:w-[320px] border-r border-slate-800/60 flex flex-col bg-slate-900/60 relative z-10 shrink-0">
            <div className="p-10 border-b border-slate-800/60 bg-slate-950/20">
               <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-4">
                 <div className="w-10 h-10 border border-blue-500/30 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shadow-inner">
                    <MessageSquare size={20} strokeWidth={3}/>
                 </div>
                 Chats
               </h2>
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] italic mt-4 pl-1">Barter Partners</p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
               {contacts.length === 0 ? (
                  <div className="text-center p-8 bg-slate-950/50 rounded-2xl border border-slate-800 shadow-inner">
                     <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic">No active connections</p>
                     <p className="text-[10px] text-slate-500 font-bold tracking-wider italic mt-2">Accept a barter request first.</p>
                  </div>
               ) : contacts.map((contact) => (
                  <button 
                    key={contact.uid}
                    onClick={() => setActiveChat(contact)}
                    className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all text-left group
                      ${activeChat?.uid === contact.uid 
                        ? "bg-blue-600/10 border-blue-500/30 shadow-[0_5px_20px_rgba(59,130,246,0.05)] border-2" 
                        : "bg-slate-950/40 hover:bg-slate-900 border border-slate-800 hover:border-slate-700"}
                    `}
                  >
                     <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border-2 transition-colors ${activeChat?.uid === contact.uid ? "border-blue-500 bg-slate-900" : "border-slate-800 bg-slate-950"}`}>
                        {contact.photo ? <img src={contact.photo} className="w-full h-full object-cover"/> : <User className="text-slate-600 w-full h-full p-3"/>}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-black italic tracking-widest truncate transition-colors ${activeChat?.uid === contact.uid ? "text-blue-400" : "text-white group-hover:text-blue-300"}`}>{contact.name}</h3>
                        <p className="text-[9px] text-slate-500 font-bold tracking-wider italic truncate flex items-center gap-1.5 mt-1.5 opacity-80"><Briefcase size={10} className="text-blue-600"/> {contact.workOrSchool || "Barter Network"}</p>
                     </div>
                  </button>
               ))}
            </div>
         </div>

         {/* Right Panel - Chat Area */}
         <div className={`flex-1 flex flex-col relative z-10 ${!activeChat ? "hidden md:flex" : "flex"} bg-slate-950/30`}>
            {!activeChat ? (
               <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                  <div className="w-24 h-24 bg-slate-950 rounded-[2rem] border border-slate-800 flex items-center justify-center mb-8 shadow-inner shadow-slate-900">
                     <MessageSquare className="text-slate-600" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter mb-3">Select a Partner</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] italic">Open a secure channel</p>
               </div>
            ) : (
               <>
                  {/* Chat Header */}
                  <div className="h-28 bg-slate-950/80 backdrop-blur-3xl border-b border-slate-800 flex items-center px-8 flex-shrink-0 gap-6 z-20 shadow-xl shadow-slate-950/50">
                     <button onClick={() => setActiveChat(null)} className="md:hidden w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-blue-500 hover:text-white shrink-0">
                         <ArrowLeft size={20} />
                     </button>
                     <div className="w-14 h-14 bg-slate-900 rounded-2xl flex-shrink-0 border-2 border-blue-500/50 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/10">
                        {activeChat.photo ? <img src={activeChat.photo} className="w-full h-full object-cover"/> : <User className="text-blue-600"/>}
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-white italic tracking-tighter leading-none mb-2">{activeChat.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                          <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase italic border border-slate-800 bg-slate-900 px-3 py-1 rounded-md">Connection Secured</p>
                        </div>
                     </div>
                  </div>

                  {/* Messages List Area */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-8 scroll-smooth">
                     {messages.map((msg, i) => {
                        const isMe = msg.senderId === auth.currentUser?.uid;
                        
                        return (
                           <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
                              <div className={`max-w-[75%] lg:max-w-[55%] rounded-[1.5rem] p-6 text-xs font-bold leading-relaxed tracking-widest italic break-words
                                 ${isMe 
                                    ? "bg-blue-600 text-white shadow-[0_5px_25px_rgba(59,130,246,0.3)] border-[0.5px] border-blue-400/50 rounded-br-none" 
                                    : "bg-slate-950 text-slate-300 border border-slate-800 shadow-xl rounded-bl-none"}`}
                              >
                                 {msg.text}
                              </div>
                           </div>
                        );
                     })}
                     <div ref={bottomRef} className="h-1 shrink-0 px-1" />
                  </div>

                  {/* Secure Input Dock */}
                  <div className="p-8 bg-slate-950/80 backdrop-blur-md border-t border-slate-800">
                     <form onSubmit={sendMessage} className="flex gap-4">
                        <input 
                           type="text"
                           value={newMessage}
                           onChange={(e) => setNewMessage(e.target.value)}
                           placeholder="Transmit message..."
                           className="flex-1 bg-slate-900/50 border border-slate-800 rounded-[1.5rem] h-16 px-6 text-sm font-black text-white italic placeholder:text-slate-600 placeholder:italic placeholder:font-bold outline-none focus:border-blue-500 transition-colors shadow-inner"
                        />
                        <button 
                           type="submit" 
                           disabled={!newMessage.trim()}
                           className="w-16 h-16 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:bg-slate-800 text-white rounded-[1.5rem] flex items-center justify-center transition-all shadow-[0_5px_20px_rgba(59,130,246,0.3)] hover:scale-105 disabled:shadow-none disabled:scale-100 disabled:hover:bg-slate-800 shrink-0"
                        >
                           <Send size={22} className={newMessage.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} strokeWidth={3}/>
                        </button>
                     </form>
                  </div>
               </>
            )}
         </div>
      </div>
    </div>
  );
}