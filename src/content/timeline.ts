import type { Localized } from "./types";

export interface Milestone {
  year: string;
  title: Localized;
  body: Localized;
}

export const timeline: Milestone[] = [
  {
    year: "1567",
    title: { tr: "Surlar yükseliyor", en: "The walls rise" },
    body: {
      tr: "Venedikliler Lefkoşa'yı on bir burçlu kusursuz bir daireyle çevreliyor. Atölyemizin taşları da aynı ocaklardan geliyor.",
      en: "The Venetians encircle Nicosia with a perfect eleven-bastion ring. Our workshop's stones come from the same quarries.",
    },
  },
  {
    year: "1890",
    title: { tr: "Demirci atölyesi", en: "The blacksmith's forge" },
    body: {
      tr: "Arasta'nın arka sokağında bir demirci, kemerli taş odada örsünü kuruyor. Ocağı yaklaşık bir asır boyunca hiç sönmüyor.",
      en: "In a back street of the Arasta a blacksmith sets up his anvil beneath a stone arch. His hearth burns for almost a century.",
    },
  },
  {
    year: "2019",
    title: { tr: "Anahtar teslim", en: "The key changes hands" },
    body: {
      tr: "Elli yıl kapalı kalan kapıyı açıyoruz. On bir ay boyunca sıva döküyor, kemerleri sağlamlaştırıyor, taşı yeniden nefes alır hale getiriyoruz.",
      en: "We open a door closed for fifty years. For eleven months we strip plaster, stabilise the arches and let the stone breathe again.",
    },
  },
  {
    year: "2020",
    title: { tr: "İlk parti", en: "The first batch" },
    body: {
      tr: "12 kilogramlık kavurucumuz demircinin ocağına yerleşiyor. İlk partimiz bir Yirgacheffe; komşular kokunun nereden geldiğini sormaya başlıyor.",
      en: "Our 12-kilo roaster settles into the blacksmith's hearth. The first batch is a Yirgacheffe; neighbours start asking where the scent comes from.",
    },
  },
  {
    year: "2022",
    title: { tr: "Doğrudan ticaret", en: "Direct trade" },
    body: {
      tr: "Huila ve Kochere'deki ortak üreticilerimizi ilk kez ziyaret ediyoruz. Çekirdeklerimizin çoğunu artık aracısız alıyoruz.",
      en: "We visit our partner producers in Huila and Kochere for the first time. Most of our coffee is now bought without intermediaries.",
    },
  },
  {
    year: "2024",
    title: { tr: "Toptan ortaklıklar", en: "Wholesale partners" },
    body: {
      tr: "Girne'den Gazimağusa'ya, adanın dört bir yanındaki 30'dan fazla kafe ve restorana haftalık taze kavrum gönderiyoruz.",
      en: "From Kyrenia to Famagusta, we ship fresh roasts weekly to more than 30 cafés and restaurants across the island.",
    },
  },
  {
    year: "2026",
    title: { tr: "Atölye & tadım odası", en: "Atelier & tasting room" },
    body: {
      tr: "Bitişikteki ikinci kemeri de restore ederek halka açık tadım (cupping) seansları düzenlediğimiz bir tadım odasına dönüştürüyoruz.",
      en: "We restore the neighbouring arch too, opening a tasting room for public cupping sessions.",
    },
  },
];
