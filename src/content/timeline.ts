import type { Localized } from "./types";

export interface Milestone {
  year: string;
  title: Localized;
  body: Localized;
}

export const timeline: Milestone[] = [
  {
    year: "1567",
    title: { tr: "Surların inşası", en: "Building the walls" },
    body: {
      tr: "Venedikliler Lefkoşa'nın çevresine on bir burçlu yuvarlak bir sur çekiyor. Atölyenin taşları da aynı ocaklardan gelmiş.",
      en: "The Venetians build an eleven-bastion ring wall around Nicosia. The stones of our workshop came from the same quarries.",
    },
  },
  {
    year: "1890",
    title: { tr: "Demirci atölyesi", en: "The blacksmith's forge" },
    body: {
      tr: "Arasta'nın arka sokağında bir demirci, kemerli taş odaya örsünü kuruyor. Ocağı neredeyse yüz yıl sönmüyor.",
      en: "A blacksmith sets up his anvil in a stone-arched room in a back street of the Arasta. His fire stays lit for almost a century.",
    },
  },
  {
    year: "2019",
    title: { tr: "Anahtar teslim", en: "The key changes hands" },
    body: {
      tr: "Elli yıldır kapalı duran kapıyı açıyoruz. On bir ay boyunca sıva söküyor, kemerleri sağlamlaştırıyor, taşı açığa çıkarıyoruz.",
      en: "We open a door that's been shut for fifty years. Over eleven months we strip the plaster, shore up the arches and uncover the stone.",
    },
  },
  {
    year: "2020",
    title: { tr: "İlk parti", en: "The first batch" },
    body: {
      tr: "12 kiloluk kavurucu demircinin ocağının yanına kuruluyor. İlk parti bir Yirgacheffe; komşular kokunun nereden geldiğini sormaya başlıyor.",
      en: "The 12 kg roaster goes in next to the blacksmith's hearth. The first batch is a Yirgacheffe, and the neighbours start asking where the smell is coming from.",
    },
  },
  {
    year: "2022",
    title: { tr: "Doğrudan ticaret", en: "Direct trade" },
    body: {
      tr: "Huila ve Kochere'deki üreticileri ilk kez ziyaret ediyoruz. Kahvelerimizin çoğunu artık doğrudan onlardan alıyoruz.",
      en: "We visit our producers in Huila and Kochere for the first time. Most of our coffee now comes straight from them.",
    },
  },
  {
    year: "2024",
    title: { tr: "Toptan ortaklıklar", en: "Wholesale partners" },
    body: {
      tr: "Girne'den Gazimağusa'ya, 30'dan fazla kafe ve restorana her hafta taze kavrulmuş kahve gönderiyoruz.",
      en: "From Kyrenia to Famagusta, more than 30 cafés and restaurants get freshly roasted coffee from us every week.",
    },
  },
  {
    year: "2026",
    title: { tr: "Atölye & tadım odası", en: "Atelier & tasting room" },
    body: {
      tr: "Bitişikteki ikinci kemeri de onarıp halka açık cupping seanslarının yapıldığı bir tadım odasına çeviriyoruz.",
      en: "We restore the arch next door and turn it into a tasting room for public cupping sessions.",
    },
  },
];
