import { useState, useRef } from "react";
import { Search, X, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export const SKILL_CATEGORIES = [
  {
    category: "Tech",
    icon: "💻",
    skills: ["Python", "JavaScript", "React", "Node.js", "Java", "C++", "Flutter", "App Development", "Web Development", "Machine Learning", "Data Science", "Cybersecurity", "Cloud Computing", "SQL", "NoSQL", "DevOps", "Docker"]
  },
  {
    category: "Design",
    icon: "🎨",
    skills: ["UI/UX Design", "Figma", "Graphic Design", "Logo Design", "3D Modeling", "Animation", "Video Editing", "Photography", "Adobe Illustrator", "Photoshop", "Canva"]
  },
  {
    category: "Finance",
    icon: "💰",
    skills: ["Trading", "Stock Market", "Crypto", "Finance", "Accounting", "Business Strategy", "Entrepreneurship", "Public Speaking", "Sales", "Negotiation"]
  },
  {
    category: "Marketing",
    icon: "📢",
    skills: ["Digital Marketing", "SEO", "Content Writing", "Blogging", "Scriptwriting", "Social Media Management", "Copywriting", "Email Marketing"]
  },
  {
    category: "Creative",
    icon: "🎵",
    skills: ["Music", "Guitar", "Singing", "Drawing", "Painting", "Photography", "Piano", "Dancing", "Acting"]
  },
  {
    category: "Life Skills",
    icon: "🗣️",
    skills: ["English", "Spanish", "French", "German", "Hindi", "Mandarin", "Yoga", "Fitness", "Cooking", "Chess", "First Aid", "Meditation"]
  }
];

export default function SkillPicker({ selected, onToggle, color = "blue" }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredCategories = SKILL_CATEGORIES.map(cat => ({
    ...cat,
    skills: cat.skills.filter(s => s.toLowerCase().includes(search.toLowerCase()))
  })).filter(cat => cat.skills.length > 0);

  return (
    <div className="space-y-8">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search for skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl h-16 pl-14 pr-14 text-white placeholder-slate-800 focus:outline-none focus:border-blue-600 transition-all font-black uppercase tracking-widest text-xs italic"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {!search && (
        <div className="relative flex items-center group/nav">
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-4 z-10 w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-blue-500 hover:text-white hover:bg-blue-600 transition-all opacity-0 group-hover/nav:opacity-100 shadow-xl"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div 
             ref={scrollRef}
             className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 px-2 scroll-smooth"
          >
            {SKILL_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                className={`whitespace-nowrap px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border italic
                  ${activeCategory === i 
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900 text-slate-600 border-slate-800 hover:text-slate-400 hover:bg-slate-800"}`}
              >
                <span className="mr-2 opacity-80">{cat.icon}</span> {cat.category}
              </button>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute -right-4 z-10 w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-blue-500 hover:text-white hover:bg-blue-600 transition-all opacity-0 group-hover/nav:opacity-100 shadow-xl"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 min-h-[180px] shadow-inner">
        {search && filteredCategories.length === 0 ? (
          <div className="h-[120px] flex flex-col items-center justify-center text-center">
            <p className="text-slate-800 font-black text-xs uppercase tracking-[0.3em] italic">No skills found</p>
          </div>
        ) : (
          <div className="space-y-10">
            {(search ? filteredCategories : [SKILL_CATEGORIES[activeCategory]]).map((cat) => (
              <div key={cat.category} className="animate-fade-in">
                {search && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 mb-5 italic border-l-2 border-blue-600 pl-4">{cat.category}</p>}
                <div className="flex flex-wrap gap-3">
                  {cat.skills.map(skill => {
                    const isSelected = selected.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => onToggle(skill)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-3 uppercase tracking-widest italic
                          ${isSelected
                            ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20"
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800"}`}
                      >
                        {isSelected && <Sparkles size={12} fill="currentColor" className="animate-pulse" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
           <div className={`w-2 h-2 rounded-full ${selected.length === 5 ? 'bg-blue-500 animate-ping' : 'bg-slate-800'}`}></div>
           <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] italic">
             Skills selected: {selected.length} <span className="text-slate-800 mx-1">/</span> 5
           </p>
        </div>
        {selected.length >= 5 && (
           <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.4em] italic animate-pulse">Maximum limit reached</p>
        )}
      </div>
    </div>
  );
}
