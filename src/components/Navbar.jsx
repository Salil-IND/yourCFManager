import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bookmark, LayoutDashboard, Code2, LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const Navbar = () => {
  const { user, isAuthLoading } = useAuthStore();

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-Out Error:", error);
    }
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Code2 className="h-6 w-6 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
            <span className="font-bold text-xl text-slate-100 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              CF Explorer
            </span>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-6">
              <NavLink 
                to="/" 
                className={({isActive}) => `flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Home className="h-4 w-4" />
                <span>Explorer</span>
              </NavLink>
              <NavLink 
                to="/bookmarks" 
                className={({isActive}) => `flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Bookmark className="h-4 w-4" />
                <span>Bookmarks</span>
              </NavLink>
              <NavLink 
                to="/dashboard" 
                className={({isActive}) => `flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </NavLink>
            </div>

            <div className="h-6 w-px bg-slate-700 hidden md:block"></div>

            {isAuthLoading ? (
               <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=0D8ABC&color=fff`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-slate-700"
                />
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-lg border border-slate-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
