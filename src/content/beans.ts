import type { Localized } from "./types";

export type BeanCategory = "espresso" | "filter" | "micro";
export type RoastLevel = "light" | "medium" | "mediumDark";

/** Key moments of a roast, used to draw the profile curve. Times in minutes, temps in °C. */
export interface RoastProfile {
  charge: number; // bean probe reading at charge (drops from here)
  turningPoint: { t: number; temp: number };
  firstCrack: { t: number; temp: number };
  drop: { t: number; temp: number };
}

export interface Bean {
  id: string;
  name: string;
  origin: Localized;
  region: string;
  farm: string;
  altitude: number; // metres above sea level
  process: Localized;
  variety: string;
  harvest: string;
  category: BeanCategory;
  roast: RoastLevel;
  notes: Localized<string[]>;
  /** 1–10 sensory scores. */
  acidity: number;
  body: number;
  sweetness: number;
  brew: Localized;
  story: Localized;
  profile: RoastProfile;
  /** Featured on the homepage carousel. */
  signature?: boolean;
  /** A tonal accent for the card's swatch. */
  tone: string;
}

export const beans: Bean[] = [
  {
    id: "yirgacheffe-kochere",
    name: "Yirgacheffe Kochere",
    origin: { tr: "Etiyopya", en: "Ethiopia" },
    region: "Gedeo, Yirgacheffe",
    farm: "Kochere Debo İstasyonu",
    altitude: 2150,
    process: { tr: "Yıkanmış", en: "Washed" },
    variety: "Kurume, Wolisho",
    harvest: "2026",
    category: "filter",
    roast: "light",
    notes: {
      tr: ["Yasemin", "Bergamot", "Beyaz şeftali", "Çiçek balı"],
      en: ["Jasmine", "Bergamot", "White peach", "Blossom honey"],
    },
    acidity: 9,
    body: 4,
    sweetness: 7,
    brew: { tr: "V60 · 1:16 · 93 °C", en: "V60 · 1:16 · 93 °C" },
    story: {
      tr: "Kochere'nin sisli yamaçlarında, 800'den fazla küçük üreticinin kiraz teslim ettiği bir istasyon. Fincanda bir çay bahçesi kadar berrak.",
      en: "A washing station on Kochere's misty slopes, fed by more than 800 smallholders. In the cup, clear as a tea garden.",
    },
    profile: {
      charge: 205,
      turningPoint: { t: 1.4, temp: 92 },
      firstCrack: { t: 7.6, temp: 196 },
      drop: { t: 9.1, temp: 205 },
    },
    signature: true,
    tone: "#C9A66B",
  },
  {
    id: "huila-pink-bourbon",
    name: "Huila Pink Bourbon",
    origin: { tr: "Kolombiya", en: "Colombia" },
    region: "Pitalito, Huila",
    farm: "Finca El Mirador",
    altitude: 1850,
    process: { tr: "Anaerobik Bal", en: "Anaerobic Honey" },
    variety: "Pink Bourbon",
    harvest: "2026",
    category: "micro",
    roast: "light",
    notes: {
      tr: ["Kırmızı greyfurt", "Hibiskus", "Karpuz", "Esmer şeker"],
      en: ["Ruby grapefruit", "Hibiscus", "Watermelon", "Panela"],
    },
    acidity: 8,
    body: 6,
    sweetness: 9,
    brew: { tr: "Kalita Wave · 1:15 · 94 °C", en: "Kalita Wave · 1:15 · 94 °C" },
    story: {
      tr: "Rodrigo Sánchez'in ailesinden üçüncü kuşak; kirazlar 72 saat oksijensiz tanklarda bekletilip balıyla kurutuluyor.",
      en: "Third generation of the Sánchez family; cherries rest 72 hours in sealed tanks, then dry with their honey intact.",
    },
    profile: {
      charge: 200,
      turningPoint: { t: 1.3, temp: 90 },
      firstCrack: { t: 7.9, temp: 197 },
      drop: { t: 9.4, temp: 206 },
    },
    signature: true,
    tone: "#B4643A",
  },
  {
    id: "guatemala-antigua",
    name: "Antigua La Soledad",
    origin: { tr: "Guatemala", en: "Guatemala" },
    region: "Antigua",
    farm: "Finca La Soledad",
    altitude: 1600,
    process: { tr: "Yıkanmış", en: "Washed" },
    variety: "Bourbon, Caturra",
    harvest: "2026",
    category: "filter",
    roast: "medium",
    notes: {
      tr: ["Sütlü çikolata", "Kavrulmuş badem", "Kırmızı elma", "Karamel"],
      en: ["Milk chocolate", "Toasted almond", "Red apple", "Caramel"],
    },
    acidity: 6,
    body: 7,
    sweetness: 8,
    brew: { tr: "Chemex · 1:16 · 92 °C", en: "Chemex · 1:16 · 92 °C" },
    story: {
      tr: "Üç volkanın gölgesinde, mineral açısından zengin kül toprağında yetişen klasik, yuvarlak ve sıcak bir fincan.",
      en: "Grown in mineral-rich ash soil in the shadow of three volcanoes — a classic, round and warming cup.",
    },
    profile: {
      charge: 210,
      turningPoint: { t: 1.5, temp: 94 },
      firstCrack: { t: 8.2, temp: 198 },
      drop: { t: 10.1, temp: 210 },
    },
    tone: "#8A5A3C",
  },
  {
    id: "house-blend-01",
    name: "Surlariçi House Blend No. 01",
    origin: { tr: "Brezilya · Etiyopya · Kolombiya", en: "Brazil · Ethiopia · Colombia" },
    region: "Cerrado Mineiro · Sidama · Huila",
    farm: "Fazenda Pinhal · Bombe · El Mirador",
    altitude: 1450,
    process: { tr: "Doğal & Yıkanmış", en: "Natural & Washed" },
    variety: "Yellow Catuaí, Heirloom, Caturra",
    harvest: "2025–26",
    category: "espresso",
    roast: "mediumDark",
    notes: {
      tr: ["Bitter çikolata", "Fındık pralini", "Kurutulmuş kiraz", "Keçiboynuzu"],
      en: ["Dark chocolate", "Hazelnut praline", "Dried cherry", "Carob"],
    },
    acidity: 4,
    body: 9,
    sweetness: 8,
    brew: { tr: "Espresso · 18 g → 38 g · 28 sn", en: "Espresso · 18 g → 38 g · 28 s" },
    story: {
      tr: "Atölyenin ilk harmanı. Sütle buluştuğunda keçiboynuzu pekmezi gibi; tek başına içildiğinde kadife bir gövde.",
      en: "The atelier's first blend. With milk it tastes of carob molasses; on its own, a velvet body.",
    },
    profile: {
      charge: 215,
      turningPoint: { t: 1.6, temp: 96 },
      firstCrack: { t: 8.8, temp: 199 },
      drop: { t: 11.4, temp: 216 },
    },
    signature: true,
    tone: "#5B3A26",
  },
  {
    id: "kenya-nyeri",
    name: "Nyeri Gatomboya AA",
    origin: { tr: "Kenya", en: "Kenya" },
    region: "Nyeri",
    farm: "Gatomboya Kooperatifi",
    altitude: 1800,
    process: { tr: "Yıkanmış", en: "Washed" },
    variety: "SL28, SL34",
    harvest: "2026",
    category: "filter",
    roast: "light",
    notes: {
      tr: ["Kuş üzümü", "Domates yaprağı", "Kan portakalı", "Pekmez"],
      en: ["Blackcurrant", "Tomato leaf", "Blood orange", "Molasses"],
    },
    acidity: 9,
    body: 6,
    sweetness: 7,
    brew: { tr: "V60 · 1:16 · 94 °C", en: "V60 · 1:16 · 94 °C" },
    story: {
      tr: "Kenya Dağı'nın eteklerinde, çift fermantasyonlu yıkama ile işlenen, canlı ve sulu bir klasik.",
      en: "A vivid, juicy classic from the foothills of Mount Kenya, processed with a double-fermentation wash.",
    },
    profile: {
      charge: 205,
      turningPoint: { t: 1.4, temp: 91 },
      firstCrack: { t: 7.8, temp: 197 },
      drop: { t: 9.3, temp: 206 },
    },
    tone: "#7A2E2A",
  },
  {
    id: "costa-rica-tarrazu",
    name: "Tarrazú Las Lajas Perla Negra",
    origin: { tr: "Kosta Rika", en: "Costa Rica" },
    region: "Sabanilla de Alajuela",
    farm: "Las Lajas Micro-Mill",
    altitude: 1450,
    process: { tr: "Anaerobik Siyah Bal", en: "Anaerobic Black Honey" },
    variety: "Caturra, Catuaí",
    harvest: "2026",
    category: "micro",
    roast: "light",
    notes: {
      tr: ["Böğürtlen reçeli", "Tarçın", "Kakao çekirdeği", "Kırmızı şarap"],
      en: ["Blackberry jam", "Cinnamon", "Cacao nib", "Red wine"],
    },
    acidity: 7,
    body: 8,
    sweetness: 9,
    brew: { tr: "Origami · 1:15 · 92 °C", en: "Origami · 1:15 · 92 °C" },
    story: {
      tr: "Chacón ailesinin efsanevi değirmeni; kirazlar gölgede, 30 gün boyunca, müsilajı korunarak kurutuluyor.",
      en: "The Chacón family's legendary mill; cherries dry in shade for 30 days with their mucilage kept intact.",
    },
    profile: {
      charge: 200,
      turningPoint: { t: 1.3, temp: 90 },
      firstCrack: { t: 8.0, temp: 196 },
      drop: { t: 9.6, temp: 205 },
    },
    tone: "#3E2433",
  },
  {
    id: "espresso-arasta",
    name: "Arasta Espresso No. 02",
    origin: { tr: "Brezilya · Guatemala", en: "Brazil · Guatemala" },
    region: "Sul de Minas · Huehuetenango",
    farm: "Fazenda Santa Inês & Finca El Injerto",
    altitude: 1350,
    process: { tr: "Pulped Natural & Yıkanmış", en: "Pulped Natural & Washed" },
    variety: "Bourbon, Catuaí",
    harvest: "2025–26",
    category: "espresso",
    roast: "medium",
    notes: {
      tr: ["Karamelize armut", "Fındık", "Portakal kabuğu", "Kakao"],
      en: ["Caramelised pear", "Hazelnut", "Orange peel", "Cocoa"],
    },
    acidity: 6,
    body: 8,
    sweetness: 8,
    brew: { tr: "Espresso · 18 g → 40 g · 27 sn", en: "Espresso · 18 g → 40 g · 27 s" },
    story: {
      tr: "Tek başına içilmek için tasarlanmış, parlak ama yumuşak bir espresso. Arasta'nın sabah kalabalığına adandı.",
      en: "A bright yet gentle espresso designed to be drunk straight. Dedicated to the Arasta's morning crowd.",
    },
    profile: {
      charge: 210,
      turningPoint: { t: 1.5, temp: 94 },
      firstCrack: { t: 8.5, temp: 198 },
      drop: { t: 10.7, temp: 211 },
    },
    tone: "#9C6B3F",
  },
];

export const signatureBeans = beans.filter((b) => b.signature);
