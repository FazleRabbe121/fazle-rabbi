/**
 * ALL EDITABLE WEBSITE CONTENT LIVES HERE.
 * Anything marked [PLACEHOLDER] should be replaced with real details.
 * Images: swap the files in src/assets (keep the same file names) or change the imports below.
 */
import cocktail1 from "@/assets/cocktail-1.jpg";
import cocktail2 from "@/assets/cocktail-2.jpg";
import cocktail3 from "@/assets/cocktail-3.jpg";
import cocktail4 from "@/assets/cocktail-4.jpg";
import coffee1 from "@/assets/coffee-1.jpg";
import coffee2 from "@/assets/coffee-2.jpg";
import portrait from "@/assets/portrait.jpg";
import heroPoster from "@/assets/hero-poster.jpg";

export const site = {
  name: "Fazle Rabbi",
  title: "Professional Bartender | Barista | Mixologist",
  tagline: "Crafting Exceptional Experiences, One Drink at a Time.",
  siteUrl: "https://example.com", // [PLACEHOLDER] your live domain (used for SEO tags)
  location: "Mediterranean Region", // [PLACEHOLDER]
  images: { heroPoster, portrait },

  about: {
    heading: "Hospitality is a craft. Every guest, a story.",
    paragraphs: [
      "[PLACEHOLDER] I am a professional bartender, barista and mixologist with hands-on experience across luxury hotels, cocktail lounges and specialty coffee venues. My work blends classic technique with modern creativity.",
      "[PLACEHOLDER] From high-volume service to bespoke cocktail menus, I focus on precision, consistency and genuine guest connection — the details that turn a drink into a memorable experience.",
    ],
    stats: [
      { value: "8+", label: "Years behind the bar" }, // [PLACEHOLDER]
      { value: "300+", label: "Recipes developed" },
      { value: "50k+", label: "Guests served" },
      { value: "4", label: "Countries worked" },
    ],
  },

  experience: [
    { period: "2022 — Present", role: "Head Bartender", venue: "[PLACEHOLDER] Luxury Hotel Bar, City", points: ["Lead a team of 6 bartenders across a 120-cover cocktail lounge", "Designed two seasonal menus, increasing beverage revenue by 18%", "Manage stock, par levels, ordering and cost control"] },
    { period: "2019 — 2022", role: "Senior Bartender & Mixologist", venue: "[PLACEHOLDER] Cocktail Lounge, City", points: ["Signature cocktail creation and batching programme", "Trained junior staff in classic specs and speed service", "Guest-facing events, masterclasses and pairings"] },
    { period: "2017 — 2019", role: "Barista", venue: "[PLACEHOLDER] Specialty Coffee House, City", points: ["Espresso calibration, milk texturing and latte art", "Daily grinder dial-in and equipment maintenance", "High-volume morning service with consistent quality"] },
  ],

  hospitalitySkills: [
    "Guest experience & upselling", "Bar operations & mise en place", "Stock control & inventory", "Cost & pour-cost management",
    "Team leadership & training", "Health, safety & hygiene", "Responsible alcohol service", "Events & private functions",
  ],

  mixology: {
    intro: "A deep repertoire of classic and contemporary cocktails, built on balance, dilution and technique.",
    items: [
      { title: "Classic Specs", text: "IBA classics, pre-Prohibition and tiki canon executed to precise specification." },
      { title: "Technique", text: "Shaking, stirring, throwing, layering, muddling, fat-washing and clarification." },
      { title: "In-house Prep", text: "Syrups, cordials, shrubs, infusions, purees and batched serves." },
      { title: "Menu Development", text: "Concept, costing, naming and staff training for seasonal menus." },
    ],
  },

  coffee: {
    intro: "Specialty coffee preparation with the same precision as the cocktail bar.",
    items: [
      { title: "Espresso Extraction", text: "Dose, yield and time calibration for balanced, repeatable shots." },
      { title: "Milk & Latte Art", text: "Microfoam texturing; hearts, tulips, rosettas and swans." },
      { title: "Brew Methods", text: "V60, Chemex, AeroPress, French press and cold brew." },
      { title: "Coffee Cocktails", text: "Espresso Martini variations and coffee-led signature serves." },
    ],
  },

  signatureCocktails: [
    { name: "Golden Hour", spirit: "Gin", description: "[PLACEHOLDER] Dry gin, chamomile cordial, citrus oils, clear ice.", image: cocktail1 },
    { name: "Island Ember", spirit: "Rum", description: "[PLACEHOLDER] Aged rum blend, pineapple, falernum, mint.", image: cocktail2 },
    { name: "Smoked Heritage", spirit: "Whiskey", description: "[PLACEHOLDER] Bourbon, demerara, aromatic bitters, oak smoke.", image: cocktail3 },
    { name: "Rose Riviera", spirit: "Gin", description: "[PLACEHOLDER] Pink gin, rose, lemon, egg-white silk.", image: cocktail4 },
  ],

  cocktailGallery: [
    { src: cocktail1, alt: "Clear stirred cocktail in gold-rimmed coupe with lemon twist", category: "Martini" },
    { src: cocktail2, alt: "Tiki cocktail in ceramic mug with mint and orchid", category: "Tiki" },
    { src: cocktail3, alt: "Smoked old fashioned with large ice cube and orange peel", category: "Whiskey" },
    { src: cocktail4, alt: "Pink gin cocktail in coupe with rose petals", category: "Signature" },
    { src: heroPoster, alt: "Bartender pouring a stirred cocktail into a crystal coupe", category: "Signature" },
  ],

  coffeeGallery: [
    { src: coffee1, alt: "Rosetta latte art in a black cup" },
    { src: coffee2, alt: "Barista pouring swan latte art" },
  ],

  highlights: [
    { year: "2024", title: "[PLACEHOLDER] Regional Cocktail Competition — Finalist" },
    { year: "2023", title: "[PLACEHOLDER] Launched award-nominated seasonal menu" },
    { year: "2022", title: "[PLACEHOLDER] Promoted to Head Bartender" },
    { year: "2021", title: "[PLACEHOLDER] Latte Art Throwdown — 1st Place" },
  ],

  certifications: [
    { name: "[PLACEHOLDER] WSET Level 2 Award in Spirits", issuer: "Wine & Spirit Education Trust", year: "2023" },
    { name: "[PLACEHOLDER] SCA Barista Skills — Intermediate", issuer: "Specialty Coffee Association", year: "2021" },
    { name: "[PLACEHOLDER] Food Safety & Hygiene Level 2", issuer: "Accredited Provider", year: "2022" },
    { name: "[PLACEHOLDER] Responsible Service of Alcohol", issuer: "Accredited Provider", year: "2020" },
  ],

  contact: {
    email: "hello@example.com", // [PLACEHOLDER]
    phone: "+00 000 000 000", // [PLACEHOLDER]
    whatsapp: "https://wa.me/0000000000", // [PLACEHOLDER] international number, digits only
    linkedin: "https://www.linkedin.com/in/your-profile", // [PLACEHOLDER]
    instagram: "https://www.instagram.com/your-profile", // [PLACEHOLDER]
    availability: "Open to full-time positions, seasonal contracts and private events.",
  },
} as const;

export const ENQUIRY_TYPES = ["Recruitment", "Event Booking", "Consulting", "Collaboration", "Other"] as const;
