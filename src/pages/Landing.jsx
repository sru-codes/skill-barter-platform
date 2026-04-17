import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowRight, Zap, Shield, Sparkles, Brain, Globe, Users } from "lucide-react";
import Logo from "../components/Logo";

const features = [
  {
    title: "Bidirectional Matching",
    description: "Our engine ensures both parties find exactly what they're looking for, simultaneously.",
    icon: Zap,
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Skill Assistant",
    description: "Get precise compatibility scores based on your goals, level, and past exchange success.",
    icon: Sparkles,
    color: "from-violet-500 to-violet-600"
  },
  {
    title: "Proof of Expertise",
    description: "Verified skill portfolios and rating systems build a foundation of radical trust.",
    icon: Shield,
    color: "from-blue-500 to-blue-600"
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-blue-500/30 font-sans">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 group">
         <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/5 blur-[150px] rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] h-20 px-6 md:px-12 flex items-center justify-center">
        <div className="max-w-7xl w-full flex justify-between items-center bg-slate-950/40 backdrop-blur-2xl border border-slate-900 rounded-3xl h-16 px-8 shadow-2xl">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Logo size={40} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic leading-none">
              <span className="text-white">Skill</span>
              <span className="text-blue-600">Barter</span>
            </span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex gap-10 text-[10px] font-black tracking-[0.4em] text-slate-500 italic">
               <a href="#how" className="hover:text-blue-500 transition-colors">How it Works</a>
               <a href="#features" className="hover:text-blue-500 transition-colors">Features</a>
            </div>
            {isLoggedIn ? (
              <button 
                onClick={() => navigate("/dashboard")}
                className="btn-primary h-10 px-8 !text-[10px] tracking-[0.2em] italic"
              >
                Go to Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate("/login")}
                className="btn-primary h-10 px-8 !text-[10px] tracking-[0.2em] italic"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-48 md:pt-64 pb-40 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 mb-10 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
            <span className="text-blue-500 font-black text-[9px] tracking-[0.4em] italic">Network Active</span>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[0.9] tracking-tighter text-white italic text-center">
             Exchange Skills, <br /> <span className="text-blue-600 drop-shadow-[0_0_30px_rgba(79,70,229,0.3)]">Not Money.</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-slate-500 text-xl font-black tracking-widest mb-16 leading-relaxed italic opacity-80">
            The friendly community for sharing knowledge. Swap your skills with thousands of learners around the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate("/login")}
              className="btn-primary px-16 h-20 text-sm flex items-center justify-center gap-4 font-black tracking-[0.3em] italic shadow-2xl shadow-blue-600/40"
            >
              Get Started <ArrowRight size={24} strokeWidth={3} />
            </button>
            <a href="#how" className="bg-slate-900 hover:bg-slate-800 text-white px-16 h-20 text-sm flex items-center justify-center gap-4 font-black tracking-[0.3em] italic border border-slate-800 rounded-2xl transition-all">
               How it Works
            </a>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/2 left-0 w-full flex justify-between px-20 pointer-events-none opacity-20 hidden xl:flex">
           <div className="w-64 h-64 bg-slate-900 rounded-[3rem] border border-slate-800 rotate-12 flex items-center justify-center shadow-2xl animate-bounce duration-[4000ms]">
              <Brain size={80} className="text-blue-600" />
           </div>
           <div className="w-64 h-64 bg-slate-900 rounded-[3rem] border border-slate-800 -rotate-12 flex items-center justify-center shadow-2xl animate-bounce delay-1000 duration-[5000ms]">
              <Globe size={80} className="text-pink-600" />
           </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="py-24 border-y border-slate-900 bg-slate-950 px-6">
         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20">
            {[
              { label: "Community Size", value: "24.5K+", color: "text-white" },
              { label: "Match Success", value: "99.8%", color: "text-blue-600" },
              { label: "Skills Available", value: "642+", color: "text-white" },
              { label: "Join for Free", value: "$0.00", color: "text-pink-600" }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                 <p className={`text-4xl md:text-6xl font-black mb-4 tracking-tighter italic ${stat.color} group-hover:scale-110 transition-transform duration-500`}>{stat.value}</p>
                 <p className="text-slate-800 font-black text-[10px] tracking-[0.5em] italic">{stat.label}</p>
              </div>
            ))}
         </div>
      </section>

      {/* How it Works Section */}
      <section id="how" className="py-40 px-6 max-w-7xl mx-auto relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -z-10"></div>
         <div className="text-center mb-32">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic">How it <span className="text-blue-600">Works.</span></h2>
            <p className="text-slate-700 text-xs font-black tracking-[0.6em] italic">Simple steps to start sharing skills.</p>
         </div>

         <div className="grid md:grid-cols-3 gap-10">
            {[
               { n: "01", t: "Create Profile", d: "Tell us about your skills and what you're looking to learn from others." },
               { n: "02", t: "Smart Match", d: "Our smart system connects you with the perfect person to trade skills with." },
               { n: "03", t: "Connect", d: "Start a conversation and begin your skill sharing journey today." }
            ].map((step, idx) => (
               <div key={idx} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] p-12 hover:border-blue-600/50 transition-all group relative overflow-hidden shadow-2xl">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-[10px] font-black mb-10 text-white italic tracking-widest shadow-2xl shadow-blue-600/30">
                     {step.n}
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-white tracking-tighter italic">{step.t}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-bold tracking-wider italic opacity-80">{step.d}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-40 px-6 bg-slate-900/20 border-y border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
             <div className="order-2 lg:order-1">
                <h2 className="text-5xl md:text-6xl font-black mb-16 leading-[1.1] tracking-tighter italic">Skill Barter <br /><span className="text-blue-600">Benefits.</span></h2>
                <div className="space-y-12">
                   {features.map((f, i) => (
                     <div key={i} className="flex gap-8 group">
                        <div className={`w-16 h-16 shrink-0 rounded-[1.5rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-500 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-blue-600/30`}>
                           <f.icon size={28} strokeWidth={3} />
                        </div>
                        <div>
                           <h4 className="text-lg font-black mb-2 text-white tracking-tight italic">{f.title}</h4>
                           <p className="text-slate-600 text-sm leading-relaxed font-black tracking-widest italic opacity-60 font-bold">{f.description}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="order-1 lg:order-2">
                <div className="bg-slate-950 border border-slate-900 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden group shadow-inner">
                   <div className="absolute top-0 right-0 p-8">
                      <Sparkles className="text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity animate-pulse" size={60} />
                   </div>
                   <div className="w-40 h-40 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex items-center justify-center mx-auto mb-12 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                      <Brain size={72} className="text-blue-600 animate-pulse" />
                   </div>
                   <p className="text-blue-500 font-black text-[11px] tracking-[0.6em] mb-6 italic">COMMUNITY v2.0</p>
                   <p className="text-white font-black text-3xl md:text-4xl italic leading-[1.1] tracking-tighter">"Knowledge is the only resource that amplifies through distribution."</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 px-6">
         <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-[4rem] p-16 md:p-28 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-600/5 blur-[120px] rounded-full"></div>
            
            <h2 className="text-5xl md:text-8xl font-black mb-10 leading-none tracking-tighter italic">Ready to <br /><span className="text-blue-600">Connect?</span></h2>
            <p className="text-slate-500 text-xl font-black tracking-[0.2em] mb-16 max-w-2xl mx-auto italic opacity-80">Join the thousands of learners already sharing skills.</p>
            
            <button 
              onClick={() => navigate("/login")}
              className="btn-primary px-20 h-24 text-base font-black tracking-[0.4em] italic shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all"
            >
              Connect Now
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-900 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-16">
              <div className="flex flex-col items-start">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="flex items-center justify-center">
                      <Logo size={48} />
                   </div>
                   <span className="text-2xl font-black tracking-tighter italic">
                     <span className="text-white">Skill</span>
                     <span className="text-blue-600">Barter</span>
                   </span>
                 </div>
                 <p className="text-slate-800 text-[10px] font-black tracking-[0.8em] italic">Skill Barter Community // Est. 2026</p>
              </div>
              <div className="flex flex-wrap gap-12 font-black text-[10px] tracking-[0.4em] text-slate-700 italic">
                 <a href="#" className="hover:text-blue-500 transition-colors">Status</a>
                 <a href="#" className="hover:text-blue-500 transition-colors">Updates</a>
                 <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
                 <a href="#" className="hover:text-blue-500 transition-colors">About</a>
              </div>
           </div>
           <div className="mt-20 pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-slate-900 text-[10px] font-black tracking-[0.6em] italic">© 2026 SkillBarter. All Rights Reserved.</p>
              <div className="flex items-center gap-6 text-slate-800">
                 <Globe size={16} />
                 <Users size={16} />
                 <Brain size={16} />
              </div>
           </div>
        </div>
      </footer>

    </div>
  );
}
