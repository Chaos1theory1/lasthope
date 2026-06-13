import React from "react";
import { Sprout, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  logoUrl?: string;
  currentLanguage: "en" | "fr" | "ar";
  footerDescription?: string;
  footerCopyright?: string;
  footerData?: any;
}

export default function Footer({
  onNavigate,
  contactEmail,
  contactPhone,
  contactAddress,
  logoUrl,
  currentLanguage,
  footerDescription,
  footerCopyright,
  footerData
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const isRtl = currentLanguage === "ar";

  const t = (key: string) => {
    switch (key) {
      case "desc":
        return currentLanguage === "en"
          ? "Bridging modern bio-technology and regional Tunisian agriculture. We produce heavy-fruiting mycelium on grain and eco-composites using agricultural co-products."
          : currentLanguage === "ar"
          ? "الربط بين البيولوجيا الحديثة والزراعة التونسية الإقليمية. نقوم بإنتاج أبواغ حبوب فطرية ممتازة ومواد حيوية عازلة من منتجات زراعية ثانوية."
          : "Bridging modern bio-technology and regional Tunisian agriculture. We produce heavy-fruiting mycelium on grain and eco-composites using agricultural co-products.";
      case "quickLinks":
        return currentLanguage === "en" ? "Quick Navigation" : currentLanguage === "ar" ? "وصول سريع" : "Navigation Rapide";
      case "regionalOperations":
        return currentLanguage === "en" ? "Regional Operations" : currentLanguage === "ar" ? "العمليات الإقليمية" : "Implantations Régionales";
      case "officeContacts":
        return currentLanguage === "en" ? "Office Contacts" : currentLanguage === "ar" ? "الاتصال والمكاتب" : "Secrétariat";
      case "allRightsReserved":
        return currentLanguage === "en"
          ? `© ${currentYear} Tunisian Mycelium Biotech. Registered under Startup Act. All Rights Reserved.`
          : currentLanguage === "ar"
          ? `© ${currentYear} بيوتك أغرو تونس. جميع الحقوق محفوظة ومسجلة طبقاً لقانون المؤسسات الناشئة.`
          : `© ${currentYear} Tunisian Mycelium Biotech. Enregistré sous le Startup Act Tunisien. Tous droits réservés.`;
      case "privacyCharter":
        return currentLanguage === "en" ? "Privacy Charter" : currentLanguage === "ar" ? "ميثاق الخصوصية" : "Charte de Confidentialité";
      case "technicalSpec":
        return currentLanguage === "en" ? "Technical Spec" : currentLanguage === "ar" ? "المواصفات الفنية" : "Fiche Technique";
      case "tunisBase":
        return currentLanguage === "en" ? "Tunis: Corporate & Cleanrooms" : currentLanguage === "ar" ? "تونس: مكاتب ومختبرات التعقيم" : "Tunis : Corporate & Cleanrooms";
      default:
        return key;
    }
  };

  const getVal = (key: string, fallback: string) => {
    if (!footerData) return fallback;
    const langKey = `${key}_${currentLanguage}`;
    if (footerData[langKey]) return footerData[langKey];
    if (footerData[key]) return footerData[key];
    return fallback;
  };

  const getRegions = (): string[] => {
    if (!footerData) return [t("tunisBase")];
    const langKey = `regions_${currentLanguage}`;
    if (Array.isArray(footerData[langKey]) && footerData[langKey].length > 0) {
      return footerData[langKey];
    }
    if (Array.isArray(footerData.regions) && footerData.regions.length > 0) {
      return footerData.regions;
    }
    const singleLoc = getVal("regionalLocation", "");
    if (singleLoc) return [singleLoc];
    return [t("tunisBase")];
  };

  const navLabels = {
    home: currentLanguage === "en" ? "Home Overview" : currentLanguage === "ar" ? "نظرة عامة على الموقع" : "Accueil Site",
    about: currentLanguage === "en" ? "About Sci-Lab" : currentLanguage === "ar" ? "من نحن وعلم الخلايا" : "À Propos du Labo",
    products: currentLanguage === "en" ? "Products & Services" : currentLanguage === "ar" ? "المنتجات والخدمات الفطرية" : "Produits & Services",
    contact: currentLanguage === "en" ? "Contact & Inquiries" : currentLanguage === "ar" ? "الاستفسارات والاتصال الفني" : "Nous Contacter"
  };

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Mission Column */}
          <div className="col-span-1 md:col-span-1.5 space-y-4 text-start">
            <div className={`flex items-center gap-2.5 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              {logoUrl ? (
                <div className="bg-white border border-stone-700 rounded-lg h-10 w-10 flex items-center justify-center overflow-hidden shadow-xs">
                  <img src={logoUrl} alt="Biotech Agro Logo" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="p-2 bg-emerald-600 text-stone-100 rounded-lg">
                  <Sprout className="h-5 w-5" />
                </div>
              )}
              <span className="font-display font-medium text-lg text-white tracking-tight">
                Biotech Agro
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed font-light text-start">
              {getVal("description", footerDescription || t("desc"))}
            </p>
            <div className="text-xs text-stone-500 font-mono">
              {currentLanguage === "en" ? "Laboratory ID" : currentLanguage === "ar" ? "معرّف المختبر" : "Identifiant Labo"}: {getVal("labId", "Under-Construction")}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4 text-start">
            <h4 className="text-sm font-semibold text-stone-100 uppercase tracking-wider font-display">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => onNavigate("home")} className="hover:text-emerald-400 transition-colors">
                  {navLabels.home}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("about")} className="hover:text-emerald-400 transition-colors">
                  {navLabels.about}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("products")} className="hover:text-emerald-400 transition-colors">
                  {navLabels.products}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("contact")} className="hover:text-emerald-400 transition-colors">
                  {navLabels.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Regional Tunisian Bio-hubs */}
          <div className="space-y-4 text-start">
            <h4 className="text-sm font-semibold text-stone-100 uppercase tracking-wider font-display">
              {getVal("regionalTitle", t("regionalOperations"))}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 font-mono">
              {getRegions().map((region, idx) => (
                <li key={idx} className={`flex items-start gap-2 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                  <span className="leading-normal">{region}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-4 text-start">
            <h4 className="text-sm font-semibold text-stone-100 uppercase tracking-wider font-display">
              {getVal("contactHeader", t("officeContacts"))}
            </h4>
            <ul className="space-y-3.5 text-sm text-stone-400">
              <li className={`flex items-start gap-2.5 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                <MapPin className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed font-light text-start">
                  {contactAddress || "Zone Industrielle Charguia II, Tunis 2035, Tunisia"}
                </span>
              </li>
              <li className={`flex items-center gap-2.5 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                <Phone className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-mono">
                  {contactPhone || "+216 94 038 433"}
                </span>
              </li>
              <li className={`flex items-center gap-2.5 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                <Mail className="h-4 w-4 text-emerald-400" />
                <span className="text-xs">
                  {contactEmail || "contact@biotech-agro.com"}
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className={`pt-8 mt-8 border-t border-stone-800 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
          <p>{getVal("copyright", footerCopyright || t("allRightsReserved"))}</p>
          <div className="flex gap-4">
            <span className="hover:text-stone-400 cursor-pointer">{getVal("privacyText", t("privacyCharter"))}</span>
            <span className="hover:text-stone-400 cursor-pointer">{getVal("termsText", t("technicalSpec"))}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
