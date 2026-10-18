import type {
  AboutContent,
  ContactContent,
  HomeContent,
  ImageRef,
  PageSeo,
  PageSlug,
  PrivacyContent,
  ServicesContent,
  SiteSettings,
  TermsContent,
} from "./schemas";

const heroImage = (): ImageRef => ({
  src: "/images/salon/hero.webp",
  alt: "Hair & Co salon in Newport with black styling chairs, mirrors and white walls",
  width: 1600,
  height: 1600,
});

const stylingStation = (): ImageRef => ({
  src: "/images/salon/styling-station.webp",
  alt: "White styling station with a ring light and plant at Hair & Co Newport",
  width: 1600,
  height: 1600,
});

const mirrorStation = (): ImageRef => ({
  src: "/images/salon/mirror-station.webp",
  alt: "Mirror and Hair & Co logo wall inside the Newport salon",
  width: 1600,
  height: 1600,
});

const washHouse = (): ImageRef => ({
  src: "/images/salon/wash-house.webp",
  alt: "Black basins and wash chairs in the Hair & Co salon",
  width: 1600,
  height: 1600,
});

const salonFloor = (): ImageRef => ({
  src: "/images/salon/salon-floor.webp",
  alt: "Hair styling stations and mirrors at Hair & Co Newport",
  width: 1600,
  height: 1600,
});

const salonDetail = (): ImageRef => ({
  src: "/images/salon/detail.webp",
  alt: "Detail of the wash area and salon finishes at Hair & Co",
  width: 1300,
  height: 1625,
});

export const defaultSettings: SiteSettings = {
  brand: {
    name: "Hair & Co",
    logo: {
      src: "/brand/hair-and-co-mark.png",
      alt: "Hair & Co",
      width: 1024,
      height: 1024,
    },
    wordmark: {
      src: "/brand/wordmark-black.png",
      alt: "Hair & Co",
      width: 836,
      height: 130,
    },
  },
  contact: {
    phoneDisplay: "+61 412 601 878",
    phoneE164: "+61412601878",
    email: "",
    addressLine1: "1/371 Barrenjoey Rd",
    addressLine2: "Newport NSW 2107, Australia",
    addressFull: "1/371 Barrenjoey Rd, Newport NSW 2107, Australia",
    addressLocality: "Newport",
    addressRegion: "NSW",
    addressPostcode: "2107",
    addressCountry: "AU",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Hair+%26+Co+1%2F371+Barrenjoey+Rd+Newport+NSW+2107",
    facebookUrl: "https://www.facebook.com/hairandcoonline/",
    whatsappUrl: "https://wa.me/61412601878",
  },
  hours: {
    sunday: { closed: true, open: "09:00", close: "17:00" },
    monday: { closed: true, open: "09:00", close: "17:00" },
    tuesday: { closed: true, open: "09:00", close: "17:00" },
    wednesday: { closed: false, open: "09:00", close: "18:00" },
    thursday: { closed: false, open: "09:00", close: "18:00" },
    friday: { closed: false, open: "09:00", close: "18:00" },
    saturday: { closed: false, open: "09:00", close: "17:00" },
  },
  booking: {
    enabled: true,
    capacity: 2,
    slotIntervalMinutes: 30,
    leadTimeMinutes: 120,
    maxAdvanceDays: 60,
    notifyEmail: "",
    policyNote:
      "If you need to change or cancel, please call the salon as soon as you can so we can offer the time to someone else.",
    confirmationNote:
      "Your appointment is confirmed. Please arrive a few minutes early and call the salon if anything changes.",
  },
  payments: {
    enabled: false,
    depositPercent: 20,
    depositNote:
      "A deposit is required to secure your booking. The balance is payable in the salon.",
  },
  footer: {
    tagline: "Cuts, colour and styling on Sydney's Northern Beaches.",
    copyright: "© Hair & Co. All rights reserved.",
  },
  seo: {
    defaultTitle: "Hair & Co | Hair Salon in Newport, Sydney",
    defaultDescription:
      "A considered hair salon in Newport on Sydney's Northern Beaches. Cuts, colour, treatments and styling. Book online or call +61 412 601 878.",
    defaultOgImage: {
      src: "/og/hair-and-co.jpg",
      alt: "Hair & Co — Newport, Sydney",
      width: 1200,
      height: 630,
    },
    googleVerification: "",
    bingVerification: "",
  },
};

export const defaultPageSeo: Record<PageSlug, PageSeo> = {
  home: {
    title: "Hair & Co | Hair Salon in Newport, Sydney",
    description:
      "A considered hair salon in Newport on Sydney's Northern Beaches. Cuts, colour, treatments and styling. Book online or call +61 412 601 878.",
    ogImage: defaultSettings.seo.defaultOgImage,
    canonical: "",
    noindex: false,
  },
  about: {
    title: "About Hair & Co | Newport Hair Salon",
    description:
      "Inside Hair & Co, a light-filled hair salon on Barrenjoey Road in Newport. Our approach to cuts, colour and easy, lived-in hair.",
    ogImage: {
      src: "/images/salon/styling-station.webp",
      alt: "Styling station at Hair & Co Newport",
      width: 1600,
      height: 1600,
    },
    canonical: "",
    noindex: false,
  },
  services: {
    title: "Hair Services & Prices | Hair & Co Newport",
    description:
      "Explore cuts, colour, treatments and styling at Hair & Co in Newport, Sydney. See prices, durations and what's included, then book online.",
    ogImage: {
      src: "/images/salon/wash-house.webp",
      alt: "Wash house at Hair & Co Newport",
      width: 1600,
      height: 1600,
    },
    canonical: "",
    noindex: false,
  },
  contact: {
    title: "Contact & Opening Hours | Hair & Co Newport",
    description:
      "Find Hair & Co at 1/371 Barrenjoey Rd, Newport NSW 2107. Opening hours, phone, map and online booking.",
    ogImage: defaultSettings.seo.defaultOgImage,
    canonical: "",
    noindex: false,
  },
  privacy: {
    title: "Privacy Policy | Hair & Co",
    description:
      "How Hair & Co collects, uses and protects personal information submitted through the website and booking system.",
    ogImage: defaultSettings.seo.defaultOgImage,
    canonical: "",
    noindex: false,
  },
  terms: {
    title: "Terms & Deposit Policy | Hair & Co",
    description:
      "Booking, deposit, cancellation, refund and privacy terms for Hair & Co in Newport, Sydney.",
    ogImage: defaultSettings.seo.defaultOgImage,
    canonical: "",
    noindex: false,
  },
};

export const homeContent: HomeContent = {
  hero: {
    eyebrow: "Newport · Sydney",
    titleLines: ["A considered", "hair salon", "in Newport."],
    intro:
      "Cuts, colour, treatments and styling on Sydney's Northern Beaches — with the time and attention a good appointment deserves.",
    primaryCta: { label: "Book an appointment", href: "/book" },
    secondaryCta: { label: "Explore services", href: "/services" },
    image: heroImage(),
    sideLabel: "1/371 Barrenjoey Rd",
  },
  marquee: ["Cuts", "Colour", "Treatments", "Styling", "Newport"],
  intro: {
    label: "The salon",
    heading: "Hair that feels like you.",
    paragraphs: [
      "Hair & Co is a salon on Barrenjoey Road in Newport. We keep things simple: a proper consultation, considered colour, a cut that suits your hair, and a finish you can recreate at home.",
      "The space is light-filled and unhurried, with black chairs, mirrors and a little greenery. Come in for a change, a tidy-up or simply the pleasure of an hour to yourself.",
    ],
    image: stylingStation(),
    caption: "Our Newport space",
  },
  statement: {
    text: "Considered cuts. Quiet confidence. Hair you can live in.",
    image: salonFloor(),
  },
  servicesPreview: {
    label: "The menu",
    heading: "A service for every kind of appointment.",
    body: "From a precision cut to a full colour transformation, every service begins with a conversation about your hair and how you want to wear it.",
    ctaLabel: "View all services",
  },
  gallery: {
    label: "Inside the salon",
    heading: "A quiet corner of Barrenjoey Road.",
    images: [heroImage(), stylingStation(), mirrorStation(), washHouse()],
  },
  experience: {
    label: "The experience",
    heading: "Simple, thoughtful, yours.",
    items: [
      {
        title: "Listen first",
        body: "Every appointment starts with a conversation about your hair, your routine and what you actually want.",
      },
      {
        title: "Considered craft",
        body: "Precision cutting, thoughtful colour and finishes that look as good on day three as they do on day one.",
      },
      {
        title: "Easy to live with",
        body: "We'll show you how to style it at home, without a bathroom full of products you'll never use.",
      },
    ],
  },
  location: {
    label: "Visit",
    heading: "Find us in Newport.",
    body: "On Barrenjoey Road in Newport, a world away from the rush. Book online, call us, or stop by during opening hours.",
    image: washHouse(),
  },
  closing: {
    heading: "Ready when you are.",
    body: "Choose a service, pick a time, and we'll take care of the rest.",
    primaryLabel: "Book an appointment",
    secondaryLabel: "Call the salon",
  },
};

export const aboutContent: AboutContent = {
  hero: {
    eyebrow: "About Hair & Co",
    title: "A calmer kind of hair appointment.",
    intro:
      "A light-filled salon on Barrenjoey Road, built around good hair and an easy experience.",
    image: stylingStation(),
  },
  story: {
    label: "The salon",
    heading: "Hair, without the fuss.",
    paragraphs: [
      "Hair & Co is a hair salon in Newport on Sydney's Northern Beaches. The space is simple and light-filled, with black styling chairs, generous mirrors and touches of green. It is designed to feel calm from the moment you walk in.",
      "We believe a good appointment starts with listening. Before the scissors or colour come out, we talk about your hair, your routine and the amount of time you actually want to spend styling it at home.",
      "The result is hair that feels considered rather than overworked — a shape that grows out well, colour that suits your skin and a finish you can repeat.",
    ],
  },
  values: {
    label: "Our approach",
    heading: "Three things we care about.",
    items: [
      {
        title: "Listen first",
        body: "A proper consultation, every time. We want to understand what you like, what you don't, and what your hair does on an ordinary Tuesday.",
      },
      {
        title: "Colour with intention",
        body: "From a subtle gloss to a full head of foils, we choose tones and techniques that work with your hair and your lifestyle.",
      },
      {
        title: "Hair that works at home",
        body: "You shouldn't need a salon's worth of tools to recreate your finish. We'll show you the short version.",
      },
    ],
  },
  space: {
    label: "The space",
    heading: "Made for slowing down.",
    body: "White walls, black chairs, mirrors and a little greenery. The salon is a calm, considered place to spend an hour — with none of the rush.",
    image: mirrorStation(),
  },
  gallery: {
    label: "Inside",
    heading: "A look around.",
    images: [salonFloor(), washHouse(), salonDetail(), stylingStation()],
  },
  closing: {
    heading: "Come and see us.",
    body: "Book online or call the salon. We're on Barrenjoey Road in Newport.",
    primaryLabel: "Book an appointment",
  },
};

export const servicesContent: ServicesContent = {
  hero: {
    eyebrow: "Services & prices",
    title: "The full menu.",
    intro:
      "Cuts, colour, treatments and styling. Every service starts with a consultation, and every price is in AUD.",
    image: washHouse(),
  },
  intro: {
    label: "Before you book",
    heading: "Good hair, clearly priced.",
    paragraphs: [
      "Choose the service that sounds closest to what you need. If you're not sure, book a consultation or call us and we'll point you in the right direction.",
      "Colour services marked “from” are priced by hair length, density and the amount of product required. We'll confirm the final price before we begin.",
    ],
  },
  menu: {
    label: "The menu",
    heading: "Cuts, colour, treatments, styling.",
    note: "Prices are in AUD and payment is in salon.",
  },
  booking: {
    heading: "Booking is simple.",
    body: "Pick a service, choose an available time and leave the rest to us. You'll receive a reference and the details of your appointment.",
  },
  closing: {
    heading: "Not sure what to book?",
    body: "Call the salon and we'll help you choose the right service for your hair.",
    primaryLabel: "Call +61 412 601 878",
  },
};

export const contactContent: ContactContent = {
  hero: {
    eyebrow: "Contact",
    title: "Find us in Newport.",
    intro: "On Barrenjoey Road, in the heart of Newport on Sydney's Northern Beaches.",
    image: mirrorStation(),
  },
  details: {
    heading: "The details.",
    note: "Call, book online, or stop by during opening hours.",
  },
  hours: {
    heading: "Opening hours.",
  },
  location: {
    heading: "Barrenjoey Road.",
    body: "Hair & Co is at 1/371 Barrenjoey Rd, Newport NSW 2107. Use the link below to open directions in Google Maps.",
    image: salonFloor(),
  },
  closing: {
    heading: "We'd love to see you.",
    body: "Book an appointment online or call the salon.",
    primaryLabel: "Book an appointment",
  },
};

export const privacyContent: PrivacyContent = {
  title: "Privacy policy",
  updated: "October 2026",
  paragraphs: [
    "Hair & Co respects your privacy. This policy explains how we collect, use and protect the personal information you provide when you use this website or book an appointment.",
    "When you make a booking, we collect your name, email address, phone number, the service you have chosen, your preferred appointment time and any notes you choose to add. We also record when you accepted this policy.",
    "We use this information to manage your appointment, contact you about your booking and keep a record of the services we have provided. We do not sell your personal information or use it for unrelated marketing.",
    "To protect the booking form from abuse, we may store a one-way hash of the IP address that made a booking. This cannot be used to identify you directly and is not used for advertising.",
    "Your booking details are stored in a secure database and may be sent by email to the salon and to you as a confirmation. Our service providers handle data on our behalf and are required to keep it secure.",
    "If you pay a deposit online, card payments are processed by Stripe. Stripe receives the payment and contact information needed to process the transaction. Hair & Co does not receive or store your full card number. Stripe may process data outside Australia under its own privacy terms.",
    "We keep booking information only for as long as we need it to manage your appointment, maintain our records and meet legal obligations. You can ask us to correct or delete your personal information by calling the salon.",
    "This website uses an essential cookie only when a member of the Hair & Co team signs in to the administration area. It is not used for advertising or analytics.",
  ],
  contactNote:
    "For privacy questions or to request access to your information, call Hair & Co on +61 412 601 878.",
};

export const termsContent: TermsContent = {
  title: "Terms & Deposit Policy",
  version: "2026-10",
  effectiveDate: "October 2026",
  sections: [
    {
      title: "1. About Hair & Co",
      paragraphs: [
        "Hair & Co is a hair salon at 1/371 Barrenjoey Rd, Newport NSW 2107, Australia. Phone: +61 412 601 878. ABN: available on request.",
        "These terms apply to bookings, services and payments made through this website or in the salon. They are governed by the laws of New South Wales and Australia, including the Australian Consumer Law.",
      ],
    },
    {
      title: "2. Your consumer rights",
      paragraphs: [
        "Our services come with guarantees that cannot be excluded under the Australian Consumer Law, including that services are provided with due care and skill, are fit for the purpose you made known to us, and are supplied within a reasonable time.",
        "Nothing in these terms excludes, restricts or modifies those rights. If a guarantee applies, you may be entitled to a remedy even where these terms say something different.",
      ],
    },
    {
      title: "3. Bookings and confirmation",
      paragraphs: [
        "A booking request is an offer. It is confirmed only when we send a booking confirmation and, where a deposit is required, when the deposit is paid.",
        "You must provide accurate contact details and tell us about anything that may affect your service. If you are under 18, a parent or guardian must approve the booking and any colour or chemical service.",
        "We may decline, change or cancel a booking where it is necessary for safety, staffing, availability or a genuine error, or where a customer is abusive, intoxicated or behaving unsafely. If we cancel for a reason within our control, we will offer a reschedule or refund the deposit. This does not limit your statutory rights.",
      ],
    },
    {
      title: "4. Consultations, services and pricing",
      paragraphs: [
        "Every service includes a consultation. Hair outcomes depend on your hair history, condition, products, home care and other factors. We will explain the likely result and realistic maintenance. We do not guarantee an exact colour, length, style or outcome where that would be misleading, but we will provide our services with due care and skill.",
        "“From” prices are starting prices. Your final price may be higher depending on hair length, density, colour history, product use and the time required. We will confirm the price with you before the service begins. A deposit is credited towards the final service price.",
      ],
    },
    {
      title: "5. Health, allergies and patch tests",
      paragraphs: [
        "You must tell us about allergies, skin or scalp conditions, pregnancy, medications, recent chemical treatments or anything else that may affect your service. Colour or chemical services may require a patch test at least 48 hours before the appointment.",
        "We may decline or modify a service if we believe it is unsafe to proceed. Refusing a service for a genuine safety reason is not a breach of these terms.",
      ],
    },
    {
      title: "6. Deposits and card payments",
      paragraphs: [
        "Where enabled, a deposit of 20% of the listed service price is required to secure a booking. The deposit is calculated on the listed price, rounded to the nearest Australian dollar, with a minimum of A$1, and is capped at the service price.",
        "The deposit is not an extra fee. It is credited towards the final service price, and the remaining balance is payable in the salon.",
        "Payments are processed by Stripe. We do not receive or store your full card number. Stripe may process payment data outside Australia. Prices are in Australian dollars and include GST unless stated otherwise. We do not add an undisclosed card surcharge.",
        "If payment fails or is not completed within the checkout window, the booking is not confirmed and the held time may be released.",
      ],
    },
    {
      title: "7. Cancellations and rescheduling by you",
      paragraphs: [
        "If you cancel or reschedule with at least 48 hours’ notice before your appointment, we will refund the deposit to your original payment method or, if you prefer, transfer it to the rescheduled appointment. Stripe refunds may take 5–10 business days to appear, depending on your bank.",
        "If you cancel with less than 48 hours’ notice, do not attend, or arrive so late that we cannot reasonably provide the service, we may retain some or all of the deposit as a reasonable cancellation fee for the reserved time and lost booking opportunity. We will consider exceptional circumstances in good faith, and this does not exclude any right you have under the Australian Consumer Law.",
        "If you arrive late, we may need to shorten or reschedule the service to protect other appointments.",
      ],
    },
    {
      title: "8. Cancellations by us",
      paragraphs: [
        "If we cancel your appointment for a reason within our control, we will offer you a reschedule or refund the deposit in full. If we cannot provide a service you have paid for, you may be entitled to a remedy under the Australian Consumer Law.",
      ],
    },
    {
      title: "9. Refunds and service concerns",
      paragraphs: [
        "Deposit refunds are processed to the original payment method and are reviewed manually. A refund is not automatic simply because a customer changes their mind, except where these terms or the Australian Consumer Law require it.",
        "If you are unhappy with a service, please contact us within 7 days on +61 412 601 878 and describe the concern. We will review it and, where appropriate, offer a correction or remedy. This does not limit your rights under the Australian Consumer Law, including your right to contact NSW Fair Trading or the ACCC.",
      ],
    },
    {
      title: "10. Prices, GST and receipts",
      paragraphs: [
        "All prices are in Australian dollars and include GST unless stated otherwise. We will provide a receipt or tax invoice on request. Prices may change; the price displayed or quoted at the time of booking or consultation applies. We do not charge an excessive card surcharge.",
      ],
    },
    {
      title: "11. Privacy and electronic communications",
      paragraphs: [
        "We collect the information needed to manage your booking, provide services, process payments and meet legal obligations. Our Privacy Policy explains what we collect, why, how long we keep it, who we share it with (including Stripe), and how to access or correct it.",
        "Booking emails are transactional. We will only send marketing messages with your consent, and you can opt out at any time.",
      ],
    },
    {
      title: "12. Liability",
      paragraphs: [
        "To the extent permitted by law, we are not liable for indirect or consequential loss, or for loss caused by factors outside our reasonable control. Nothing in these terms excludes or limits liability that cannot lawfully be excluded, including liability under the Australian Consumer Law.",
      ],
    },
    {
      title: "13. Website and intellectual property",
      paragraphs: [
        "The website content, photographs, logo and copy are owned by or licensed to Hair & Co. You may use the website for personal booking purposes only. You must not scrape, copy, republish or misuse the content without permission.",
      ],
    },
    {
      title: "14. Chargebacks and payment disputes",
      paragraphs: [
        "If you believe a payment is wrong, please contact us first so we can investigate. We may provide booking records, terms acceptance, payment records and service records to Stripe or a financial institution in response to a chargeback. Contacting us or raising a chargeback does not limit your consumer rights.",
      ],
    },
    {
      title: "15. Changes to these terms",
      paragraphs: [
        "We may update these terms from time to time. The version displayed at checkout applies to a new booking. Changes do not retrospectively alter rights relating to an earlier booking. The current version and effective date are shown on this page.",
      ],
    },
    {
      title: "16. Contact and complaints",
      paragraphs: [
        "For booking, payment, privacy or complaint questions, contact Hair & Co at 1/371 Barrenjoey Rd, Newport NSW 2107, or call +61 412 601 878. If we cannot resolve a complaint, you can contact NSW Fair Trading or the ACCC. Nothing in this clause prevents you from exercising your legal rights.",
      ],
    },
    {
      title: "17. Governing law",
      paragraphs: [
        "If any part of these terms is unenforceable, the remaining parts continue to apply. These terms are governed by the laws of New South Wales, Australia. Consumers may also have rights under the law of the state or territory where they live.",
      ],
    },
  ],
  contactNote:
    "For questions about these terms, deposits or refunds, call Hair & Co on +61 412 601 878.",
};

export const defaultPages = {
  home: { content: homeContent, seo: defaultPageSeo.home },
  about: { content: aboutContent, seo: defaultPageSeo.about },
  services: { content: servicesContent, seo: defaultPageSeo.services },
  contact: { content: contactContent, seo: defaultPageSeo.contact },
  privacy: { content: privacyContent, seo: defaultPageSeo.privacy },
  terms: { content: termsContent, seo: defaultPageSeo.terms },
} as const;

export type SeedService = {
  name: string;
  slug: string;
  category: string;
  description: string;
  inclusions: string[];
  priceCents: number;
  priceType: "fixed" | "from";
  durationMinutes: number;
  image: ImageRef | null;
  active: boolean;
  sortOrder: number;
  isSample: boolean;
};

export const sampleServices: SeedService[] = [
  {
    name: "Signature Cut & Finish",
    slug: "signature-cut-finish",
    category: "Cuts",
    description:
      "A full appointment for a new shape or a considered refresh. We start with a consultation, then cleanse, cut and finish your hair.",
    inclusions: [
      "Consultation",
      "Cleanse and scalp massage",
      "Precision cut",
      "Blow-dry and styling",
    ],
    priceCents: 11000,
    priceType: "fixed",
    durationMinutes: 75,
    image: null,
    active: true,
    sortOrder: 10,
    isSample: true,
  },
  {
    name: "Men's Cut",
    slug: "mens-cut",
    category: "Cuts",
    description:
      "A tailored cut with a clean finish, whether you want something sharp, soft or easy to wear.",
    inclusions: ["Consultation", "Cleanse", "Cut", "Style"],
    priceCents: 7000,
    priceType: "fixed",
    durationMinutes: 45,
    image: null,
    active: true,
    sortOrder: 20,
    isSample: true,
  },
  {
    name: "Fringe Trim",
    slug: "fringe-trim",
    category: "Cuts",
    description:
      "A quick tidy between appointments to keep your fringe sitting exactly where it should.",
    inclusions: ["Quick consultation", "Fringe trim", "Finishing"],
    priceCents: 3000,
    priceType: "fixed",
    durationMinutes: 30,
    image: null,
    active: true,
    sortOrder: 30,
    isSample: true,
  },
  {
    name: "Regrowth Colour",
    slug: "regrowth-colour",
    category: "Colour",
    description:
      "A refresh of your root colour to cover regrowth and keep your tone even between fuller colour appointments.",
    inclusions: [
      "Colour consultation",
      "Regrowth application",
      "Cleanse",
      "Blow-dry",
    ],
    priceCents: 13500,
    priceType: "from",
    durationMinutes: 90,
    image: null,
    active: true,
    sortOrder: 40,
    isSample: true,
  },
  {
    name: "Full Head Colour",
    slug: "full-head-colour",
    category: "Colour",
    description:
      "An all-over colour for a richer, more uniform result. We choose the shade together in consultation.",
    inclusions: [
      "Colour consultation",
      "Full colour application",
      "Cleanse",
      "Blow-dry",
    ],
    priceCents: 19500,
    priceType: "from",
    durationMinutes: 120,
    image: null,
    active: true,
    sortOrder: 50,
    isSample: true,
  },
  {
    name: "Partial Foils",
    slug: "partial-foils",
    category: "Colour",
    description:
      "Soft dimension around the face and top sections, finished with a toner to tailor the tone.",
    inclusions: [
      "Colour consultation",
      "Partial foils",
      "Toner",
      "Cleanse and blow-dry",
    ],
    priceCents: 23000,
    priceType: "from",
    durationMinutes: 150,
    image: null,
    active: true,
    sortOrder: 60,
    isSample: true,
  },
  {
    name: "Full Head Foils",
    slug: "full-head-foils",
    category: "Colour",
    description:
      "A full head of foils for brighter, more dimensional colour, tailored with a toner and finished with a blow-dry.",
    inclusions: [
      "Colour consultation",
      "Full head foils",
      "Toner",
      "Cleanse and blow-dry",
    ],
    priceCents: 29000,
    priceType: "from",
    durationMinutes: 180,
    image: null,
    active: true,
    sortOrder: 70,
    isSample: true,
  },
  {
    name: "Gloss & Tone",
    slug: "gloss-and-tone",
    category: "Colour",
    description:
      "A quick shine boost and tone refresh to soften brassiness or add depth between colour appointments.",
    inclusions: ["Tone consultation", "Gloss application", "Cleanse", "Blow-dry"],
    priceCents: 7500,
    priceType: "fixed",
    durationMinutes: 45,
    image: null,
    active: true,
    sortOrder: 80,
    isSample: true,
  },
  {
    name: "Bond Repair Treatment",
    slug: "bond-repair-treatment",
    category: "Treatments",
    description:
      "A strengthening treatment for hair that feels dry, fragile or overworked, finished with a scalp massage and blow-dry.",
    inclusions: [
      "Hair consultation",
      "Bond repair treatment",
      "Scalp massage",
      "Blow-dry",
    ],
    priceCents: 8000,
    priceType: "fixed",
    durationMinutes: 45,
    image: null,
    active: true,
    sortOrder: 90,
    isSample: true,
  },
  {
    name: "Scalp Ritual",
    slug: "scalp-ritual",
    category: "Treatments",
    description:
      "An exfoliating cleanse and relaxing scalp massage to reset the scalp and leave hair feeling fresh.",
    inclusions: ["Scalp consultation", "Exfoliating cleanse", "Massage", "Finish"],
    priceCents: 5500,
    priceType: "fixed",
    durationMinutes: 30,
    image: null,
    active: true,
    sortOrder: 100,
    isSample: true,
  },
  {
    name: "Blow Dry & Style",
    slug: "blow-dry-and-style",
    category: "Styling",
    description:
      "A cleanse and professional blow-dry for smooth, polished hair or an easy, textured finish.",
    inclusions: ["Style consultation", "Cleanse", "Blow-dry", "Finishing"],
    priceCents: 6500,
    priceType: "fixed",
    durationMinutes: 45,
    image: null,
    active: true,
    sortOrder: 110,
    isSample: true,
  },
  {
    name: "Event Styling",
    slug: "event-styling",
    category: "Styling",
    description:
      "Polished styling for a wedding, event or special occasion, from a sleek finish to soft movement.",
    inclusions: ["Style consultation", "Preparation", "Styling", "Finishing"],
    priceCents: 12000,
    priceType: "fixed",
    durationMinutes: 60,
    image: null,
    active: true,
    sortOrder: 120,
    isSample: true,
  },
];
