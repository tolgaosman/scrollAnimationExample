import type { Localized } from "./types";

export type MenuSection = "signature" | "classics" | "cold" | "pastry";

export interface MenuItem {
  id: string;
  section: MenuSection;
  name: Localized;
  description: Localized;
  price: number; // Turkish lira
  badge?: "seasonal" | "house";
}

export const menu: MenuItem[] = [
  {
    id: "carob-cortado",
    section: "signature",
    name: { tr: "Keçiboynuzu Kortado", en: "Carob Cortado" },
    description: {
      tr: "House Blend No. 01, Mesarya'dan keçiboynuzu pekmezi ve kadife süt. Kıbrıs'ın kendisi gibi: tatlı, topraksı, cömert.",
      en: "House Blend No. 01, Mesaoria carob molasses and velvet milk. Like Cyprus itself: sweet, earthy, generous.",
    },
    price: 145,
    badge: "house",
  },
  {
    id: "pistachio-cremoso",
    section: "signature",
    name: { tr: "Fıstıklı Cremoso", en: "Pistachio Cremoso" },
    description: {
      tr: "Taş değirmende ezdiğimiz Antep fıstığı kreması, çift ristretto ve üzerine kavrulmuş fıstık kırığı.",
      en: "Stone-ground Antep pistachio cream, double ristretto and a scatter of toasted pistachio.",
    },
    price: 165,
    badge: "house",
  },
  {
    id: "espresso-tonic",
    section: "signature",
    name: { tr: "Espresso Tonik · Narenciye", en: "Espresso Tonic · Citrus" },
    description: {
      tr: "Yirgacheffe espresso, Güzelyurt portakalı kabuğu ve bitter tonik. Öğleden sonranın serin yüzü.",
      en: "Yirgacheffe espresso, Morphou orange zest and bitter tonic. The cool face of the afternoon.",
    },
    price: 155,
    badge: "seasonal",
  },
  {
    id: "espresso",
    section: "classics",
    name: { tr: "Espresso", en: "Espresso" },
    description: {
      tr: "Haftanın espressosu; 18 gram, 28 saniye.",
      en: "Espresso of the week; 18 grams, 28 seconds.",
    },
    price: 85,
  },
  {
    id: "flat-white",
    section: "classics",
    name: { tr: "Flat White", en: "Flat White" },
    description: {
      tr: "Çift ristretto ve ipeksi mikro köpük.",
      en: "Double ristretto and silky micro-foam.",
    },
    price: 125,
  },
  {
    id: "pourover",
    section: "classics",
    name: { tr: "Günün Pour-Over'ı", en: "Pour-Over of the Day" },
    description: {
      tr: "Mikro-lot seçkisinden, V60 ya da Kalita ile elde demlenir.",
      en: "From our micro-lot selection, brewed by hand in a V60 or Kalita.",
    },
    price: 150,
  },
  {
    id: "cypriot",
    section: "classics",
    name: { tr: "Kumda Kıbrıs Kahvesi", en: "Sand-Brewed Cypriot Coffee" },
    description: {
      tr: "Bakır cezvede, kum ocağında; yanında lokum ve soğuk su.",
      en: "Copper cezve over hot sand; served with lokum and cold water.",
    },
    price: 95,
  },
  {
    id: "signature-cold-brew",
    section: "cold",
    name: { tr: "İmza Soğuk Demleme", en: "Signature Cold Brew" },
    description: {
      tr: "16 saat, Guatemala Antigua, kristal buz. Şekersiz ve sabırlı.",
      en: "16 hours, Guatemala Antigua, crystal ice. Unsweetened and patient.",
    },
    price: 135,
  },
  {
    id: "nitro-carob",
    section: "cold",
    name: { tr: "Nitro Keçiboynuzu", en: "Nitro Carob" },
    description: {
      tr: "Azotla köpürtülmüş soğuk demleme, keçiboynuzu şurubu ve deniz tuzu.",
      en: "Nitrogen-infused cold brew, carob syrup and a pinch of sea salt.",
    },
    price: 160,
    badge: "seasonal",
  },
  {
    id: "rose-cold-brew",
    section: "cold",
    name: { tr: "Gül & Kakule Soğuk Demleme", en: "Rose & Cardamom Cold Brew" },
    description: {
      tr: "Mazotos gülü suyu, yeşil kakule ve yulaf sütü bulutu.",
      en: "Mazotos rose water, green cardamom and a cloud of oat milk.",
    },
    price: 150,
  },
  {
    id: "halloumi-pogaca",
    section: "pastry",
    name: { tr: "Hellimli Zahter Poğaça", en: "Halloumi & Za'atar Pogača" },
    description: {
      tr: "Taze hellim, dağ kekiği ve susam; sabah 6'da fırından.",
      en: "Fresh halloumi, wild thyme and sesame; out of the oven at 6 a.m.",
    },
    price: 95,
    badge: "house",
  },
  {
    id: "carob-croissant",
    section: "pastry",
    name: { tr: "Keçiboynuzlu Kruvasan", en: "Carob Croissant" },
    description: {
      tr: "72 saat fermente tereyağlı hamur, keçiboynuzu kreması.",
      en: "72-hour laminated butter dough, carob cream filling.",
    },
    price: 115,
  },
  {
    id: "pistachio-cake",
    section: "pastry",
    name: { tr: "Fıstıklı Zeytinyağlı Kek", en: "Pistachio Olive Oil Cake" },
    description: {
      tr: "Erken hasat Kıbrıs zeytinyağı, limon ve fıstık.",
      en: "Early-harvest Cypriot olive oil, lemon and pistachio.",
    },
    price: 120,
  },
  {
    id: "anari-cheesecake",
    section: "pastry",
    name: { tr: "Nor Peynirli Cheesecake", en: "Anari Cheesecake" },
    description: {
      tr: "Taze nor peyniri, harnup balı ve kavrulmuş susam tabanı.",
      en: "Fresh anari cheese, carob honey and a toasted sesame base.",
    },
    price: 135,
    badge: "seasonal",
  },
];

export const MENU_SECTIONS: MenuSection[] = ["signature", "classics", "cold", "pastry"];
