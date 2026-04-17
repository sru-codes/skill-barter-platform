import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { Search, MapPin, User, MessageSquare, Briefcase, Zap, Star, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SkillGrid() {
  const [users, setUsers] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (auth.currentUser) {
           const mySnap = await getDoc(doc(db, "users", auth.currentUser.uid));
           if (mySnap.exists()) setMyProfile(mySnap.data());
        }

        const snap = await getDocs(collection(db, "users"));
        const userList = [];
        snap.forEach(doc => {
          if (doc.id === auth.currentUser?.uid) return;
          const data = doc.data();
          if (data.offering && data.offering.length > 0) {
            userList.push({ uid: doc.id, ...data });
          }
        });

        // Mock data injection block for testing empty DBs
        if (userList.length === 0) {
           userList.push(
            {
               uid: "mock-1",
               name: "Alex Dev",
               workOrSchool: "GIET Baniatangi",
               location: "Bangalore",
               photo: "https://randomuser.me/api/portraits/men/32.jpg",
               offering: ["Python", "Machine Learning", "Data Analysis"],
               isOnline: true
            },
            {
               uid: "mock-2",
               name: "Sarah Jenkins",
               workOrSchool: "IIT Bombay",
               location: "Mumbai",
               photo: "https://randomuser.me/api/portraits/women/44.jpg",
               offering: ["React", "UI/UX Design", "Figma"],
               isOnline: false
            },
            {
               uid: "mock-3",
               name: "Rahul Tech",
               workOrSchool: "NIT Rourkela",
               location: "Pune",
               photo: "https://randomuser.me/api/portraits/men/84.jpg",
               offering: ["Java", "Spring Boot", "System Design"],
               isOnline: true
            }
           );
        }

        setUsers(userList);
      } catch (err) {
        console.error("Fetch Users Error:", err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const sendRequest = async (e) => {
    e.preventDefault();
    if (!selectedUser || !message.trim()) return;
    setSending(true);
    try {
      const q = query(collection(db, "barter_requests"),
        where("fromUser", "==", auth.currentUser.uid),
        where("toUser", "==", selectedUser.uid));
      const existing = await getDocs(q);
      
      if (existing.empty) {
         await addDoc(collection(db, "barter_requests"), {
           fromUser: auth.currentUser.uid,
           fromName: auth.currentUser.displayName || "Someone",
           fromPhoto: auth.currentUser.photoURL || "",
           toUser: selectedUser.uid,
           toName: selectedUser.name,
           message: message.trim(),
           status: "pending",
           createdAt: serverTimestamp()
         });
         
         await addDoc(collection(db, "notifications"), {
           toUid: selectedUser.uid,
           fromUid: auth.currentUser.uid,
           title: "New Request",
           message: `${auth.currentUser.displayName || "Someone"} wants to share skills.`,
           type: "success",
           category: "SKILL_REQUEST",
           read: false,
           createdAt: serverTimestamp()
         });
      }
      setSelectedUser(null);
      setMessage("");
    } catch (err) { console.error(err); }
    setSending(false);
  };

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    const matchName = u.name?.toLowerCase().includes(s);
    const matchOffering = u.offering?.some(off => off.toLowerCase().includes(s));
    return matchName || matchOffering;
  });

  if (loading) return (
     <div className="flex justify-center items-center h-[60vh]">
        <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto min-h-screen">
      
      {/* Search Header Section */}
      <div className="mb-12 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-4 flex items-center gap-3 leading-none">
            <Zap className="text-indigo-600" size={48} />
            Skill <span className="text-indigo-600">Marketplace</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.4em] italic pl-2">Discover top talent in the network</p>
        </div>
        
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-violet-500 transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search by skill or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-600 h-16 pl-16 pr-8 rounded-[2rem] text-sm font-black text-white italic tracking-widest placeholder:text-slate-700 outline-none transition-all shadow-inner focus:bg-slate-950"
          />
        </div>
      </div>

      {/* Grid Layout */}
      {filteredUsers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-24 text-center animate-fade-in">
            <Filter className="text-slate-700 w-16 h-16 mx-auto mb-6" />
            <h2 className="text-2xl text-white font-black italic tracking-tighter mb-2">No users found</h2>
            <p className="text-slate-500 italic text-sm font-bold">Try searching for a different skill.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredUsers.map((u, i) => (
             <div key={u.uid} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col group hover:border-indigo-500/50 transition-all shadow-xl relative overflow-hidden animate-fade-in" style={{animationDelay: `${i*0.05}s`}}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[80px] -z-10 group-hover:bg-indigo-600/10 transition-colors"></div>
               
               <div className="flex items-center gap-5 mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-slate-800 p-0.5 flex-shrink-0 relative group-hover:border-indigo-500 transition-colors shadow-2xl">
                   {u.photo ? <img src={u.photo} className="w-full h-full object-cover rounded-[0.8rem]" /> : <User className="w-full h-full text-slate-700 p-2"/>}
                   {u.isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-900 rounded-full shadow-lg"></div>}
                 </div>
                 <div className="min-w-0">
                   <h3 className="text-white font-black italic tracking-wider text-xl truncate leading-none mb-2">{u.name}</h3>
                   <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] tracking-widest italic truncate max-w-[150px]">
                         <Briefcase size={10} className="text-indigo-500 shrink-0" />
                         <span className="truncate">{u.workOrSchool || "GIET Baniatangi"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 uppercase text-[9px] font-black tracking-[0.2em] italic truncate max-w-[150px]">
                         <MapPin size={10} className="text-indigo-500 shrink-0" />
                         <span className="truncate">{u.location || "GLOBAL"}</span>
                      </div>
                   </div>
                 </div>
               </div>

               <div className="flex-1 space-y-4 mb-8">
                 <div>
                    <p className="text-[10px] font-black text-blue-500 italic mb-4 tracking-widest flex items-center gap-2"><Briefcase size={14}/> EXPERTISE</p>
                    <div className="flex flex-wrap gap-2">
                       {u.offering?.slice(0,3).map(skill => (
                          <span key={skill} className="bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)] rounded-xl px-3 py-1.5 text-[9px] font-black italic tracking-[0.1em] break-all">
                             {skill}
                          </span>
                       ))}
                       {u.offering?.length > 3 && (
                          <span className="bg-slate-950 border border-slate-800 text-slate-500 rounded-xl px-3 py-1.5 text-[9px] font-black italic tracking-widest shadow-inner">
                             +{u.offering.length - 3}
                          </span>
                       )}
                    </div>
                 </div>
               </div>

               <button 
                  onClick={() => {
                     setSelectedUser(u);
                     const mySkills = myProfile?.offering?.length ? myProfile.offering.join(", ") : "my skills";
                     const theirSkills = u.offering?.length ? u.offering.join(", ") : "your skills";
                     setMessage(`Hi ${u.name.split(' ')[0]}! I can teach you ${mySkills}, and I'd love to learn ${theirSkills} from you. Want to barter?`);
                  }}
                  className="w-full h-14 bg-slate-950 border border-slate-800 text-slate-400 font-black italic text-[10px] tracking-[0.2em] uppercase rounded-2xl hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all shadow-inner flex items-center justify-center gap-3"
               >
                  <MessageSquare size={16} />
                  Propose Barter
               </button>
             </div>
           ))}
        </div>
      )}

      {/* Modal Popup */}
      {selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-300 px-4">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 md:p-14 max-w-lg w-full shadow-[0_30px_100px_rgba(59,130,246,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10"></div>
              
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-950 border border-slate-800 p-1 flex-shrink-0">
                  {selectedUser.photo ? (
                    <img src={selectedUser.photo} className="w-full h-full object-cover rounded-[1.2rem]" />
                  ) : <User className="w-full h-full text-slate-700 p-3" />}
                </div>
                <div>
                   <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-2">Message <br/><span className="text-indigo-400">{selectedUser.name.split(' ')[0]}</span></h3>
                   <p className="text-[10px] text-indigo-500/70 font-black italic tracking-widest uppercase">Propose a skill exchange</p>
                </div>
              </div>

              <form onSubmit={sendRequest}>
                 <p className="text-xs font-black text-slate-400 italic tracking-widest mb-3 uppercase">Your Message</p>
                 <textarea 
                   required
                   value={message}
                   onChange={e => setMessage(e.target.value)}
                   placeholder={`Hi ${selectedUser.name.split(' ')[0]}, I'd love to learn from you! I can teach...`}
                   className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-3xl h-36 p-6 text-sm font-bold text-white placeholder:text-slate-600 resize-none outline-none transition-all shadow-inner mb-10 italic leading-relaxed"
                 />
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="flex-1 h-14 bg-transparent hover:bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-slate-400 rounded-2xl font-black italic text-[10px] tracking-[0.2em] uppercase transition-all flex items-center justify-center shadow-inner hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={sending}
                      className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black italic text-[10px] tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {sending ? "Sending..." : "Send Proposal"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
