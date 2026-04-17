import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  RecaptchaVerifier, signInWithPhoneNumber,
  sendPasswordResetEmail
} from "firebase/auth";
import { Mail, Phone, ArrowLeft, Send, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("main");
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/dashboard");
    } catch (e) { setError(e.message.replace("Firebase: ", "")); }
  };

  const handleEmail = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      navigate("/dashboard");
    } catch (e) { 
      setError(e.message.replace("Firebase: ", "")); 
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess("Check your email to reset your password.");
      setError("");
    } catch (e) {
      setError(e.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  const sendOTP = async () => {
    setError(""); setSuccess("");
    const digits = phone.replace(/[^\d]/g, "");
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    const fullNumber = "+91" + digits;
    setLoading(true);
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => { console.log("reCAPTCHA solved"); },
        "expired-callback": () => { setError("reCAPTCHA expired. Please try again."); }
      });
      const result = await signInWithPhoneNumber(auth, fullNumber, window.recaptchaVerifier);
      window.confirmationResult = result;
      setOtpSent(true);
    } catch (e) {
      setError(e.message.replace("Firebase: ", ""));
      if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) return;
    setError(""); setLoading(true);
    try {
      await window.confirmationResult.confirm(otp);
      navigate("/dashboard");
    } catch (e) { setError("Incorrect code. Please check and try again."); }
    setLoading(false);
  };

  const resetPhone = () => {
    setOtpSent(false); setOtp(""); setError(""); setSuccess("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
         <div className="absolute top-[5%] left-[5%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-[5%] right-[5%] w-[600px] h-[600px] bg-pink-600/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-fade-in relative min-h-[500px]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 z-50"></div>
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-between w-[40%] bg-slate-950 p-10 relative overflow-hidden border-r border-slate-800">
           <div className="absolute top-0 right-0 w-full h-full bg-indigo-600/5 blur-[100px]"></div>
           <div className="relative z-10">
              <div className="mb-12"><Logo size={48} /></div>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6 tracking-tighter italic">
                Exchange <br /> Skills, Not <br /> <span className="text-indigo-600">Money.</span>
              </h2>
              <p className="text-slate-500 font-bold text-xs tracking-widest leading-relaxed opacity-80">
                Connect with a global community of experts and learners. Share knowledge and grow together.
              </p>
           </div>
           <div className="relative z-10 space-y-8 pt-10 border-t border-slate-800">
              {[
                { i: Zap, t: "AI Matching", d: "Smart matching" },
                { i: ShieldCheck, t: "Verified", d: "Trusted community" },
                { i: CheckCircle2, t: "Free", d: "Pure skill exchange" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                   <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      <item.i size={14} />
                   </div>
                   <div>
                      <h4 className="text-white font-black text-xs leading-none">{item.t}</h4>
                      <p className="text-slate-600 text-[10px] mt-1">{item.d}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-center bg-slate-900/50">
           {mode === "main" && (
             <div className="animate-fade-in text-center md:text-left">
                <h1 className="text-3xl font-black text-white mb-3">Welcome to <span className="text-indigo-600">Skill Barter</span></h1>
                <p className="text-slate-500 text-sm mb-12">Sign in to start trading skills with people around the world.</p>
                <div className="space-y-4">
                   <button onClick={handleGoogle} className="w-full h-14 bg-white hover:bg-slate-50 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl text-sm">
                     <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
                     Continue with Google
                   </button>
                   <div className="relative py-4">
                      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800"></div>
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-slate-900 text-[10px] text-slate-600 font-semibold italic">or sign in with</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => { setMode("email"); setIsRegister(true); }} className="bg-slate-950 hover:bg-slate-800 text-white font-bold h-14 rounded-xl border border-slate-800 transition-all text-xs flex items-center justify-center gap-2 tracking-wider italic">
                        <Mail size={16} /> Email Login
                      </button>
                      <button onClick={() => setMode("phone")} className="bg-slate-950 hover:bg-slate-800 text-white font-bold h-14 rounded-xl border border-slate-800 transition-all text-xs flex items-center justify-center gap-2 tracking-wider italic">
                        <Phone size={16} /> Phone Login
                      </button>
                   </div>
                </div>
                <div className="mt-12 pt-8 border-t border-slate-800">
                   <p className="text-slate-600 text-sm mb-3">Already have an account?</p>
                   <button onClick={() => { setMode("email"); setIsRegister(false); }} className="text-indigo-500 font-bold text-sm hover:text-white transition-all border-b border-indigo-500/40 hover:border-white tracking-tighter">
                     Enter Skill Barter
                   </button>
                </div>
             </div>
           )}

           {mode === "email" && (
             <div className="animate-fade-in">
                <button onClick={() => setMode("main")} className="flex items-center gap-2 text-indigo-500 font-bold text-sm mb-10 hover:text-white transition-all italic">
                   <ArrowLeft size={16} /> Back
                </button>
                <h2 className="text-2xl font-black text-white mb-1">{isRegister ? "Sign Up" : "Login"}</h2>
                <p className="text-slate-500 text-xs mb-8 tracking-tight">{isRegister ? "Fill in your details to get started." : "Sign in to access your dashboard."}</p>
                
                {error && <div className="bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-xl mb-6">{error}</div>}
                {success && <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-4 rounded-xl mb-6">{success}</div>}

                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 ml-1">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field w-full h-12 font-medium text-sm" />
                   </div>
                   <div className="space-y-1">
                       <label className="text-[11px] font-semibold text-slate-400 ml-1">Password</label>
                       <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field w-full h-12 font-medium text-sm" />
                   </div>
                   
                   {!isRegister && (
                     <div className="flex justify-end -mt-2">
                       <button onClick={handleForgotPassword} className="text-indigo-500 text-[10px] font-bold hover:text-white transition-colors italic">
                         Forgot Password?
                       </button>
                     </div>
                   )}

                   <button onClick={handleEmail} disabled={loading} className="w-full btn-primary h-12 text-xs font-black tracking-widest italic shadow-xl shadow-indigo-600/30 disabled:opacity-50 mt-4">
                     {loading ? "Please wait..." : isRegister ? "Sign Up" : "Login"}
                   </button>
                   <button onClick={() => setIsRegister(!isRegister)} className="w-full text-slate-500 text-xs hover:text-white transition-all py-2 font-semibold">
                     {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
                   </button>
                </div>
             </div>
           )}

           {mode === "phone" && (
              <div className="animate-fade-in">
                <button onClick={() => { setMode("main"); resetPhone(); }} className="flex items-center gap-2 text-indigo-500 font-bold text-sm mb-10 hover:text-white transition-all italic"><ArrowLeft size={16} /> Back</button>
                <h2 className="text-3xl font-black text-white mb-2">Phone Login</h2>
                <p className="text-slate-500 text-sm mb-10">We'll send a 6-digit verification code to your number.</p>
                {error && <div className="bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-xl mb-6">{error}</div>}
                {!otpSent ? (
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 ml-1">Phone Number</label>
                        <div className="flex items-center gap-2">
                          <span className="h-14 px-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center text-indigo-400 font-bold text-sm shrink-0">+91</span>
                          <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ""))} placeholder="98765 43210" maxLength={10} className="input-field w-full h-14 font-medium text-base tracking-widest" />
                        </div>
                        <p className="text-slate-600 text-[10px] font-bold tracking-widest ml-1 opacity-60">Enter your 10-digit mobile number</p>
                     </div>
                     <div id="recaptcha-container"></div>
                     <button onClick={sendOTP} disabled={loading || phone.replace(/[^\d]/g, "").length !== 10} className="w-full btn-primary h-14 text-sm font-black tracking-widest italic shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Sending..." : "Send OTP"}
                     </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-4 rounded-xl text-center">✅ code sent to <span className="text-white">+91 {phone}</span></div>
                     <div className="space-y-3 text-center">
                        <label className="text-xs font-black tracking-widest text-slate-500 block mb-3">6-Digit Code</label>
                        <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-6 text-white focus:outline-none focus:border-indigo-600 transition-all font-black text-3xl text-center tracking-[0.4em] shadow-inner" />
                     </div>
                     <button onClick={verifyOTP} disabled={loading || otp.length < 6} className="w-full btn-primary h-14 text-sm font-black tracking-widest italic shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Verifying..." : "Verify & Sign In"} <Send size={18} fill="currentColor" />
                     </button>
                     <button onClick={resetPhone} className="w-full text-slate-500 text-xs hover:text-white py-3 transition-all font-bold tracking-widest">Change Number / Resend</button>
                  </div>
                )}
              </div>
           )}
           <p className="text-[9px] font-black text-slate-800 tracking-[0.4em] text-center mt-auto pt-16 italic opacity-40">SKILL BARTER // AUTH · V2.0</p>
        </div>
      </div>
    </div>
  );
}