/**
 * ALL EDITABLE WEBSITE CONTENT LIVES HERE.
 * Images: swap the files in src/assets (keep the same file names) or change the imports below.
 */
import cocktail1 from "@/assets/cocktail-1.jpg";
import cocktail2 from "@/assets/cocktail-2.jpg";
import cocktail3 from "@/assets/cocktail-3.jpg";
import cocktail4 from "@/assets/cocktail-4.jpg";
import coffee1 from "@/assets/coffee-1.jpg";
import coffee2 from "@/assets/coffee-2.jpg";
import portraitAsset from "@/assets/fazle-rabbi-portrait.jpg.asset.json";
import heroPoster from "@/assets/hero-poster.jpg";

export const site = {
  name: "Fazle Rabbi",
  title: "Professional Bartender | Barista | Mixologist",
  tagline: "Crafting Exceptional Experiences, One Drink at a Time.",
  siteUrl: "https://example.com", // Set to your live domain (used for SEO canonical link)
  location: "Limassol Marina, Cyprus",
  images: { heroPoster, portrait: portraitAsset.url },

  about: {
    heading: "Hospitality is a craft. Every guest, a story.",
    paragraphs: [
      "Customer-focused Bartender and Barista with over five years of hospitality experience across bars, restaurants, beach resorts and five-star hotels in Cyprus and Bangladesh.",
      "Skilled in classic and signature cocktails, specialty coffee, professional latte art, espresso machine operation and calibration, stock control and bar hygiene. Committed to consistent quality, efficient service and memorable guest experiences.",
      "Available for events and private bookings across Cyprus — from private parties and weddings to corporate, hotel, beach and marina events.",
    ],
    stats: [
      { value: "5+", label: "Years in hospitality" },
      { value: "6", label: "Venues" },
      { value: "2", label: "Countries" },
      { value: "5", label: "Trainings completed" },
    ],
  },

  experience: [
    { period: "June 2026 — Present", role: "Senior Bartender", venue: "Epsilon Restro Bar, Gazebo Mare — Limassol Marina, Cyprus", logos: ["/logos/epsilon-restro-bar.jpg", "/logos/gazebo-mare.jpg"], points: [
      "Prepare classic and signature cocktails with consistent quality and presentation.",
      "Handle high-volume service efficiently during busy beach and restaurant shifts.",
      "Maintain fast, accurate service throughout demanding night shifts.",
      "Keep the bar clean, organized and fully stocked throughout service.",
      "Serve cocktails, wines, beers and spirits efficiently during busy restaurant service.",
      "Coordinate with the floor team to ensure timely beverage service and smooth guest experiences.",
    ] },
    { period: "February 2026 — June 2026", role: "Senior Bartender", venue: "Flamingo Paradise Beach Hotel — Amphitrites Street, Protaras, Cyprus", logos: ["/logos/flamingo-paradise-beach-hotel.jpg"], points: [
      "Provide quality service across Pool Bar, Lobby Bar and Restaurant Bar.",
      "Prepare classic and signature cocktails to hotel standards.",
      "Deliver efficient service during busy shifts and peak hours.",
      "Maintain bar cleanliness, stock control and daily setup.",
      "Ensure proper glassware, garnishes and presentation for every beverage served.",
    ] },
    { period: "May 2025 — January 2026", role: "Bartender", venue: "O'Neill's Irish Pub and Restaurant — Tombs of the Kings Road, Paphos, Cyprus", logos: [], points: [
      "Prepare and serve classic cocktails, draught beers, spirits and other beverages.",
      "Operate beer taps and maintain proper pouring techniques and serving standards.",
      "Deliver friendly and efficient service in a lively, high-volume pub environment.",
      "Handle cash transactions, process payments and maintain billing accuracy.",
      "Manage busy evening shifts, bar stock and daily preparation.",
      "Maintain bar cleanliness, hygiene and a welcoming atmosphere for guests.",
    ] },
    { period: "October 2023 — April 2025", role: "Bartender", venue: "Sea Pearl Beach Resort and Spa — Jaliapalong, Cox's Bazar, Bangladesh", logos: ["/logos/sea-pearl-beach-resort-spa.jpg"], points: [
      "Prepare and serve classic cocktails, spirits, wines and other beverages.",
      "Provide professional service across Pool Bar, Lobby Bar and Restaurant Bar.",
      "Maintain beverage quality, presentation and guest satisfaction.",
      "Manage bar setup, stock control and daily operations.",
      "Maintain cleanliness, hygiene and proper bar organization.",
    ] },
    { period: "April 2021 — October 2023", role: "Barista / Bartender", venue: "The Westin Dhaka (Marriott International) — Gulshan Avenue, Dhaka, Bangladesh", logos: ["/logos/the-westin-dhaka-marriott.jpg"], points: [
      "Prepare espresso-based coffees, cappuccinos, lattes and other beverages.",
      "Craft classic cocktails, signature drinks and mocktails to hotel standards.",
      "Deliver professional beverage service with attention to quality and presentation.",
      "Operate espresso machines and bar equipment efficiently.",
      "Maintain beverage stock, bar setup and daily preparation.",
      "Ensure cleanliness, hygiene and excellent guest satisfaction.",
    ] },
    { period: "February 2019 — April 2021", role: "Barista", venue: "Sugar Boulangerie and Pâtisserie — Kolatoli, Hotel Motel Zone, Cox's Bazar, Bangladesh", logos: ["/logos/sugar-boulangerie-patisserie.jpg"], points: [
      "Prepare espresso, cappuccino, latte, flat white and specialty coffee beverages.",
      "Operate professional espresso machines and grinders with precision, adjusting grind size and extraction parameters.",
      "Demonstrate knowledge of coffee beans, origins, roast profiles, grinding and brewing methods.",
      "Prepare pour-over, French press, cold brew, iced coffee and other specialty brewing methods.",
    ] },
  ] as { period: string; role: string; venue: string; logos: string[]; points: string[] }[],

  skillGroups: [
    { title: "Bar & Mixology", skills: ["Advanced mixology", "Cocktail, mocktail and beverage recipes", "Extensive drink recipe knowledge and menu execution", "Bar inventory control", "Responsible alcohol service"] },
    { title: "Coffee & Barista", skills: ["Coffee beans and roasting", "Espresso machine calibration", "Manual and automated brewing", "Latte art and beverage presentation"] },
    { title: "Service & Operations", skills: ["Friendly customer service", "Service speed and accuracy", "Hygiene and safety compliance", "POS system and cash handling", "Conflict resolution and guest relations", "Time management", "Teamwork and collaboration in fast-paced environments"] },
  ],

  mixology: {
    intro: "Classic and signature cocktails prepared to hotel standards across pool, lobby, restaurant, pub and marina bars.",
    items: [
      { title: "Classic & Signature", text: "Classic and signature cocktails prepared with consistent quality and presentation." },
      { title: "Mocktails & Beverages", text: "Mocktails, wines, beers, draught and spirits served efficiently during busy service." },
      { title: "High-Volume Service", text: "Fast, accurate service through busy beach, restaurant, pub and night shifts." },
      { title: "Bar Operations", text: "Bar setup, stock control, glassware, garnishes, cleanliness and hygiene." },
    ],
  },

  coffee: {
    intro: "Specialty coffee preparation built on precise extraction and professional barista training.",
    items: [
      { title: "Espresso & Calibration", text: "Espresso machine and grinder operation, adjusting grind size and extraction parameters." },
      { title: "Milk & Latte Art", text: "Cappuccinos, lattes and flat whites finished with professional latte art." },
      { title: "Brew Methods", text: "Pour-over, French press, cold brew, iced coffee and other specialty methods." },
      { title: "Coffee Knowledge", text: "Coffee beans, origins, roast profiles, grinding and brewing methods." },
    ],
  },

  signatureCocktails: [
    { name: "Classic Cocktails", spirit: "Classics", description: "Classic cocktails prepared with consistent quality and presentation.", image: cocktail1 },
    { name: "Signature Drinks", spirit: "Signature", description: "Signature cocktails crafted to hotel standards.", image: cocktail2 },
    { name: "Spirits & Wines", spirit: "Bar service", description: "Cocktails, wines, beers and spirits served efficiently during busy service.", image: cocktail3 },
    { name: "Mocktails", spirit: "Zero proof", description: "Mocktails and beverages with attention to quality and presentation.", image: cocktail4 },
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
    { year: "5+", title: "Years of hospitality experience across Cyprus and Bangladesh" },
    { year: "2026", title: "Promoted to Senior Bartender in Cyprus — Flamingo Paradise Beach Hotel, then Epsilon Restro Bar, Gazebo Mare" },
    { year: "5★", title: "Worked in five-star hotel environments including The Westin Dhaka (Marriott) and Sea Pearl Beach Resort and Spa" },
    { year: "Pro", title: "Professional training with Monin Bangladesh and Northend Coffee Roasters" },
    { year: "Bars", title: "Experience across pool, lobby, restaurant, pub and marina bar formats" },
  ],

  certifications: [
    { name: "Basic Barista Training", issuer: "Northend Coffee Roasters", year: "June 2019" },
    { name: "Basic Bartender Training", issuer: "Monin Bangladesh", year: "March 2021" },
    { name: "In-House Bartending and Beverage Service Training", issuer: "The Westin Dhaka (Marriott)", year: "July 2022" },
    { name: "Professional Barista Training", issuer: "Northend Coffee Roasters", year: "December 2022" },
    { name: "Cocktail Craftsmanship and Mixology Training", issuer: "Sea Pearl Resort and Spa", year: "January 2024" },
  ],

  education: { name: "Higher Secondary Certificate (H.S.C.)", school: "Shariatpur Govt. College, Shariatpur Sadar, Bangladesh", years: "2019 — 2021" },
  languages: [
    { name: "Bangla", level: "Native" },
    { name: "English", level: "Advanced" },
    { name: "Hindi", level: "Upper-intermediate" },
  ],

  /**
   * Rolling strip under the hero. Real logo files live in public/logos/ (e.g. public/logos/gazebo-mare.jpg).
   * To add or swap one: drop the official file in that folder and set `logo: "/logos/file.jpg"`.
   * O'Neill's has no logo file yet, so an elegant text wordmark is shown there instead.
   * Never hotlink logos from other websites or draw imitations.
   */
  venues: [
    { name: "The Westin Dhaka (Marriott)", logo: "/logos/the-westin-dhaka-marriott.jpg" },
    { name: "Sea Pearl Beach Resort and Spa", logo: "/logos/sea-pearl-beach-resort-spa.jpg" },
    { name: "Flamingo Paradise Beach Hotel", logo: "/logos/flamingo-paradise-beach-hotel.jpg" },
    { name: "O'Neill's Irish Pub and Restaurant" },
    { name: "Epsilon Restro Bar, Gazebo Mare", logo: "/logos/epsilon-restro-bar.jpg" },
    { name: "Sugar Boulangerie and Pâtisserie", logo: "/logos/sugar-boulangerie-patisserie.jpg" },
  ] as { name: string; logo?: string }[],
  trainedWith: [
    { name: "Monin Bangladesh" },
    { name: "Northend Coffee Roasters" },
  ] as { name: string; logo?: string }[],

  events: {
    badge: "Available for events and private bookings in Cyprus",
    heading: "Available for Events",
    intro: "Hosting an event? I'd be glad to come and work it. I provide professional bartending and barista service for events across Cyprus, bringing hotel-standard cocktail craft, specialty coffee and warm, efficient guest service.",
    cards: [
      { title: "Bartender", text: "Classic and signature cocktails, mocktails, wines, beers and spirits — high-volume service from a clean, well-organised bar." },
      { title: "Barista", text: "Espresso-based coffee, cappuccinos and lattes finished with latte art, plus cold brew and iced coffee." },
      { title: "Bar and Service Standards", text: "Hygiene and safety compliance, responsible alcohol service, stock control and seamless teamwork with the floor team." },
    ],
    line: "Private parties, weddings, corporate and hotel events, beach and marina events. Share the date, venue and guest numbers, and I'll get back to you.",
  },

  contact: {
    email: "Fazlerabbe905@gmail.com",
    phone: "+357 95502363",
    whatsapp: "https://wa.me/35795502363",
    linkedin: "https://www.linkedin.com/in/fazle-rabbi-5785aa269",
    availability: "Based in Limassol Marina, Cyprus. Open to bartending, barista and mixology roles, and private events.",
  },
} as const;
export const ENQUIRY_TYPES = ["Recruitment", "Event booking", "Consulting", "Collaboration", "Other"] as const;
