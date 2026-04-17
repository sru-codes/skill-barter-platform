import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MessageSquare, BadgeCheck, Shield, Rocket, ArrowLeft } from "lucide-react";

export default function Rating() {
  const { targetUid, targetName } = useParams();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState(null);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const loadPartner = async () => {
      const snap = await getDoc(doc(db, "users", targetUid));
      if (snap.exists()) setPartner(snap.data());
    };
    loadPartner();
  }, [targetUid, user, navigate]);

  const handleSubmit = async () => {
    setSending(true);
    try {
      await addDoc(collection(db, "ratings"), {
        fromUid: user.uid,
        toUid: targetUid,
        rating: rating,
        review: review.trim(),
        createdAt: serverTimestamp()
      });

      const partnerRef = doc(db, "users", targetUid);
      const pSnap = await getDoc(partnerRef);
      if (pSnap.exists()) {
        const pData = pSnap.data();
        const currentRating = pData.rating || 5;
        const totalRatings = (pData.ratingCount || 0) + 1;
        const newRating = ((currentRating * (totalRatings - 1)) + rating) / totalRatings;
        await updateDoc(partnerRef, {
          rating: Number(newRating.toFixed(1)),
          ratingCount: totalRatings
        });
      }
      navigate("/dashboard");
    } catch (err) {
       console.error(err);
       alert("Sync Validation failed.");
    }
    setSending(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-white mb-12 transition-all group font-black text-[10px] uppercase tracking-widest italic">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Return to Signal
      </button>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        
        {/* Left: Summary */}
        <div className="space-y-10">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[80px] -z-10"></div>
             <div className="w-24 h-24 bg-slate-950 border-2 border-slate-800 rounded-3xl flex items-center justify-center mb-8 shadow-inner overflow-hidden">
                {partner?.photo ? (
                  <img src={partner.photo} className="w-full h-full object-cover" />
                ) : (
                  <BadgeCheck size={48} className="text-blue-600/40" />
                )}
             </div>
             <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 italic">COMPLETED EXCHANGE</p>
             <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-6">VALIDATE <br /> {targetName}</h1>
             <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest leading-relaxed opacity-60">Record the data quality and expertise delivered during this barter cycle.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
                <Rocket size={20} className="text-blue-600 mx-auto mb-4" />
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1 italic">Mastery Rank</p>
                <p className="text-white font-black uppercase italic tracking-tighter">ELITE NODE</p>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
                <Shield size={20} className="text-pink-600 mx-auto mb-4" />
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1 italic">Sync Rate</p>
                <p className="text-white font-black uppercase italic tracking-tighter">99.8% VERIFIED</p>
             </div>
          </div>
        </div>

        {/* Right: Input */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 md:p-14 shadow-2xl relative">
           <div className="mb-12">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 block italic">1. QUANTIFY RADIANCE</label>
              <div className="flex justify-between items-center bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setRating(s)}
                    className="group relative"
                  >
                    <Star 
                      fill={rating >= s ? "currentColor" : "none"} 
                      className={`w-10 h-10 transition-all ${rating >= s ? "text-blue-600 scale-125" : "text-slate-800 group-hover:text-slate-600"}`} 
                      strokeWidth={2.5} 
                    />
                    {rating === s && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,1)]"></div>}
                  </button>
                ))}
              </div>
           </div>

           <div className="mb-12">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 block italic">2. SYNERGOTIC LOG</label>
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="Describe the knowledge transfer efficacy..."
                className="input-field w-full min-h-[160px] resize-none py-6 px-8 text-sm font-bold italic leading-relaxed uppercase placeholder:opacity-20"
              />
           </div>

           <button 
             onClick={handleSubmit}
             disabled={sending}
             className="btn-primary w-full h-20 text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl shadow-blue-600/40 active:scale-95 transition-all"
           >
             {sending ? "TRANSMITTING TO GRID..." : "COMMIT VALIDATION LOG"}
           </button>
           
           <p className="text-[9px] text-slate-700 font-black uppercase text-center mt-8 tracking-widest italic opacity-40">Verification will be permanently logged in the mastery network.</p>
        </div>

      </div>
    </div>
  );
}
