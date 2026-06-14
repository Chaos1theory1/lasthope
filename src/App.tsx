import React, { useState, useEffect } from "react";
import {
  Sprout,
  ShieldCheck,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  Lock,
  Unlock,
  Settings,
  Sparkles,
  Plus,
  Trash,
  Edit,
  Check,
  Loader2,
  ChevronRight,
  GraduationCap,
  Eye,
  EyeOff,
  MessageSquare,
  Calendar,
  AlertCircle,
  Filter,
  ArrowUpRight,
  Info,
  X,
  FileText,
  IterationCw,
  UploadCloud,
  Printer,
  Cpu,
  Award,
  Smartphone,
  Headphones,
  Activity
} from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GoogleDriveVault from "./components/GoogleDriveVault";
import { Product, Service, ContactMessage, SiteContent, DatabaseState, ProductCategory, ProductStatus, TeamMember, Certification, FeatureItem, CatalogSection } from "./types";
import { i18n } from "./translations";

// Floating-overlay or in-place inline text editor for admin live editing
function EditableText({
  value,
  onSave,
  multiline = false,
  isAdmin = false,
  className = ""
}: {
  value: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  isAdmin: boolean;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  if (!isAdmin) {
    return <span className={className}>{value}</span>;
  }

  if (isEditing) {
    return (
      <span className="inline-flex flex-col gap-1 w-full max-w-lg bg-stone-50 border border-emerald-500 rounded-lg p-1.5 shadow-sm text-start font-sans" onClick={(e) => e.stopPropagation()}>
        {multiline ? (
          <textarea
            value={val || ""}
            onChange={(e) => setVal(e.target.value)}
            className="w-full text-xs font-sans p-1.5 border border-stone-250 bg-white rounded text-stone-850"
            rows={3}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={val || ""}
            onChange={(e) => setVal(e.target.value)}
            className="w-full text-xs font-sans px-2 py-1 border border-stone-250 bg-white rounded text-stone-850"
            autoFocus
          />
        )}
        <span className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => {
              onSave(val);
              setIsEditing(false);
            }}
            className="p-1 bg-emerald-750 text-white rounded cursor-pointer hover:bg-emerald-850 flex items-center justify-center"
            title="Save"
          >
            <Check size={11} />
          </button>
          <button
            type="button"
            onClick={() => {
              setVal(value);
              setIsEditing(false);
            }}
            className="p-1 bg-stone-200 text-stone-700 rounded cursor-pointer hover:bg-stone-350 flex items-center justify-center"
            title="Cancel"
          >
            <X size={11} />
          </button>
        </span>
      </span>
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group relative inline-block border border-dashed border-stone-300 hover:border-emerald-600/80 hover:bg-emerald-50/40 rounded px-1 transition duration-150 cursor-pointer ${className}`}
    >
      {value || <span className="italic text-stone-400 font-light">[Empty. Edit]</span>}
      <span className="absolute -top-3.5 -right-3.5 hidden group-hover:flex items-center justify-center p-0.5 bg-emerald-700 text-white rounded-full shadow-xs z-20">
        <Edit size={8} />
      </span>
    </span>
  );
}

// High performance high definition client-side image resizing helper
function resizeImage(base64Str: string, maxDim: number = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
}

// Utility to get localized content fields with language suffix
const DEFAULT_FALLBACKS: Record<string, Record<string, string>> = {
  ar: {
    // Hero
    badge: "رائد التكنلوجيا الحيوية بتونس",
    title: "زراعة الإمكانات اللامتناهية للأبواغ الفطرية",
    subtitle: "نحن نقوم بتدوير المنتجات الثانوية الزراعية التونسية - مثل قشور الزيتون وحبوب القمح - إلى أبواغ فطرية ممتازة ومواد حيوية قابلة للتحلل. تمكين المزارعين الإقليميين ودفع الاقتصاد الدائري.",
    primaryCta: "اكتشف منتجاتنا",
    secondaryCta: "احجز استشارة",
    // About / Choose Section
    chooseTitle: "لماذا يختار المزارعون بيوتك أغرو",
    chooseSubtitle: "تجمع بيوتك أغرو بين التكنولوجيا الحيوية ومراقبة الجودة والأدوات الرقمية لتقديم حل متكامل لإنتاج الأبواغ الفطرية المصممة خصيصاً للأسواق التونسية والأفريقية.",
    choosePhaseTitle1: "عملية مبتكرة",
    choosePhaseDesc1: "أبواغ فطريات سائلة ممتازة منتجة في ظروف معقمة مع تتبع رقميّ لكل دفعة.",
    choosePhaseTitle2: "تتبع برمز الاستجابة السريعة",
    choosePhaseDesc2: "كل دفعة يتم تحديدها وتتبعها وتوثيقها من التلقيح حتى التسليم تضمن السلامة.",
    choosePhaseTitle3: "جودة متناسقة",
    choosePhaseDesc3: "سلالات وبروتوكولات معيارية لضمان إنتاجية متناسقة في كل دورة إنتاج فطرية.",
    choosePhaseTitle4: "الدعم الفني",
    choosePhaseDesc4: "ملاءمة الدعم للتنصيب وتهيئة بيئة غرف إنتاج الفطريات لتحقيق أفضل العوائد للمزارع.",
    // Features Title
    featuresTitle: "ريادة الابتكار الدائري",
    featuresSubtitle: "يستخدم مختبرنا الأنظمة البيولوجية لإعادة تدوير المواد، مما يوفر حلولاً عضوية مخصصة لتونس.",
    // Features Details
    "100% Native Substrates": "ركائز محلية 100٪",
    "We utilize premium Tunisian barley, wheat grains, and upcycled regional olive wood sawdust for our mycelial structures.": "نحن نستخدم الشعير التونسي الممتاز، وحبوب القمح، ونشارة خشب الزيتون المعاد تدويرها لبنياتنا الفطرية.",
    "Sterile Cleanroom Bio-Lab": "مختبر حيوي معقم",
    "All our grain spawn batches are inoculated inside HEPA-14 filtered environments, warranting a zero-contamination rate.": "يتم تلقيح جميع دفعات أبواغ الحبوب الفطرية داخل بيئات تصفية HEPA-14، مما يضمن معدل تلوث صفري.",
    "Circular Bio-pack Innovation": "ابتكار العبوات الحيوية الدائرية",
    "We develop eco-composites & mycelium protective blocks that decompose within 45 days, substituting synthetic single-use expanded plastics.": "نقوم بتطوير مركبات بيئية وقوالب فطريات واقية تتحلل خلال 45 يوماً، كبديل للبلاستيك الموسع.",
    "Empowering Regional Farmers": "تمكين المزارعين الإقليميين",
    "By upcycling agricultural by-products, we generate extra income routes for Tunisian farmers while securing high-performance farming inoculants.": "من خلال إعادة تدوير المنتجات الثانوية الزراعية، نوفر مداخيل إضافية للمزارعين التونسيين مع تأمين ملقحات عالية الأداء.",
    // Biotech (About Biology Page Copy)
    biotechBadge: "العملية البيوتكنولوجية",
    biotechTitle: "كيف نحول الحبوب التونسية إلى أبواغ عالية الحيوية",
    biotechDesc1: "الميسيليوم على الحبوب هو البذرة الخلوية الأولية. في غرفنا المعقمة بتونس، نقوم بإكثار المستنسخات الأم لتلقيح الحبوب المعقّمة.",
    biotechDesc2: "يوفر هذا للمزارعين في تونس وسيلة توزيع مثالية لتسريع دورات النمو عند خلطها مع قش القمح أو لب الزيتون.",
    biotechPhasesTitle: "مراحل النمو الديناميكي:",
    biotechPhaseTitle1: "عزل السلالة",
    biotechPhaseDesc1: "عزل واختيار السلالات القوية على أطباق Petri تحت غطاء HEPA.",
    biotechPhaseTitle2: "تنشيط وتعقيم الحبوب",
    biotechPhaseDesc2: "غسل الشعير المحلي الممتاز وتعقيمه تحت الضغط والحرارة لمدة 2.5 ساعة.",
    biotechPhaseTitle3: "التلقيح العقيم",
    biotechPhaseDesc3: "حقن السائل الفطري داخل قوارير الحبوب تحت تيار هواء HEPA مستمر لنمو متناسق.",
    // Biology Core
    scienceBadge: "جوهر بيولوجيا الفطريات",
    about_title: "ريادة التكنولوجيا الحيوية العضوية في شمال إفريقيا",
    about_subtitle: "من المناطق الخصبة في تونس، نجمع بين التراث الزراعي المحلي والعلوم البيولوجية الحديثة.",
    storyHeading: "إعادة تدوير المنتجات الثانوية التونسية",
    story: "تأسست بيوتك أغرو بفضل فريق من المهندسين والحالمين من جميع أنحاء تونس بهدف تثمين المخلفات الفلاحية لإنتاج فطر متميز وكرتون فطري طبيعي بديل للبلاستيك.",
    teamFocus: "يتابع فريقنا من العلماء التونسيين إنتاج وتلقيح كل دفعة بدقة لضمان خلوها تماماً من أي نوع من الملوثات.",
    missionTitle: "مهمتنا الأستراتيجية",
    mission: "توسيع نطاق زراعة الفطر الدائرية في تونس وتوفير أبواغ معقمة، وتطوير مواد حيوية بيئية بديلة للبلاستيك.",
    // Catalog Section & services
    servicesTitle: "إعداد الاستشارات والخدمات الهندسية",
    servicesSubtitle: "نحن نقدم الدعم الفني لتصميم المختبرات، وتحديد أحجام أجهزة التعقيم، ومخططات تهيئة قنوات التهوئة الحيوية.",
    contactTitle: "اتصل بنا",
    contactSubtitle: "أسئلة حول كتالوجات الأبواغ، أو إعداد غرف التعقيم، أو الشراكات؟ أرسل لنا رسالة.",
    sendAMessage: "أرسل لنا رسالة مباشرة",
    contactFormSubtitle: "عادة ما يجيب مديرو المعمل لدينا في غضون 24 ساعة عمل.",
    address: "المنطقة الصناعية الشرقية الثانية، تونس 2035، تونس",
    phone: "+216 94 038 433",
    email: "contact@biotech-agro.com",
    workingHours: "الإثنين - الجمعة: 08:30 - 17:30 (توقيت جرينتش +1)"
  },
  fr: {
    // Hero
    badge: "PIONNIER DE LA BIOTECH EN TUNISIE",
    title: "Cultiver le potentiel infini du mycélium",
    subtitle: "Nous valorisons les co-produits agricoles tunisiens—comme les coques d'olives et les grains de blé—en blanc de semis de qualité supérieure et en biomatériaux compostables. Autonomiser les producteurs régionaux.",
    primaryCta: "Découvrir Nos Produits",
    secondaryCta: "Réserver un Conseil",
    // About / Choose Section
    chooseTitle: "Pourquoi les producteurs choisissent Biotech Agro",
    chooseSubtitle: "Biotech Agro associe la biotechnologie, le contrôle qualité et le digital pour offrir une solution complète de production de mycélium sur les marchés tunisien et africain.",
    choosePhaseTitle1: "Procédé innovant",
    choosePhaseDesc1: "Mycélium liquide de qualité supérieure produit en conditions stériles avec suivi lot par lot.",
    choosePhaseTitle2: "Traçabilité par QR code",
    choosePhaseDesc2: "Chaque lot est identifié, suivi et documenté depuis l'inoculation jusqu'à la livraison complète.",
    choosePhaseTitle3: "Qualité constante",
    choosePhaseDesc3: "Souches et protocoles standardisés garantissant un rendement régulier à chaque cycle cultural.",
    choosePhaseTitle4: "Support Technique",
    choosePhaseDesc4: "Accompagnement personnalisé pour l'installation d'unités de culture et l'optimisation des flux d'air.",
    // Features Title
    featuresTitle: "Pionnier de l'Innovation Circulaire",
    featuresSubtitle: "Notre laboratoire utilise des systèmes biologiques pour recycler les matières, offrant des solutions adaptées à la Tunisie.",
    // Features Details
    "100% Native Substrates": "Substrats 100% Locaux",
    "We utilize premium Tunisian barley, wheat grains, and upcycled regional olive wood sawdust for our mycelial structures.": "Nous utilisons de l'orge de Tunisie, des grains de blé et de la sciure de bois d'olivier recyclée pour nos structures.",
    "Sterile Cleanroom Bio-Lab": "Laboratoire stérile de pointe",
    "All our grain spawn batches are inoculated inside HEPA-14 filtered environments, warranting a zero-contamination rate.": "Inoculation réalisée en salle propre sous flux laminaire HEPA-14, garantissant une pureté absolue.",
    "Circular Bio-pack Innovation": "Emballages Biosourcés Circulaires",
    "We develop eco-composites & mycelium protective blocks that decompose within 45 days, substituting synthetic single-use expanded plastics.": "Emballages et blocs de protection biosourcés et biodégradables en 45 jours remplaçant le polystyrène expansé.",
    "Empowering Regional Farmers": "Autonomisation des Agriculteurs",
    "By upcycling agricultural by-products, we generate extra income routes for Tunisian farmers while securing high-performance farming inoculants.": "Génération de revenus complémentaires pour les agriculteurs locaux via la valorisation de leurs résidus fauchés.",
    // Biotech (About Biology Page Copy)
    biotechBadge: "Le Procédé Biotechnologique",
    biotechTitle: "Comment nous transformons les grains locaux en mycélium robuste",
    biotechDesc1: "Le mycélium sur grain constitue la semence d'origine. Dans nos salles blanches, nous propageons des souches mères pures pour ensemencer les grains.",
    biotechDesc2: "Ceci offre aux producteurs une semence performante pour optimiser la colonisation des substrats.",
    biotechPhasesTitle: "Phases de croissance d'un lot :",
    biotechPhaseTitle1: "Sélection des souches",
    biotechPhaseDesc1: "Amélioration et sélection de souches pures sous hotte à flux laminaire.",
    biotechPhaseTitle2: "Préparation des céréales",
    biotechPhaseDesc2: "Lavage des céréales locales puis stérilisation sous haute pression durant 2H30.",
    biotechPhaseTitle3: "Inoculation aseptique",
    biotechPhaseDesc3: "Introduction du mycélium en milieu hautement stérile sous flux d'air purifié.",
    // Biology Core
    scienceBadge: "Notre Cœur Technologique",
    about_title: "Pionnier des biotechnologies mycologiques en Afrique du Nord",
    about_subtitle: "Né au cœur des terres fertiles de Tunisie, nous lisons savoir-faire local et excellence scientifique.",
    storyHeading: "Valorisation des ressources agricoles",
    story: "Biotech Agro a été fondée pour valoriser les coproduits et pailles de céréales locales grâce à notre savoir-faire en mycologie industrielle, créant des semences d'excellence et des biomatériaux.",
    teamFocus: "Notre équipe de docteurs et d'ingénieurs assure des contrôles de pureté rigoureux garantissant un mycélium d'une vitalité exceptionnelle.",
    missionTitle: "Notre Mission Stratégique",
    mission: "Démocratiser la culture de champignons en Tunisie, fournir des semences d'élite et créer des biomatériaux biosourcés.",
    // Catalog Section & services
    servicesTitle: "Advisory Setup & Engineering Services",
    servicesSubtitle: "Nous offrons un support technique de pointe pour le dimensionnement de vos labos, autoclaves et systèmes d'aération.",
    contactTitle: "Nous Contacter",
    contactSubtitle: "Des questions sur nos produits, un projet d'installation ou une demande de partenariat ?",
    sendAMessage: "Envoyez-nous un Message",
    contactFormSubtitle: "Nos responsables de laboratoire répondent généralement sous 24 heures de bureau.",
    address: "Zone Industrielle Charguia II, Tunis 2035, Tunisie",
    phone: "+216 94 038 433",
    email: "contact@biotech-agro.com",
    workingHours: "Lundi - Vendredi: 08:30 - 17:30 (GMT+1)"
  }
};

function getLocalizedValue(
  sectionObj: any,
  key: string,
  currentLanguage: string,
  fallbackDefault: string,
  sectionKey?: string
): string {
  if (!sectionObj) {
    if (currentLanguage !== "en" && DEFAULT_FALLBACKS[currentLanguage]) {
      if (sectionKey) {
        const scopedKey = `${sectionKey}_${key}`;
        if (DEFAULT_FALLBACKS[currentLanguage][scopedKey] !== undefined) {
          return DEFAULT_FALLBACKS[currentLanguage][scopedKey];
        }
      }
      if (DEFAULT_FALLBACKS[currentLanguage][key] !== undefined) {
        if (key !== "title" && key !== "subtitle") {
          return DEFAULT_FALLBACKS[currentLanguage][key];
        }
      }
      if (DEFAULT_FALLBACKS[currentLanguage][fallbackDefault] !== undefined) {
        return DEFAULT_FALLBACKS[currentLanguage][fallbackDefault];
      }
    }
    return fallbackDefault;
  }
  const langKey = `${key}_${currentLanguage}`;
  if (sectionObj[langKey] !== undefined && sectionObj[langKey] !== null && sectionObj[langKey] !== "") {
    return sectionObj[langKey];
  }
  
  if (currentLanguage !== "en" && DEFAULT_FALLBACKS[currentLanguage]) {
    if (sectionKey) {
      const scopedKey = `${sectionKey}_${key}`;
      if (DEFAULT_FALLBACKS[currentLanguage][scopedKey] !== undefined) {
        return DEFAULT_FALLBACKS[currentLanguage][scopedKey];
      }
    }
    if (DEFAULT_FALLBACKS[currentLanguage][key] !== undefined) {
      if (key !== "title" && key !== "subtitle") {
        return DEFAULT_FALLBACKS[currentLanguage][key];
      }
    }
    const rawVal = sectionObj[key] || "";
    if (DEFAULT_FALLBACKS[currentLanguage][rawVal] !== undefined) {
      return DEFAULT_FALLBACKS[currentLanguage][rawVal];
    }
    if (DEFAULT_FALLBACKS[currentLanguage][fallbackDefault] !== undefined) {
      return DEFAULT_FALLBACKS[currentLanguage][fallbackDefault];
    }
  }

  if (sectionObj[key] !== undefined && sectionObj[key] !== null && sectionObj[key] !== "") {
    return sectionObj[key];
  }
  return fallbackDefault;
}

function getProductLocalizedValue(
  product: any,
  fieldKey: string,
  lang: string,
  defaultValue: string
): string {
  if (!product) return defaultValue;
  const langKey = `${fieldKey}_${lang}`;
  if (product[langKey] !== undefined && product[langKey] !== null && product[langKey] !== "") {
    return product[langKey];
  }
  if (product[fieldKey] !== undefined && product[fieldKey] !== null && product[fieldKey] !== "") {
    return product[fieldKey];
  }
  return defaultValue;
}

// Inline image asset editor for admin live image changes
// Inline image asset editor for admin live image changes
function EditableImage({
  src,
  onSave,
  isAdmin = false,
  className = "",
  alt = "",
  maxDim = 800,
  uploadImage,
  blobFolder = "content"
}: {
  src: string;
  onSave: (newSrc: string) => void;
  isAdmin: boolean;
  className?: string;
  alt?: string;
  maxDim?: number;
  uploadImage?: (file: File, folder: BlobFolder, maxDim: number) => Promise<string>;
  blobFolder?: BlobFolder;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [urlValue, setUrlValue] = React.useState(src || "");

  React.useEffect(() => {
    setUrlValue(src || "");
  }, [src]);

  const isValidImageUrl = (value: string) => {
    const trimmed = value.trim();

    return (
      trimmed.startsWith("https://") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("data:image/")
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setIsUploading(true);

      if (uploadImage) {
        const blobUrl = await uploadImage(file, blobFolder, maxDim);
        onSave(blobUrl);
        setUrlValue(blobUrl);
      } else {
        const reader = new FileReader();

        reader.onloadend = async () => {
          if (typeof reader.result === "string") {
            const resized = await resizeImage(reader.result, maxDim);
            onSave(resized);
            setUrlValue(resized);
          }
        };

        reader.readAsDataURL(file);
      }

      setIsPanelOpen(false);
    } catch (error: any) {
      console.error("Inline image upload failed:", error);
      alert(error.message || "Image upload failed.");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveUrl = () => {
    const trimmed = urlValue.trim();

    if (!trimmed) {
      alert("Please paste an image URL first.");
      return;
    }

    if (!isValidImageUrl(trimmed)) {
      alert("Please use a valid image URL starting with https://, http://, /, or data:image/.");
      return;
    }

    onSave(trimmed);
    setIsPanelOpen(false);
  };

  if (!isAdmin) {
    return <img src={src} alt={alt} className={className} referrerPolicy="no-referrer" />;
  }

  return (
    <div className="relative group overflow-hidden rounded-xl inline-block w-full h-full">
      <img src={src} alt={alt} className={className} referrerPolicy="no-referrer" />

      <div
        onClick={() => {
          if (!isUploading) {
            setIsPanelOpen(true);
          }
        }}
        className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer gap-1"
      >
        {isUploading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <UploadCloud size={14} />
            <span>Change image</span>
          </>
        )}
      </div>

      {isPanelOpen && (
        <div
          className="fixed inset-0 z-[100] bg-stone-950/60 flex items-center justify-center p-4"
          onClick={() => {
            if (!isUploading) {
              setIsPanelOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Change image</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Upload from your computer to Vercel Blob, or paste an image URL.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isUploading) {
                    setIsPanelOpen(false);
                  }
                }}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="border border-stone-200 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
                Option 1 — Upload from device
              </p>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Uploading to Blob...
                  </>
                ) : (
                  <>
                    <UploadCloud size={15} />
                    Upload image
                  </>
                )}
              </button>

              <p className="text-[10px] text-stone-400">
                Recommended: JPG, PNG, or WebP. Max 3 MB.
              </p>
            </div>

            <div className="border border-stone-200 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
                Option 2 — Use image URL
              </p>

              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-stone-250 bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={handleSaveUrl}
                className="w-full rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold py-3 flex items-center justify-center gap-2"
              >
                <Check size={15} />
                Save URL
              </button>

              <p className="text-[10px] text-stone-400">
                URL images are not copied to Blob. They stay hosted on the external source.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const defaultTeamFallbacks: TeamMember[] = [
  {
    id: "team_1",
    name: "Ali",
    role: "Fondateur & analyste en systèmes d’information",
    bio: "Concepteur de la plateforme interne BiotechAgro dédiée à la digitalisation des protocoles biologiques, à la traçabilité des lots et au contrôle qualité. Responsable des études de marché, du business plan, des protocoles de production et du développement du site et de l’application interne.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "team_2",
    name: "Alaa",
    role: "Cofondateur & investisseur",
    bio: "Partenaire stratégique de BiotechAgro, engagé dans le développement du projet, le soutien à l’investissement et la structuration de la croissance commerciale.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300"
  }
];

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "fr" | "ar">("fr");
  const [adminFooterLanguage, setAdminFooterLanguage] = useState<"en" | "fr" | "ar">("fr");
  // Page selection: 'home', 'about', 'products', 'contact', 'admin'
  const [activePage, setActivePage] = useState<string>("home");
  const [armedTeamMemberDeleteId, setArmedTeamMemberDeleteId] = useState<string | null>(null);
  const [activeAboutIconPicker, setActiveAboutIconPicker] = useState<"mission" | "vision" | null>(null);
  const [activeGrowerIconPicker, setActiveGrowerIconPicker] = useState<number | null>(null);
  const [selectedQrProduct, setSelectedQrProduct] = useState<Product | null>(null);
  const [printableQrBase64, setPrintableQrBase64] = useState<string>("");
  const [isPreloadingQr, setIsPreloadingQr] = useState<boolean>(false);
  const [qrEditMode, setQrEditMode] = useState<boolean>(false);
  const [qrForm, setQrForm] = useState<Partial<Product>>({});

  //home page background picture
const [isHeroBgPanelOpen, setIsHeroBgPanelOpen] = useState(false);
const [isHeroBgUploading, setIsHeroBgUploading] = useState(false);
const [heroBgUrlInput, setHeroBgUrlInput] = useState("");


  useEffect(() => {
    if (!selectedQrProduct) {
      setPrintableQrBase64("");
      setIsPreloadingQr(false);
      return;
    }
    
    let isMounted = true;
    setIsPreloadingQr(true);
    
    const fetchQrAsBase64 = async () => {
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/?qr=${selectedQrProduct.id}`)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch QR");
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) {
            if (typeof reader.result === "string") {
              setPrintableQrBase64(reader.result);
            }
            setIsPreloadingQr(false);
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error preloading printable QR code:", err);
        if (isMounted) {
          setIsPreloadingQr(false);
        }
      }
    };
    
    fetchQrAsBase64();
    
    return () => {
      isMounted = false;
    };
  }, [selectedQrProduct]);

  // Site general data states
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(true);

  // Dynamically update the website favicon to match the logo
  useEffect(() => {
    const faviconUrl = siteContent?.logoUrl || "/src/assets/images/biotech_agro_logo_1781085871729.png";
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
    link.type = "image/png";
  }, [siteContent?.logoUrl]);

  // Sync active language text direction for RTL (Arabic) or LTR (French/English)
  useEffect(() => {
    if (currentLanguage === "ar" && activePage !== "admin") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage, activePage]);

  // Client-side visual states
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service | null>(null);

  // Client landing forms
  const [contactForm, setContactForm] = useState({
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    subject: "",
    message: ""
  });
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [messageSuccess, setMessageSuccess] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<string>("");

  // Admin authentication states
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem("myco_admin_token") || "");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Forgot password/Reset states
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("biotechagro.digital@gmail.com");
  const [resetCode, setResetCode] = useState<string>("");
  const [resetNewPassword, setResetNewPassword] = useState<string>("");
  const [isRequestingResetCode, setIsRequestingResetCode] = useState<boolean>(false);
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);
  const [resetCodeSent, setResetCodeSent] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string>("");
  const [resetError, setResetError] = useState<string>("");
  const [simulatedCode, setSimulatedCode] = useState<string>("");

  // Active admin security settings retrieved from server
  const [adminSecEmail, setAdminSecEmail] = useState<string>("");
  const [isSecDefaultPassword, setIsSecDefaultPassword] = useState<boolean>(true);
  const [secLastLogin, setSecLastLogin] = useState<string>("");
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState<string>("");
  const [emailUpdateError, setEmailUpdateError] = useState<string>("");
  const [isUpdatingSecEmail, setIsUpdatingSecEmail] = useState<boolean>(false);

  // Admin operational states
  const [adminMessages, setAdminMessages] = useState<ContactMessage[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState<boolean>(false);
  const [newAdminPassword, setNewAdminPassword] = useState<string>("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string>("");
  const [passwordChangeError, setPasswordChangeError] = useState<string>("");

  // Editable forms for text content
  const [editHero, setEditHero] = useState<any>({ badge: "", title: "", subtitle: "", primaryCta: "", secondaryCta: "" });
  const [editAbout, setEditAbout] = useState<any>({ title: "", subtitle: "", story: "", mission: "", vision: "", teamFocus: "" });
  const [editContactDetails, setEditContactDetails] = useState<any>({ email: "", phone: "", address: "", locationMapEmbed: "", workingHours: "" });
  const [editFooter, setEditFooter] = useState<any>({ description: "", copyright: "" });
  const [isUpdatingTexts, setIsUpdatingTexts] = useState<string | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState<string>("");
  const [isDraggingLogo, setIsDraggingLogo] = useState<boolean>(false);

  // Product Editor overlay/modal variables
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: "",
    scientificName: "",
    description: "",
    category: "Grain Spawn",
    price: "",
    status: "Available",
    image: "",
    specifications: []
  });
  const [isProductImageUploading, setIsProductImageUploading] = useState(false);

  const [tempSpec, setTempSpec] = useState<string>("");
  const [isSavingProduct, setIsSavingProduct] = useState<boolean>(false);

  // Service Editor variables
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    name: "",
    description: "",
    price: "",
    duration: "",
    image: "",
    benefits: []
  });
  const [tempBenefit, setTempBenefit] = useState<string>("");
  const [isSavingService, setIsSavingService] = useState<boolean>(false);

  // active target textarea helper for copy-pasting AI text
  const [activeTextareaFocus, setActiveTextareaFocus] = useState<string>("hero_subtitle");

  // ==========================================
  // EFFECT: Fetch Dynamic Site Datasets
  // ==========================================
  const loadPublicData = async () => {
    setIsLoadingContent(true);
    try {
      const response = await fetch("/api/content");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setServices(data.services || []);
        if (data.siteContent) {
          setSiteContent(data.siteContent);
          // populate editorial copy edit inputs
          setEditHero(data.siteContent.hero);
          setEditAbout(data.siteContent.about);
          setEditContactDetails(data.siteContent.contactDetails);
          setLogoUrlInput(data.siteContent.logoUrl || "");
          if (data.siteContent.footer) {
            setEditFooter(data.siteContent.footer);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load content:", err);
    } finally {
      setIsLoadingContent(false);
    }
  };

  useEffect(() => {
    loadPublicData();
  }, []);

  // Listen for physical QR scanner parameters ?qr=prod_xxxxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrId = params.get("qr");
    if (qrId && products.length > 0) {
      const matched = products.find((p) => p.id === qrId);
      if (matched) {
        setSelectedQrProduct(matched);
        setActivePage("qr");
        // Clear query parameters from address bar to keep UX clean in history
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [products]);

  // ==========================================
  // EFFECT: Verify Token & Get Inbox Messages
  // ==========================================
  const verifyTokenAndLoadInbox = async (token: string) => {
    if (!token) return;
    try {
      const response = await fetch("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setIsAdminLoggedIn(true);
        loadAdminInbox(token);
        loadAdminSettings(token);
      } else {
        // stale token
        localStorage.removeItem("myco_admin_token");
        setAuthToken("");
        setIsAdminLoggedIn(false);
      }
    } catch (err) {
      console.error("Token verification failed:", err);
    }
  };

  const loadAdminInbox = async (token: string) => {
    try {
      const response = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const msgs = await response.json();
        setAdminMessages(msgs);
        setUnreadMessagesCount(msgs.filter((m: any) => !m.isRead).length);
      }
    } catch (err) {
      console.error("Inbox fetching failed:", err);
    }
  };

  const loadAdminSettings = async (token: string) => {
    try {
      const response = await fetch("/api/auth/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminSecEmail(data.adminEmail || "biotechagro.digital@gmail.com");
        setIsSecDefaultPassword(data.isDefaultPassword);
        setSecLastLogin(data.lastLogin || "");
      }
    } catch (err) {
      console.error("Failed to load admin security settings:", err);
    }
  };

  useEffect(() => {
    if (authToken) {
      verifyTokenAndLoadInbox(authToken);
    }
  }, [authToken]);

  // ==========================================
  // USER: Submit contact inquiry
  // ==========================================
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingMessage(true);
    setMessageSuccess(false);
    setMessageError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      const data = await response.json();
      if (response.ok) {
        setMessageSuccess(true);
        setContactForm({
          senderName: "",
          senderEmail: "",
          senderPhone: "",
          subject: "",
          message: ""
        });
        // reload admin inbox if admin is viewing this during live operations
        if (isAdminLoggedIn && authToken) {
          loadAdminInbox(authToken);
        }
      } else {
        setMessageError(data.error || "Failed to submit message inquiry.");
      }
    } catch (err) {
      setMessageError("Network error. Please try again later.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // ==========================================
  // ADMIN: Authentication
  // ==========================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem("myco_admin_token", data.token);
        setAuthToken(data.token);
        setIsAdminLoggedIn(true);
        setAdminPassword("");
        setAdminUsername("");
        loadAdminInbox(data.token);
        loadAdminSettings(data.token);
      } else {
        setLoginError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      setLoginError("Failed to reach server. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("myco_admin_token");
    setAuthToken("");
    setIsAdminLoggedIn(false);
    setAdminMessages([]);
    if (activePage === "admin") {
      setActivePage("home");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword.trim()) return;
    setIsPasswordUpdating(true);
    setPasswordChangeSuccess("");
    setPasswordChangeError("");

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ newPassword: newAdminPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setPasswordChangeSuccess("Password updated securely!");
        setNewAdminPassword("");
        loadAdminSettings(authToken);
      } else {
        setPasswordChangeError(data.error || "Fail to update password.");
      }
    } catch (err) {
      setPasswordChangeError("Network connection error.");
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecEmail.trim()) return;
    setIsUpdatingSecEmail(true);
    setEmailUpdateSuccess("");
    setEmailUpdateError("");

    try {
      const response = await fetch("/api/auth/update-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ email: adminSecEmail.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setEmailUpdateSuccess("Registered laboratory security email updated successfully!");
        setAdminSecEmail(data.email);
        loadAdminSettings(authToken);
      } else {
        setEmailUpdateError(data.error || "Failed to update email.");
      }
    } catch (err) {
      setEmailUpdateError("Network connection error.");
    } finally {
      setIsUpdatingSecEmail(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsRequestingResetCode(true);
    setResetMessage("");
    setResetError("");

    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setResetCodeSent(true);
        setResetMessage(data.message);
        if (data.simulatedCode) {
          setSimulatedCode(data.simulatedCode);
        }
      } else {
        setResetError(data.error || "Failed to request reset code.");
      }
    } catch (err) {
      setResetError("Server connection error.");
    } finally {
      setIsRequestingResetCode(false);
    }
  };

  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetCode.trim() || !resetNewPassword.trim()) return;
    setIsResettingPassword(true);
    setResetMessage("");
    setResetError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail.trim(),
          code: resetCode.trim(),
          newPassword: resetNewPassword.trim()
        })
      });
      const data = await response.json();
      if (response.ok) {
        setResetMessage("Password reset successfully! Fallback dynamic default passwords have been disabled.");
        setResetCode("");
        setResetNewPassword("");
        setSimulatedCode("");
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetCodeSent(false);
          setResetMessage("");
          setResetError("");
        }, 3000);
      } else {
        setResetError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setResetError("Server connection error.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  // ==========================================
  // ADMIN: Edit Texts
  // ==========================================
  const handleUpdateTextSection = async (section: string, payload: any, showAlert = true) => {
    setIsUpdatingTexts(section);
    try {
      const response = await fetch("/api/content/text", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ section, data: payload })
      });

      if (response.ok) {
        const data = await response.json();
        setSiteContent(data.content);
        if (data.content.hero) setEditHero(data.content.hero);
        if (data.content.about) setEditAbout(data.content.about);
        if (data.content.contactDetails) setEditContactDetails(data.content.contactDetails);
        if (data.content.footer) setEditFooter(data.content.footer);
        if (showAlert) {
          alert(`Success: Website ${section} text saved securely.`);
        }
      // src/App.tsx around line 980
      } else {
        // ✅ HIGHLY IMPROVED ERROR AND STATUS LOGGING
        let errMsg = `Server error ${response.status}.`;
        try {
          const errData = await response.json();
          errMsg = errData.error || errData.message || errMsg;
        } catch (_) {
          try {
            const errText = await response.text();
            if (errText && errText.length < 200) {
              errMsg = `${errMsg} Details: ${errText}`;
            }
          } catch (__) {}
        }
        alert(`Error: ${errMsg}`);
      }
    } catch (err) {
      alert("Error sending request.");
    } finally {
      setIsUpdatingTexts(null);
    }
  };

  // Dynamic Team member live editor state modifiers
  const handleAddNewTeamMember = () => {
    const defaultMember: TeamMember = {
      id: "team_" + Date.now(),
      name: "New Innovator",
      role: "Scientist / Engineer",
      bio: "Provide a direct biological or logistics description.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300"
    };
    const currentTeam = siteContent?.team || defaultTeamFallbacks;
    const updated = [...currentTeam, defaultMember];
    handleUpdateTextSection("team", updated, true);
  };

  const handleUpdateTeamMember = (id: string, updatedFields: Partial<TeamMember>) => {
    const currentTeam = siteContent?.team || defaultTeamFallbacks;
    const updated = currentTeam.map(member => member.id === id ? { ...member, ...updatedFields } : member);
    handleUpdateTextSection("team", updated, false);
  };

  const handleDeleteTeamMember = (id: string) => {
    const currentTeam = siteContent?.team || defaultTeamFallbacks;
    const updated = currentTeam.filter(member => member.id !== id);
    handleUpdateTextSection("team", updated, true);
  };

  // Dynamic Certifications live editor state modifiers
  const handleAddNewCertification = () => {
    const defaultCert: Certification = {
      id: "cert_" + Date.now(),
      title: "HACCP Safety",
      description: "Critical Control Points Certification verifying sterility procedures.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=150"
    };
    const currentCerts = siteContent?.certifications || [];
    const updated = [...currentCerts, defaultCert];
    handleUpdateTextSection("certifications", updated, true);
  };

  const handleUpdateCertification = (id: string, updatedFields: Partial<Certification>) => {
    const currentCerts = siteContent?.certifications || [];
    const updated = currentCerts.map(cert => cert.id === id ? { ...cert, ...updatedFields } : cert);
    handleUpdateTextSection("certifications", updated, false);
  };

  const handleDeleteCertification = (id: string) => {
    if (confirm("Delete this certification?")) {
      const currentCerts = siteContent?.certifications || [];
      const updated = currentCerts.filter(cert => cert.id !== id);
      handleUpdateTextSection("certifications", updated, true);
    }
  };

  const handleUpdateFeature = (id: string, updatedFields: Partial<FeatureItem>) => {
    const updatedFeatures = siteContent?.features.map(feat => feat.id === id ? { ...feat, ...updatedFields } : feat) || [];
    handleUpdateTextSection("features", updatedFeatures, false);
  };

  // ==========================================
  // ADMIN: QR Direct Live Editing handlers
  // ==========================================
  const startQrEditing = () => {
    if (selectedQrProduct) {
      setQrForm({ ...selectedQrProduct });
      setQrEditMode(true);
    }
  };

  const handleSaveQrForm = async () => {
    if (!selectedQrProduct) return;
    try {
      const response = await fetch(`/api/products/${selectedQrProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(qrForm)
      });
      if (response.ok) {
        const data = await response.json();
        const updated = data.product;
        // Update both list state and active single product selection state
        setProducts(prev => prev.map(p => p.id === selectedQrProduct.id ? updated : p));
        setSelectedQrProduct(updated);
        setQrEditMode(false);
        alert("Batch tracking details saved securely!");
      } else {
        alert("Failed to update product batch data.");
      }
    } catch (err) {
      alert("Error saving live QR product parameters.");
    }
  };

  // ==========================================
  // ADMIN: Create, Update, Delete Products
  // ==========================================
  const handleOpenProductCreate = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      scientificName: "",
      description: "",
      category: "Grain Spawn",
      price: "",
      status: "Available",
      image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600",
      specifications: ["Carrier: Certified Grains", "Inoculation: 10%"],
      availableItems: 100,
      productionDate: "",
      expirationDate: "",
    });
  };

  const handleOpenProductEdit = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProductImageUploading) {
  alert("Please wait until the product image finishes uploading.");
  return;
}
    setIsSavingProduct(true);
    const isNew = !editingProduct;
    const url = isNew ? "/api/products" : `/api/products/${editingProduct.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(productForm)
      });
      if (response.ok) {
        setProductForm({ name: "", scientificName: "", description: "", specifications: [] });
        setEditingProduct(null);
        loadPublicData();
      } else {
        alert("Error saving mycelium product parameters.");
      }
    } catch (err) {
      alert("Server error.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleBindDocumentToProduct = async (productId: string, docUrl: string) => {
    try {
      const prod = products.find(p => p.id === productId);
      if (!prod) return;
      
      const updatedProduct = {
        ...prod,
        certificateUrl: docUrl
      };
      
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(updatedProduct)
      });
      
      if (response.ok) {
        loadPublicData();
      } else {
        alert("Found issue binding document url. Please check admin login credentials.");
      }
    } catch (err) {
      console.error("Bind document issue:", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product from the public catalog?")) return;
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        loadPublicData();
      } else {
        alert("Delete request failed.");
      }
    } catch (err) {
      alert("Error contacting server.");
    }
  };

  // Base64 file converter for product/service image upload
type BlobFolder =
  | "products"
  | "services"
  | "logos"
  | "qr"
  | "content"
  | "home"
  | "about"
  | "team"
  | "certifications";

const uploadFileToBlob = async (
  file: File,
  folder: BlobFolder = "content",
  maxDim: number = 1200
): Promise<string> => {
  if (!authToken) {
    throw new Error("Please log in as admin before uploading images.");
  }

  if (file.size > 3 * 1024 * 1024) {
    throw new Error("Image is too large. Please upload an image smaller than 3 MB.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Invalid image file."));
      }
    };

    reader.onerror = () => reject(new Error("Could not read image file."));
  });

  const response = await fetch("/api/media/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      dataUrl,
      filename: file.name,
      folder
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Image upload failed.");
  }

  return data.url;
};


const handleImageUpload = async (
  file: File,
  callback: (url: string) => void,
  folder: BlobFolder = "products"
) => {
  try {
    const url = await uploadFileToBlob(file, folder, 1200);
    callback(url);
  } catch (error: any) {
    console.error("Image upload failed:", error);
    alert(error.message || "Image upload failed.");
  }
};

const getHeroBackgroundImage = () => {
  return (
    siteContent.hero?.backgroundImage ||
    "/assets/images/home_hero_background.png"
  );
};

const isValidImageUrl = (value: string) => {
  const trimmed = value.trim();

  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  );
};

const handleSaveHeroBackgroundUrl = async () => {
  const trimmed = heroBgUrlInput.trim();

  if (!trimmed) {
    alert("Please paste an image URL first.");
    return;
  }

  if (!isValidImageUrl(trimmed)) {
    alert("Please use a valid image URL starting with https://, http://, /, or data:image/.");
    return;
  }

  await handleUpdateTextSection(
    "hero",
    {
      ...siteContent.hero,
      backgroundImage: trimmed
    },
    false
  );

  setIsHeroBgPanelOpen(false);
};

const handleUploadHeroBackground = async (file: File) => {
  try {
    setIsHeroBgUploading(true);

    const url = await uploadFileToBlob(file, "home", 1800);

    await handleUpdateTextSection(
      "hero",
      {
        ...siteContent.hero,
        backgroundImage: url
      },
      false
    );

    setHeroBgUrlInput(url);
    setIsHeroBgPanelOpen(false);
  } catch (error: any) {
    console.error("Hero background upload failed:", error);
    alert(error.message || "Hero background upload failed.");
  } finally {
    setIsHeroBgUploading(false);
  }
};

  // ==========================================
  // ADMIN: Create, Update, Delete Services
  // ==========================================
  const handleOpenServiceCreate = () => {
    setEditingService(null);
    setServiceForm({
      name: "",
      description: "",
      price: "",
      duration: "",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600",
      benefits: ["Technical Site Layout Evaluation"]
    });
  };

  const handleOpenServiceEdit = (serv: Service) => {
    setEditingService(serv);
    setServiceForm({ ...serv });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingService(true);
    const isNew = !editingService;
    const url = isNew ? "/api/services" : `/api/services/${editingService.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(serviceForm)
      });
      if (response.ok) {
        setServiceForm({ name: "", description: "", price: "", duration: "", benefits: [] });
        setEditingService(null);
        loadPublicData();
      } else {
        alert("Error saving advising package.");
      }
    } catch (err) {
      alert("Server failure.");
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Remove this consulting/setup program?")) return;
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        loadPublicData();
      } else {
        alert("Failed to delete service.");
      }
    } catch (err) {
      alert("Error.");
    }
  };

  // ==========================================
  // ADMIN: Manage incoming user messages
  // ==========================================
  const handleToggleMessageRead = async (id: string) => {
    try {
      const response = await fetch(`/api/messages/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        loadAdminInbox(authToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message forever?")) return;
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        loadAdminInbox(authToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Triggered when clicking "Use Copy" in AI Assistant
  const handleAcceptAICopy = (copiedText: string) => {
    if (activeTextareaFocus === "hero_title") {
      setEditHero({ ...editHero, title: copiedText });
    } else if (activeTextareaFocus === "hero_subtitle") {
      setEditHero({ ...editHero, subtitle: copiedText });
    } else if (activeTextareaFocus === "about_story") {
      setEditAbout({ ...editAbout, story: copiedText });
    } else if (activeTextareaFocus === "about_mission") {
      setEditAbout({ ...editAbout, mission: copiedText });
    } else if (activeTextareaFocus === "about_vision") {
      setEditAbout({ ...editAbout, vision: copiedText });
    } else if (activeTextareaFocus === "about_teamFocus") {
      setEditAbout({ ...editAbout, teamFocus: copiedText });
    } else if (activeTextareaFocus === "product_desc") {
      setProductForm({ ...productForm, description: copiedText });
    } else if (activeTextareaFocus === "service_desc") {
      setServiceForm({ ...serviceForm, description: copiedText });
    } else {
      alert("First click inside a text field before inserting generated AI copy.");
    }
  };

  // Feature icon mapper to Lucide elements
  const renderFeatureIcon = (name: string) => {
    switch (name) {
      case "Sprout":
        return <Sprout className="w-6 h-6 text-emerald-800" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-emerald-800" />;
      case "IterationCw":
        return <IterationCw className="w-6 h-6 text-emerald-800" />;
      case "GraduationCap":
        return <GraduationCap className="w-6 h-6 text-emerald-800" />;
      default:
        return <Sprout className="w-6 h-6 text-emerald-800" />;
    }
  };

  // About icon mapper
  const renderAboutIcon = (name: string) => {
    switch (name) {
      case "Sprout":
        return <Sprout className="w-5 h-5 text-emerald-800" />;
      case "Globe":
        return <Globe className="w-5 h-5 text-emerald-800" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5 text-emerald-800" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-emerald-800" />;
      case "Eye":
        return <Eye className="w-5 h-5 text-emerald-800" />;
      default:
        return <Sprout className="w-5 h-5 text-emerald-800" />;
    }
  };

  // Growers Choose benefit icon mapper
  const renderGrowerIcon = (name: string, className = "w-6 h-6 text-emerald-800") => {
    switch (name) {
      case "Cpu":
        return <Cpu className={className} />;
      case "Smartphone":
        return <Smartphone className={className} />;
      case "Award":
        return <Award className={className} />;
      case "Headphones":
        return <Headphones className={className} />;
      case "Activity":
        return <Activity className={className} />;
      case "Sprout":
        return <Sprout className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      default:
        return <Cpu className={className} />;
    }
  };

  // Download QR Code image as a blob
  const downloadQrCode = (productId: string, productName: string) => {
    if (!printableQrBase64) return;
    try {
      const link = document.createElement("a");
      link.href = printableQrBase64;
      link.download = `QR_Code_${productName.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download QR code", error);
      // Fallback
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${window.location.origin}/?qr=${productId}`)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcf9] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 print:bg-white print:p-0">
      
      <div className="print:hidden w-full flex-grow flex flex-col">
        {/* GLOBAL NAVBAR */}
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleLogout}
        logoUrl={siteContent?.logoUrl}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* CORE SCREENS VIEW ROUTING */}
      <main className="flex-grow">
        
        {/* ==========================================
            SCREEN: HOME OVERVIEW
            ========================================== */}
        {activePage === "home" && siteContent && (
          <div className="space-y-16">
            
            {/* Elegant Hero Banner */}
            <section
  className="relative isolate overflow-hidden bg-[#fcfcf9] pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-stone-200/50"
>
  
  <div
  className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-100 saturate-[1.15] contrast-[1.08]"
  style={{
    backgroundImage: `url('${getHeroBackgroundImage()}')`
  }}
/>


  <div className="absolute inset-0 -z-10 bg-white/25" />
<div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/35 via-white/15 to-[#fcfcf9]/55" />
{isAdminLoggedIn && (
    <button
      type="button"
      onClick={() => {
        setHeroBgUrlInput(getHeroBackgroundImage());
        setIsHeroBgPanelOpen(true);
      }}
      className="absolute top-4 right-4 z-20 rounded-full bg-white/90 border border-emerald-200 px-4 py-2 text-[11px] font-bold text-emerald-900 shadow-lg hover:bg-emerald-50 flex items-center gap-2"
    >
      <UploadCloud size={14} />
      Change Hero Background
    </button>
  )}

  {isHeroBgPanelOpen && (
  <div
    className="fixed inset-0 z-[100] bg-stone-950/60 flex items-center justify-center p-4"
    onClick={() => {
      if (!isHeroBgUploading) {
        setIsHeroBgPanelOpen(false);
      }
    }}
  >
    <div
      className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-4 text-start"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">
            Change Home Background
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Upload a new background to database, or paste an external image URL.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isHeroBgUploading) {
              setIsHeroBgPanelOpen(false);
            }
          }}
          className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
        >
          <X size={16} />
        </button>
      </div>

      <div className="border border-stone-200 rounded-xl p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
          Option 1 — Upload from device
        </p>

        <input
          type="file"
          accept="image/*"
          disabled={isHeroBgUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              handleUploadHeroBackground(file);
            }
          }}
          className="w-full rounded-lg border border-stone-250 bg-white px-3 py-2 text-xs text-stone-800"
        />

        {isHeroBgUploading && (
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-2">
            <Loader2 size={12} className="animate-spin" />
            Uploading background to database...
          </p>
        )}

        <p className="text-[10px] text-stone-400">
          Recommended: wide image, JPG/PNG/WebP, under 3 MB.
        </p>
      </div>

      <div className="border border-stone-200 rounded-xl p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
          Option 2 — Use image URL
        </p>

        <input
          type="url"
          value={heroBgUrlInput}
          onChange={(e) => setHeroBgUrlInput(e.target.value)}
          placeholder="https://example.com/background.jpg"
          className="w-full rounded-lg border border-stone-250 bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-emerald-500"
        />

        <button
          type="button"
          onClick={handleSaveHeroBackgroundUrl}
          disabled={isHeroBgUploading}
          className="w-full rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Check size={15} />
          Save URL
        </button>

        <p className="text-[10px] text-stone-400 break-all">
          Current: {getHeroBackgroundImage()}
        </p>
      </div>
    </div>
  </div>
)}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-stone-300 rounded-full blur-3xl animate-pulse-slow" />
              </div>

              <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase">
                  <Sparkles className="w-3 h-3 text-emerald-700 animate-spin-slow" />
                  <EditableText
                    value={getLocalizedValue(siteContent.hero, "badge", currentLanguage, "Tunisian Advanced Myco-Lab")}
                    onSave={(val) => handleUpdateTextSection("hero", { ...siteContent.hero, badge: val, [`badge_${currentLanguage}`]: val }, false)}
                    isAdmin={isAdminLoggedIn}
                  />
                </span>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1]">
                  <EditableText
                    value={getLocalizedValue(siteContent.hero, "title", currentLanguage, "Unlocking the Organic Power of Pure Mushroom Spawn")}
                    onSave={(val) => handleUpdateTextSection("hero", { ...siteContent.hero, title: val, [`title_${currentLanguage}`]: val }, false)}
                    isAdmin={isAdminLoggedIn}
                    multiline={true}
                  />
                </h1>

                <p className="text-stone-600 text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                  <EditableText
                    value={getLocalizedValue(siteContent.hero, "subtitle", currentLanguage, "Certified pure strain inoculants & eco-packaging substrates grown locally in Tunisia under elite aseptic standards.")}
                    onSave={(val) => handleUpdateTextSection("hero", { ...siteContent.hero, subtitle: val, [`subtitle_${currentLanguage}`]: val }, false)}
                    isAdmin={isAdminLoggedIn}
                    multiline={true}
                  />
                </p>

                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => setActivePage("products")}
                    className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md hover:translate-y-[-1px] cursor-pointer"
                  >
                    <EditableText
                      value={getLocalizedValue(siteContent.hero, "primaryCta", currentLanguage, "Explore Catalogs")}
                      onSave={(val) => handleUpdateTextSection("hero", { ...siteContent.hero, primaryCta: val, [`primaryCta_${currentLanguage}`]: val }, false)}
                      isAdmin={isAdminLoggedIn}
                    />
                  </button>
                  <button
                    onClick={() => setActivePage("contact")}
                    className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer"
                  >
                    <EditableText
                      value={getLocalizedValue(siteContent.hero, "secondaryCta", currentLanguage, "Inquire Live")}
                      onSave={(val) => handleUpdateTextSection("hero", { ...siteContent.hero, secondaryCta: val, [`secondaryCta_${currentLanguage}`]: val }, false)}
                      isAdmin={isAdminLoggedIn}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Why Growers Choose Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-b from-stone-50/50 to-white/80 border border-stone-200/60 rounded-3xl shadow-xs">
              <div className="text-center space-y-3 mb-12">
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                  <EditableText
                    value={getLocalizedValue(siteContent.about, "chooseTitle", currentLanguage, "Why growers choose Biotech Agro")}
                    onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, chooseTitle: val, [`chooseTitle_${currentLanguage}`]: val }, false)}
                    isAdmin={isAdminLoggedIn}
                  />
                </h2>
                <p className="text-stone-500 max-w-3xl mx-auto text-sm sm:text-base font-light leading-relaxed">
                  <EditableText
                    value={getLocalizedValue(siteContent.about, "chooseSubtitle", currentLanguage, "Biotech Agro combines biotechnology, quality control, and digital tools to offer a complete mycelium production solution tailored to the Tunisian and African markets.")}
                    onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, chooseSubtitle: val, [`chooseSubtitle_${currentLanguage}`]: val }, false)}
                    isAdmin={isAdminLoggedIn}
                    multiline={true}
                  />
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1st section: Innovative process */}
                <div className="p-6 bg-white border border-stone-150 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  {siteContent.about.choosePhaseImage1 ? (
                    <div className="absolute inset-0 w-full h-full group z-10 bg-white">
                      <EditableImage
                        src={siteContent.about.choosePhaseImage1}
                        onSave={(newImg) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseImage1: newImg }, false)}
                        isAdmin={isAdminLoggedIn}
                        maxDim={800}
                        className="w-full h-full object-cover"
                        alt="Custom image upload card"
                      />
                      {isAdminLoggedIn && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...siteContent.about };
                            delete updated.choosePhaseImage1;
                            handleUpdateTextSection("about", updated, false);
                          }}
                          className="absolute top-2 right-2 bg-stone-900/90 hover:bg-stone-850 text-white text-[9px] px-2 py-0.5 rounded-md font-bold shadow-xs z-20 transition-all"
                        >
                          Show Text + Icon
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="relative inline-block w-fit mr-auto">
                        <button
                          type="button"
                          disabled={!isAdminLoggedIn}
                          onClick={() => setActiveGrowerIconPicker(activeGrowerIconPicker === 1 ? null : 1)}
                          className={`p-3 bg-emerald-50 text-emerald-800 rounded-xl inline-flex items-center justify-center transition-all ${
                            isAdminLoggedIn ? "hover:scale-110 hover:bg-emerald-100 cursor-pointer" : ""
                          }`}
                          title={isAdminLoggedIn ? "Click to change icon" : undefined}
                        >
                          {renderGrowerIcon(siteContent.about.choosePhaseIcon1 || "Cpu")}
                        </button>
                        
                        {isAdminLoggedIn && activeGrowerIconPicker === 1 && (
                          <div className="absolute top-14 left-0 mt-1 bg-white border border-stone-200 rounded-xl p-2.5 shadow-xl z-50 flex flex-col gap-2 min-w-[240px] animate-fade-in text-start">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {(["Cpu", "Smartphone", "Award", "Headphones", "Activity", "Sprout", "ShieldCheck"] as const).map((ic) => (
                                <button
                                  key={ic}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateTextSection("about", { ...siteContent.about, choosePhaseIcon1: ic }, false);
                                    setActiveGrowerIconPicker(null);
                                  }}
                                  className="p-1.5 hover:bg-emerald-50 text-emerald-800 rounded-lg transition-all cursor-pointer"
                                  title={ic}
                                >
                                  {renderGrowerIcon(ic, "w-4 h-4")}
                                </button>
                              ))}
                            </div>
                            <div className="border-t border-stone-100 pt-2 flex flex-col gap-1">
                              <span className="text-[9px] font-mono font-bold text-stone-400">UPLOAD PERSONALIZED ICON</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                      if (typeof reader.result === "string") {
                                        const resized = await resizeImage(reader.result, 128);
                                        handleUpdateTextSection("about", { ...siteContent.about, choosePhaseIcon1: resized }, false);
                                        setActiveGrowerIconPicker(null);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="text-[9px] w-full"
                              />
                            </div>
                            <div className="border-t border-stone-100 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateTextSection("about", { ...siteContent.about, choosePhaseImage1: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300" }, false);
                                  setActiveGrowerIconPicker(null);
                                }}
                                className="w-full text-left text-[10px] text-emerald-850 hover:underline font-bold"
                              >
                                📷 Show Picture instead of Text
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 text-start">
                        <h4 className="font-display font-semibold text-base text-stone-950">
                          <EditableText
                            value={getLocalizedValue(siteContent.about, "choosePhaseTitle1", currentLanguage, "Innovative process")}
                            onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseTitle1: val, [`choosePhaseTitle1_${currentLanguage}`]: val }, false)}
                            isAdmin={isAdminLoggedIn}
                          />
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed font-light">
                          <EditableText
                            value={getLocalizedValue(siteContent.about, "choosePhaseDesc1", currentLanguage, "Premium liquid mycelium and spawn, produced in sterile conditions with digital batch-by-batch tracking")}
                            onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseDesc1: val, [`choosePhaseDesc1_${currentLanguage}`]: val }, false)}
                            isAdmin={isAdminLoggedIn}
                            multiline={true}
                          />
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2nd section: QR code traceability */}
                <div className="p-6 bg-white border border-stone-150 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  {siteContent.about.choosePhaseImage2 ? (
                    <div className="absolute inset-0 w-full h-full group z-10 bg-white">
                      <EditableImage
                        src={siteContent.about.choosePhaseImage2}
                        onSave={(newImg) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseImage2: newImg }, false)}
                        isAdmin={isAdminLoggedIn}
                        maxDim={800}
                        className="w-full h-full object-cover"
                        alt="Custom image upload card"
                      />
                      {isAdminLoggedIn && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...siteContent.about };
                            delete updated.choosePhaseImage2;
                            handleUpdateTextSection("about", updated, false);
                          }}
                          className="absolute top-2 right-2 bg-stone-900/90 hover:bg-stone-850 text-white text-[9px] px-2 py-0.5 rounded-md font-bold shadow-xs z-20 transition-all"
                        >
                          Show Text + Icon
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="relative inline-block w-fit mr-auto">
                        <button
                          type="button"
                          disabled={!isAdminLoggedIn}
                          onClick={() => setActiveGrowerIconPicker(activeGrowerIconPicker === 2 ? null : 2)}
                          className={`p-3 bg-emerald-50 text-emerald-800 rounded-xl inline-flex items-center justify-center transition-all ${
                            isAdminLoggedIn ? "hover:scale-110 hover:bg-emerald-100 cursor-pointer" : ""
                          }`}
                          title={isAdminLoggedIn ? "Click to change icon" : undefined}
                        >
                          {renderGrowerIcon(siteContent.about.choosePhaseIcon2 || "Smartphone")}
                        </button>

                        {isAdminLoggedIn && activeGrowerIconPicker === 2 && (
                          <div className="absolute top-14 left-0 mt-1 bg-white border border-stone-200 rounded-xl p-2.5 shadow-xl z-50 flex flex-col gap-2 min-w-[240px] animate-fade-in text-start">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {(["Cpu", "Smartphone", "Award", "Headphones", "Activity", "Sprout", "ShieldCheck"] as const).map((ic) => (
                                <button
                                  key={ic}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateTextSection("about", { ...siteContent.about, choosePhaseIcon2: ic }, false);
                                    setActiveGrowerIconPicker(null);
                                  }}
                                  className="p-1.5 hover:bg-emerald-50 text-emerald-800 rounded-lg transition-all cursor-pointer"
                                  title={ic}
                                >
                                  {renderGrowerIcon(ic, "w-4 h-4")}
                                </button>
                              ))}
                            </div>
                            <div className="border-t border-stone-100 pt-2 flex flex-col gap-1">
                              <span className="text-[9px] font-mono font-bold text-stone-400">UPLOAD PERSONALIZED ICON</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                      if (typeof reader.result === "string") {
                                        const resized = await resizeImage(reader.result, 128);
                                        handleUpdateTextSection("about", { ...siteContent.about, choosePhaseIcon2: resized }, false);
                                        setActiveGrowerIconPicker(null);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="text-[9px] w-full"
                              />
                            </div>
                            <div className="border-t border-stone-100 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateTextSection("about", { ...siteContent.about, choosePhaseImage2: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300" }, false);
                                  setActiveGrowerIconPicker(null);
                                }}
                                className="w-full text-left text-[10px] text-emerald-850 hover:underline font-bold"
                              >
                                📷 Show Picture instead of Text
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 text-start">
                        <h4 className="font-display font-semibold text-base text-stone-950">
                          <EditableText
                            value={getLocalizedValue(siteContent.about, "choosePhaseTitle2", currentLanguage, "QR code traceability")}
                            onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseTitle2: val, [`choosePhaseTitle2_${currentLanguage}`]: val }, false)}
                            isAdmin={isAdminLoggedIn}
                          />
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed font-light">
                          <EditableText
                            value={getLocalizedValue(siteContent.about, "choosePhaseDesc2", currentLanguage, "Every batch is identified, tracked, and documented from inoculation to delivery.")}
                            onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseDesc2: val, [`choosePhaseDesc2_${currentLanguage}`]: val }, false)}
                            isAdmin={isAdminLoggedIn}
                            multiline={true}
                          />
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3rd section: Consistent quality */}
                <div className="p-6 bg-white border border-stone-150 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  {siteContent.about.choosePhaseImage3 ? (
                    <div className="absolute inset-0 w-full h-full group z-10 bg-white">
                      <EditableImage
                        src={siteContent.about.choosePhaseImage3}
                        onSave={(newImg) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseImage3: newImg }, false)}
                        isAdmin={isAdminLoggedIn}
                        maxDim={800}
                        className="w-full h-full object-cover"
                        alt="Custom image upload card"
                      />
                      {isAdminLoggedIn && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...siteContent.about };
                            delete updated.choosePhaseImage3;
                            handleUpdateTextSection("about", updated, false);
                          }}
                          className="absolute top-2 right-2 bg-stone-900/90 hover:bg-stone-850 text-white text-[9px] px-2 py-0.5 rounded-md font-bold shadow-xs z-20 transition-all"
                        >
                          Show Text + Icon
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="relative inline-block w-fit mr-auto">
                        <button
                          type="button"
                          disabled={!isAdminLoggedIn}
                          onClick={() => setActiveGrowerIconPicker(activeGrowerIconPicker === 3 ? null : 3)}
                          className={`p-3 bg-emerald-50 text-emerald-800 rounded-xl inline-flex items-center justify-center transition-all ${
                            isAdminLoggedIn ? "hover:scale-110 hover:bg-emerald-100 cursor-pointer" : ""
                          }`}
                          title={isAdminLoggedIn ? "Click to change icon" : undefined}
                        >
                          {renderGrowerIcon(siteContent.about.choosePhaseIcon3 || "Award")}
                        </button>

                        {isAdminLoggedIn && activeGrowerIconPicker === 3 && (
                          <div className="absolute top-14 left-0 mt-1 bg-white border border-stone-200 rounded-xl p-2.5 shadow-xl z-50 flex flex-col gap-2 min-w-[240px] animate-fade-in text-start">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {(["Cpu", "Smartphone", "Award", "Headphones", "Activity", "Sprout", "ShieldCheck"] as const).map((ic) => (
                                <button
                                  key={ic}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateTextSection("about", { ...siteContent.about, choosePhaseIcon3: ic }, false);
                                    setActiveGrowerIconPicker(null);
                                  }}
                                  className="p-1.5 hover:bg-emerald-50 text-emerald-800 rounded-lg transition-all cursor-pointer"
                                  title={ic}
                                >
                                  {renderGrowerIcon(ic, "w-4 h-4")}
                                </button>
                              ))}
                            </div>
                            <div className="border-t border-stone-100 pt-2 flex flex-col gap-1">
                              <span className="text-[9px] font-mono font-bold text-stone-400">UPLOAD PERSONALIZED ICON</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                      if (typeof reader.result === "string") {
                                        const resized = await resizeImage(reader.result, 128);
                                        handleUpdateTextSection("about", { ...siteContent.about, choosePhaseIcon3: resized }, false);
                                        setActiveGrowerIconPicker(null);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="text-[9px] w-full"
                              />
                            </div>
                            <div className="border-t border-stone-100 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateTextSection("about", { ...siteContent.about, choosePhaseImage3: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=300" }, false);
                                  setActiveGrowerIconPicker(null);
                                }}
                                className="w-full text-left text-[10px] text-emerald-850 hover:underline font-bold"
                              >
                                📷 Show Picture instead of Text
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 text-start">
                        <h4 className="font-display font-semibold text-base text-stone-950">
                          <EditableText
                            value={getLocalizedValue(siteContent.about, "choosePhaseTitle3", currentLanguage, "Consistent quality")}
                            onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseTitle3: val, [`choosePhaseTitle3_${currentLanguage}`]: val }, false)}
                            isAdmin={isAdminLoggedIn}
                          />
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed font-light">
                          <EditableText
                            value={getLocalizedValue(siteContent.about, "choosePhaseDesc3", currentLanguage, "Standardized strains and protocols to ensure consistent yields across every production cycle.")}
                            onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseDesc3: val, [`choosePhaseDesc3_${currentLanguage}`]: val }, false)}
                            isAdmin={isAdminLoggedIn}
                            multiline={true}
                          />
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4th section: Technical Support */}
                <div className="p-6 bg-white border border-stone-150 rounded-2xl shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                  {siteContent.about.choosePhaseImage4 ? (
                    <div className="absolute inset-0 w-full h-full group z-10 bg-white">
                      <EditableImage
                        src={siteContent.about.choosePhaseImage4}
                        onSave={(newImg) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseImage4: newImg }, false)}
                        isAdmin={isAdminLoggedIn}
                        maxDim={800}
                        className="w-full h-full object-cover"
                        alt="Custom image upload card"
                      />
                      {isAdminLoggedIn && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...siteContent.about };
                            delete updated.choosePhaseImage4;
                            handleUpdateTextSection("about", updated, false);
                          }}
                          className="absolute top-2 right-2 bg-stone-900/90 hover:bg-stone-850 text-white text-[9px] px-2 py-0.5 rounded-md font-bold shadow-xs z-20 transition-all font-sans"
                        >
                          Show Text + Icon
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="relative inline-block w-fit mr-auto">
                        <button
                          type="button"
                          disabled={!isAdminLoggedIn}
                          onClick={() => setActiveGrowerIconPicker(activeGrowerIconPicker === 4 ? null : 4)}
                          className={`p-3 bg-emerald-50 text-emerald-800 rounded-xl inline-flex items-center justify-center transition-all ${
                            isAdminLoggedIn ? "hover:scale-110 hover:bg-emerald-100 cursor-pointer" : ""
                          }`}
                          title={isAdminLoggedIn ? "Click to change icon" : undefined}
                        >
                          {renderGrowerIcon(siteContent.about.choosePhaseIcon4 || "Headphones")}
                        </button>

                        {isAdminLoggedIn && activeGrowerIconPicker === 4 && (
                          <div className="absolute top-14 left-0 mt-1 bg-white border border-stone-200 rounded-xl p-2.5 shadow-xl z-50 flex flex-col gap-2 min-w-[240px] animate-fade-in text-start">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {(["Cpu", "Smartphone", "Award", "Headphones", "Activity", "Sprout", "ShieldCheck"] as const).map((ic) => (
                                <button
                                  key={ic}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateTextSection("about", { ...siteContent.about, choosePhaseIcon4: ic }, false);
                                    setActiveGrowerIconPicker(null);
                                  }}
                                  className="p-1.5 hover:bg-emerald-50 text-emerald-800 rounded-lg transition-all cursor-pointer"
                                  title={ic}
                                >
                                  {renderGrowerIcon(ic, "w-4 h-4")}
                                </button>
                              ))}
                            </div>
                            <div className="border-t border-stone-100 pt-2 flex flex-col gap-1">
                              <span className="text-[9px] font-mono font-bold text-stone-400">UPLOAD PERSONALIZED ICON</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                      if (typeof reader.result === "string") {
                                        const resized = await resizeImage(reader.result, 128);
                                        handleUpdateTextSection("about", { ...siteContent.about, choosePhaseIcon4: resized }, false);
                                        setActiveGrowerIconPicker(null);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="text-[9px] w-full"
                              />
                            </div>
                            <div className="border-t border-stone-100 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateTextSection("about", { ...siteContent.about, choosePhaseImage4: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=300" }, false);
                                  setActiveGrowerIconPicker(null);
                                }}
                                className="w-full text-left text-[10px] text-emerald-850 hover:underline font-bold"
                              >
                                📷 Show Picture instead of Text
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 text-start">
                        <h4 className="font-display font-semibold text-base text-stone-950 font-sans">
                          <EditableText
                            value={getLocalizedValue(siteContent.about, "choosePhaseTitle4", currentLanguage, "Technical Support")}
                            onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseTitle4: val, [`choosePhaseTitle4_${currentLanguage}`]: val }, false)}
                            isAdmin={isAdminLoggedIn}
                          />
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed font-light">
                          <EditableText
                            value={getLocalizedValue(siteContent.about, "choosePhaseDesc4", currentLanguage, "Customer support for setting up and optimizing cultivation units.")}
                            onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, choosePhaseDesc4: val, [`choosePhaseDesc4_${currentLanguage}`]: val }, false)}
                            isAdmin={isAdminLoggedIn}
                            multiline={true}
                          />
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Scientific Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="text-center space-y-2 mb-12">
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                  <EditableText
                    value={getLocalizedValue(siteContent.about, "featuresTitle", currentLanguage, "Pioneering Circular Innovation")}
                    onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, featuresTitle: val, [`featuresTitle_${currentLanguage}`]: val }, false)}
                    isAdmin={isAdminLoggedIn}
                  />
                </h2>
                <p className="text-stone-500 max-w-xl mx-auto text-sm font-light">
                  <EditableText
                    value={getLocalizedValue(siteContent.about, "featuresSubtitle", currentLanguage, "Our lab utilizes biological systems to cycle materials, providing organic solutions tailored for Tunisia.")}
                    onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, featuresSubtitle: val, [`featuresSubtitle_${currentLanguage}`]: val }, false)}
                    isAdmin={isAdminLoggedIn}
                    multiline={true}
                  />
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {siteContent.features.map((feat) => (
                  <div
                    key={feat.id}
                    className="p-6 bg-white border border-stone-200/60 rounded-2xl shadow-xs hover:shadow-md transition-all hover:translate-y-[-2px] relative group"
                  >
                    <div className="p-3 bg-stone-100 rounded-xl w-fit mb-4 group-hover:bg-emerald-50 transition-colors">
                      {renderFeatureIcon(feat.icon)}
                    </div>
                    <h3 className="font-display font-semibold text-lg text-stone-900 mb-2">
                      <EditableText
                        value={getLocalizedValue(feat, "title", currentLanguage, feat.title)}
                        onSave={(val) => handleUpdateFeature(feat.id, { title: val, [`title_${currentLanguage}`]: val })}
                        isAdmin={isAdminLoggedIn}
                      />
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed font-light">
                      <EditableText
                        value={getLocalizedValue(feat, "description", currentLanguage, feat.description)}
                        onSave={(val) => handleUpdateFeature(feat.id, { description: val, [`description_${currentLanguage}`]: val })}
                        isAdmin={isAdminLoggedIn}
                        multiline={true}
                      />
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive Science Section - "How mycelium processes substrates" */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="interactive-science-section">
              <div className="bg-[#1c241d] text-stone-100 rounded-3xl p-8 lg:p-12 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 pointer-events-none opacity-10">
                  <Sprout className="w-96 h-96 -mr-16 -mb-16 text-emerald-300" />
                </div>

                {isAdminLoggedIn && (
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                      onClick={() => {
                        if (siteContent.about.biotechImage) {
                          handleUpdateTextSection("about", { ...siteContent.about, biotechImage: "" }, false);
                        } else {
                          handleUpdateTextSection("about", { ...siteContent.about, biotechImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231c241d'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2310b981'>Upload Process Diagram</text></svg>" }, false);
                        }
                      }}
                      className="px-3 py-1 bg-emerald-900 border border-emerald-700/50 hover:bg-emerald-850 text-emerald-300 rounded-lg text-[10px] font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      {siteContent.about.biotechImage ? "Show Text Content" : "Show Image Display"}
                    </button>
                  </div>
                )}

                {siteContent.about.biotechImage ? (
                  <div className="w-full relative rounded-2xl overflow-hidden group min-h-[300px]">
                    <EditableImage
                      src={siteContent.about.biotechImage}
                      onSave={(newImg) => handleUpdateTextSection("about", { ...siteContent.about, biotechImage: newImg }, false)}
                      isAdmin={isAdminLoggedIn}
                      className="w-full h-full max-h-[600px] object-cover rounded-2xl"
                      alt="Biotechnology Process Diagram"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      <EditableText
                        value={getLocalizedValue(siteContent.about, "biotechBadge", currentLanguage, "The Biotechnology Process")}
                        onSave={(val) => handleUpdateTextSection("about", { 
                          ...siteContent.about, 
                          biotechBadge: val,
                          [`biotechBadge_${currentLanguage}`]: val 
                        }, false)}
                        isAdmin={isAdminLoggedIn}
                        className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block"
                      />
                    </span>
                    <h2 className="font-display text-3xl font-bold text-white tracking-tight lead-[1.2]">
                      <EditableText
                        value={getLocalizedValue(siteContent.about, "biotechTitle", currentLanguage, "How We Transform Tunisian Grain into Highly Viable Spawn")}
                        onSave={(val) => handleUpdateTextSection("about", { 
                          ...siteContent.about, 
                          biotechTitle: val,
                          [`biotechTitle_${currentLanguage}`]: val 
                        }, false)}
                        isAdmin={isAdminLoggedIn}
                      />
                    </h2>
                    <p className="text-stone-300 leading-relaxed text-sm font-light">
                      <EditableText
                        value={getLocalizedValue(siteContent.about, "biotechDesc1", currentLanguage, "Mycelium on grains (mushroom spawn) is cellular starter seed. In our Tunis cleanrooms, we propagate native mother clones. When transferred onto clean grains under autoclaved setups, the white fungal network hyper-colonizes every seed, absorbing cellular starches.")}
                        onSave={(val) => handleUpdateTextSection("about", { 
                          ...siteContent.about, 
                          biotechDesc1: val,
                          [`biotechDesc1_${currentLanguage}`]: val 
                        }, false)}
                        isAdmin={isAdminLoggedIn}
                        multiline={true}
                      />
                    </p>
                    <p className="text-stone-300 leading-relaxed text-sm font-light">
                      <EditableText
                        value={getLocalizedValue(siteContent.about, "biotechDesc2", currentLanguage, "This provides growers in Tunisia with an optimized delivery device. When mixed into wheat straw or agricultural olive pulp, each grain acts as a biological ignition node, triggering accelerated growth cycles.")}
                        onSave={(val) => handleUpdateTextSection("about", { 
                          ...siteContent.about, 
                          biotechDesc2: val,
                          [`biotechDesc2_${currentLanguage}`]: val 
                        }, false)}
                        isAdmin={isAdminLoggedIn}
                        multiline={true}
                      />
                    </p>
                  </div>

                  <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800 space-y-4">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      <EditableText
                        value={getLocalizedValue(siteContent.about, "biotechPhasesTitle", currentLanguage, "Dynamic Growth Phases:")}
                        onSave={(val) => handleUpdateTextSection("about", { 
                          ...siteContent.about, 
                          biotechPhasesTitle: val,
                          [`biotechPhasesTitle_${currentLanguage}`]: val 
                        }, false)}
                        isAdmin={isAdminLoggedIn}
                        className="text-xs font-semibold text-white uppercase tracking-wider font-mono block"
                      />
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">1</div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            <EditableText
                              value={getLocalizedValue(siteContent.about, "biotechPhaseTitle1", currentLanguage, "Clone Separation")}
                              onSave={(val) => handleUpdateTextSection("about", { 
                                ...siteContent.about, 
                                biotechPhaseTitle1: val,
                                [`biotechPhaseTitle1_${currentLanguage}`]: val 
                              }, false)}
                              isAdmin={isAdminLoggedIn}
                            />
                          </h4>
                          <p className="text-xs text-stone-400">
                            <EditableText
                              value={getLocalizedValue(siteContent.about, "biotechPhaseDesc1", currentLanguage, "Isolating robust strains on MEA Petri dishes under HEPA hoods.")}
                              onSave={(val) => handleUpdateTextSection("about", { 
                                ...siteContent.about, 
                                biotechPhaseDesc1: val,
                                [`biotechPhaseDesc1_${currentLanguage}`]: val 
                              }, false)}
                              isAdmin={isAdminLoggedIn}
                              multiline={true}
                            />
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 border-t border-stone-800 pt-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">2</div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            <EditableText
                              value={getLocalizedValue(siteContent.about, "biotechPhaseTitle2", currentLanguage, "Grain Activation & Sterilization")}
                              onSave={(val) => handleUpdateTextSection("about", { 
                                ...siteContent.about, 
                                biotechPhaseTitle2: val,
                                [`biotechPhaseTitle2_${currentLanguage}`]: val 
                              }, false)}
                              isAdmin={isAdminLoggedIn}
                            />
                          </h4>
                          <p className="text-xs text-stone-400">
                            <EditableText
                              value={getLocalizedValue(siteContent.about, "biotechPhaseDesc2", currentLanguage, "Washing premium local barley and pressure heating for 2.5 hours.")}
                              onSave={(val) => handleUpdateTextSection("about", { 
                                ...siteContent.about, 
                                biotechPhaseDesc2: val,
                                [`biotechPhaseDesc2_${currentLanguage}`]: val 
                              }, false)}
                              isAdmin={isAdminLoggedIn}
                              multiline={true}
                            />
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 border-t border-stone-800 pt-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono">3</div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            <EditableText
                              value={getLocalizedValue(siteContent.about, "biotechPhaseTitle3", currentLanguage, "Aseptic Inoculation")}
                              onSave={(val) => handleUpdateTextSection("about", { 
                                ...siteContent.about, 
                                biotechPhaseTitle3: val,
                                [`biotechPhaseTitle3_${currentLanguage}`]: val 
                              }, false)}
                              isAdmin={isAdminLoggedIn}
                            />
                          </h4>
                          <p className="text-xs text-stone-400">
                            <EditableText
                              value={getLocalizedValue(siteContent.about, "biotechPhaseDesc3", currentLanguage, "Inoculating mycelial liquid into grain flasks with constant HEPA air.")}
                              onSave={(val) => handleUpdateTextSection("about", { 
                                ...siteContent.about, 
                                biotechPhaseDesc3: val,
                                [`biotechPhaseDesc3_${currentLanguage}`]: val 
                              }, false)}
                              isAdmin={isAdminLoggedIn}
                              multiline={true}
                            />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </section>
          </div>
        )}

        {/* ==========================================
            SCREEN: PRIVATE DISCOVERY QR DETAILS VIEW
            ========================================== */}
        {activePage === "qr" && selectedQrProduct && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in" id="qr-detail-page">
            {/* Header / Navigation Bar */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <button
                onClick={() => {
                  setActivePage("home");
                  setSelectedQrProduct(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
              >
                ← Back to Home
              </button>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase">
                  BATCH SECURE AUTHENTICATED
                </span>
              </div>
            </div>

            {/* Main Visual Dual Panel Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Panel: Example Photo & Category Details */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-stone-50 border border-stone-250 p-4 rounded-2xl space-y-4 shadow-sm">
                  <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden relative">
                    <img
                      src={qrEditMode ? (qrForm.image || "") : selectedQrProduct.image}
                      alt={selectedQrProduct.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 text-[9px] font-bold tracking-wider font-mono bg-stone-900/90 text-stone-50 rounded-md uppercase">
                        {selectedQrProduct.category}
                      </span>
                    </div>
                  </div>

                  {/* Pricing and status indicator */}
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-stone-200">
                    <div>
                      <span className="text-[10px] text-stone-400 font-mono block">REFERENCE VALUE</span>
                      <span className="text-sm font-bold text-stone-900">{selectedQrProduct.price}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-mono block text-right">BATCH STATUS</span>
                      <span className={`text-xs font-bold ${selectedQrProduct.status === "Available" ? "text-emerald-700" : "text-rose-700"}`}>
                        ● {selectedQrProduct.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secure certificate box */}
                <div className="p-4 bg-stone-950 text-stone-100 rounded-2xl border border-stone-800 space-y-2">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-wider block">TUNISIA MYCELIUM BIOTECH</span>
                  <h4 className="text-xs font-bold">🛡️ Authenticity Verification Certificate</h4>
                  <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                    This single jar, spawn bag or grow kit contains active, contaminant-free mycelium inoculated inside our premium sterile cleanrooms in Tunisia. Substrate sterilization completed under 121°C autoclaving.
                  </p>
                </div>
              </div>

              {/* Right Panel: Description, Tracking Stock Levels, and Dates */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Product Name headings */}
                <div className="space-y-1">
                  <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 leading-tight">
                    {selectedQrProduct.name}
                  </h1>
                  {selectedQrProduct.scientificName && (
                    <p className="text-xs text-stone-500 font-medium italic">
                      Taxonomy: {selectedQrProduct.scientificName}
                    </p>
                  )}
                </div>

                {/* QR Parameters tracking details: Available Stock, Prodn Date, Expiry Date */}
                <div className={`grid ${isAdminLoggedIn ? "grid-cols-3" : "grid-cols-1"} gap-3`}>
                  <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl text-center">
                    <span className="text-[9px] font-mono text-emerald-800 font-semibold block uppercase tracking-wider mb-1">
                      Available Stock
                    </span>
                    {qrEditMode ? (
                      <input
                        type="number"
                        min={0}
                        value={qrForm.availableItems ?? 50}
                        onChange={(e) => setQrForm({ ...qrForm, availableItems: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-white border border-stone-250 rounded-md px-1.5 py-0.5 text-center text-xs font-bold"
                      />
                    ) : (
                      <span className="text-lg font-bold text-emerald-950">
                        {selectedQrProduct.availableItems ?? 50} <span className="text-[10px] font-normal">units</span>
                      </span>
                    )}
                  </div>

                  {isAdminLoggedIn && (
                    <>
                      <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl text-center">
                        <span className="text-[9px] font-mono text-stone-500 font-semibold block uppercase tracking-wider mb-1">
                          Production Date
                        </span>
                        {qrEditMode ? (
                          <input
                            type="date"
                            value={qrForm.productionDate || ""}
                            onChange={(e) => setQrForm({ ...qrForm, productionDate: e.target.value })}
                            className="w-full bg-white border border-stone-250 rounded-md px-1.5 py-0.5 text-xs text-center"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-stone-800">
                            {selectedQrProduct.productionDate || "Not Stated"}
                          </span>
                        )}
                      </div>

                      <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl text-center">
                        <span className="text-[9px] font-mono text-stone-500 font-semibold block uppercase tracking-wider mb-1">
                          Expiration Date
                        </span>
                        {qrEditMode ? (
                          <input
                            type="date"
                            value={qrForm.expirationDate || ""}
                            onChange={(e) => setQrForm({ ...qrForm, expirationDate: e.target.value })}
                            className="w-full bg-white border border-stone-250 rounded-md px-1.5 py-0.5 text-xs text-center"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-stone-800">
                            {selectedQrProduct.expirationDate || "Not Stated"}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Description & analytical copy */}
                <div className="space-y-2 bg-stone-50/50 p-4 rounded-xl border border-stone-200/60">
                  <h3 className="text-xs font-bold text-stone-800 uppercase font-mono tracking-wider">
                    Biological Characteristics / Instructions:
                  </h3>
                  {qrEditMode ? (
                    <textarea
                      rows={5}
                      value={qrForm.description || ""}
                      onChange={(e) => setQrForm({ ...qrForm, description: e.target.value })}
                      className="w-full bg-white border border-stone-250 rounded-lg p-2.5 text-xs text-stone-900 animate-fade-in"
                    />
                  ) : (
                    <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed whitespace-pre-wrap">
                      {selectedQrProduct.description || "Inoculated grains ready to spawn substrates under micro-filtrated laboratory settings."}
                    </p>
                  )}
                </div>

                {/* specifications list if any */}
                {selectedQrProduct.specifications && selectedQrProduct.specifications.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-stone-400">Biological Parameters:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedQrProduct.specifications.map((spec, i) => (
                        <span key={i} className="text-[10px] bg-stone-100 text-stone-600 border border-stone-200 rounded-md px-2 py-0.5 font-mono">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Live Controls block */}
                {isAdminLoggedIn && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950 font-display">🔧 Administrator Real-Time Console</h4>
                        <p className="text-[10px] text-emerald-700">You can edit the active description, example photo uploader, and dates directly.</p>
                      </div>
                      {!qrEditMode ? (
                        <button
                          onClick={startQrEditing}
                          className="px-3 py-1 bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Enable Live Edits
                        </button>
                      ) : (
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => setQrEditMode(false)}
                            className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Discard
                          </button>
                          <button
                            onClick={handleSaveQrForm}
                            className="px-3 py-1 bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>

                    {qrEditMode && (
                      <div className="space-y-2 pt-2 border-t border-emerald-200 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-emerald-950 block">Direct Photo Url</label>
                          <input
                            type="text"
                            value={qrForm.image || ""}
                            onChange={(e) => setQrForm({ ...qrForm, image: e.target.value })}
                            className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1 text-xs text-stone-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-emerald-950 block">Or Upload Local Image File:</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], (b64) => setQrForm({ ...qrForm, image: b64 }));
                              }
                            }}
                            className="w-full bg-white border border-stone-250 rounded-lg p-1 text-xs text-stone-900"
                          />
                        </div>
                      </div>
                    )}

                    {/* QR Code label printing view for Admin */}
                    <div className="pt-3 border-t border-emerald-200 flex items-center gap-4 bg-white/70 p-3 rounded-xl border border-emerald-100">
                      <img
                        src={printableQrBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/?qr=${selectedQrProduct.id}`)}`}
                        alt="Product QR Label Code"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 bg-white border p-1 rounded-lg shrink-0 shadow-xs"
                      />
                      <div className="space-y-1.5 flex-1">
                        <span className="text-[10px] font-bold text-stone-700 block">🖨️ Physical Substrate Label Generator</span>
                        <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                          Print or download this authentic QR block to stick on Mycelial jars, bags, or grow kits. Pointing directly to:
                          <span className="text-[10px] text-stone-500 block font-mono bg-stone-100 p-1 rounded select-all mt-1">
                            {window.location.origin}/?qr={selectedQrProduct.id}
                          </span>
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.print()}
                            disabled={isPreloadingQr || !printableQrBase64}
                            className={`px-2.5 py-1 font-mono text-[10px] font-bold border rounded transition-colors ${
                              isPreloadingQr || !printableQrBase64
                                ? "bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed"
                                : "bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                            }`}
                          >
                            {isPreloadingQr ? "Preloading..." : "Print QR Sticker"}
                          </button>
                          <button
                            onClick={() => downloadQrCode(selectedQrProduct.id, selectedQrProduct.name)}
                            disabled={isPreloadingQr || !printableQrBase64}
                            className={`px-2.5 py-1 font-mono text-[10px] font-bold border rounded transition-colors ${
                              isPreloadingQr || !printableQrBase64
                                ? "bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-250 cursor-pointer"
                            }`}
                          >
                            Save QR Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            SCREEN: ABOUT US
            ========================================== */}
        {activePage === "about" && siteContent && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
            
            {/* Intro Section */}
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="inline-block">
                <EditableText
                  value={getLocalizedValue(siteContent.about, "scienceBadge", currentLanguage, "Our Biology Core")}
                  onSave={(val) => handleUpdateTextSection("about", { 
                    ...siteContent.about, 
                    scienceBadge: val,
                    [`scienceBadge_${currentLanguage}`]: val 
                  }, false)}
                  isAdmin={isAdminLoggedIn}
                  className="text-[10px] font-mono tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase font-bold"
                />
              </span>
              <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 leading-tight">
                <EditableText
                  value={getLocalizedValue(siteContent.about, "title", currentLanguage, "About us", "about")}
                  onSave={(val) => handleUpdateTextSection("about", { 
                    ...siteContent.about, 
                    title: val,
                    [`title_${currentLanguage}`]: val 
                  }, false)}
                  isAdmin={isAdminLoggedIn}
                />
              </h1>
              <p className="text-stone-500 text-lg leading-relaxed font-light">
                <EditableText
                  value={getLocalizedValue(siteContent.about, "subtitle", currentLanguage, "Dynamic mycelial propagation and bio-material design", "about")}
                  onSave={(val) => handleUpdateTextSection("about", { 
                    ...siteContent.about, 
                    subtitle: val,
                    [`subtitle_${currentLanguage}`]: val 
                  }, false)}
                  isAdmin={isAdminLoggedIn}
                  multiline={true}
                />
              </p>
            </div>

            {/* Core Story Block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-stone-900">
                  <EditableText
                    value={getLocalizedValue(siteContent.about, "storyHeading", currentLanguage, "Upcycling Tunisian Co-Products")}
                    onSave={(val) => handleUpdateTextSection("about", { 
                      ...siteContent.about, 
                      storyHeading: val,
                      [`storyHeading_${currentLanguage}`]: val 
                    }, false)}
                    isAdmin={isAdminLoggedIn}
                  />
                </h2>
                <p className="text-stone-600 leading-relaxed font-light text-sm sm:text-base">
                  <EditableText
                    value={getLocalizedValue(siteContent.about, "story", currentLanguage, "Our laboratory scales sustainable mycelium solutions.")}
                    onSave={(val) => handleUpdateTextSection("about", { 
                      ...siteContent.about, 
                      story: val,
                      [`story_${currentLanguage}`]: val 
                    }, false)}
                    isAdmin={isAdminLoggedIn}
                    multiline={true}
                  />
                </p>
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-800 rounded-r-xl">
                  <p className="text-xs text-emerald-950 font-light italic leading-relaxed">
                    <EditableText
                      value={getLocalizedValue(siteContent.about, "teamFocus", currentLanguage, "We aim to integrate agriculture and scientific bio-materials.")}
                      onSave={(val) => handleUpdateTextSection("about", { 
                        ...siteContent.about, 
                        teamFocus: val,
                        [`teamFocus_${currentLanguage}`]: val 
                      }, false)}
                      isAdmin={isAdminLoggedIn}
                      multiline={true}
                    />
                  </p>
                </div>
              </div>

              {/* Lab Visual representation image card */}
              <div className="rounded-3xl border border-stone-200 relative overflow-hidden mx-auto w-full max-w-xl bg-stone-100 shadow-xs h-[240px] sm:h-[280px] flex items-center justify-center">
                <EditableImage
                  src={
                    currentLanguage === "fr"
                      ? siteContent.about.frenchLabImage || "/src/assets/images/French.jpeg"
                      : currentLanguage === "ar"
                      ? siteContent.about.arabicLabImage || "/src/assets/images/Arabic.jpeg"
                      : siteContent.about.englishLabImage || "/src/assets/images/English.jpeg"
                  }
                  alt={`${currentLanguage} illustration`}
                  onSave={(newImg) => {
                    const updateObj: any = {};
                    if (currentLanguage === "fr") {
                      updateObj.frenchLabImage = newImg;
                    } else if (currentLanguage === "ar") {
                      updateObj.arabicLabImage = newImg;
                    } else {
                      updateObj.englishLabImage = newImg;
                    }
                    handleUpdateTextSection("about", { ...siteContent.about, ...updateObj }, true);
                  }}
                  isAdmin={isAdminLoggedIn}
                  maxDim={600}
                  className="h-full w-full object-contain rounded-2xl"
                />
              </div>
            </div>

            {/* Mission & Vision Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-3 relative group">
                {isAdminLoggedIn && (
                  <div className="absolute top-2 right-2 flex gap-1 z-35">
                    <button
                      onClick={() => {
                        if (siteContent.about.missionImage) {
                          handleUpdateTextSection("about", { ...siteContent.about, missionImage: "" }, false);
                        } else {
                          // set placeholder base64 svg
                          handleUpdateTextSection("about", { ...siteContent.about, missionImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2364748b'>Upload Graphic</text></svg>" }, false);
                        }
                      }}
                      className="text-[10px] font-mono bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded cursor-pointer border border-emerald-200/60 transition-all"
                    >
                      {siteContent.about.missionImage ? "Show Text" : "Show Image"}
                    </button>
                  </div>
                )}

                {siteContent.about.missionImage ? (
                  <div className="w-full h-full min-h-[160px] rounded-xl overflow-hidden">
                    <EditableImage
                      src={siteContent.about.missionImage}
                      onSave={(newImg) => handleUpdateTextSection("about", { ...siteContent.about, missionImage: newImg }, false)}
                      isAdmin={isAdminLoggedIn}
                      className="w-full h-full object-cover rounded-xl"
                      alt="Mission Graphics"
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative inline-block z-30 font-sans">
                      <button
                        type="button"
                        disabled={!isAdminLoggedIn}
                        onClick={() => setActiveAboutIconPicker(activeAboutIconPicker === "mission" ? null : "mission")}
                        className={`p-2.5 bg-emerald-100 text-emerald-800 rounded-xl inline-flex items-center justify-center transition-all ${
                          isAdminLoggedIn ? "hover:scale-105 hover:bg-emerald-200 cursor-pointer" : ""
                        }`}
                        title={isAdminLoggedIn ? "Click to change icon" : undefined}
                      >
                        {siteContent.about.missionIcon && siteContent.about.missionIcon.startsWith("data:") ? (
                          <img src={siteContent.about.missionIcon} className="w-5 h-5 object-contain" alt="Custom icon" />
                        ) : (
                          renderAboutIcon(siteContent.about.missionIcon || "Sprout")
                        )}
                      </button>
                      {isAdminLoggedIn && activeAboutIconPicker === "mission" && (
                        <div className="absolute top-12 left-0 mt-1 bg-white border border-stone-200 rounded-xl p-2.5 shadow-xl z-50 flex flex-col gap-2 min-w-[240px] animate-fade-in text-start">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {(["Sprout", "Globe", "ShieldCheck", "Sparkles", "Eye"] as const).map((ic) => (
                              <button
                                key={ic}
                                type="button"
                                onClick={() => {
                                  handleUpdateTextSection("about", { ...siteContent.about, missionIcon: ic }, false);
                                  setActiveAboutIconPicker(null);
                                }}
                                className="p-1.5 hover:bg-emerald-50 text-emerald-800 rounded-lg transition-all cursor-pointer"
                                title={ic}
                              >
                                {renderAboutIcon(ic)}
                              </button>
                            ))}
                          </div>
                          <div className="border-t border-stone-100 pt-2 flex flex-col gap-1">
                            <span className="text-[9px] font-mono font-bold text-stone-400">UPLOAD PERSONALIZED ICON</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    if (typeof reader.result === "string") {
                                      const resized = await resizeImage(reader.result, 128);
                                      handleUpdateTextSection("about", { ...siteContent.about, missionIcon: resized }, false);
                                      setActiveAboutIconPicker(null);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="text-[9px] w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-xl text-stone-900">
                      <EditableText
                        value={getLocalizedValue(siteContent.about, "missionTitle", currentLanguage, "Our Strategic Mission")}
                        onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, missionTitle: val, [`missionTitle_${currentLanguage}`]: val }, false)}
                        isAdmin={isAdminLoggedIn}
                      />
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed font-light">
                      <EditableText
                        value={getLocalizedValue(siteContent.about, "mission", currentLanguage, "Upcycling local bio-resources into high quality spawn.")}
                        onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, mission: val, [`mission_${currentLanguage}`]: val }, false)}
                        isAdmin={isAdminLoggedIn}
                        multiline={true}
                      />
                    </p>
                  </>
                )}
              </div>

              <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-3 relative group">
                {isAdminLoggedIn && (
                  <div className="absolute top-2 right-2 flex gap-1 z-35">
                    <button
                      onClick={() => {
                        if (siteContent.about.visionImage) {
                          handleUpdateTextSection("about", { ...siteContent.about, visionImage: "" }, false);
                        } else {
                          // set placeholder base64 svg
                          handleUpdateTextSection("about", { ...siteContent.about, visionImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2364748b'>Upload Graphic</text></svg>" }, false);
                        }
                      }}
                      className="text-[10px] font-mono bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded cursor-pointer border border-emerald-200/60 transition-all"
                    >
                      {siteContent.about.visionImage ? "Show Text" : "Show Image"}
                    </button>
                  </div>
                )}

                {siteContent.about.visionImage ? (
                  <div className="w-full h-full min-h-[160px] rounded-xl overflow-hidden">
                    <EditableImage
                      src={siteContent.about.visionImage}
                      onSave={(newImg) => handleUpdateTextSection("about", { ...siteContent.about, visionImage: newImg }, false)}
                      isAdmin={isAdminLoggedIn}
                      className="w-full h-full object-cover rounded-xl"
                      alt="Vision Graphics"
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative inline-block z-30 font-sans">
                      <button
                        type="button"
                        disabled={!isAdminLoggedIn}
                        onClick={() => setActiveAboutIconPicker(activeAboutIconPicker === "vision" ? null : "vision")}
                        className={`p-2.5 bg-emerald-100 text-emerald-800 rounded-xl inline-flex items-center justify-center transition-all ${
                          isAdminLoggedIn ? "hover:scale-105 hover:bg-emerald-200 cursor-pointer" : ""
                        }`}
                        title={isAdminLoggedIn ? "Click to change icon" : undefined}
                      >
                        {siteContent.about.visionIcon && siteContent.about.visionIcon.startsWith("data:") ? (
                          <img src={siteContent.about.visionIcon} className="w-5 h-5 object-contain" alt="Custom icon" />
                        ) : (
                          renderAboutIcon(siteContent.about.visionIcon || "Globe")
                        )}
                      </button>
                      {isAdminLoggedIn && activeAboutIconPicker === "vision" && (
                        <div className="absolute top-12 left-0 mt-1 bg-white border border-stone-200 rounded-xl p-2.5 shadow-xl z-50 flex flex-col gap-2 min-w-[240px] animate-fade-in text-start">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {(["Sprout", "Globe", "ShieldCheck", "Sparkles", "Eye"] as const).map((ic) => (
                              <button
                                key={ic}
                                type="button"
                                onClick={() => {
                                  handleUpdateTextSection("about", { ...siteContent.about, visionIcon: ic }, false);
                                  setActiveAboutIconPicker(null);
                                }}
                                className="p-1.5 hover:bg-emerald-50 text-emerald-800 rounded-lg transition-all cursor-pointer"
                                title={ic}
                              >
                                {renderAboutIcon(ic)}
                              </button>
                            ))}
                          </div>
                          <div className="border-t border-stone-100 pt-2 flex flex-col gap-1">
                            <span className="text-[9px] font-mono font-bold text-stone-400">UPLOAD PERSONALIZED ICON</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    if (typeof reader.result === "string") {
                                      const resized = await resizeImage(reader.result, 128);
                                      handleUpdateTextSection("about", { ...siteContent.about, visionIcon: resized }, false);
                                      setActiveAboutIconPicker(null);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="text-[9px] w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-xl text-stone-900">
                      <EditableText
                        value={getLocalizedValue(siteContent.about, "visionTitle", currentLanguage, "Our Strategic Vision")}
                        onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, visionTitle: val, [`visionTitle_${currentLanguage}`]: val }, false)}
                        isAdmin={isAdminLoggedIn}
                      />
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed font-light">
                      <EditableText
                        value={getLocalizedValue(siteContent.about, "vision", currentLanguage, "Pioneering the circular bio-economy of mycological substrates in North Africa.")}
                        onSave={(val) => handleUpdateTextSection("about", { ...siteContent.about, vision: val, [`vision_${currentLanguage}`]: val }, false)}
                        isAdmin={isAdminLoggedIn}
                        multiline={true}
                      />
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Team Members Section */}
            <div className="border-t border-stone-200/60 pt-16 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="font-display text-3xl font-bold tracking-tight text-stone-900">
                  {currentLanguage === 'en' ? "Meet Our Team" : currentLanguage === 'ar' ? "فريق العمل" : "Notre Équipe"}
                </h2>
                <p className="text-stone-500 font-light text-sm">
                  {currentLanguage === 'en' ? "Discover the passionate professionals behind Biotech Agro Tunisia." : currentLanguage === 'ar' ? "اكتشف الكفاءات التونسية الشغوفة التي تقود مسيرة التطوير الحيوية." : "Découvrez les professionnels passionnés derrière Biotech Agro Tunisia."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {(siteContent.team || defaultTeamFallbacks).map((member) => (
                  <div key={member.id} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col items-center text-center group relative hover:border-emerald-300 transition-all duration-300">
                    {isAdminLoggedIn && (
                      <div className="absolute top-4 right-4 z-40 flex items-center gap-1">
                        {armedTeamMemberDeleteId === member.id ? (
                          <div className="flex gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-rose-200 shadow-sm animate-fade-in">
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteTeamMember(member.id);
                                setArmedTeamMemberDeleteId(null);
                              }}
                              className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold rounded cursor-pointer transition-all"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setArmedTeamMemberDeleteId(null)}
                              className="px-1.5 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-[9px] font-medium rounded cursor-pointer transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setArmedTeamMemberDeleteId(member.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full border border-rose-100 cursor-pointer shadow-xs z-30 transition-all"
                            title="Remove Team Member"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    )}
                    <div className="w-32 h-32 rounded-full overflow-hidden border border-stone-200/80 shadow-inner">
                      <EditableImage
                        src={member.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300"}
                        onSave={(newImg) => handleUpdateTeamMember(member.id, { image: newImg })}
                        isAdmin={isAdminLoggedIn}
                        className="w-full h-full object-cover"
                        alt={member.name}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display font-medium text-lg text-stone-900 leading-tight">
                        <EditableText
                          value={member.name}
                          onSave={(val) => handleUpdateTeamMember(member.id, { name: val })}
                          isAdmin={isAdminLoggedIn}
                        />
                      </h3>
                      <p className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                        <EditableText
                          value={member.role}
                          onSave={(val) => handleUpdateTeamMember(member.id, { role: val })}
                          isAdmin={isAdminLoggedIn}
                        />
                      </p>
                    </div>
                    <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed">
                      <EditableText
                        value={member.bio}
                        onSave={(val) => handleUpdateTeamMember(member.id, { bio: val })}
                        isAdmin={isAdminLoggedIn}
                        multiline={true}
                      />
                    </p>
                  </div>
                ))}
              </div>

              {isAdminLoggedIn && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleAddNewTeamMember}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-xs"
                  >
                    + {currentLanguage === "en" ? "Add Team Member" : "Ajouter un membre"}
                  </button>
                </div>
              )}
            </div>

            {/* Certifications Section */}
            {((siteContent.certifications && siteContent.certifications.length > 0) || isAdminLoggedIn) && (
              <div className="border-t border-stone-200/60 pt-16 space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h2 className="font-display text-3xl font-bold tracking-tight text-stone-900">
                    {currentLanguage === 'en' ? "Certifications & Standard Norms" : currentLanguage === 'ar' ? "الشهادات الإدارية والمعايير" : "Certifications & Normes de Qualité"}
                  </h2>
                  <p className="text-stone-500 font-light text-sm">
                    {currentLanguage === 'en' 
                      ? "To ensure absolute sterility, high yields, and traceability across our premium spawn lines." 
                      : currentLanguage === 'ar' 
                      ? "نلتزم بمعايير تعقيم وتوثيق مخبرية صارمة لضمان نقاء الأبواغ وجودة التتبع." 
                      : "Procédures d’hygiène et contrôles stricts garantissant un mycélium d'excellence."}
                  </p>
                </div>

                {(!siteContent.certifications || siteContent.certifications.length === 0) ? (
                  <p className="text-center text-xs text-stone-400 font-mono py-6 border border-dashed border-stone-200 rounded-2xl bg-stone-50">
                    No active certification records attached. Visitors won't see this empty section.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {siteContent.certifications.map((cert) => (
                      <div key={cert.id} className="bg-[#fcfcf9] border border-stone-200 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 relative hover:border-emerald-200 transition-all duration-300">
                        {isAdminLoggedIn && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCertification(cert.id)}
                            className="absolute top-3 right-3 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full border border-rose-100 cursor-pointer shadow-xs z-30"
                            title="Remove Certification"
                          >
                            <X size={12} />
                          </button>
                        )}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-stone-200 flex items-center justify-center p-2 mb-1">
                          <EditableImage
                            src={cert.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=150"}
                            onSave={(newImg) => handleUpdateCertification(cert.id, { image: newImg })}
                            isAdmin={isAdminLoggedIn}
                            className="max-h-full max-w-full object-contain"
                            alt={cert.title}
                          />
                        </div>
                        <h3 className="font-display font-semibold text-sm text-stone-900 leading-tight">
                          <EditableText
                            value={cert.title}
                            onSave={(val) => handleUpdateCertification(cert.id, { title: val })}
                            isAdmin={isAdminLoggedIn}
                          />
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed font-light">
                          <EditableText
                            value={cert.description}
                            onSave={(val) => handleUpdateCertification(cert.id, { description: val })}
                            isAdmin={isAdminLoggedIn}
                            multiline={true}
                          />
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {isAdminLoggedIn && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleAddNewCertification}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-xs"
                    >
                      + {currentLanguage === "en" ? "Add Certification" : "Ajouter une certification"}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ==========================================
            SCREEN: PRODUCTS & SERVICES
            ========================================== */}
        {activePage === "products" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16" id="products-catalog-page">
            
            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 leading-tight">
                <EditableText
                  value={
                    siteContent?.catalog?.[`title_${currentLanguage}` as keyof CatalogSection] ||
                    siteContent?.catalog?.title ||
                    "Our Biotech Catalog"
                  }
                  onSave={(val) => {
                    const existingCatalog = siteContent?.catalog || {};
                    handleUpdateTextSection("catalog", {
                      ...existingCatalog,
                      [`title_${currentLanguage}`]: val
                    }, false);
                  }}
                  isAdmin={isAdminLoggedIn}
                />
              </h1>
              <p className="text-stone-500 text-sm font-light">
                <EditableText
                  value={
                    siteContent?.catalog?.[`subtitle_${currentLanguage}` as keyof CatalogSection] ||
                    siteContent?.catalog?.subtitle ||
                    "Premium-grade mushroom grain spawn inoculated on organic local grains, sustainable cellular bio-materials, and advisory consultings for Tunisian farming setup."
                  }
                  onSave={(val) => {
                    const existingCatalog = siteContent?.catalog || {};
                    handleUpdateTextSection("catalog", {
                      ...existingCatalog,
                      [`subtitle_${currentLanguage}`]: val
                    }, false);
                  }}
                  isAdmin={isAdminLoggedIn}
                  multiline={true}
                />
              </p>
            </div>

            {/* Category Filter Bar */}
            <div className="flex flex-wrap justify-center gap-2 border-b border-stone-200 pb-6">
              {["All", "Grain Spawn", "Bio-materials", "Starting Cultures", "Consulting & Setup"].map((cat) => {
                const label = currentLanguage === "ar"
                  ? cat === "All" ? "الكل"
                    : cat === "Grain Spawn" ? "أبواغ الحبوب الفطرية"
                    : cat === "Bio-materials" ? "المواد الحيوية"
                    : cat === "Starting Cultures" ? "العزلات والأوساط المغذية"
                    : cat === "Consulting & Setup" ? "الاستشارة والتأهيل"
                    : cat
                  : currentLanguage === "fr"
                  ? cat === "All" ? "Tout afficher"
                    : cat === "Grain Spawn" ? "Blanc de Semence (Mycélium)"
                    : cat === "Bio-materials" ? "Matériaux Organiques"
                    : cat === "Starting Cultures" ? "Souches de Cultures"
                    : cat === "Consulting & Setup" ? "Études & Conseils"
                    : cat
                  : cat; // Default English

                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 text-xs font-semibold tracking-wide rounded-xl transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-stone-900 text-white shadow-xs"
                        : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Products Grid */}
            <div className="space-y-8">
              <h2 className="font-display text-2xl font-bold text-stone-900">
                <EditableText
                  value={
                    siteContent?.catalog?.[`gridHeading_${currentLanguage}` as keyof CatalogSection] ||
                    siteContent?.catalog?.gridHeading ||
                    "Mycelial Spawn & Bio-materials"
                  }
                  onSave={(val) => {
                    const existingCatalog = siteContent?.catalog || {};
                    handleUpdateTextSection("catalog", {
                      ...existingCatalog,
                      [`gridHeading_${currentLanguage}`]: val
                    }, false);
                  }}
                  isAdmin={isAdminLoggedIn}
                />
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter((p) => categoryFilter === "All" || p.category === categoryFilter)
                  .map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProductDetails(product)}
                      className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all hover:translate-y-[-2px] cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        {/* Product Photo */}
                        <div className="h-48 bg-stone-100 relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={getProductLocalizedValue(product, "name", currentLanguage, product.name)}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold rounded-full tracking-wider border shadow-xs ${
                                product.status === "Available"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                  : product.status === "Pre-order"
                                  ? "bg-amber-50 border-amber-200 text-amber-800"
                                  : "bg-rose-50 border-rose-200 text-rose-800"
                              }`}
                            >
                              {currentLanguage === "ar"
                                ? product.status === "Available" ? "متوفر" : product.status === "Pre-order" ? "طلب مسبق" : "غير متوفر"
                                : currentLanguage === "fr"
                                ? product.status === "Available" ? "Disponible" : product.status === "Pre-order" ? "Pré-commande" : "Épuisé"
                                : product.status}
                            </span>
                          </div>
                          
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-stone-900/40 backdrop-blur-xs rounded-md">
                            <span className="text-[10px] text-white/90 font-mono tracking-widest block uppercase">
                              {currentLanguage === "ar"
                                ? product.category === "Grain Spawn" ? "أبواغ حبوب"
                                  : product.category === "Bio-materials" ? "مواد حيوية"
                                  : product.category === "Starting Cultures" ? "عزلات فطرية"
                                  : product.category === "Consulting & Setup" ? "استشارات"
                                  : product.category
                                : currentLanguage === "fr"
                                ? product.category === "Grain Spawn" ? "Blanc de Semence"
                                  : product.category === "Bio-materials" ? "Bio-matériaux"
                                  : product.category === "Starting Cultures" ? "Souches"
                                  : product.category === "Consulting & Setup" ? "Conseils"
                                  : product.category
                                : product.category}
                            </span>
                          </div>
                        </div>

                        {/* Title and details */}
                        <div className="p-5 space-y-2">
                          {product.scientificName && (
                            <span className="text-xs font-mono text-emerald-700 italic block font-semibold">
                              {product.scientificName}
                            </span>
                          )}
                          <h3 className="font-display font-semibold text-lg text-stone-900 group-hover:text-emerald-900 transition-colors">
                            {getProductLocalizedValue(product, "name", currentLanguage, product.name)}
                          </h3>
                          <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 font-light">
                            {getProductLocalizedValue(product, "description", currentLanguage, product.description)}
                          </p>
                        </div>
                      </div>

                      {/* Pricing and spec summary */}
                      <div className="px-5 pb-5 pt-2 flex justify-between items-center bg-stone-50/55 border-t border-stone-100">
                        <span className="text-sm font-semibold text-stone-900 font-mono">
                          {product.price}
                        </span>
                        <span className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                          View details
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Advisory Consultation Services Section */}
            {(categoryFilter === "All" || categoryFilter === "Consulting & Setup") && (
              <div className="space-y-8 pt-6 border-t border-stone-200">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold text-stone-900">
                    <EditableText
                      isAdmin={isAdminLoggedIn}
                      value={
                        siteContent?.catalog?.[`servicesTitle_${currentLanguage}` as keyof CatalogSection] ||
                        siteContent?.catalog?.servicesTitle ||
                        "Advisory Setup & Engineering Services"
                      }
                      onSave={(val) => {
                        const existingCatalog = siteContent?.catalog || {};
                        handleUpdateTextSection("catalog", {
                          ...existingCatalog,
                          [`servicesTitle_${currentLanguage}`]: val
                        }, false);
                      }}
                      className="font-display text-2xl font-bold text-stone-900 block"
                    />
                  </h2>
                  <p className="text-stone-500 text-sm font-light">
                    <EditableText
                      isAdmin={isAdminLoggedIn}
                      multiline={true}
                      value={
                        siteContent?.catalog?.[`servicesSubtitle_${currentLanguage}` as keyof CatalogSection] ||
                        siteContent?.catalog?.servicesSubtitle ||
                        "We offer technical support for laboratory design, autoclave sizing, and ventilation layout schemes."
                      }
                      onSave={(val) => {
                        const existingCatalog = siteContent?.catalog || {};
                        handleUpdateTextSection("catalog", {
                          ...existingCatalog,
                          [`servicesSubtitle_${currentLanguage}`]: val
                        }, false);
                      }}
                      className="text-stone-500 text-sm font-light block"
                    />
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {services.map((serv) => (
  <div
    key={serv.id}
    onClick={() => setSelectedServiceDetails(serv)}
    className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden p-6 shadow-xs flex flex-col md:flex-row gap-6 hover:shadow-md hover:translate-y-[-2px] transition-all self-stretch cursor-pointer group"
  >
                      <div className="w-full md:w-1/3 bg-stone-100 rounded-xl overflow-hidden self-stretch h-40 md:h-auto">
                        <img
  src={serv.image}
  alt={getProductLocalizedValue(serv, "name", currentLanguage, serv.name)}
  referrerPolicy="no-referrer"
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
/>
                      </div>

                      <div className="w-full md:w-2/3 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-600 font-mono text-[10px] uppercase tracking-wider rounded-lg inline-block">
                            {serv.duration || "Custom Scope"}
                          </span>
                          <h3 className="font-display font-semibold text-lg text-stone-900">
                            {getProductLocalizedValue(serv, "name", currentLanguage, serv.name)}
                          </h3>
                          <p className="text-xs text-stone-500 leading-relaxed font-light">
                            {getProductLocalizedValue(serv, "description", currentLanguage, serv.description)}
                          </p>
                          
                          {/* Benefits list */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-mono block">Package benefits:</span>
                            {serv.benefits.map((b, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-stone-600">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="font-light">{b}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-stone-100">
  <div>
    <span className="text-xs font-mono text-stone-400 block">
      {currentLanguage === "ar"
        ? "تسعير الاستشارة:"
        : currentLanguage === "fr"
        ? "Tarif de consultation :"
        : "Consultation pricing:"}
    </span>
    <span className="text-sm font-bold text-emerald-900 font-mono">{serv.price}</span>
  </div>

  <span className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
    {currentLanguage === "ar"
      ? "عرض التفاصيل"
      : currentLanguage === "fr"
      ? "Voir détails"
      : "View details"}
    <ArrowUpRight className="w-3.5 h-3.5" />
  </span>
</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DETAILED SPEC POPUP MODAL */}
            {selectedProductDetails && (
              <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedProductDetails(null)}
                    className="absolute top-4 right-4 p-2 bg-stone-900/70 text-white hover:bg-stone-900 rounded-full z-10 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="h-64 relative bg-stone-100">
                    <img
                      src={selectedProductDetails.image}
                      alt={getProductLocalizedValue(selectedProductDetails, "name", currentLanguage, selectedProductDetails.name)}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 p-3 bg-stone-950/80 backdrop-blur-xs rounded-xl border border-stone-800 text-stone-100">
                      <span className="text-[9px] font-mono tracking-widest text-emerald-300 block uppercase">
                        {selectedProductDetails.category}
                      </span>
                      <h3 className="font-display font-medium text-lg leading-tight">
                        {getProductLocalizedValue(selectedProductDetails, "name", currentLanguage, selectedProductDetails.name)}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-emerald-800 italic block font-bold">
                        {selectedProductDetails.scientificName || "Scientific Standard Batch"}
                      </span>
                      <p className="text-sm leading-relaxed text-stone-600 font-light">
                        {getProductLocalizedValue(selectedProductDetails, "description", currentLanguage, selectedProductDetails.description)}
                      </p>
                    </div>

                    {/* Specifications List */}
                    {selectedProductDetails.specifications && selectedProductDetails.specifications.length > 0 && (
                      <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-3">
                        <span className="text-xs font-semibold text-stone-900 font-display block uppercase tracking-wider">
                          {currentLanguage === "ar" ? "مواصفات دفعة المختبر:" : currentLanguage === "fr" ? "Spécifications du lot de laboratoire :" : "Laboratory Batch Specifications:"}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedProductDetails.specifications.map((spec, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                              <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full shrink-0" />
                              <span className="font-light">{spec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-stone-150 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-stone-400 block font-mono">
                          {currentLanguage === "ar" ? "التسعير المرجعي التونسي:" : currentLanguage === "fr" ? "Tarif indicatif tunisien :" : "Tunisian Reference Pricing:"}
                        </span>
                        <span className="text-lg font-bold text-stone-900 font-mono">{selectedProductDetails.price}</span>
                      </div>
                      <button
                        onClick={() => {
                          const localizedName = getProductLocalizedValue(selectedProductDetails, "name", currentLanguage, selectedProductDetails.name);
                          setSelectedProductDetails(null);
                          setContactForm((f) => ({
                            ...f,
                            subject: currentLanguage === "ar" ? `طلب شراء: ${localizedName}` : currentLanguage === "fr" ? `Demande d'achat : ${localizedName}` : `Order inquiry: ${localizedName}`,
                            message: currentLanguage === "ar"
                              ? `مرحباً فريق بيوتك أغرو، أود الاستفسار عن اقتناء "${localizedName}". الرجاء مدّي بآجال التسليم ومواصفات الكميات المتاحة.`
                              : currentLanguage === "fr"
                              ? `Bonjour l'équipe Biotech Agro, je souhaite me renseigner pour acquérir le produit "${localizedName}". Veuillez m'indiquer vos délais et conditions de livraison.`
                              : `Asslema Biotech Agro team, I would like to purchase the "${localizedName}". Please advise of lead times and bulk delivery details.`
                          }));
                          setActivePage("contact");
                        }}
                        className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                      >
                        {currentLanguage === "ar" ? "إرسال طلب شراء" : currentLanguage === "fr" ? "Créer demande d'achat" : "Send Purchase Inquiry"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}



{/* DETAILED SERVICE POPUP MODAL */}
{selectedServiceDetails && (
  <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150">
      
      {/* Close button */}
      <button
        onClick={() => setSelectedServiceDetails(null)}
        className="absolute top-4 right-4 p-2 bg-stone-900/70 text-white hover:bg-stone-900 rounded-full z-10 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="h-64 relative bg-stone-100">
        <img
          src={selectedServiceDetails.image}
          alt={getProductLocalizedValue(selectedServiceDetails, "name", currentLanguage, selectedServiceDetails.name)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-4 left-4 p-3 bg-stone-950/80 backdrop-blur-xs rounded-xl border border-stone-800 text-stone-100 max-w-[85%]">
          <span className="text-[9px] font-mono tracking-widest text-emerald-300 block uppercase">
            {selectedServiceDetails.duration || "Consulting Service"}
          </span>

          <h3 className="font-display font-medium text-lg leading-tight">
            {getProductLocalizedValue(selectedServiceDetails, "name", currentLanguage, selectedServiceDetails.name)}
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono text-emerald-800 italic block font-bold">
            {currentLanguage === "ar"
              ? "خدمة هندسية واستشارية"
              : currentLanguage === "fr"
              ? "Service de conseil technique"
              : "Technical Advisory Service"}
          </span>

          <p className="text-sm leading-relaxed text-stone-600 font-light">
            {getProductLocalizedValue(selectedServiceDetails, "description", currentLanguage, selectedServiceDetails.description)}
          </p>
        </div>

        {selectedServiceDetails.benefits && selectedServiceDetails.benefits.length > 0 && (
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold text-stone-900 font-display block uppercase tracking-wider">
              {currentLanguage === "ar"
                ? "مزايا الخدمة:"
                : currentLanguage === "fr"
                ? "Avantages du service :"
                : "Service Benefits:"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedServiceDetails.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-light">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-stone-150 flex justify-between items-center">
          <div>
            <span className="text-xs text-stone-400 block font-mono">
              {currentLanguage === "ar"
                ? "تسعير الاستشارة:"
                : currentLanguage === "fr"
                ? "Tarif de consultation :"
                : "Consultation Pricing:"}
            </span>

            <span className="text-lg font-bold text-stone-900 font-mono">
              {selectedServiceDetails.price}
            </span>
          </div>

          <button
            onClick={() => {
              const localizedName = getProductLocalizedValue(
                selectedServiceDetails,
                "name",
                currentLanguage,
                selectedServiceDetails.name
              );

              setSelectedServiceDetails(null);

              setContactForm((f) => ({
                ...f,
                subject:
                  currentLanguage === "ar"
                    ? `طلب استشارة: ${localizedName}`
                    : currentLanguage === "fr"
                    ? `Demande de consultation : ${localizedName}`
                    : `Consultation inquiry: ${localizedName}`,
                message:
                  currentLanguage === "ar"
                    ? `مرحباً فريق بيوتك أغرو، أود طلب استشارة حول خدمة "${localizedName}". الرجاء التواصل معي لتحديد التفاصيل الفنية والموعد المناسب.`
                    : currentLanguage === "fr"
                    ? `Bonjour l'équipe Biotech Agro, je souhaite demander une consultation concernant le service "${localizedName}". Merci de me contacter pour discuter des détails techniques et du calendrier.`
                    : `Asslema Biotech Agro team, I would like to request a consultation regarding "${localizedName}". Please contact me to discuss technical details and scheduling.`
              }));

              setActivePage("contact");
            }}
            className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
          >
            {currentLanguage === "ar"
              ? "طلب استشارة"
              : currentLanguage === "fr"
              ? "Demander une consultation"
              : "Request Consultation"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}



          </div>
        )}

        {/* ==========================================
            SCREEN: CONTACT US
            ========================================== */}
        {activePage === "contact" && siteContent && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="font-display text-4xl font-bold text-stone-900">
                <EditableText
                  value={getLocalizedValue(siteContent.contactDetails, "contactTitle", currentLanguage, "Contact Our Laboratory", "contact")}
                  onSave={(val) => handleUpdateTextSection("contact", { 
                    ...siteContent.contactDetails, 
                    contactTitle: val, 
                    [`contactTitle_${currentLanguage}`]: val 
                  }, false)}
                  isAdmin={isAdminLoggedIn}
                />
              </h1>
              <p className="text-sm text-stone-500 font-light font-sans">
                <EditableText
                  value={getLocalizedValue(siteContent.contactDetails, "contactSubtitle", currentLanguage, "Submit bulk grain spawn questions, custom molded biocomposite requests, or schedule a physical visit to our cleanroom workspace.", "contact")}
                  onSave={(val) => handleUpdateTextSection("contact", { 
                    ...siteContent.contactDetails, 
                    contactSubtitle: val, 
                    [`contactSubtitle_${currentLanguage}`]: val 
                  }, false)}
                  isAdmin={isAdminLoggedIn}
                />
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Message submit form */}
              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-display font-bold text-xl text-stone-900 mb-1">
                    <EditableText
                      value={getLocalizedValue(siteContent.contactDetails, "sendAMessage", currentLanguage, "Send a Message", "contact")}
                      onSave={(val) => handleUpdateTextSection("contact", { 
                        ...siteContent.contactDetails, 
                        sendAMessage: val, 
                        [`sendAMessage_${currentLanguage}`]: val 
                      }, false)}
                      isAdmin={isAdminLoggedIn}
                    />
                  </h3>
                  <p className="text-xs text-stone-400">
                    <EditableText
                      value={getLocalizedValue(siteContent.contactDetails, "contactFormSubtitle", currentLanguage, "Our lab managers generally respond within 24 working hours.", "contact")}
                      onSave={(val) => handleUpdateTextSection("contact", { 
                        ...siteContent.contactDetails, 
                        contactFormSubtitle: val, 
                        [`contactFormSubtitle_${currentLanguage}`]: val 
                      }, false)}
                      isAdmin={isAdminLoggedIn}
                    />
                  </p>
                </div>

                {messageSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full w-fit mx-auto">
                      <Check className="w-8 h-8 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-medium text-lg text-emerald-950">Message Sent Successfully!</h4>
                      <p className="text-xs text-emerald-800 font-light">Y'atik saha, your contact request has reached our lab operators. We will verify your query and follow up.</p>
                    </div>
                    <button
                      onClick={() => setMessageSuccess(false)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg tracking-wide cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    
                    {messageError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-mono flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{messageError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-700 block">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={contactForm.senderName}
                          onChange={(e) => setContactForm({ ...contactForm, senderName: e.target.value })}
                          className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-emerald-700 transition-all font-light"
                          placeholder="e.g. Mehdi Saïd"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-700 block">Your Email Address *</label>
                        <input
                          type="email"
                          required
                          value={contactForm.senderEmail}
                          onChange={(e) => setContactForm({ ...contactForm, senderEmail: e.target.value })}
                          className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-emerald-700 transition-all font-light"
                          placeholder="mehdi@example.tn"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-700 block">Phone Number (Optional)</label>
                        <input
                          type="text"
                          value={contactForm.senderPhone}
                          onChange={(e) => setContactForm({ ...contactForm, senderPhone: e.target.value })}
                          className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-emerald-700 transition-all font-light"
                          placeholder="e.g. +216 98 123 456"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-700 block">Subject *</label>
                        <input
                          type="text"
                          required
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-emerald-700 transition-all font-light"
                          placeholder="Inquiry or order request"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-stone-700 block">Your Message Details *</label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-emerald-700 transition-all font-light"
                        placeholder="Please write details about substrate volumes, mushroom varieties, or your design requirements..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingMessage}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-950 hover:bg-emerald-900 text-stone-100 disabled:opacity-40 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                    >
                      {isSendingMessage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting message request...
                        </>
                      ) : (
                        "Send Inquiry Message"
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Lab Coordinates and Interactive Map */}
              <div className="space-y-6 flex flex-col justify-between">
                <div className="bg-stone-900 text-stone-300 rounded-3xl p-6 sm:p-8 space-y-4 border border-stone-800">
                  <h3 className="font-display font-semibold text-lg text-white">Tunisian Laboratory Center</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light space-y-2 sm:space-y-0">
                    <div className="space-y-1">
                      <span className="text-stone-500 font-mono uppercase block text-[10px]">Office Address</span>
                      <p className="text-stone-200 leading-relaxed">
                        <EditableText
                          value={getLocalizedValue(siteContent.contactDetails, "address", currentLanguage, "Zone Industrielle Charguia II, Tunis 2035, Tunisia")}
                          onSave={(val) => handleUpdateTextSection("contact", { ...siteContent.contactDetails, address: val, [`address_${currentLanguage}`]: val }, false)}
                          isAdmin={isAdminLoggedIn}
                          multiline={true}
                        />
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-stone-500 font-mono uppercase block text-[10px]">Client Hotlines</span>
                      <p className="text-stone-200 font-mono">
                        <EditableText
                          value={getLocalizedValue(siteContent.contactDetails, "phone", currentLanguage, "+216 94 038 433")}
                          onSave={(val) => handleUpdateTextSection("contact", { ...siteContent.contactDetails, phone: val, [`phone_${currentLanguage}`]: val }, false)}
                          isAdmin={isAdminLoggedIn}
                        />
                      </p>
                      <p className="text-stone-400">
                        <EditableText
                          value={getLocalizedValue(siteContent.contactDetails, "email", currentLanguage, "contact@biotech-agro.com")}
                          onSave={(val) => handleUpdateTextSection("contact", { ...siteContent.contactDetails, email: val, [`email_${currentLanguage}`]: val }, false)}
                          isAdmin={isAdminLoggedIn}
                        />
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Office Hours: <EditableText
                      value={getLocalizedValue(siteContent.contactDetails, "workingHours", currentLanguage, "Monday - Friday: 08:30 - 17:30 (GMT+1)")}
                      onSave={(val) => handleUpdateTextSection("contact", { ...siteContent.contactDetails, workingHours: val, [`workingHours_${currentLanguage}`]: val }, false)}
                      isAdmin={isAdminLoggedIn}
                    /></span>
                  </div>
                </div>

                {/* Map iFrame */}
                <div className="bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 flex-grow h-64 lg:h-auto min-h-64 shadow-xs relative">
                  <iframe
                    src={siteContent.contactDetails.locationMapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title="Biotech Agro Location Map"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0"
                  />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            SCREEN: ADMIN AUTHENTICATION / ACCESS PANEL
            ========================================== */}
        {activePage === "admin" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {!isAdminLoggedIn ? (
              
              /* LOGIN & SECURE PASSWORD RECOVERY CHANNELS */
              <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-3xl p-8 shadow-md space-y-6">
                {!showForgotPassword ? (
                  /* STANDARD LOGIN SCREEN VIEW */
                  <>
                    <div className="text-center space-y-2">
                      <div className="p-3.5 bg-stone-100 text-stone-700 rounded-2xl w-fit mx-auto border border-stone-200">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h1 className="font-display text-2xl font-bold text-stone-900">Lab Administration Log In</h1>
                      <p className="text-xs text-stone-400">Enter secure laboratory credentials to manage catalog and copy decks.</p>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {loginError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-mono flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-700 block">Username *</label>
                        <input
                          type="text"
                          required
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-hidden focus:border-emerald-700 transition-all font-light"
                          placeholder="e.g. admin"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-stone-700 block font-sans">Password or Access Code *</label>
                        <input
                          type="password"
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-hidden focus:border-emerald-700 transition-all font-mono"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-[11px] text-stone-500 font-light flex items-start gap-1.5 leading-relaxed">
                        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span><strong>Staff Notice:</strong> The default credentials are <code>admin</code> / <code>admin</code> unless customized inside settings.</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full h-11 flex items-center justify-center gap-2 bg-[#1b2a22] hover:bg-[#121c17] text-white disabled:opacity-40 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying lab security...
                          </>
                        ) : (
                          "Sign In to Console"
                        )}
                      </button>

                      <div className="pt-2 border-t border-stone-150">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true);
                            setResetEmail("biotechagro.digital@gmail.com");
                          }}
                          className="w-full text-center text-xs text-emerald-800 hover:text-emerald-900 hover:underline font-medium transition-all"
                        >
                          Forgot Password / Reset Settings?
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* PASSWORD RECOVERY / CHANGE DEFAULT VIEW */
                  <>
                    <div className="text-center space-y-2">
                      <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl w-fit mx-auto border border-emerald-100">
                        <Mail className="w-6 h-6 animate-pulse" />
                      </div>
                      <h1 className="font-display text-2xl font-bold text-stone-900">Lab Password Reset</h1>
                      <p className="text-xs text-stone-400">Request a secure 6-digit administrative verification code to update credentials.</p>
                    </div>

                    <div className="space-y-4">
                      {resetError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-mono flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{resetError}</span>
                        </div>
                      )}

                      {resetMessage && (
                        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-lg text-xs flex items-center gap-2 leading-relaxed">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{resetMessage}</span>
                        </div>
                      )}

                      {!resetCodeSent ? (
                        /* REQUEST STAGE */
                        <form onSubmit={handleRequestResetCode} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-stone-700 block">Registered Admin Email *</label>
                            <input
                              type="email"
                              required
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-hidden focus:border-emerald-700 font-light"
                              placeholder="biotechagro.digital@gmail.com"
                            />
                            <p className="text-[10px] text-stone-400 font-light">Your registered access email can be matched below.</p>
                          </div>

                          <button
                            type="submit"
                            disabled={isRequestingResetCode}
                            className="w-full h-11 flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white disabled:opacity-45 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
                          >
                            {isRequestingResetCode ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Gen Code & Dispatching...
                              </>
                            ) : (
                              "Send Verification Code"
                            )}
                          </button>
                        </form>
                      ) : (
                        /* VERIFICATION CODE & RESET STAGE */
                        <form onSubmit={handleVerifyAndResetPassword} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-stone-700 block font-mono">6-Digit Code *</label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={resetCode}
                              onChange={(e) => setResetCode(e.target.value)}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-hidden focus:border-emerald-700 text-center font-bold tracking-widest font-mono"
                              placeholder="000000"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-stone-700 block font-sans">New Access Password *</label>
                            <input
                              type="password"
                              required
                              value={resetNewPassword}
                              onChange={(e) => setResetNewPassword(e.target.value)}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-hidden focus:border-emerald-700 font-mono"
                              placeholder="Enter complex password"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isResettingPassword || !resetCode || !resetNewPassword}
                            className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-900 hover:bg-emerald-850 text-white disabled:opacity-45 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
                          >
                            {isResettingPassword ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Validating Code and Cryptographic hashing...
                              </>
                            ) : (
                              "Verify and Reset Password Code"
                            )}
                          </button>
                        </form>
                      )}

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setResetCodeSent(false);
                            setResetMessage("");
                            setResetError("");
                            setResetCode("");
                            setResetNewPassword("");
                          }}
                          className="w-full text-center text-xs text-stone-500 hover:text-stone-800 transition-all font-light"
                        >
                          ← Back to Sign In Screen
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              
              /* COHESIVE SECURE ADMIN CONTROL PANEL */
              <div className="space-y-8">
                
                {/* Header and statistics at a glance */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
                  <div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold tracking-widest block w-fit mb-1.5">
                      SECURE BIOTECH CONSOLE
                    </span>
                    <h1 className="font-display text-2xl font-bold text-stone-900">Lab Hub Central Panel</h1>
                    <p className="text-xs text-stone-400 font-light mt-0.5">Edit web information decks, catalogs, and manage incoming messages.</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 h-10 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border border-rose-100"
                  >
                    <Unlock className="w-4 h-4" />
                    Sign Out Panel
                  </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-stone-200 p-4 rounded-xl text-center">
                    <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">Products Listed</span>
                    <span className="text-3xl font-bold font-display text-emerald-950 block mt-1">{products.length} Items</span>
                  </div>
                  <div className="bg-white border border-stone-200 p-4 rounded-xl text-center">
                    <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">Consultings</span>
                    <span className="text-3xl font-bold font-display text-emerald-950 block mt-1">{services.length} Programs</span>
                  </div>
                  <div className="bg-white border border-stone-250 p-4 rounded-xl text-center relative overflow-hidden">
                    <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">Unread Inquiry</span>
                    <span className={`text-3xl font-bold font-display block mt-1 ${unreadMessagesCount > 0 ? "text-rose-600 animate-pulse" : "text-stone-700"}`}>
                      {unreadMessagesCount} messages
                    </span>
                  </div>
                  <div className="bg-white border border-stone-200 p-4 rounded-xl text-center">
                    <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">Auth Status</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono uppercase bg-emerald-50 px-2 py-1 rounded-md inline-block mt-2 font-display">
                      Verified Session
                    </span>
                  </div>
                </div>

                {/* MAIN GRID: Content management area */}
                <div className="w-full space-y-12">
                    
                    {/* SECTION: ADMIN MESSAGE INBOX */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                        <div>
                          <h3 className="font-display font-bold text-lg text-stone-900">Communication Inquiry Inbox</h3>
                          <p className="text-xs text-stone-400">Review bulk requests, partnership inquiries, and farmer notifications.</p>
                        </div>
                        <MessageSquare className="w-5 h-5 text-stone-400" />
                      </div>

                      {adminMessages.length === 0 ? (
                        <p className="text-xs text-stone-400 text-center py-6">Inquiry folders are currently clean and empty.</p>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                          {adminMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-4 rounded-xl border transition-all ${
                                !msg.isRead ? "bg-emerald-50/50 border-emerald-250 shadow-xs" : "bg-stone-50 border-stone-200"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm text-stone-900">{msg.senderName}</h4>
                                    {!msg.isRead && (
                                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-mono rounded font-bold uppercase tracking-wider">
                                        New
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-stone-500 font-mono">
                                    {msg.senderEmail} {msg.senderPhone ? `| ${msg.senderPhone}` : ""}
                                  </p>
                                </div>
                                <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1 font-light">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(msg.receivedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>

                              <div className="bg-white/80 border border-stone-100 p-2.5 rounded-lg text-xs leading-relaxed text-stone-700 italic font-light mb-3 whitespace-pre-wrap">
                                <strong>Subject: {msg.subject}</strong>
                                <br />
                                {msg.message}
                              </div>

                              <div className="flex justify-between items-center">
                                <button
                                  onClick={() => handleToggleMessageRead(msg.id)}
                                  className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold tracking-wide flex items-center gap-1 cursor-pointer"
                                >
                                  {msg.isRead ? "Mark Unread" : "Mark Read"}
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash className="w-3 h-3" />
                                  Delete Inquiry
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* LOGO & BRAND IDENTITY CUSTOMIZER */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                        <div>
                          <h3 className="font-display font-semibold text-lg text-stone-900">Brand Logo & Identity</h3>
                          <p className="text-xs text-stone-405">Configure your dynamic laboratory logo. You can paste a web URL or upload an image directly from your machine.</p>
                        </div>
                        <Settings className="w-5 h-5 text-stone-400" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        
                        {/* Logo Preview */}
                        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-stone-500 uppercase">Live Preview</span>
                          <div className="bg-white border border-stone-200 rounded-xl h-24 w-24 flex items-center justify-center shadow-xs overflow-hidden">
                            {siteContent?.logoUrl ? (
                              <img src={siteContent.logoUrl} alt="Biotech Agro Brand Logo" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <Sprout className="h-10 w-10 text-emerald-800" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-stone-800 block">Biotech Agro</span>
                            <span className="text-[10px] text-stone-400 font-mono">Dynamic Brand Asset</span>
                          </div>
                        </div>

                        {/* Logo Controls */}
                        <div className="md:col-span-2 space-y-5">
                          
                          {/* Paste URL */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-stone-700 block">Logo Image URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="https://example.com/logo.png"
                                value={logoUrlInput}
                                onChange={(e) => setLogoUrlInput(e.target.value)}
                                className="flex-1 bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-700 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateTextSection("logo", { logoUrl: logoUrlInput })}
                                disabled={isUpdatingTexts === "logo"}
                                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-850 text-white rounded-xl text-xs font-semibold tracking-wide disabled:opacity-45 leading-none shadow-xs cursor-pointer select-none"
                              >
                                {isUpdatingTexts === "logo" ? "Saving..." : "Apply URL"}
                              </button>
                            </div>
                            <span className="text-[10px] text-stone-405 font-light block">You can paste any URL pointing to a PNG, WEBP, or SVG file (e.g. from GitHub, CDN, etc.).</span>
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-stone-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                              <span className="bg-white px-2.5 text-stone-400 font-mono text-[10px] uppercase">Or upload image from device</span>
                            </div>
                          </div>

                          {/* Drag 'n' Drop Area */}
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingLogo(true);
                            }}
                            onDragLeave={() => setIsDraggingLogo(false)}
                            onDrop={async (e) => {
                              e.preventDefault();
                              setIsDraggingLogo(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                try {
  const url = await uploadFileToBlob(file, "logos", 800);
  setLogoUrlInput(url);
  handleUpdateTextSection("logo", { logoUrl: url });
} catch (error: any) {
  alert(error.message || "Logo upload failed.");
}
                              }
                            }}
                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none ${
                              isDraggingLogo
                                ? "border-emerald-700 bg-emerald-50/20"
                                : "border-stone-200 hover:border-stone-450 bg-stone-50/40"
                            }`}
                            onClick={() => {
                              const fileInput = document.getElementById("logo-file-input");
                              fileInput?.click();
                            }}
                          >
                            <input
                              type="file"
                              id="logo-file-input"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
  const url = await uploadFileToBlob(file, "logos", 800);
  setLogoUrlInput(url);
  handleUpdateTextSection("logo", { logoUrl: url });
} catch (error: any) {
  alert(error.message || "Logo upload failed.");
}
                                }
                              }}
                            />
                            <UploadCloud className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-stone-850">Drag and drop file here, or click to browse</p>
                            <p className="text-[10px] text-stone-400 mt-0.5 font-light">Supports PNG, JPG, WEBP, or SVG. Automatically converted to a lightweight self-contained Data-URI.</p>
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* SECTION: EDIT WEBSITE TEXT COPY */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-8">
                      <div className="border-b border-stone-100 pb-4">
                        <h3 className="font-display font-semibold text-lg text-stone-900">Footer & Contact Settings</h3>
                        <p className="text-xs text-stone-400 font-light mt-0.5">Control global contact credentials, corporate addresses, legal registration, and dynamic region operations.</p>
                      </div>

                      {/* Footer Section Texts */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setIsUpdatingTexts("footer");
                          try {
                            const resFooter = await fetch("/api/content/text", {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${authToken}`
                              },
                              body: JSON.stringify({ section: "footer", data: editFooter })
                            });

                            const resContact = await fetch("/api/content/text", {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${authToken}`
                              },
                              body: JSON.stringify({ section: "contact", data: editContactDetails })
                            });

                            if (resFooter.ok && resContact.ok) {
                              const data = await resContact.json();
                              setSiteContent(data.content);
                              if (data.content.footer) setEditFooter(data.content.footer);
                              if (data.content.contactDetails) setEditContactDetails(data.content.contactDetails);
                              alert("Success: Footer specifications and contact coordinates updated successfully.");
                            } else {
                              const failedRes = !resFooter.ok ? resFooter : resContact;
                              const errData = await failedRes.json().catch(() => ({}));
                              const errMsg = errData.error || errData.message || "Verification error. Failed to save some fields. Try logging in again.";
                              alert(`Error: ${errMsg}`);
                            }
                          } catch (err) {
                            alert("Server communication error.");
                          } finally {
                            setIsUpdatingTexts(null);
                          }
                        }}
                        className="space-y-6 font-sans"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                          <div>
                            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">Corporate Footer & Contacts</h4>
                            <p className="text-[10px] text-stone-400 mt-0.5">Translate and customize footer copy, contacts, and operational regions.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1 shrink-0">
                              <Globe className="w-3.5 h-3.5 text-stone-500 hover:text-emerald-800 transition-colors" />
                              Editing Language:
                            </span>
                            <select
                              value={adminFooterLanguage}
                              onChange={(e) => setAdminFooterLanguage(e.target.value as "en" | "fr" | "ar")}
                              className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-700 font-medium transition-all cursor-pointer"
                            >
                              <option value="en">English (EN)</option>
                              <option value="fr">Français (FR)</option>
                              <option value="ar">العربية (AR)</option>
                            </select>
                          </div>
                        </div>

                        {/* PART 1: Legal and copyright text */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-stone-700">Footer Brand Mission / Description ({adminFooterLanguage.toUpperCase()}) *</label>
                            <textarea
                              rows={2}
                              value={editFooter?.[`description_${adminFooterLanguage}`] || editFooter?.description || ""}
                              onChange={(e) => setEditFooter({ 
                                ...editFooter, 
                                description: e.target.value,
                                [`description_${adminFooterLanguage}`]: e.target.value 
                              })}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-705 transition-all font-light"
                              placeholder="Describe your Tunisian biotechnology hub..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-stone-700">Footer Legal Copyright / Registration ({adminFooterLanguage.toUpperCase()}) *</label>
                            <textarea
                              rows={2}
                              value={editFooter?.[`copyright_${adminFooterLanguage}`] || editFooter?.copyright || ""}
                              onChange={(e) => setEditFooter({ 
                                ...editFooter, 
                                copyright: e.target.value,
                                [`copyright_${adminFooterLanguage}`]: e.target.value 
                              })}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-705 transition-all font-light"
                              placeholder="e.g. © 2026 Tunisian Mycelium Biotech..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-stone-700">Laboratory ID / Code ({adminFooterLanguage.toUpperCase()})</label>
                            <input
                              type="text"
                              value={editFooter?.[`labId_${adminFooterLanguage}`] || editFooter?.labId || ""}
                              onChange={(e) => setEditFooter({ 
                                ...editFooter, 
                                labId: e.target.value,
                                [`labId_${adminFooterLanguage}`]: e.target.value 
                              })}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-705 transition-all font-light"
                              placeholder="e.g. Under-Construction"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-stone-700">Regional Operations List Heading ({adminFooterLanguage.toUpperCase()})</label>
                            <input
                              type="text"
                              value={editFooter?.[`regionalTitle_${adminFooterLanguage}`] || editFooter?.regionalTitle || ""}
                              onChange={(e) => setEditFooter({ 
                                ...editFooter, 
                                regionalTitle: e.target.value,
                                [`regionalTitle_${adminFooterLanguage}`]: e.target.value 
                              })}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-705 transition-all font-light"
                              placeholder="e.g. Regional Operations"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-stone-700">Contact Office Group Heading ({adminFooterLanguage.toUpperCase()})</label>
                            <input
                              type="text"
                              value={editFooter?.[`contactHeader_${adminFooterLanguage}`] || editFooter?.contactHeader || ""}
                              onChange={(e) => setEditFooter({ 
                                ...editFooter, 
                                contactHeader: e.target.value,
                                [`contactHeader_${adminFooterLanguage}`]: e.target.value 
                              })}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-705 transition-all font-light"
                              placeholder="e.g. Office Contacts"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-stone-700">Privacy Policy Link Label ({adminFooterLanguage.toUpperCase()})</label>
                            <input
                              type="text"
                              value={editFooter?.[`privacyText_${adminFooterLanguage}`] || editFooter?.privacyText || ""}
                              onChange={(e) => setEditFooter({ 
                                ...editFooter, 
                                privacyText: e.target.value,
                                [`privacyText_${adminFooterLanguage}`]: e.target.value 
                              })}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-705 transition-all font-light"
                              placeholder="e.g. Privacy Charter"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-stone-700">Technical Spec Link Label ({adminFooterLanguage.toUpperCase()})</label>
                            <input
                              type="text"
                              value={editFooter?.[`termsText_${adminFooterLanguage}`] || editFooter?.termsText || ""}
                              onChange={(e) => setEditFooter({ 
                                ...editFooter, 
                                termsText: e.target.value,
                                [`termsText_${adminFooterLanguage}`]: e.target.value 
                              })}
                              className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-705 transition-all font-light"
                              placeholder="e.g. Technical Spec"
                            />
                          </div>
                        </div>

                        {/* PART 2: Phone, Email, Address Contact Details (MODIFIABLE BY ADMIN NOW!) */}
                        <div className="border-t border-stone-150 pt-4 text-start">
                          <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono mb-3 animate-fade-in">Office Contact Details ({adminFooterLanguage.toUpperCase()})</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block col-span-1">Contact Email Address ({adminFooterLanguage.toUpperCase()})</label>
                              <input
                                type="email"
                                value={editContactDetails?.[`email_${adminFooterLanguage}`] || editContactDetails?.email || ""}
                                onChange={(e) => setEditContactDetails({ 
                                  ...editContactDetails, 
                                  email: e.target.value,
                                  [`email_${adminFooterLanguage}`]: e.target.value 
                                })}
                                className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-707 transition-all font-light"
                                placeholder="e.g. contact@domain.tn"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block col-span-1">Contact Telephone ({adminFooterLanguage.toUpperCase()})</label>
                              <input
                                type="text"
                                value={editContactDetails?.[`phone_${adminFooterLanguage}`] || editContactDetails?.phone || ""}
                                onChange={(e) => setEditContactDetails({ 
                                  ...editContactDetails, 
                                  phone: e.target.value,
                                  [`phone_${adminFooterLanguage}`]: e.target.value 
                                })}
                                className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-707 transition-all font-light"
                                placeholder="e.g. +216 94 038 433"
                              />
                            </div>
                            <div className="space-y-1 col-span-1 md:col-span-2">
                              <label className="text-xs font-semibold text-stone-700 block">Physical Registered Address ({adminFooterLanguage.toUpperCase()})</label>
                              <input
                                type="text"
                                value={editContactDetails?.[`address_${adminFooterLanguage}`] || editContactDetails?.address || ""}
                                onChange={(e) => setEditContactDetails({ 
                                  ...editContactDetails, 
                                  address: e.target.value,
                                  [`address_${adminFooterLanguage}`]: e.target.value 
                                })}
                                className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-707 transition-all font-light"
                                placeholder="Zone Industrielle Charguia II, Tunis 2035, Tunisia"
                              />
                            </div>
                            <div className="pt-3 border-t border-stone-150 col-span-1 md:col-span-2">
                              <h6 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono mb-1">Contact Page Main Headers ({adminFooterLanguage.toUpperCase()})</h6>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block">Contact Screen Title ({adminFooterLanguage.toUpperCase()})</label>
                              <input
                                type="text"
                                value={editContactDetails?.[`contactTitle_${adminFooterLanguage}`] || editContactDetails?.contactTitle || ""}
                                onChange={(e) => setEditContactDetails({ 
                                  ...editContactDetails, 
                                  contactTitle: e.target.value,
                                  [`contactTitle_${adminFooterLanguage}`]: e.target.value 
                                })}
                                className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-707 transition-all font-light"
                                placeholder="e.g. Contact Our Laboratory"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block">Contact Screen Subtitle ({adminFooterLanguage.toUpperCase()})</label>
                              <input
                                type="text"
                                value={editContactDetails?.[`contactSubtitle_${adminFooterLanguage}`] || editContactDetails?.contactSubtitle || ""}
                                onChange={(e) => setEditContactDetails({ 
                                  ...editContactDetails, 
                                  contactSubtitle: e.target.value,
                                  [`contactSubtitle_${adminFooterLanguage}`]: e.target.value 
                                })}
                                className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-707 transition-all font-light"
                                placeholder="e.g. Submit bulk grain spawn questions..."
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block">Contact Message Form Title ({adminFooterLanguage.toUpperCase()})</label>
                              <input
                                type="text"
                                value={editContactDetails?.[`sendAMessage_${adminFooterLanguage}`] || editContactDetails?.sendAMessage || ""}
                                onChange={(e) => setEditContactDetails({ 
                                  ...editContactDetails, 
                                  sendAMessage: e.target.value,
                                  [`sendAMessage_${adminFooterLanguage}`]: e.target.value 
                                })}
                                className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-707 transition-all font-light"
                                placeholder="e.g. Send a Message"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block">Contact Message Form Subtitle ({adminFooterLanguage.toUpperCase()})</label>
                              <input
                                type="text"
                                value={editContactDetails?.[`contactFormSubtitle_${adminFooterLanguage}`] || editContactDetails?.contactFormSubtitle || ""}
                                onChange={(e) => setEditContactDetails({ 
                                  ...editContactDetails, 
                                  contactFormSubtitle: e.target.value,
                                  [`contactFormSubtitle_${adminFooterLanguage}`]: e.target.value 
                                })}
                                className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-707 transition-all font-light"
                                placeholder="e.g. Our lab managers generally respond..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* PART 3: Dynamic Regional Operations */}
                        <div className="border-t border-stone-150 pt-4 text-start space-y-3">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">
                              Regional Operations ({adminFooterLanguage.toUpperCase()})
                            </h5>
                            <button
                              type="button"
                              onClick={() => {
                                const regionsKey = `regions_${adminFooterLanguage}`;
                                const prev = Array.isArray(editFooter?.[regionsKey])
                                  ? editFooter[regionsKey]
                                  : Array.isArray(editFooter?.regions)
                                  ? editFooter.regions
                                  : editFooter?.regionalLocation
                                  ? [editFooter.regionalLocation]
                                  : ["Tunis: Corporate & Cleanrooms"];
                                setEditFooter({
                                  ...editFooter,
                                  [regionsKey]: [...prev, "New dynamic regional hub"]
                                });
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded text-[10px] font-bold font-mono transition-all cursor-pointer"
                            >
                              + Add Operational Region
                            </button>
                          </div>
                          <p className="text-[10px] text-stone-400 font-light">Custom locations or distribution branches listed inside the footer module for this language.</p>

                          <div className="space-y-2">
                            {(() => {
                              const regionsKey = `regions_${adminFooterLanguage}`;
                              const list = Array.isArray(editFooter?.[regionsKey])
                                ? editFooter[regionsKey]
                                : Array.isArray(editFooter?.regions)
                                ? editFooter.regions
                                : editFooter?.regionalLocation
                                ? [editFooter.regionalLocation]
                                : ["Tunis: Corporate & Cleanrooms"];
                              
                              if (list.length === 0) {
                                return <p className="text-xs text-stone-400 italic">No region hubs specified yet.</p>;
                              }

                              return list.map((regionItem: string, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={regionItem}
                                    onChange={(e) => {
                                      const updatedList = [...list];
                                      updatedList[idx] = e.target.value;
                                      setEditFooter({
                                        ...editFooter,
                                        [regionsKey]: updatedList
                                      });
                                    }}
                                    className="flex-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-emerald-700 font-light"
                                    placeholder="e.g. Sfax Cleanroom Network..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedList = list.filter((_: any, i: number) => i !== idx);
                                      setEditFooter({
                                        ...editFooter,
                                        [regionsKey]: updatedList
                                      });
                                    }}
                                    className="px-2.5 py-1.5 hover:bg-red-50 text-red-600 border border-stone-200 hover:border-red-200 rounded-lg text-xs transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isUpdatingTexts === "footer"}
                          className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-stone-100 disabled:opacity-40 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer font-sans"
                        >
                          {isUpdatingTexts === "footer" ? "Saving credentials..." : "Save Corporate Parameters"}
                        </button>
                      </form>
                    </div>

                    {/* SECTION: CATALOG PRODUCT MANAGEMENT */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                        <div>
                          <h3 className="font-display font-semibold text-lg text-stone-900">Manage Catalog Products</h3>
                          <p className="text-xs text-stone-400">Add, edit, or remove mycelial spawns and composite materials.</p>
                        </div>
                        <button
                          onClick={handleOpenProductCreate}
                          className="flex items-center gap-1.2 px-3 py-1.5 bg-emerald-950 text-emerald-100 rounded-xl text-xs font-semibold tracking-wide hover:bg-emerald-900 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          New Product
                        </button>
                      </div>

                      {/* Add/Edit Product Form overlay or static editor depending on state */}
                      {(productForm.name !== undefined && (productForm.id || editingProduct === null)) && (
                        <form onSubmit={handleSaveProduct} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-stone-200/80">
                            <h4 className="text-xs font-bold text-stone-800 font-display">
                              {editingProduct ? `Edit Product (Ref: ${editingProduct.id})` : "Add New Mycelium Catalog Item"}
                            </h4>
                            <button
                              type="button"
                              onClick={() => setProductForm({ name: undefined })}
                              className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                            >
                              Cancel Form
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Commercial Name (Default / EN) *</label>
                              <input
                                type="text"
                                required
                                value={productForm.name || ""}
                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                                placeholder="Pearl Oyster Spawn"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Nom commercial (FR)</label>
                              <input
                                type="text"
                                value={(productForm as any).name_fr || ""}
                                onChange={(e) => setProductForm({ ...productForm, name_fr: e.target.value } as any)}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                                placeholder="Blanc de Pleurote de Californie"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#065f46]">الاسم التجاري (AR)</label>
                              <input
                                type="text"
                                value={(productForm as any).name_ar || ""}
                                onChange={(e) => setProductForm({ ...productForm, name_ar: e.target.value } as any)}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-[#065f46] text-xs font-medium"
                                placeholder="لقاح فطر البلوط"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Scientific Latin taxonomy</label>
                              <input
                                type="text"
                                value={productForm.scientificName || ""}
                                onChange={(e) => setProductForm({ ...productForm, scientificName: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 italic"
                                placeholder="Pleurotus ostreatus"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block">Analytical Description (Default / EN)</label>
                              <textarea
                                rows={2}
                                onFocus={() => setActiveTextareaFocus("product_desc")}
                                value={productForm.description || ""}
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                                placeholder="Describe structural colonization speed..."
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block">Description analytique (FR)</label>
                              <textarea
                                rows={2}
                                value={(productForm as any).description_fr || ""}
                                onChange={(e) => setProductForm({ ...productForm, description_fr: e.target.value } as any)}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                                placeholder="Description de la structure de colonisation..."
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#065f46] block">الوصف التحليلي (AR)</label>
                              <textarea
                                rows={2}
                                value={(productForm as any).description_ar || ""}
                                onChange={(e) => setProductForm({ ...productForm, description_ar: e.target.value } as any)}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-stone-950 text-xs font-light"
                                placeholder="تفاصيل سرعة الاستعمار ونوع الحبيبات..."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Catalog Category</label>
                              <select
                                value={productForm.category}
                                onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2 py-1.5 text-xs text-stone-900"
                              >
                                <option value="Grain Spawn">Grain Spawn</option>
                                <option value="Bio-materials">Bio-materials</option>
                                <option value="Starting Cultures">Starting Cultures</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Reference Price (Tunisian Currency)</label>
                              <input
                                type="text"
                                required
                                value={productForm.price || ""}
                                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                                placeholder="e.g. 15 TND / kg"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Inventory Status</label>
                              <select
                                value={productForm.status}
                                onChange={(e) => setProductForm({ ...productForm, status: e.target.value as ProductStatus })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2 py-1.5 text-xs text-stone-900"
                              >
                                <option value="Available">Available</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Pre-order">Pre-order</option>
                              </select>
                            </div>
                          </div>

                          {/* Batch & Expiration QR Tracking Fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-emerald-950 flex items-center gap-1">
                                Available Items (Stock)
                              </label>
                              <input
                                type="number"
                                required
                                min={0}
                                value={productForm.availableItems ?? 50}
                                onChange={(e) => setProductForm({ ...productForm, availableItems: parseInt(e.target.value, 10) || 0 })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-emerald-950">Production Date</label>
                              <input
                                type="date"
                                value={productForm.productionDate || ""}
                                onChange={(e) => setProductForm({ ...productForm, productionDate: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-emerald-950">Expiration Date</label>
                              <input
                                type="date"
                                value={productForm.expirationDate || ""}
                                onChange={(e) => setProductForm({ ...productForm, expirationDate: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                              />
                            </div>
                          </div>

                          {/* Dynamic image upload helper */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block">Pasted Image URL</label>
                              <input
                                type="text"
                                value={productForm.image || ""}
                                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block text-emerald-900 font-bold">NATIVE IMAGE FILE UPLOAD</label>
                             <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (file) {
      setIsProductImageUploading(true);

      handleImageUpload(
        file,
        (url) => {
          setProductForm((prev) => ({ ...prev, image: url }));
          setIsProductImageUploading(false);
        },
        "products"
      );
    }
  }}
  className="w-full bg-stone-100 border border-stone-300 rounded-lg text-[10px] p-1"
/>
{isProductImageUploading && (
  <p className="text-[10px] text-emerald-700 font-semibold">
    Uploading image to Database... please wait before saving.
  </p>
)}

{productForm.image && (
  <p className="text-[10px] text-stone-500 break-all">
    Current image URL: {productForm.image}
  </p>
)}
                            </div>
                          </div>

                          {/* Batch Specification Tags */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-stone-700 block">Substrate carrier & fruiting variables:</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={tempSpec}
                                onChange={(e) => setTempSpec(e.target.value)}
                                className="flex-grow bg-white border border-stone-250 rounded-lg px-2.5 py-1 text-xs"
                                placeholder="e.g. Carrier: Organic Tunisian Barley"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (tempSpec.trim()) {
                                    const specs = [...(productForm.specifications || []), tempSpec.trim()];
                                    setProductForm({ ...productForm, specifications: specs });
                                    setTempSpec("");
                                  }
                                }}
                                className="px-3 bg-stone-900 text-white rounded-lg text-xs"
                              >
                                Add Tag
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {productForm.specifications?.map((spec, i) => (
                                <span key={i} className="px-2 py-0.5 bg-stone-200 text-stone-800 text-[10px] rounded-md font-light flex items-center gap-1">
                                  {spec}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = productForm.specifications?.filter((_, idx) => idx !== i);
                                      setProductForm({ ...productForm, specifications: filtered || [] });
                                    }}
                                    className="text-stone-500 hover:text-stone-800"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              type="button"
                              onClick={() => setProductForm({ name: undefined })}
                              className="px-4 py-1.5 border border-stone-300 rounded-lg text-xs"
                            >
                              Dismiss Form
                            </button>
                            <button
                              type="submit"
                              disabled={isSavingProduct}
                              className="px-6 py-1.5 bg-emerald-900 text-white rounded-lg text-xs font-semibold"
                            >
                              {isSavingProduct ? "Processing..." : "Commit Save Product"}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Current products listings list */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {products.map((item) => (
                          <div key={item.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded-md bg-stone-200 shrink-0" />
                              <div>
                                <h4 className="font-semibold text-xs text-stone-900">{item.name}</h4>
                                <span className="text-[9px] font-mono text-emerald-800 font-semibold">{item.category} | {item.price}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 animate-fade-in">
                              <button
                                onClick={() => {
                                  setSelectedQrProduct(item);
                                  setActivePage("qr");
                                }}
                                className="p-1 px-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <span>📬 QR Page</span>
                              </button>
                              <button
                                onClick={() => handleOpenProductEdit(item)}
                                className="p-1 px-2.5 border border-stone-200 bg-white rounded-md text-[10px] text-stone-700 hover:bg-stone-50 flex items-center gap-1 cursor-pointer"
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(item.id)}
                                className="p-1 px-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <Trash className="w-3 h-3" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECTION: EDIT CONVERSATION SERVICES */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
                      <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                        <div>
                          <h3 className="font-display font-semibold text-lg text-stone-900">Manage Core Advisory Packages</h3>
                          <p className="text-xs text-stone-400">Edit design setup and workshop listings.</p>
                        </div>
                        <button
                          onClick={handleOpenServiceCreate}
                          className="flex items-center gap-1.2 px-3 py-1.5 bg-emerald-950 text-emerald-100 rounded-xl text-xs font-semibold tracking-wide hover:bg-emerald-900 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          New Service
                        </button>
                      </div>

                      {/* Service Form */}
                      {(serviceForm.name !== undefined && (serviceForm.id || editingService === null)) && (
                        <form onSubmit={handleSaveService} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-stone-200/80">
                            <h4 className="text-xs font-bold text-stone-800 font-display">
                              {editingService ? "Edit Advisory Details" : "Add Advisory Setup Program"}
                            </h4>
                            <button type="button" onClick={() => setServiceForm({ name: undefined })} className="text-stone-400 text-xs font-bold">
                              Cancel
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Program Area (Default / EN) *</label>
                              <input
                                type="text"
                                required
                                value={serviceForm.name || ""}
                                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                                placeholder="Fruiting Tunnel Ventilation Layout"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Titre du service (FR)</label>
                              <input
                                type="text"
                                value={(serviceForm as any).name_fr || ""}
                                onChange={(e) => setServiceForm({ ...serviceForm, name_fr: e.target.value } as any)}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                                placeholder="Aménagement de tunnel de fructification"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#065f46]">اسم الخدمة (AR)</label>
                              <input
                                type="text"
                                value={(serviceForm as any).name_ar || ""}
                                onChange={(e) => setServiceForm({ ...serviceForm, name_ar: e.target.value } as any)}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-[#065f46] text-xs font-medium"
                                placeholder="تخطيط تهوية نفق الثمار"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Cycle Duration</label>
                              <input
                                type="text"
                                value={serviceForm.duration || ""}
                                onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                                placeholder="3 - 5 Days Consulting"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block">Long Description (Default / EN)</label>
                              <textarea
                                rows={2}
                                onFocus={() => setActiveTextareaFocus("service_desc")}
                                value={serviceForm.description || ""}
                                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700 block">Description détaillée (FR)</label>
                              <textarea
                                rows={2}
                                value={(serviceForm as any).description_fr || ""}
                                onChange={(e) => setServiceForm({ ...serviceForm, description_fr: e.target.value } as any)}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-[#065f46] block">الوصف التفصيلي (AR)</label>
                              <textarea
                                rows={2}
                                value={(serviceForm as any).description_ar || ""}
                                onChange={(e) => setServiceForm({ ...serviceForm, description_ar: e.target.value } as any)}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-stone-950 text-xs font-light"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-xs font-semibold text-stone-700">Image URL</label>
                              <input
                                type="text"
                                value={serviceForm.image || ""}
                                onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Pricing TND</label>
                              <input
                                type="text"
                                required
                                value={serviceForm.price || ""}
                                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-stone-700 block uppercase">NATIVE PICTURE FILE UPLOAD</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files?.[0]) {
                                  handleImageUpload(
  e.target.files[0],
  (url) => setServiceForm((prev) => ({ ...prev, image: url })),
  "services"
);
                                }
                              }}
                              className="w-full bg-stone-100 border border-stone-305 text-[10px] p-1 rounded"
                            />
                          </div>

                          {/* Benefits list editing */}
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-stone-700 block">Deliverables/Benefits:</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={tempBenefit}
                                onChange={(e) => setTempBenefit(e.target.value)}
                                className="flex-grow bg-white border border-stone-250 rounded-lg px-2.5 py-1 text-xs"
                                placeholder="e.g. Laminar Flow Testing"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (tempBenefit.trim()) {
                                    const b = [...(serviceForm.benefits || []), tempBenefit.trim()];
                                    setServiceForm({ ...serviceForm, benefits: b });
                                    setTempBenefit("");
                                  }
                                }}
                                className="px-3 bg-stone-900 text-white rounded-lg text-xs"
                              >
                                Add Benefit
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {serviceForm.benefits?.map((ben, i) => (
                                <span key={i} className="px-2 py-0.5 bg-stone-200 text-stone-800 text-[10px] rounded-md font-light flex items-center gap-1">
                                  {ben}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = serviceForm.benefits?.filter((_, idx) => idx !== i);
                                      setServiceForm({ ...serviceForm, benefits: filtered || [] });
                                    }}
                                    className="text-stone-500 hover:text-stone-800"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button type="button" onClick={() => setServiceForm({ name: undefined })} className="px-4 py-1.5 border border-stone-300 rounded-lg text-xs">
                              Cancel
                            </button>
                            <button type="submit" disabled={isSavingService} className="px-6 py-1.5 bg-emerald-900 text-white rounded-lg text-xs font-semibold">
                              Save advisory pack
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Display current services */}
                      <div className="space-y-2">
                        {services.map((serv) => (
                          <div key={serv.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img src={serv.image} alt={serv.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded-md bg-stone-200 shrink-0" />
                              <div>
                                <h4 className="font-semibold text-xs text-stone-900">{serv.name}</h4>
                                <span className="text-[10px] text-stone-400 font-mono italic">{serv.duration} | {serv.price}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 text-[10px]">
                              <button onClick={() => handleOpenServiceEdit(serv)} className="p-1 px-2.5 border border-stone-200 bg-white rounded-md text-stone-700 font-semibold cursor-pointer">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteService(serv.id)} className="p-1 px-2.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-md cursor-pointer">
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECTION: CONFIGURE SECURITY CREDENTIALS */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
                      
                      {/* SUB-SECTION: ADMIN RECOVERY EMAIL */}
                      <div className="space-y-4">
                        <div className="border-b border-stone-100 pb-3">
                          <h3 className="font-display font-semibold text-lg text-stone-900 font-sans">Lab Administrator Security Mail</h3>
                          <p className="text-xs text-stone-400 font-light mt-0.5">Define your secure administrative mail address. This email will be used to dispatch secondary reset verification codes.</p>
                        </div>

                        <form onSubmit={handleEmailUpdate} className="space-y-4">
                          {emailUpdateSuccess && (
                            <p className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono">
                              {emailUpdateSuccess}
                            </p>
                          )}
                          {emailUpdateError && (
                            <p className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono">
                              {emailUpdateError}
                            </p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">Registered Email Address</label>
                              <input
                                type="email"
                                required
                                value={adminSecEmail}
                                onChange={(e) => setAdminSecEmail(e.target.value)}
                                className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs font-sans text-stone-800 focus:border-emerald-700 focus:outline-hidden"
                                placeholder="biotechagro.digital@gmail.com"
                              />
                            </div>
                            
                            <div className="self-end">
                              <button
                                type="submit"
                                disabled={isUpdatingSecEmail || !adminSecEmail.trim()}
                                className="px-5 py-2.5 bg-stone-950 hover:bg-stone-900 text-stone-100 disabled:opacity-40 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                              >
                                {isUpdatingSecEmail ? "Saving mail config..." : "Update Security Mail"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* SUB-SECTION: CONFIGURE SECURITY PASSWORD */}
                      <div className="space-y-4 pt-4 border-t border-stone-150">
                        <div>
                          <h4 className="font-display font-semibold text-md text-stone-900">Console Passcode & Security Overrides</h4>
                          <p className="text-xs text-stone-450 font-light mt-0.5">
                            Update the system access passcode. Changing this passcode immediately disables the dynamic default sandbox logins.
                          </p>
                          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                            <span className="text-stone-400 font-light">Default Passcodes Status: </span>
                            {isSecDefaultPassword ? (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-mono text-[10px] font-bold">● fallback ACTIVE</span>
                            ) : (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-250 font-mono text-[10px] font-bold">● fallback DISABLED (HIGH SECURITY MODE)</span>
                            )}
                          </div>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                          {passwordChangeSuccess && (
                            <p className="p-2.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-mono">
                              {passwordChangeSuccess}
                            </p>
                          )}
                          {passwordChangeError && (
                            <p className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono">
                              {passwordChangeError}
                            </p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-stone-700">New Password Code</label>
                              <input
                                type="password"
                                value={newAdminPassword}
                                onChange={(e) => setNewAdminPassword(e.target.value)}
                                className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono"
                                placeholder="Type complex characters"
                              />
                            </div>
                            
                            <div className="self-end">
                              <button
                                type="submit"
                                disabled={isPasswordUpdating || !newAdminPassword.trim()}
                                className="px-5 py-2.5 bg-stone-950 hover:bg-stone-900 text-stone-100 disabled:opacity-40 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
                              >
                                {isPasswordUpdating ? "Hashing with salt..." : "Update Security Code"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>

                    </div>

                  </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* GLOBAL SUSTAINABLE FOOTER */}
      <Footer
        onNavigate={setActivePage}
        contactEmail={siteContent?.contactDetails?.[`email_${currentLanguage}`] || siteContent?.contactDetails?.email}
        contactPhone={siteContent?.contactDetails?.[`phone_${currentLanguage}`] || siteContent?.contactDetails?.phone}
        contactAddress={siteContent?.contactDetails?.[`address_${currentLanguage}`] || siteContent?.contactDetails?.address}
        logoUrl={siteContent?.logoUrl}
        currentLanguage={currentLanguage}
        footerData={siteContent?.footer}
      />
      </div>

      {/* PRINT-ONLY SEAMLESS PURE QR BLOCK */}
      {selectedQrProduct && printableQrBase64 && (
        <div id="printable-qr-label-card">
          <img
            src={printableQrBase64}
            alt="Print QR Code"
          />
        </div>
      )}

    </div>
  );
}
