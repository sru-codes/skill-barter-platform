import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect, useContext } from "react";
import { auth, db, messaging } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getToken, onMessage } from "firebase/messaging";
import { GeminiContext } from './context/GeminiContext';

// Pages & Components
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Rating from "./pages/Rating";
import Bookings from "./pages/Bookings";
import SkillFeed from "./pages/SkillFeed";
import SkillGrid from "./pages/SkillGrid";
import Leaderboard from "./pages/Leaderboard";
import Notifications from "./pages/Notifications";
import AIChat from "./pages/AIChat";

function App() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Connection to GeminiContext
  const gemini = useContext(GeminiContext);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        setHasProfile(snap.exists());

        try {
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              const token = await getToken(messaging, { 
                vapidKey: 'BMD-zN1_H_7eK2v1-Jb3X9z-j-MBy4Jp-zE8vM-j-I' 
              });
              if (token) await updateDoc(doc(db, "users", currentUser.uid), { fcmToken: token });
            }
          }
        } catch (err) { console.warn("Notifications setup failed", err); }
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    });

    const unsubMsg = onMessage(messaging, (payload) => {
      alert(`🔔 ${payload.notification.title}: ${payload.notification.body}`);
    });

    return () => { unsub(); unsubMsg(); };
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
       <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(79,70,229,0.2)]"></div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route path="/login" element={
          !user ? <Login /> : 
          !hasProfile ? <Profile user={user} /> : 
          <Navigate to="/dashboard" />
        } />
        
        <Route path="/dashboard" element={
          user && hasProfile ? <Layout user={user}><Dashboard user={user} /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/skill-grid" element={
          user && hasProfile ? <Layout user={user}><SkillGrid /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/requests" element={
          user && hasProfile ? <Layout user={user}><Requests /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/chat/:partnerId/:partnerName" element={
          user && hasProfile ? <Layout user={user}><Chat /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/chat" element={
          user && hasProfile ? <Layout user={user}><Chat /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/messages" element={
          user && hasProfile ? <Layout user={user}><Chat /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/settings" element={
          user && hasProfile ? <Layout user={user}><Settings /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/rate/:targetUid/:targetName" element={
          user && hasProfile ? <Layout user={user}><Rating /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/bookings" element={
          user && hasProfile ? <Layout user={user}><Bookings /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/feed" element={
          user && hasProfile ? <Layout user={user}><SkillFeed /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/leaderboard" element={
          user && hasProfile ? <Layout user={user}><Leaderboard /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/notifications" element={
          user && hasProfile ? <Layout user={user}><Notifications /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/ai-chat" element={
          user && hasProfile ? <Layout user={user}><AIChat /></Layout> : <Navigate to="/login" />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
