import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, getDocs, where } from "firebase/firestore";
import { Plus, Search, Tag, User, MessageSquare, Handshake, Share2, Sparkles, Filter, Rocket, Heart, X } from "lucide-react";

export default function SkillFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState("offering");
  const [category, setCategory] = useState("Tech");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const user = auth.currentUser;

  const categories = ["Tech", "Design", "Finance", "Marketing", "Creative", "Life Skills"];

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePost = async () => {
    if (!title || !description) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        uid: user.uid,
        userName: user.displayName || user.email,
        userPhoto: user.photoURL || "",
        title,
        description,
        category,
        type,
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setTitle("");
      setDescription("");
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const filteredPosts = posts.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">
            Discover <span className="text-blue-600">Skills</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] italic opacity-60 max-w-xl leading-relaxed">
            Find the perfect skill trade and connect with experts today.
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-4 px-12 h-20 text-[11px] font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-blue-600/40 shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:rotate-90 transition-transform">
             <Plus size={18} />
          </div>
          Post a Skill
        </button>
      </div>

      {/* Grid Controls */}
      <div className="mb-16 sticky top-6 z-40 bg-slate-950/80 backdrop-blur-xl p-4 rounded-[2.5rem] border border-slate-900 shadow-2xl">
         <div className="relative group">
            <Search size={22} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for skills (e.g. Python, C++)..."
              className="input-field w-full h-20 pl-20 pr-8 text-sm font-black uppercase tracking-[0.2em] italic bg-slate-900/50"
            />
         </div>
      </div>

      {/* Feed Grid */}
      {loading ? (
        <div className="py-32 flex justify-center">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, i) => (
            <div key={post.id} 
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] p-12 hover:border-blue-600/50 transition-all group relative overflow-hidden shadow-2xl flex flex-col"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
               
               <div className="w-auto px-6 h-14 bg-blue-600 rounded-2xl inline-flex flex-none self-start items-center justify-center text-[10px] font-black mb-10 text-white italic tracking-widest shadow-2xl shadow-blue-600/30 uppercase">
                  {post.category || "Skill"}
               </div>
               
               <h3 className="text-2xl font-black mb-4 text-white tracking-tighter italic">{post.title}</h3>
               
               <div className="mt-auto pt-8 flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                    {post.userPhoto ? <img src={post.userPhoto} className="w-full h-full object-cover" /> : <User size={18} className="text-blue-600" />}
                 </div>
                 <p className="text-slate-500 text-sm leading-relaxed font-bold tracking-wider italic opacity-80 truncate">
                   {post.userName}
                 </p>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 md:p-14 max-w-xl w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-fade-in">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-pink-600 opacity-50"></div>
             
             <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Post a <span className="text-blue-600">Skill</span></h2>
                <button onClick={() => setShowModal(false)} className="text-slate-700 hover:text-white transition-colors">
                   <X size={28} />
                </button>
             </div>

             <div className="space-y-10">
                <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                   {["offering", "wanting"].map(t => (
                     <button 
                       key={t}
                       onClick={() => setType(t)}
                       className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic transition-all
                         ${type === t 
                           ? (t === 'offering' ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "bg-pink-600 text-white shadow-xl shadow-pink-600/20") 
                           : "text-slate-700 hover:text-slate-500"}`}
                     >
                       {t === 'offering' ? 'I am Offering' : 'I am Looking For'}
                     </button>
                   ))}
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic ml-1 flex items-center gap-2"><Tag size={10} className="text-blue-600" /> Category</label>
                   <select 
                     value={category}
                     onChange={e => setCategory(e.target.value)}
                     className="input-field w-full h-14 font-black text-xs italic uppercase tracking-widest cursor-pointer"
                   >
                     {categories.map(c => <option key={c}>{c}</option>)}
                   </select>
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic ml-1 flex items-center gap-2"><Rocket size={10} className="text-blue-600" /> Title</label>
                   <input 
                     type="text"
                     value={title}
                     onChange={e => setTitle(e.target.value)}
                     placeholder="e.g. Python Programming or Web Design"
                     className="input-field w-full h-16 px-6 font-black text-xs italic uppercase tracking-[0.1em]"
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic ml-1 flex items-center gap-2"><Sparkles size={10} className="text-blue-600" /> Description</label>
                   <textarea 
                     value={description}
                     onChange={e => setDescription(e.target.value)}
                     placeholder="Describe what you want to teach or learn in simple words..."
                     className="input-field w-full min-h-[140px] resize-none py-6 px-6 font-black text-xs italic uppercase tracking-wider leading-relaxed"
                   />
                </div>

                <button 
                  onClick={handlePost}
                  disabled={submitting}
                  className="btn-primary w-full h-20 text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl shadow-blue-600/40"
                >
                  {submitting ? "POSTING..." : "POST NOW"}
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
