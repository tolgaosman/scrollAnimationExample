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
      tr: "Kavurma bir dinleme işidir. Birinci çatlamayı termometreden önce kulağınla duyarsın.",
      en: "Roasting is an act of listening. You hear first crack with your ears before the probe tells you.",
    },
    bio: {
      tr: "Babasının Girne Kapısı'ndaki fırınında büyüdü; ateşi ve zamanlamayı ekmekle öğrendi. Bugün her partiyi kendi eliyle imzalıyor.",
      en: "Grew up in his father's bakery by the Kyrenia Gate, learning fire and timing through bread. Today he signs every batch by hand.",
    },
    plate: ["#D6C29A", "#3A2A1E"],
  },
  {
    id: "lead-barista",
    name: "Ayşe Menteşoğlu",
    initials: "AM",
    role: { tr: "Baş Barista", en: "Lead Barista" },
    since: "2020",
    favorite: { tr: "Espresso, 1:2,1 · 28 sn", en: "Espresso, 1:2.1 · 28 s" },
    philosophy: {
      tr: "İyi bir espresso bir cümle gibidir: başı, ortası, sonu olmalı. Fazlası gevezelik.",
      en: "A good espresso is like a sentence: it needs a beginning, a middle and an end. Anything more is chatter.",
    },
    bio: {
      tr: "İki kez Kıbrıs Barista Şampiyonası finalisti. Bar arkasında sessiz, latte sanatında şiirsel.",
      en: "Twice a Cyprus Barista Championship finalist. Quiet behind the bar, poetic in latte art.",
    },
    plate: ["#B9BDC1", "#1C1814"],
  },
  {
    id: "q-grader",
    name: "Kemal Hüdaverdi",
    initials: "KH",
    role: { tr: "Kalite Kontrol · Q-Grader", en: "Quality Control · Q-Grader" },
    since: "2021",
    favorite: { tr: "Kupaj kaşığı, 8,25 g / 150 ml", en: "Cupping spoon, 8.25 g / 150 ml" },
    philosophy: {
      tr: "Damak bir kas gibidir; her sabah çalıştırılmazsa yalan söylemeye başlar.",
      en: "The palate is a muscle — skip a morning of training and it starts to lie.",
    },
    bio: {
      tr: "Lizbon ve Addis Ababa'da tadım laboratuvarlarında çalıştıktan sonra Lefkoşa'ya döndü. Her yeşil çekirdek önce onun masasından geçer.",
      en: "Returned to Nicosia after years in cupping labs in Lisbon and Addis Ababa. Every green coffee crosses his table first.",
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
      tr: "Hamur da kahve gibi fermente olur. İkisine de zaman tanırsanız size teşekkür ederler.",
      en: "Dough ferments just like coffee. Give both time and they thank you for it.",
    },
    bio: {
      tr: "Hellimli zahter poğaçası ve keçiboynuzlu kruvasanı, sabah 6'da Arasta'nın ilk kokusu oldu.",
      en: "Her halloumi-za'atar pogača and carob croissant became the Arasta's first scent at 6 a.m.",
    },
    plate: ["#E4D7C3", "#7A3D20"],
  },
];
