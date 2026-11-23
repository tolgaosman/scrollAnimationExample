import type { Localized } from "./types";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: Localized;
  since: string;
  favorite: Localized;
  philosophy: Localized;
  bio: Localized;
  /** Duotone plate colours: [ground, ink]. */
  plate: [string, string];
}

export const team: TeamMember[] = [
  {
    id: "head-roaster",
    name: "Derviş Ataoğlu",
    initials: "DA",
    role: { tr: "Kavurma Ustası", en: "Head Roaster" },
    since: "2019",
    favorite: { tr: "Kalita Wave, 1:16", en: "Kalita Wave, 1:16" },
    philosophy: {
      tr: "Kavurmada önce kulağını kullanırsın. Birinci çatlamayı termometreden önce duyarsın.",
      en: "You listen first. You hear first crack before the probe shows it.",
    },
    bio: {
      tr: "Babasının Girne Kapısı yakınındaki fırında büyüdü, ateşi ve zamanlamayı ekmekten öğrendi. Her partinin başında hâlâ kendisi duruyor.",
      en: "Grew up in his father's bakery near the Kyrenia Gate and learned fire and timing from bread. He still stands over every batch.",
    },
    plate: ["#D6C29A", "#3A2A1E"],
  },
  {
    id: "lead-barista",
    name: "Selin Menteşoğlu",
    initials: "SM",
    role: { tr: "Baş Barista", en: "Lead Barista" },
    since: "2020",
    favorite: { tr: "Espresso, 1:2,1 · 28 sn", en: "Espresso, 1:2.1 · 28 s" },
    philosophy: {
      tr: "İyi espressonun başı, ortası, sonu olur. Fazlası lafı uzatmak.",
      en: "A good espresso has a beginning, a middle and an end. Anything more is just talking.",
    },
    bio: {
      tr: "Kıbrıs Barista Şampiyonası'nda iki kez finale kaldı. Barın arkasında az konuşur; latte sanatında elini konuşturur.",
      en: "Twice a finalist at the Cyprus Barista Championship. Doesn't say much behind the bar; the latte art does the talking.",
    },
    plate: ["#B9BDC1", "#1C1814"],
  },
  {
    id: "q-grader",
    name: "Kemal Hüdaverdi",
    initials: "KH",
    role: { tr: "Kalite Kontrol · Q-Grader", en: "Quality Control · Q-Grader" },
    since: "2021",
    favorite: { tr: "Tadım kaşığı, 8,25 g / 150 ml", en: "Cupping spoon, 8.25 g / 150 ml" },
    philosophy: {
      tr: "Damak kas gibi; her sabah çalıştırmazsan yanıltmaya başlar.",
      en: "Your palate is a muscle. Skip a few mornings and it starts getting things wrong.",
    },
    bio: {
      tr: "Lizbon ve Addis Ababa'daki tadım laboratuvarlarında yıllarca çalıştı, sonra Lefkoşa'ya döndü. Her yeşil çekirdek önce onun masasından geçer.",
      en: "Spent years in cupping labs in Lisbon and Addis Ababa before coming back to Nicosia. Every green coffee goes across his table first.",
    },
    plate: ["#C9A66B", "#2B1F17"],
  },
  {
    id: "pastry-chef",
    name: "Elif Kanatlı",
    initials: "EK",
    role: { tr: "Pasta Şefi", en: "Pastry Chef" },
    since: "2022",
    favorite: { tr: "Soğuk demleme, 1:10", en: "Cold brew, 1:10" },
    philosophy: {
      tr: "Hamur da kahve gibi mayalanır. İkisine de vakit verirsen karşılığını alırsın.",
      en: "Dough ferments the way coffee does. Give either one time and it pays you back.",
    },
    bio: {
      tr: "Hellimli zahter poğaçası ve keçiboynuzlu kruvasanı sabah 6'da Arasta'nın ilk kokusu.",
      en: "Her halloumi and za'atar poğaça and her carob croissant are the first smell in the Arasta at 6 a.m.",
    },
    plate: ["#E4D7C3", "#7A3D20"],
  },
];
