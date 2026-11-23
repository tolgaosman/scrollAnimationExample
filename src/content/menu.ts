import type { Localized } from "./types";

export type MenuSection = "signature" | "classics" | "cold" | "pastry";
export type ServeStyle = "hot" | "iced" | "baked";

export interface MenuItem {
  id: string;
  section: MenuSection;
  serve: ServeStyle;
  name: Localized;
  description: Localized;
  spec: Localized;
  notes: Localized<string[]>;
  price: number; // Turkish lira
  badge?: "seasonal" | "house";
  calcMethod?: "pourover" | "espresso" | "coldbrew";
}

export const menu: MenuItem[] = [
  {
    id: "carob-cortado",
    section: "signature",
    serve: "hot",
    name: { tr: "Keçiboynuzu Kortado", en: "Carob Cortado" },
    description: {
      tr: "House Blend No. 01, Mesarya keçiboynuzu pekmezi ve buharlanmış süt. Tatlı, topraksı, cömert; biraz Kıbrıs gibi.",
      en: "House Blend No. 01, carob molasses from the Mesaoria and steamed milk. Sweet, earthy and generous, a bit like Cyprus.",
    },
    spec: { tr: "18 g · 93 °C · House No. 01", en: "18 g · 93 °C · House No. 01" },
    notes: { tr: ["Keçiboynuzu", "Kakao", "Kadife Süt"], en: ["Carob", "Cocoa", "Velvet Milk"] },
    price: 145,
    badge: "house",
    calcMethod: "espresso",
  },
  {
    id: "pistachio-cremoso",
    section: "signature",
    serve: "hot",
    name: { tr: "Fıstıklı Cremoso", en: "Pistachio Cremoso" },
    description: {
      tr: "Taş değirmende ezilmiş Antep fıstığı kreması, çift ristretto, üstünde kavrulmuş fıstık kırığı.",
      en: "Stone-ground Antep pistachio cream, a double ristretto, and toasted pistachio pieces on top.",
    },
    spec: { tr: "Çift Ristretto · Taş Değirmen", en: "Double Ristretto · Stone-Ground" },
    notes: { tr: ["Antep Fıstığı", "Karamel", "Yoğun Krema"], en: ["Pistachio", "Caramel", "Rich Crema"] },
    price: 165,
    badge: "house",
    calcMethod: "espresso",
  },
  {
    id: "espresso-tonic",
    section: "signature",
    serve: "iced",
    name: { tr: "Espresso Tonik · Narenciye", en: "Espresso Tonic · Citrus" },
    description: {
      tr: "Yirgacheffe espresso, Güzelyurt portakalının kabuğu ve bitter tonik. Sıcak bir öğleden sonra için.",
      en: "Yirgacheffe espresso, Morphou orange zest and bitter tonic. Good for a hot afternoon.",
    },
    spec: { tr: "Yirgacheffe · 4 °C · Tonik", en: "Yirgacheffe · 4 °C · Tonic" },
    notes: { tr: ["Portakal Kabuğu", "Bergamot", "Ferah"], en: ["Orange Zest", "Bergamot", "Crisp"] },
    price: 155,
    badge: "seasonal",
    calcMethod: "espresso",
  },
  {
    id: "espresso",
    section: "classics",
    serve: "hot",
    name: { tr: "Espresso", en: "Espresso" },
    description: {
      tr: "Haftanın espressosu. 18 gram, 28 saniye.",
      en: "The week's espresso. 18 grams, 28 seconds.",
    },
    spec: { tr: "18 g → 36 g · 9 bar · 28 sn", en: "18 g → 36 g · 9 bar · 28 s" },
    notes: { tr: ["Bitter Çikolata", "Fındık"], en: ["Dark Chocolate", "Hazelnut"] },
    price: 85,
    calcMethod: "espresso",
  },
  {
    id: "flat-white",
    section: "classics",
    serve: "hot",
    name: { tr: "Flat White", en: "Flat White" },
    description: {
      tr: "Çift ristretto ve ince mikro köpük.",
      en: "Double ristretto and fine micro-foam.",
    },
    spec: { tr: "160 ml · 60 °C Mikro Köpük", en: "160 ml · 60 °C Micro-Foam" },
    notes: { tr: ["Sütlü Çikolata", "Kremamsı"], en: ["Milk Chocolate", "Silky"] },
    price: 125,
    calcMethod: "espresso",
  },
  {
    id: "pourover",
    section: "classics",
    serve: "hot",
    name: { tr: "Günün Pour-Over'ı", en: "Pour-Over of the Day" },
    description: {
      tr: "Mikro-lot seçkisinden, V60 ya da Kalita ile elde demlenir.",
      en: "From our micro-lot selection, brewed by hand in a V60 or Kalita.",
    },
    spec: { tr: "16 g · 1:16 · 92 °C · 3 dk", en: "16 g · 1:16 · 92 °C · 3 min" },
    notes: { tr: ["Yasemin", "Şeftali", "Berrak"], en: ["Jasmine", "Peach", "Tea-Like"] },
    price: 150,
    calcMethod: "pourover",
  },
  {
    id: "cypriot",
    section: "classics",
    serve: "hot",
    name: { tr: "Kumda Kıbrıs Kahvesi", en: "Sand-Brewed Cypriot Coffee" },
    description: {
      tr: "Bakır cezvede, kum ocağında; yanında lokum ve soğuk su.",
      en: "Copper cezve over hot sand; served with lokum and cold water.",
    },
    spec: { tr: "Bakır Cezve · Kum Ocağı", en: "Copper Cezve · Hot Sand" },
    notes: { tr: ["Kakule", "Kavrulmuş Badem"], en: ["Cardamom", "Toasted Almond"] },
    price: 95,
  },
  {
    id: "signature-cold-brew",
    section: "cold",
    serve: "iced",
    name: { tr: "İmza Soğuk Demleme", en: "Signature Cold Brew" },
    description: {
      tr: "16 saat demlenmiş Guatemala Antigua, buzun üstünde. Şekersiz.",
      en: "Guatemala Antigua steeped for 16 hours, over ice. No sugar.",
    },
    spec: { tr: "16 sa · Guatemala · 1:10", en: "16 hrs · Guatemala · 1:10" },
    notes: { tr: ["Kakao Nibi", "Esmer Şeker"], en: ["Cacao Nib", "Brown Sugar"] },
    price: 135,
    calcMethod: "coldbrew",
  },
  {
    id: "nitro-carob",
    section: "cold",
    serve: "iced",
    name: { tr: "Nitro Keçiboynuzu", en: "Nitro Carob" },
    description: {
      tr: "Azotla köpürtülmüş soğuk demleme, keçiboynuzu şurubu ve deniz tuzu.",
      en: "Nitrogen-infused cold brew, carob syrup and a pinch of sea salt.",
    },
    spec: { tr: "Nitro Musluk · Deniz Tuzu", en: "Nitro Tap · Sea Salt" },
    notes: { tr: ["Köpüklü", "Harnup", "Tuzlu Karamel"], en: ["Cascading", "Carob", "Salted Caramel"] },
    price: 160,
    badge: "seasonal",
    calcMethod: "coldbrew",
  },
  {
    id: "rose-cold-brew",
    section: "cold",
    serve: "iced",
    name: { tr: "Gül & Kakule Soğuk Demleme", en: "Rose & Cardamom Cold Brew" },
    description: {
      tr: "Mazotos gül suyu, yeşil kakule ve yulaf sütü.",
      en: "Mazotos rose water, green cardamom and oat milk.",
    },
    spec: { tr: "Mazotos Gülü · Yulaf Bulutu", en: "Mazotos Rose · Oat Cloud" },
    notes: { tr: ["Gül Yaprağı", "Yeşil Kakule"], en: ["Rose Petal", "Green Cardamom"] },
    price: 150,
    calcMethod: "coldbrew",
  },
  {
    id: "halloumi-focaccia",
    section: "pastry",
    serve: "baked",
    name: { tr: "Hellimli & Kekikli Focaccia", en: "Halloumi & Thyme Focaccia" },
    description: {
      tr: "Ekşi maya hamur üzerinde taze hellim, dağ kekiği ve soğuk sıkım zeytinyağı. Sabah 6'da fırından çıkar.",
      en: "Sourdough focaccia topped with fresh halloumi, wild thyme and cold-pressed olive oil. Out of the oven at 6 a.m.",
    },
    spec: { tr: "06:00 Fırın · Ekşi Maya", en: "06:00 Bake · Sourdough" },
    notes: { tr: ["Taze Hellim", "Dağ Kekiği", "Zeytinyağı"], en: ["Fresh Halloumi", "Wild Thyme", "Olive Oil"] },
    price: 95,
    badge: "house",
  },
  {
    id: "carob-croissant",
    section: "pastry",
    serve: "baked",
    name: { tr: "Keçiboynuzlu Kruvasan", en: "Carob Croissant" },
    description: {
      tr: "72 saat dinlenen tereyağlı hamur, içinde keçiboynuzu kreması.",
      en: "Butter dough rested for 72 hours, filled with carob cream.",
    },
    spec: { tr: "72 sa Fermantasyon · Tereyağı", en: "72 h Laminated · Cultured Butter" },
    notes: { tr: ["Çıtır Katlar", "Harnup Kreması"], en: ["Flaky Layers", "Carob Cream"] },
    price: 115,
  },
  {
    id: "pistachio-cake",
    section: "pastry",
    serve: "baked",
    name: { tr: "Fıstıklı Zeytinyağlı Kek", en: "Pistachio Olive Oil Cake" },
    description: {
      tr: "Erken hasat Kıbrıs zeytinyağı, limon ve fıstık.",
      en: "Early-harvest Cypriot olive oil, lemon and pistachio.",
    },
    spec: { tr: "Erken Hasat Zeytinyağı", en: "Early-Harvest Olive Oil" },
    notes: { tr: ["Limon Kabuğu", "Antep Fıstığı"], en: ["Lemon Zest", "Pistachio"] },
    price: 120,
  },
  {
    id: "anari-cheesecake",
    section: "pastry",
    serve: "baked",
    name: { tr: "Nor Peynirli Cheesecake", en: "Anari Cheesecake" },
    description: {
      tr: "Taze nor peyniri, harnup balı ve kavrulmuş susam tabanı.",
      en: "Fresh anari cheese, carob honey and a toasted sesame base.",
    },
    spec: { tr: "Taze Nor · Harnup Balı", en: "Fresh Anari · Carob Honey" },
    notes: { tr: ["Susam Taban", "Hafif Krema"], en: ["Toasted Sesame", "Light Cream"] },
    price: 135,
    badge: "seasonal",
  },
];

export const MENU_SECTIONS: MenuSection[] = ["signature", "classics", "cold", "pastry"];
