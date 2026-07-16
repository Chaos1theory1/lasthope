import React, { useState } from "react";
import { Sprout, Lock, Unlock, Menu, X, Settings, Globe } from "lucide-react";

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  logoUrl?: string;
  currentLanguage: "en" | "fr" | "ar";
  onLanguageChange: (lang: "en" | "fr" | "ar") => void;
}

export default function Navbar({
  activePage,
  onNavigate,
  isAdminLoggedIn,
  onLogout,
  logoUrl,
  currentLanguage,
  onLanguageChange
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Translate navigation labels based on active currentLanguage
  const getNavLabel = (id: string) => {
    switch (id) {
      case "home":
        return currentLanguage === "en" ? "Home" : currentLanguage === "ar" ? "الرئيسية" : "Accueil";
      case "about":
        return currentLanguage === "en" ? "About Us" : currentLanguage === "ar" ? "من نحن" : "À Propos";
      case "products":
        return currentLanguage === "en" ? "Products & Services" : currentLanguage === "ar" ? "المنتجات والخدمات" : "Produits & Services";
      case "contact":
        return currentLanguage === "en" ? "Contact Us" : currentLanguage === "ar" ? "اتصل بنا" : "Nous Contacter";
      default:
        return id;
    }
  };

  const navItems = [
    { id: "home", label: getNavLabel("home") },
    { id: "about", label: getNavLabel("about") },
    { id: "products", label: getNavLabel("products") },
    { id: "contact", label: getNavLabel("contact") }
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
  };

  const textStaffAccess = currentLanguage === "en" ? "Staff Access" : currentLanguage === "ar" ? "دخول الموظفين" : "Accès Staff";
  const textConsole = currentLanguage === "en" ? "Console" : currentLanguage === "ar" ? "لوحة التحكم" : "Console";
  const textSignOut = currentLanguage === "en" ? "Sign Out" : currentLanguage === "ar" ? "تسجيل الخروج" : "Se Déconnecter";

  return (
    <nav className="sticky top-0 z-50 bg-[#fcfcf9]/95 backdrop-blur-md border-b border-stone-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick("home")}>
            {logoUrl ? (
              <div className="bg-white border border-stone-200/85 rounded-xl h-[46px] w-[46px] flex items-center justify-center shadow-xs overflow-hidden leading-none select-none">
                <img src={logoUrl} alt="Biotech Agro Logo" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="p-2 bg-emerald-950 text-emerald-100 rounded-xl">
                <Sprout className="h-6 w-6" />
              </div>
            )}
            <div>
              <span className="font-display font-medium text-lg tracking-tight text-stone-900 block leading-tight">
                Mycelium Tech Digital
              </span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-widest block -mt-0.5">
                Mycelium Tech Digital Labs
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-1 text-sm font-medium tracking-wide transition-colors ${
                    isActive ? "text-emerald-900 font-semibold" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </button>
              );
            })}

            <div className="h-4 w-px bg-stone-300" />

            {/* Language Selection Dropbox (Hidden on Admin panel) */}
            {activePage !== "admin" && (
              <div className="flex items-center gap-1.5 focus-within:text-emerald-800">
                <Globe className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as "en" | "fr" | "ar")}
                  className="bg-white/80 hover:bg-white border border-stone-200 hover:border-stone-300 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 cursor-pointer text-stone-700 transition"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            )}

            {/* Admin Dashboard Area */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick("admin")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    activePage === "admin"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                  {textConsole}
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold tracking-wide transition-all"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  {textSignOut}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick("admin")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
                  activePage === "admin"
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200/80"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                {textStaffAccess}
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden gap-2">
            {activePage !== "admin" && (
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as "en" | "fr" | "ar")}
                className="bg-white border border-stone-250 rounded-lg text-[11px] font-bold px-1.5 py-1 focus:outline-hidden text-stone-700 mr-1"
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
                <option value="ar">AR</option>
              </select>
            )}
            
            {isAdminLoggedIn && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-lg uppercase">
                Admin
              </span>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#fcfcf9] border-b border-stone-200/80 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activePage === item.id ? "bg-emerald-50 text-emerald-950 font-bold" : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="h-px bg-stone-200 my-2" />

          {isAdminLoggedIn ? (
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleNavClick("admin")}
                className="flex items-center justify-between w-full px-3 py-2.5 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950 rounded-lg text-sm font-medium"
              >
                <span>{textConsole}</span>
                <Settings className="w-4 h-4 text-emerald-700" />
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-3 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-sm font-bold"
              >
                <span>{textSignOut}</span>
                <Unlock className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick("admin")}
              className="flex items-center justify-between w-full px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-sm font-semibold"
            >
              <span>{textStaffAccess}</span>
              <Lock className="w-4 h-4 text-stone-500" />
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
