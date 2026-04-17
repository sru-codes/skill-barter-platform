import { useNavigate, useLocation, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Logo from "./Logo";
import { LayoutDashboard, Handshake, MessageSquare, Settings, LogOut, User, Radio, Trophy, Bell, Sparkles, Power, Search } from "lucide-react";

export default function Layout({ children, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [hasPendingRequests, setHasPendingRequests] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const qNotif = query(collection(db, "notifications"), 
      where("toUid", "==", user.uid), 
      where("read", "==", false));
    const unsubNotif = onSnapshot(qNotif, (snap) => {
      setHasUnread(!snap.empty);
    });

    const qReq = query(collection(db, "barter_requests"), 
      where("toUser", "==", user.uid), 
      where("status", "==", "pending"));
    const unsubReq = onSnapshot(qReq, (snap) => {
      setHasPendingRequests(!snap.empty);
    });

    return () => { unsubNotif(); unsubReq(); };
  }, [user]);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Discover Skills", path: "/skill-grid", icon: Search },
    { name: "Requests", path: "/requests", icon: Handshake },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Chats", path: "/chat", icon: MessageSquare },
    { name: "Feed", path: "/feed", icon: Radio },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "AI Chat", path: "/ai-chat", icon: Sparkles },
  ];

  const handleSignOut = async () => {
    await signOut(auth);
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-blue-500/30">

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 max-w-sm w-full mx-6 shadow-2xl shadow-blue-600/10 text-center animate-fade-in">
            <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <LogOut size={32} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-3">
              Log Out?
            </h3>
            <p className="text-slate-500 text-xs font-bold italic mb-10 leading-relaxed">
              You will be signed out of your account.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-14 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-black tracking-[0.3em] italic rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 h-14 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black tracking-[0.3em] italic rounded-2xl transition-all shadow-lg shadow-red-600/30"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-[60] w-full h-20 px-6 md:px-12 flex justify-between items-center bg-slate-950/80 backdrop-blur-2xl border-b border-slate-900 shadow-2xl shadow-blue-500/5">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Logo size={40} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter italic leading-none">
              <span className="text-white">Skill</span>
              <span className="text-blue-600">Barter</span>
            </span>
            <span className="text-[10px] font-bold text-blue-500 italic mt-1 opacity-60">Exchange Skills</span>
          </div>
        </div>
        
        {/* Mobile Header Right */}
        <div className="md:hidden flex items-center gap-4">
           {user && (
             <button onClick={() => navigate("/settings")} className="w-10 h-10 rounded-xl border border-slate-800 overflow-hidden cursor-pointer bg-slate-900 p-0.5 shadow-lg shadow-blue-600/10">
               {user.photoURL ? (
                 <img src={user.photoURL} className="w-full h-full object-cover rounded-[0.5rem]" />
               ) : (
                 <div className="w-full h-full bg-slate-950 flex items-center justify-center text-blue-500"><User size={18} /></div>
               )}
             </button>
           )}
        </div>
      </header>

      <div className="flex flex-1 relative">
        
        {/* Desktop Sidebar Navigation */}
        <nav className="hidden md:flex flex-col w-80 bg-slate-950 border-r border-slate-900 px-8 py-10 h-[calc(100vh-80px)] sticky top-20 overflow-y-auto no-scrollbar">
          <div className="flex-1 space-y-4">
            <p className="text-[10px] font-bold text-slate-700 italic mb-8 px-4">Main Menu</p>
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-5 px-5 py-4 rounded-2xl transition-all font-black text-xs tracking-[0.2em] italic group border
                    ${isActive 
                      ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/30" 
                      : "text-slate-500 border-transparent hover:text-white hover:bg-slate-900 hover:border-slate-800"}`}
                >
                  <div className="relative">
                    <Icon size={18} strokeWidth={3} className={`${isActive ? "animate-pulse" : "opacity-40"}`} />
                    {link.name === "Notifications" && hasUnread && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></div>}
                    {link.name === "Requests" && hasPendingRequests && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></div>}
                  </div>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-10 border-t border-slate-900 mt-auto">
            <div className="flex items-center gap-4 mb-10 p-4 bg-slate-900 rounded-[2rem] border border-slate-800 cursor-pointer group hover:border-blue-500/50 transition-all shadow-inner" onClick={() => navigate("/settings")}>
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden p-1 shadow-2xl group-hover:scale-105 transition-transform">
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <User size={24} className="text-blue-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                 <p className="text-xs font-bold truncate text-white italic tracking-wider">{user?.displayName || "UserName"}</p>
                 <p className="text-[10px] text-blue-500 font-bold italic opacity-60 mt-1">Community Member</p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full py-3 flex items-center gap-3 text-[10px] font-bold text-slate-700 hover:text-blue-400 transition-all italic px-4 group rounded-2xl hover:bg-slate-900 border border-transparent hover:border-slate-800"
            >
              <LogOut size={16} strokeWidth={3} className="opacity-40 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
              Log Out
            </button>
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-slate-950/80 backdrop-blur-3xl border-t border-slate-900 px-8 py-5 z-50 flex justify-between items-center shadow-2xl shadow-blue-500/20">
             {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path} className={`transition-all duration-300 relative group ${isActive ? "text-blue-500 scale-125" : "text-slate-700"}`}>
                  <div className="relative">
                    <Icon size={22} strokeWidth={isActive ? 3 : 2} />
                    {link.name === "Notifications" && hasUnread && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></div>}
                    {link.name === "Requests" && hasPendingRequests && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></div>}
                  </div>
                  {isActive && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>}
                </Link>
              );
            })}
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-14 pb-28 md:pb-14 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
