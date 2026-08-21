import { queryRun, queryAll, initDb } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SEED_HOTELS = [
  {
    id: 'on-de-roof-chennai',
    name: 'On DE Roof Restaurant',
    tagline: 'Vibrant rooftop dining with panoramic views, Asian delicacies & signature sizzling bowls',
    cuisine: 'Indo-Chinese & Asian Fusion',
    price_range: '₹₹₹',
    price_level: 3,
    rating: 4.2,
    reviews_count: 3833,
    location: '3rd floor, 4, AA Block 2nd St, Lapis Lagoon, Shanthi Colony, Anna Nagar, Chennai, Tamil Nadu 600040',
    city: 'Chennai',
    distance_km: 1.8,
    lat: 13.0844506,
    lng: 80.2170742,
    phone_number: '+91 78453 94944',
    hours: {
      monday: '13:00-16:00, 18:30-02:00',
      tuesday: '13:00-16:00, 18:30-02:00',
      wednesday: '13:00-16:00, 18:30-02:00',
      thursday: '13:00-16:00, 18:30-02:00',
      friday: '13:00-16:00, 18:30-02:00',
      saturday: '13:00-16:00, 18:30-02:00',
      sunday: '13:00-16:00, 18:30-02:00'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=On+DE+Roof+Restaurant+Anna+Nagar+Chennai',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'medium',
    wait_estimate: '15-25 min',
    parties_in_queue: 2,
    opening_hours: '1:00 PM - 4:00 PM, 6:30 PM - 2:00 AM',
    ai_walk_in_prob: 65,
    sections: ['Sky Rooftop Deck', 'Lapis Lagoon Lounge', 'Asian Hearth'],
    hourly_crowd: [
      { time: '1 PM', level: 45 }, { time: '3 PM', level: 30 }, { time: '7 PM', level: 75 },
      { time: '9 PM', level: 92 }, { time: '11 PM', level: 85 }, { time: '1 AM', level: 60 }
    ],
    tables: [
      { id: 'ODR1', name: 'Rooftop Table 1', capacity: 2, section: 'Sky Rooftop Deck', status: 'available', shape: 'round' },
      { id: 'ODR2', name: 'Rooftop Table 2', capacity: 4, section: 'Sky Rooftop Deck', status: 'occupied', mins_remaining: 20, shape: 'rect' },
      { id: 'ODR3', name: 'Lapis Booth 1', capacity: 6, section: 'Lapis Lagoon Lounge', status: 'available', shape: 'booth' },
      { id: 'ODR4', name: 'Lagoon Table 4', capacity: 4, section: 'Lapis Lagoon Lounge', status: 'reserved', reservation_name: 'Shanthi Colony Group (8:30 PM)', shape: 'rect' },
      { id: 'ODR5', name: 'Hearth Table 5', capacity: 2, section: 'Asian Hearth', status: 'available', shape: 'round' }
    ],
    menu: [
      { id: 'odr1', category: 'Signature Indo-Chinese Starters', name: 'Wok Tossed Chilli Garlic Tiger Prawns', price: 580, desc: 'Crispy king prawns tossed with fresh scallions, crushed garlic, and aged dark soy glaze.', tags: ['chef', 'gf', 'spicy'] },
      { id: 'odr2', category: 'Signature Indo-Chinese Starters', name: 'Crispy Lotus Stem in Kashmiri Honey Chilli', price: 380, desc: 'Golden-fried lotus root glazed in Kashmiri chili honey and toasted sesame seeds.', tags: ['v', 'chef'] },
      { id: 'odr3', category: 'Signature Indo-Chinese Starters', name: 'Dragon Chicken Dumplings (6 pcs)', price: 420, desc: 'Steamed crystal dumplings with minced spicy chicken, ginger, and chili oil dip.', tags: ['chef', 'spicy'] },
      { id: 'odr4', category: 'Wok Specialties & Sizzlers', name: 'Schezwan Sizzling Claypot Rice', price: 460, desc: 'Aromatic Jasmine rice sizzling with wok veggies, paneer/chicken, and spicy Schezwan gravy.', tags: ['chef', 'spicy'] },
      { id: 'odr5', category: 'Wok Specialties & Sizzlers', name: 'Kung Pao Chicken with Cashews', price: 520, desc: 'Tender chicken cubes with dried red chilies, Sichuan pepper, and crunchy toasted cashews.', tags: ['chef'] },
      { id: 'odr6', category: 'Beverages & Desserts', name: 'Jasmine Boba Pearl Iced Tea', price: 220, desc: 'Chilled Taiwanese milk tea with fresh tapioca pearls and floral jasmine aroma.', tags: ['v'] }
    ]
  },
  {
    id: 'pumpkin-tales-alwarpet',
    name: 'Pumpkin Tales Restaurant - Alwarpet',
    tagline: 'Artisanal multi-cuisine breakfast, sourdough toasts, specialty coffees & global brunch',
    cuisine: 'Artisanal Cafe & Global Brunch',
    price_range: '₹₹',
    price_level: 2,
    rating: 4.6,
    reviews_count: 6797,
    location: 'First Floor, 37, Bheemanna Garden St, Sriram Colony, Alwarpet, Chennai, Tamil Nadu 600018',
    city: 'Chennai',
    distance_km: 2.1,
    lat: 13.0337519,
    lng: 80.2552267,
    phone_number: '+91 99529 96446',
    hours: {
      monday: '07:00-22:30',
      tuesday: '07:00-22:30',
      wednesday: '07:00-22:30',
      thursday: '07:00-22:30',
      friday: '07:00-22:30',
      saturday: '07:00-22:30',
      sunday: '07:00-22:30'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Pumpkin+Tales+Alwarpet+Chennai',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'high',
    wait_estimate: '20-30 min',
    parties_in_queue: 4,
    opening_hours: '7:00 AM - 10:30 PM',
    ai_walk_in_prob: 42,
    sections: ['Garden Courtyard', 'Bakehouse Hall', 'Verandah Booths'],
    hourly_crowd: [
      { time: '8 AM', level: 65 }, { time: '10 AM', level: 90 }, { time: '1 PM', level: 85 },
      { time: '4 PM', level: 55 }, { time: '7 PM', level: 88 }, { time: '9 PM', level: 70 }
    ],
    tables: [
      { id: 'PT1', name: 'Courtyard Table 1', capacity: 2, section: 'Garden Courtyard', status: 'available', shape: 'round' },
      { id: 'PT2', name: 'Courtyard Table 2', capacity: 4, section: 'Garden Courtyard', status: 'occupied', mins_remaining: 15, shape: 'rect' },
      { id: 'PT3', name: 'Bakehouse Booth', capacity: 4, section: 'Bakehouse Hall', status: 'reserved', reservation_name: 'Ananya & Friends (10:00 AM)', shape: 'booth' },
      { id: 'PT4', name: 'Verandah Table 1', capacity: 6, section: 'Verandah Booths', status: 'available', shape: 'rect' }
    ],
    menu: [
      { id: 'pt1', category: 'All-Day Breakfast & Sourdough', name: 'Smashed Avocado & Poached Eggs Sourdough', price: 450, desc: 'Hass avocado on toasted artisanal sourdough, free-range poached eggs, feta, and chili flakes.', tags: ['chef', 'v'] },
      { id: 'pt2', category: 'All-Day Breakfast & Sourdough', name: 'Artisanal Belgian Waffles with Berry Compote', price: 390, desc: 'Crispy fluffy waffles topped with warm mixed berries, maple syrup, and whipped mascarpone.', tags: ['v'] },
      { id: 'pt3', category: 'Global Mains & Bowls', name: 'Wild Mushroom & Truffle Oil Risotto', price: 540, desc: 'Creamy Arborio rice with porcini mushrooms, parmesan crisps, and white truffle aroma.', tags: ['v', 'gf', 'chef'] },
      { id: 'pt4', category: 'Global Mains & Bowls', name: 'Pumpkin & Roasted Almond Soup', price: 320, desc: 'Velvety roasted butternut squash soup garnished with toasted almonds and herb croutons.', tags: ['v', 'gf'] },
      { id: 'pt5', category: 'Specialty Coffee & Beverages', name: 'Nitro Cold Brew & Single Origin Pour-over', price: 260, desc: 'Smooth nitrogen-infused Arabica cold brew with natural creamy head.', tags: ['v', 'gf'] }
    ]
  },
  {
    id: 'sky-asian-dining-t-nagar',
    name: 'SKY - Curated Asian Dining',
    tagline: 'Luxury high-altitude Asian gastronomy, dim sum bar & bespoke cocktails at The Residency Towers',
    cuisine: 'Pan-Asian & Dim Sum Bar',
    price_range: '₹₹₹₹',
    price_level: 4,
    rating: 4.5,
    reviews_count: 649,
    location: 'The Residency Towers, 115, Sir Thyagaraya Rd, T. Nagar, Chennai, Tamil Nadu 600017',
    city: 'Chennai',
    distance_km: 1.2,
    lat: 13.0404583,
    lng: 80.2436779,
    phone_number: '+91 70101 23000',
    hours: {
      monday: '12:00-23:00',
      tuesday: '12:00-23:00',
      wednesday: '12:00-23:00',
      thursday: '12:00-23:00',
      friday: '12:00-23:00',
      saturday: '12:00-23:00',
      sunday: '12:00-23:00'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=SKY+Curated+Asian+Dining+The+Residency+Towers+T+Nagar+Chennai',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'medium',
    wait_estimate: '10-15 min',
    parties_in_queue: 1,
    opening_hours: '12:00 PM - 11:00 PM',
    ai_walk_in_prob: 75,
    sections: ['Skyline Glass Room', 'Teppanyaki Counter', 'Moonlight Terrace'],
    hourly_crowd: [
      { time: '12 PM', level: 35 }, { time: '2 PM', level: 55 }, { time: '7 PM', level: 70 },
      { time: '8 PM', level: 90 }, { time: '10 PM', level: 75 }
    ],
    tables: [
      { id: 'SKY1', name: 'Skyline Table 1', capacity: 2, section: 'Skyline Glass Room', status: 'available', shape: 'round' },
      { id: 'SKY2', name: 'Skyline Table 2', capacity: 4, section: 'Skyline Glass Room', status: 'occupied', mins_remaining: 18, shape: 'rect' },
      { id: 'SKY3', name: 'Teppanyaki Seat 1-4', capacity: 4, section: 'Teppanyaki Counter', status: 'available', shape: 'rect' },
      { id: 'SKY4', name: 'Moonlight VIP Terrace', capacity: 6, section: 'Moonlight Terrace', status: 'reserved', reservation_name: 'Dr. Subramanian (8:00 PM)', shape: 'booth' }
    ],
    menu: [
      { id: 'sky1', category: 'Dim Sum & Small Plates', name: 'Truffle Edamame Crystal Dim Sum', price: 620, desc: 'Delicate translucent parcels filled with steamed edamame, water chestnuts, and black truffle pate.', tags: ['v', 'chef'] },
      { id: 'sky2', category: 'Dim Sum & Small Plates', name: 'Prawn Har Gao with Gold Leaf', price: 720, desc: 'Steamed tiger prawn dumplings with bamboo shoots topped with edible 24k gold leaf.', tags: ['chef', 'gf'] },
      { id: 'sky3', category: 'Robata Grills & Curated Asian Mains', name: 'Norwegian Salmon Robata Teriyaki', price: 1250, desc: 'Charcoal-grilled Atlantic salmon glazed in house-made 12-year mirin teriyaki reduction.', tags: ['gf', 'chef'] },
      { id: 'sky4', category: 'Robata Grills & Curated Asian Mains', name: 'Thai Green Curry with Jasmine Fragrant Rice', price: 780, desc: 'Simmered in fresh galangal, kaffir lime, pea aubergines, and rich first-press coconut milk.', tags: ['v', 'gf'] },
      { id: 'sky5', category: 'Desserts & Mixology', name: 'Matcha Fondant Lava Cake', price: 480, desc: 'Warm green tea molten cake with black sesame ice cream and almond tuile.', tags: ['v'] }
    ]
  },
  {
    id: 'padmam-veg-t-nagar',
    name: 'Padmam Veg Restaurant',
    tagline: 'Authentic South Indian pure vegetarian culinary heritage, Ghee Podi dosas & traditional thalis',
    cuisine: 'Pure Vegetarian & South Indian Thali',
    price_range: '₹₹',
    price_level: 2,
    rating: 4.4,
    reviews_count: 4157,
    location: '18/54, Venkatanarayana Rd, T. Nagar, Chennai, Tamil Nadu 600017',
    city: 'Chennai',
    distance_km: 0.9,
    lat: 13.0365465,
    lng: 80.236093,
    phone_number: '+91 89398 08084',
    hours: {
      monday: '07:00-22:30',
      tuesday: '07:00-22:30',
      wednesday: '07:00-22:30',
      thursday: '07:00-22:30',
      friday: '07:00-22:30',
      saturday: '07:00-22:30',
      sunday: '07:00-22:30'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Padmam+Veg+Restaurant+Venkatanarayana+Rd+T+Nagar+Chennai',
    image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'high',
    wait_estimate: '15-20 min',
    parties_in_queue: 3,
    opening_hours: '7:00 AM - 10:30 PM',
    ai_walk_in_prob: 50,
    sections: ['Main AC Hall', 'Thali Section', 'Family Dining Floor'],
    hourly_crowd: [
      { time: '8 AM', level: 80 }, { time: '10 AM', level: 60 }, { time: '1 PM', level: 95 },
      { time: '4 PM', level: 50 }, { time: '8 PM', level: 90 }, { time: '10 PM', level: 45 }
    ],
    tables: [
      { id: 'PAD1', name: 'Main Hall Table 1', capacity: 2, section: 'Main AC Hall', status: 'available', shape: 'round' },
      { id: 'PAD2', name: 'Main Hall Table 2', capacity: 4, section: 'Main AC Hall', status: 'occupied', mins_remaining: 12, shape: 'rect' },
      { id: 'PAD3', name: 'Thali Table 1', capacity: 4, section: 'Thali Section', status: 'occupied', mins_remaining: 25, shape: 'rect' },
      { id: 'PAD4', name: 'Family Table 1', capacity: 6, section: 'Family Dining Floor', status: 'available', shape: 'rect' }
    ],
    menu: [
      { id: 'pad1', category: 'Tiffin & Dosai Specialties', name: 'Special Ghee Podi Masala Dosa', price: 180, desc: 'Crispy golden crepe roasted in pure cow ghee, coated with gun powder podi & potato masala.', tags: ['v', 'chef'] },
      { id: 'pad2', category: 'Tiffin & Dosai Specialties', name: 'Mini Ghee Sambar Idli (14 pcs)', price: 140, desc: 'Bite-sized soft steamed rice cakes immersed in piping hot Madras shallot sambar and melted ghee.', tags: ['v', 'chef'] },
      { id: 'pad3', category: 'Traditional South Indian Thalis', name: 'Padmam Royal South Indian Meals Thali', price: 320, desc: '14-item traditional feast with poriyal, kootu, avial, sambar, rasam, payasam, appalam & curd.', tags: ['v', 'chef'] },
      { id: 'pad4', category: 'Beverages & Sweets', name: 'Degree Filter Coffee in Brass Dabarah', price: 60, desc: 'Freshly brewed Kumbakonam roasted chicory blend frothed with full cream milk.', tags: ['v', 'gf'] }
    ]
  },
  {
    id: 'ignna-cocktail-bar-nungambakkam',
    name: 'IGNNA Cocktail Bar & Rooftop Restaurant - Sterling Road',
    tagline: 'Chic open-air rooftop bar, flame-grilled skewers & craft mixology overlooking Nungambakkam',
    cuisine: 'Chettinad Tacos & Charcoal Grill Bar',
    price_range: '₹₹₹',
    price_level: 3,
    rating: 4.4,
    reviews_count: 1047,
    location: '58, Sterling Rd, Nungambakkam, Chennai, Tamil Nadu 600034',
    city: 'Chennai',
    distance_km: 2.8,
    lat: 13.0643121,
    lng: 80.236816,
    phone_number: '+91 90476 43786',
    hours: {
      monday: '12:00-23:30',
      tuesday: '12:00-23:30',
      wednesday: '12:00-23:30',
      thursday: '12:00-23:30',
      friday: '12:00-23:30',
      saturday: '12:00-23:30',
      sunday: '12:00-23:30'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=IGNNA+Cocktail+Bar+Rooftop+Sterling+Rd+Nungambakkam+Chennai',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'medium',
    wait_estimate: '10-20 min',
    parties_in_queue: 2,
    opening_hours: '12:00 PM - 11:30 PM',
    ai_walk_in_prob: 68,
    sections: ['Rooftop Open Lounge', 'Bar High Tops', 'Sterling Deck'],
    hourly_crowd: [
      { time: '1 PM', level: 30 }, { time: '5 PM', level: 45 }, { time: '7 PM', level: 75 },
      { time: '9 PM', level: 95 }, { time: '11 PM', level: 80 }
    ],
    tables: [
      { id: 'IGN1', name: 'Rooftop Lounge 1', capacity: 2, section: 'Rooftop Open Lounge', status: 'available', shape: 'round' },
      { id: 'IGN2', name: 'Rooftop Lounge 2', capacity: 4, section: 'Rooftop Open Lounge', status: 'occupied', mins_remaining: 25, shape: 'rect' },
      { id: 'IGN3', name: 'Bar High Top 1', capacity: 2, section: 'Bar High Tops', status: 'available', shape: 'round' },
      { id: 'IGN4', name: 'Sterling VIP Deck', capacity: 8, section: 'Sterling Deck', status: 'reserved', reservation_name: 'Chennai Tech Meet (8:00 PM)', shape: 'booth' }
    ],
    menu: [
      { id: 'ign1', category: 'Charcoal Grills & Skewers', name: 'Chettinad Mutton Kari Sukka Tacos', price: 540, desc: 'Slow-roasted tender lamb in stone-ground Chettinad spices served in warm parotta tacos.', tags: ['chef', 'spicy'] },
      { id: 'ign2', category: 'Charcoal Grills & Skewers', name: 'Smoked Cottage Cheese Tikka Skewers', price: 420, desc: 'Charcoal-grilled paneer steaks with bell peppers and roasted cumin rub.', tags: ['v', 'gf'] },
      { id: 'ign3', category: 'Gourmet Mains & Sliders', name: 'Gunpowder Spiced Crispy Calamari', price: 480, desc: 'Golden squid rings tossed in spicy Madras gunpowder podi and curry leaf aioli.', tags: ['chef', 'spicy'] },
      { id: 'ign4', category: 'Signature Cocktails & Mocktails', name: 'Chennai Filter Coffee Whiskey Sour', price: 480, desc: 'Bourbon infused with freshly brewed South Indian peaberry decoction and nutmeg.', tags: ['chef'] }
    ]
  },
  {
    id: 'six-o-one-the-park',
    name: "Six 'O' One",
    tagline: 'Iconic 24-hour luxury dining, Mediterranean thin-crust pizzas, global buffet & midnight dessert bar',
    cuisine: '24/7 Mughlai Biryani & Global Buffet',
    price_range: '₹₹₹₹',
    price_level: 4,
    rating: 4.8,
    reviews_count: 2076,
    location: '601, Anna Salai, near US Embassy, Gangai Karai Puram, T. Nagar, Chennai, Tamil Nadu 600006',
    city: 'Chennai',
    distance_km: 1.5,
    lat: 13.0529021,
    lng: 80.2496841,
    phone_number: '+91 44 4267 6000',
    hours: {
      monday: 'Open 24 hours',
      tuesday: 'Open 24 hours',
      wednesday: 'Open 24 hours',
      thursday: 'Open 24 hours',
      friday: 'Open 24 hours',
      saturday: 'Open 24 hours',
      sunday: 'Open 24 hours'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Six+O+One+601+Anna+Salai+T+Nagar+Chennai',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'low',
    wait_estimate: 'Immediate (0-5 min)',
    parties_in_queue: 0,
    opening_hours: 'Open 24 hours',
    ai_walk_in_prob: 90,
    sections: ['24/7 Buffet Atrium', 'Wood-Fired Pizzeria', 'VIP Glass Lounge'],
    hourly_crowd: [
      { time: '1 AM', level: 40 }, { time: '8 AM', level: 60 }, { time: '1 PM', level: 80 },
      { time: '8 PM', level: 85 }, { time: '11 PM', level: 65 }
    ],
    tables: [
      { id: 'SO1', name: 'Atrium Table 1', capacity: 2, section: '24/7 Buffet Atrium', status: 'available', shape: 'round' },
      { id: 'SO2', name: 'Atrium Table 2', capacity: 4, section: '24/7 Buffet Atrium', status: 'available', shape: 'rect' },
      { id: 'SO3', name: 'Pizzeria Booth', capacity: 4, section: 'Wood-Fired Pizzeria', status: 'occupied', mins_remaining: 10, shape: 'booth' },
      { id: 'SO4', name: 'VIP Lounge Suite', capacity: 8, section: 'VIP Glass Lounge', status: 'available', shape: 'rect' }
    ],
    menu: [
      { id: 'so1', category: '24/7 Global Buffet & Italian', name: 'Grand Global Buffet Spread Experience', price: 1850, desc: 'Lavish spread with live sushi, Mediterranean counters, Indian claypots & dessert island.', tags: ['chef'] },
      { id: 'so2', category: '24/7 Global Buffet & Italian', name: 'Wood-Fired Burrata & Truffle Pizza', price: 890, desc: 'Handcrafted sourdough crust, San Marzano tomato sauce, fresh Puglia burrata, and truffle glaze.', tags: ['v', 'chef'] },
      { id: 'so3', category: 'Midnight Kitchen Specials', name: 'Dum Mutton Biryani with Mirchi Salan (24/7)', price: 750, desc: 'Slow-braised tender lamb dum biryani available round the clock with garlic raita.', tags: ['chef', 'gf', 'spicy'] },
      { id: 'so4', category: 'Desserts', name: 'Classic Venetian Tiramisu al Mascarpone', price: 450, desc: 'Espresso-soaked Savoiardi ladyfingers layered with rich Italian mascarpone cream.', tags: ['v'] }
    ]
  },
  {
    id: 'avartana-itc-grand-chola',
    name: 'Avartana',
    tagline: 'Progressive avant-garde South Indian culinary art, molecular textures & bespoke degustation menus',
    cuisine: 'South Indian Avant-Garde Fine Dining',
    price_range: '₹₹₹₹',
    price_level: 4,
    rating: 4.7,
    reviews_count: 4020,
    location: 'ITC Grand Chola, Little Mount, Guindy, Chennai, Tamil Nadu 600032',
    city: 'Chennai',
    distance_km: 3.5,
    lat: 13.010511,
    lng: 80.220708,
    phone_number: '+91 44 2220 0000',
    hours: {
      monday: '18:30-23:00',
      tuesday: '18:30-23:00',
      wednesday: '18:30-23:00',
      thursday: '18:30-23:00',
      friday: '18:30-23:00',
      saturday: '12:00-14:30, 18:30-23:00',
      sunday: '12:00-14:30, 18:30-23:00'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Avartana+ITC+Grand+Chola+Guindy+Chennai',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'high',
    wait_estimate: 'Prior Booking Required',
    parties_in_queue: 3,
    opening_hours: '6:30 PM - 11:00 PM (Lunch on Sat-Sun: 12:00 PM - 2:30 PM)',
    ai_walk_in_prob: 30,
    sections: ['The Tasting Salon', 'Banana Leaf Glass Room', 'Private Sommelier Suite'],
    hourly_crowd: [
      { time: '6 PM', level: 40 }, { time: '7 PM', level: 85 }, { time: '8 PM', level: 98 },
      { time: '9 PM', level: 95 }, { time: '10 PM', level: 60 }
    ],
    tables: [
      { id: 'AV1', name: 'Salon Table 1', capacity: 2, section: 'The Tasting Salon', status: 'occupied', mins_remaining: 35, shape: 'round' },
      { id: 'AV2', name: 'Salon Table 2', capacity: 2, section: 'The Tasting Salon', status: 'available', shape: 'round' },
      { id: 'AV3', name: 'Banana Leaf Table', capacity: 4, section: 'Banana Leaf Glass Room', status: 'reserved', reservation_name: 'Kapoor Degustation (7:30 PM)', shape: 'rect' },
      { id: 'AV4', name: 'Sommelier Suite', capacity: 6, section: 'Private Sommelier Suite', status: 'available', shape: 'rect' }
    ],
    menu: [
      { id: 'av1', category: 'Signature Degustation Menus', name: 'Maya 7-Course Avant-Garde South Indian Tasting', price: 3800, desc: 'Seven progressive courses blending southern spices with modern molecular gastronomy.', tags: ['chef', 'gf'] },
      { id: 'av2', category: 'Signature Degustation Menus', name: 'Anika 11-Course Grand Culinary Odyssey', price: 5800, desc: 'Eleven-course masterpiece including infused distilled rasam, lobster ghee roast, and raw mango sorbet.', tags: ['chef', 'gf'] },
      { id: 'av3', category: 'Avant-Garde Signatures', name: 'Distilled Tomato Rasam Infusion in French Press', price: 650, desc: 'Clarified aromatic heirloom tomato broth infused tableside with crushed coriander and pepper.', tags: ['v', 'gf', 'chef'] },
      { id: 'av4', category: 'Avant-Garde Signatures', name: 'Asparagus Coconut Spheres with Chili Crisp', price: 850, desc: 'Delicate coconut liquid sphere encapsulating spiced asparagus and tempered mustard seeds.', tags: ['v', 'gf'] }
    ]
  },
  {
    id: 'annalakshmi-restaurant-egmore',
    name: 'Annalakshmi Restaurant',
    tagline: 'Celebrated artistic pure vegetarian thali sanctuary, cultural ambiance & traditional heritage recipes',
    cuisine: 'Pure Vegetarian Grand Heritage Thali',
    price_range: '₹₹₹',
    price_level: 3,
    rating: 4.5,
    reviews_count: 12546,
    location: 'No 6 Mayor Ramanathan Salai, Spur Tank Road, Sulaiman Zackria Avenue, Egmore, Chennai, Tamil Nadu 600031',
    city: 'Chennai',
    distance_km: 3.2,
    lat: 13.0720701,
    lng: 80.252048,
    phone_number: '+91 94081 23333',
    hours: {
      monday: 'Closed',
      tuesday: '12:00-14:30, 19:00-21:00',
      wednesday: '12:00-14:30, 19:00-21:00',
      thursday: '12:00-14:30, 19:00-21:00',
      friday: '12:00-14:30, 19:00-21:00',
      saturday: '12:00-14:30, 19:00-21:00',
      sunday: '12:00-14:30, 19:00-22:00'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Annalakshmi+Restaurant+Spur+Tank+Road+Egmore+Chennai',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'medium',
    wait_estimate: '15-20 min',
    parties_in_queue: 2,
    opening_hours: 'Tue-Sun: 12:00 PM - 2:30 PM, 7:00 PM - 9:00 PM (Monday Closed)',
    ai_walk_in_prob: 60,
    sections: ['Temple Heritage Hall', 'Cultural Courtyard', 'Bhakti Dining Suite'],
    hourly_crowd: [
      { time: '12 PM', level: 40 }, { time: '1 PM', level: 85 }, { time: '2 PM', level: 60 },
      { time: '7 PM', level: 70 }, { time: '8 PM', level: 90 }, { time: '9 PM', level: 50 }
    ],
    tables: [
      { id: 'ANN1', name: 'Temple Hall Table 1', capacity: 4, section: 'Temple Heritage Hall', status: 'available', shape: 'rect' },
      { id: 'ANN2', name: 'Temple Hall Table 2', capacity: 6, section: 'Temple Heritage Hall', status: 'occupied', mins_remaining: 15, shape: 'rect' },
      { id: 'ANN3', name: 'Courtyard Table', capacity: 4, section: 'Cultural Courtyard', status: 'available', shape: 'round' },
      { id: 'ANN4', name: 'Bhakti Family Suite', capacity: 8, section: 'Bhakti Dining Suite', status: 'reserved', reservation_name: 'Ramanathan Family (1:00 PM)', shape: 'booth' }
    ],
    menu: [
      { id: 'ann1', category: 'Royal Pure Vegetarian Feast', name: 'Grand Annalakshmi Cultural Raja Bhojanam Thali', price: 650, desc: 'Lavish traditional South Indian platter with 16 royal delicacies served with care and love.', tags: ['v', 'chef'] },
      { id: 'ann2', category: 'Royal Pure Vegetarian Feast', name: 'Special Elaneer (Tender Coconut) Payasam', price: 180, desc: 'Exquisite dessert made of young tender coconut pulp, cardamom, cashew milk, and saffron.', tags: ['v', 'gf', 'chef'] },
      { id: 'ann3', category: 'Traditional Specialties', name: 'Authentic Mysore Bisi Bele Bath with Ghee', price: 220, desc: 'Spiced lentil and rice specialty tempered with whole cashews, shallots, and fragrant ghee.', tags: ['v', 'gf'] },
      { id: 'ann4', category: 'Traditional Specialties', name: 'Kashi Halwa with Roasted Dry Fruits', price: 160, desc: 'Traditional ash gourd dessert cooked in pure ghee with saffron and crushed pistachios.', tags: ['v', 'gf'] }
    ]
  }

  ,
  {
    id: 'sangeetha-veg-adyar',
    name: 'Sangeetha Veg Restaurant',
    tagline: 'Iconic South Indian vegetarian chain serving authentic filter coffee & dosas',
    cuisine: 'South Indian Vegetarian',
    price_range: '₹₹',
    price_level: 2,
    rating: 4.3,
    reviews_count: 5120,
    location: '1st Main Rd, Gandhi Nagar, Adyar, Chennai, Tamil Nadu 600020',
    city: 'Chennai',
    distance_km: 4.2,
    lat: 13.0068,
    lng: 80.2575,
    phone_number: '+91 44 2445 1458',
    hours: {
      monday: '07:00-22:30',
      tuesday: '07:00-22:30',
      wednesday: '07:00-22:30',
      thursday: '07:00-22:30',
      friday: '07:00-22:30',
      saturday: '07:00-22:30',
      sunday: '07:00-22:30'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Sangeetha+Veg+Restaurant+Adyar+Chennai',
    image: 'https://images.unsplash.com/photo-1610192773928-7692540a4505?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'high',
    wait_estimate: '15-20 min',
    parties_in_queue: 3,
    opening_hours: '7:00 AM - 10:30 PM',
    ai_walk_in_prob: 50,
    sections: ['Ground Floor AC', 'Family Section'],
    hourly_crowd: [
      { time: '8 AM', level: 90 }, { time: '1 PM', level: 95 }, { time: '8 PM', level: 85 }
    ],
    tables: [
      { id: 'SVA1', name: 'GF Table 1', capacity: 2, section: 'Ground Floor AC', status: 'cleaning', mins_remaining: 5, shape: 'round' },
      { id: 'SVA2', name: 'GF Table 2', capacity: 4, section: 'Ground Floor AC', status: 'occupied', mins_remaining: 15, shape: 'rect' },
      { id: 'SVA3', name: 'Family Table 1', capacity: 6, section: 'Family Section', status: 'available', shape: 'rect' }
    ],
    menu: [
      { id: 'sva1', category: 'Dosas', name: 'Ghee Roast Dosa', price: 120, desc: 'Crispy dosa roasted with pure ghee.', tags: ['v'] },
      { id: 'sva2', category: 'Meals', name: 'South Indian Mini Meals', price: 180, desc: 'Traditional thali with rice, sambar, rasam, and veggies.', tags: ['v'] }
    ]
  },
  {
    id: 'coal-barbecues-velachery',
    name: 'Coal Barbecues',
    tagline: 'Premium live grill on table with expansive global buffet',
    cuisine: 'Barbecue & North Indian Buffet',
    price_range: '₹₹₹',
    price_level: 3,
    rating: 4.6,
    reviews_count: 8500,
    location: '1st Floor, 18, 100 Feet Bypass Rd, Velachery, Chennai, Tamil Nadu 600042',
    city: 'Chennai',
    distance_km: 7.5,
    lat: 12.9800,
    lng: 80.2223,
    phone_number: '+91 44 4350 7878',
    hours: {
      monday: '12:00-15:30, 18:30-23:00',
      tuesday: '12:00-15:30, 18:30-23:00',
      wednesday: '12:00-15:30, 18:30-23:00',
      thursday: '12:00-15:30, 18:30-23:00',
      friday: '12:00-15:30, 18:30-23:00',
      saturday: '12:00-15:30, 18:30-23:00',
      sunday: '12:00-15:30, 18:30-23:00'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Coal+Barbecues+Velachery+Chennai',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'high',
    wait_estimate: '30-45 min',
    parties_in_queue: 5,
    opening_hours: '12:00 PM - 3:30 PM, 6:30 PM - 11:00 PM',
    ai_walk_in_prob: 20,
    sections: ['Grill Zone', 'Live Counters'],
    hourly_crowd: [
      { time: '1 PM', level: 95 }, { time: '8 PM', level: 100 }, { time: '9 PM', level: 90 }
    ],
    tables: [
      { id: 'CB1', name: 'Grill Table 1', capacity: 4, section: 'Grill Zone', status: 'reserved', reservation_name: 'Birthday Party (8:00 PM)', shape: 'rect' },
      { id: 'CB2', name: 'Grill Table 2', capacity: 8, section: 'Grill Zone', status: 'cleaning', mins_remaining: 10, shape: 'rect' }
    ],
    menu: [
      { id: 'cb1', category: 'Buffet', name: 'Non-Veg Dinner Buffet', price: 950, desc: 'Unlimited grills, main course and desserts.', tags: ['chef'] },
      { id: 'cb2', category: 'Buffet', name: 'Veg Dinner Buffet', price: 850, desc: 'Unlimited veg grills, main course and desserts.', tags: ['v'] }
    ]
  },
  {
    id: 'murugan-idli-shop-besant-nagar',
    name: 'Murugan Idli Shop',
    tagline: 'World famous soft idlis and signature chutneys',
    cuisine: 'South Indian Vegetarian',
    price_range: '₹₹',
    price_level: 2,
    rating: 4.4,
    reviews_count: 6300,
    location: 'E 149/1, 2nd Avenue, Besant Nagar, Chennai, Tamil Nadu 600090',
    city: 'Chennai',
    distance_km: 5.8,
    lat: 13.0002,
    lng: 80.2736,
    phone_number: '+91 44 2446 6699',
    hours: {
      monday: '07:00-23:00',
      tuesday: '07:00-23:00',
      wednesday: '07:00-23:00',
      thursday: '07:00-23:00',
      friday: '07:00-23:00',
      saturday: '07:00-23:00',
      sunday: '07:00-23:00'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Murugan+Idli+Shop+Besant+Nagar+Chennai',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'medium',
    wait_estimate: '10-15 min',
    parties_in_queue: 1,
    opening_hours: '7:00 AM - 11:00 PM',
    ai_walk_in_prob: 70,
    sections: ['Main Hall', 'Beach View AC'],
    hourly_crowd: [
      { time: '9 AM', level: 80 }, { time: '7 PM', level: 85 }
    ],
    tables: [
      { id: 'MIS1', name: 'Hall Table 1', capacity: 2, section: 'Main Hall', status: 'available', shape: 'rect' },
      { id: 'MIS2', name: 'Hall Table 2', capacity: 4, section: 'Main Hall', status: 'occupied', mins_remaining: 10, shape: 'rect' },
      { id: 'MIS3', name: 'Beach View 1', capacity: 4, section: 'Beach View AC', status: 'cleaning', mins_remaining: 2, shape: 'rect' }
    ],
    menu: [
      { id: 'mis1', category: 'Idli', name: 'Malligai Poo Idli', price: 40, desc: 'Steamed soft idlis served with 4 signature chutneys.', tags: ['v'] },
      { id: 'mis2', category: 'Drinks', name: 'Jigarthanda', price: 110, desc: 'Famous Madurai cold beverage with almond gum, sarsaparilla syrup and ice cream.', tags: ['v'] }
    ]
  },
  {
    id: 'karpambal-mess-mylapore',
    name: 'Karpambal Mess',
    tagline: 'Traditional homely Brahmin food since 1953',
    cuisine: 'South Indian Vegetarian',
    price_range: '₹',
    price_level: 1,
    rating: 4.5,
    reviews_count: 2100,
    location: '20, East Mada Street, Mylapore, Chennai, Tamil Nadu 600004',
    city: 'Chennai',
    distance_km: 3.1,
    lat: 13.0336,
    lng: 80.2694,
    phone_number: '+91 44 2461 4623',
    hours: {
      monday: '06:30-22:00',
      tuesday: '06:30-22:00',
      wednesday: '06:30-22:00',
      thursday: '06:30-22:00',
      friday: '06:30-22:00',
      saturday: '06:30-22:00',
      sunday: '06:30-22:00'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Karpambal+Mess+Mylapore+Chennai',
    image: 'https://images.unsplash.com/photo-1543826173-70651703c5a4?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'high',
    wait_estimate: '20-25 min',
    parties_in_queue: 4,
    opening_hours: '6:30 AM - 10:00 PM',
    ai_walk_in_prob: 40,
    sections: ['Dining Area'],
    hourly_crowd: [
      { time: '7 AM', level: 95 }, { time: '1 PM', level: 90 }, { time: '6 PM', level: 85 }
    ],
    tables: [
      { id: 'KM1', name: 'Table 1', capacity: 4, section: 'Dining Area', status: 'occupied', mins_remaining: 5, shape: 'rect' },
      { id: 'KM2', name: 'Table 2', capacity: 2, section: 'Dining Area', status: 'cleaning', mins_remaining: 3, shape: 'rect' }
    ],
    menu: [
      { id: 'km1', category: 'Tiffin', name: 'Keerai Vadai', price: 30, desc: 'Crispy lentil donut mixed with healthy greens.', tags: ['v'] },
      { id: 'km2', category: 'Sweets', name: 'Badam Halwa', price: 90, desc: 'Rich almond pudding cooked in ghee.', tags: ['v'] }
    ]
  },
  {
    id: 'savya-rasa-omr',
    name: 'Savya Rasa',
    tagline: 'A journey through the culinary heritage of South India',
    cuisine: 'South Indian Fine Dining',
    price_range: '₹₹₹₹',
    price_level: 4,
    rating: 4.7,
    reviews_count: 3200,
    location: '18, OMR Road, Thuraipakkam, Chennai, Tamil Nadu 600097',
    city: 'Chennai',
    distance_km: 12.4,
    lat: 12.9348,
    lng: 80.2307,
    phone_number: '+91 99401 54722',
    hours: {
      monday: '12:00-15:30, 19:00-23:00',
      tuesday: '12:00-15:30, 19:00-23:00',
      wednesday: '12:00-15:30, 19:00-23:00',
      thursday: '12:00-15:30, 19:00-23:00',
      friday: '12:00-15:30, 19:00-23:00',
      saturday: '12:00-15:30, 19:00-23:00',
      sunday: '12:00-15:30, 19:00-23:00'
    },
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Savya+Rasa+OMR+Chennai',
    image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=800&q=80',
    crowd_level: 'medium',
    wait_estimate: 'Prior Booking Recommended',
    parties_in_queue: 1,
    opening_hours: '12:00 PM - 3:30 PM, 7:00 PM - 11:00 PM',
    ai_walk_in_prob: 50,
    sections: ['Kongunadu Heritage Room', 'Chettinad Hall'],
    hourly_crowd: [
      { time: '1 PM', level: 75 }, { time: '8 PM', level: 85 }
    ],
    tables: [
      { id: 'SR1', name: 'Heritage Table 1', capacity: 4, section: 'Kongunadu Heritage Room', status: 'available', shape: 'round' },
      { id: 'SR2', name: 'Chettinad Booth', capacity: 6, section: 'Chettinad Hall', status: 'reserved', reservation_name: 'Dr. Ramesh (8:30 PM)', shape: 'booth' }
    ],
    menu: [
      { id: 'sr1', category: 'Starters', name: 'Kodi Vepudu', price: 420, desc: 'Spicy Andhra style chicken dry roast.', tags: ['chef', 'spicy'] },
      { id: 'sr2', category: 'Mains', name: 'Pallipalayam Mutton', price: 650, desc: 'Traditional Erode style tender mutton curry with coconut pieces.', tags: ['chef'] }
    ]
  }
];

export const seedDatabase = async () => {
  console.log('🌱 Dropping and Recreating Database with Chennai Restaurants & Real Location Data...');

  // Drop tables in FK-safe order (child tables first)
  // PRAGMA foreign_keys is ON — order matters
  await queryRun('DROP TABLE IF EXISTS reservations');
  await queryRun('DROP TABLE IF EXISTS menu_items');
  await queryRun('DROP TABLE IF EXISTS `tables`');
  await queryRun('DROP TABLE IF EXISTS users');
  await queryRun('DROP TABLE IF EXISTS orders');
  await queryRun('DROP TABLE IF EXISTS riders');
  await queryRun('DROP TABLE IF EXISTS restaurants');
  await queryRun('DROP TABLE IF EXISTS marketplace_settings');

  await initDb(true);



  for (const rest of SEED_HOTELS) {
    await queryRun(
      `INSERT INTO restaurants (id, name, tagline, cuisine, price_range, price_level, rating, reviews_count, location, city, distance_km, lat, lng, phone_number, hours_json, google_maps_url, image, crowd_level, wait_estimate, parties_in_queue, opening_hours, ai_walk_in_prob, sections_json, hourly_crowd_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rest.id,
        rest.name,
        rest.tagline,
        rest.cuisine,
        rest.price_range,
        rest.price_level || 2,
        rest.rating,
        rest.reviews_count,
        rest.location,
        rest.city,
        rest.distance_km,
        rest.lat,
        rest.lng,
        rest.phone_number || '',
        JSON.stringify(rest.hours || {}),
        rest.google_maps_url,
        rest.image,
        rest.crowd_level,
        rest.wait_estimate,
        rest.parties_in_queue,
        rest.opening_hours,
        rest.ai_walk_in_prob,
        JSON.stringify(rest.sections),
        JSON.stringify(rest.hourly_crowd)
      ]
    );

    for (const table of rest.tables) {
      await queryRun(
        `INSERT INTO \`tables\` (id, restaurant_id, name, capacity, section, status, mins_remaining, shape, reservation_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          table.id,
          rest.id,
          table.name,
          table.capacity,
          table.section,
          table.status,
          table.mins_remaining || null,
          table.shape || 'rect',
          table.reservation_name || null
        ]
      );
    }

    for (const item of rest.menu) {
      await queryRun(
        `INSERT INTO menu_items (id, restaurant_id, category, name, price, description, tags_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          rest.id,
          item.category,
          item.name,
          item.price,
          item.desc,
          JSON.stringify(item.tags || [])
        ]
      );
    }
  }

  const customerHash = await bcrypt.hash('password', 10);
  const adminHash = await bcrypt.hash('admin123', 10);
  const user123Hash = await bcrypt.hash('user123', 10);
  const owner123Hash = await bcrypt.hash('owner123', 10);

  await queryRun(
    `INSERT INTO users (id, name, email, role, password_hash, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['user-1', 'Rajesh Kapoor', 'rajesh.kapoor@example.com', 'customer', customerHash, null]
  );
  await queryRun(
    `INSERT INTO users (id, name, email, role, password_hash, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['user-admin-1', 'Avartana General Manager', 'admin@itcgrandchola.com', 'admin', adminHash, 'avartana-itc-grand-chola']
  );

  // Standard Demo Accounts
  await queryRun(
    `INSERT INTO users (id, name, email, role, password_hash, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['demo-user', 'Hema Sundar (Verified Diner)', 'user@example.com', 'customer', user123Hash, null]
  );
  await queryRun(
    `INSERT INTO users (id, name, email, role, password_hash, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['demo-owner', 'Sundhara Pandian (Owner)', 'owner@restaurant.com', 'owner', owner123Hash, 'on-de-roof-chennai']
  );
  await queryRun(
    `INSERT INTO users (id, name, email, role, password_hash, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['demo-admin', 'Platform Super Admin', 'admin@smarttable.ai', 'admin', adminHash, null]
  );

  // Initial Sample Reservation
  await queryRun(
    `INSERT INTO reservations (id, restaurant_id, restaurant_name, table_id, table_name, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status, order_status, special_requests, pre_ordered_items_json, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'RES-8921',
      'avartana-itc-grand-chola',
      'Avartana',
      'AV3',
      'Banana Leaf Table (4 guests)',
      'Rajesh Kapoor',
      'rajesh.kapoor@example.com',
      '+91 98201 23456',
      4,
      '2026-08-14',
      '19:30',
      'Confirmed',
      'Preparing',
      'Anniversary tasting menu celebration (mild spice)',
      JSON.stringify([
        { id: 'av1', name: 'Maya 7-Course Avant-Garde South Indian Tasting', qty: 2, price: 3800 },
        { id: 'av3', name: 'Distilled Tomato Rasam Infusion in French Press', qty: 2, price: 650 }
      ]),
      'SMART-TABLE-RES-8921-AV'
    ]
  );

  // Additional Sample Users
  await queryRun(
    `INSERT INTO users (id, name, email, role, password_hash, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['user-2', 'Priya Raman', 'priya.raman@example.com', 'customer', customerHash, null]
  );
  await queryRun(
    `INSERT INTO users (id, name, email, role, password_hash, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['user-3', 'Sathish Kumar', 'sathish.k@example.com', 'customer', customerHash, null]
  );
  await queryRun(
    `INSERT INTO users (id, name, email, role, password_hash, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['rider-1', 'Murugan R', 'murugan.r@example.com', 'rider', customerHash, null]
  );
  await queryRun(
    `INSERT INTO users (id, name, email, role, password_hash, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['restaurant-admin-2', 'Sangeetha Manager', 'admin@sangeethaadyar.com', 'admin', adminHash, 'sangeetha-veg-adyar']
  );

  // Additional Reservations
  await queryRun(
    `INSERT INTO reservations (id, restaurant_id, restaurant_name, table_id, table_name, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status, order_status, special_requests, pre_ordered_items_json, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'RES-1002',
      'coal-barbecues-velachery',
      'Coal Barbecues',
      'CB1',
      'Grill Table 1 (4 guests)',
      'Sathish Kumar',
      'sathish.k@example.com',
      '+91 99444 55666',
      4,
      '2026-08-20',
      '20:00',
      'Confirmed',
      'Received',
      'Birthday celebration, please arrange a small cake',
      JSON.stringify([
        { id: 'cb1', name: 'Non-Veg Dinner Buffet', qty: 4, price: 950 }
      ]),
      'SMART-TABLE-RES-1002-CB'
    ]
  );

  await queryRun(
    `INSERT INTO reservations (id, restaurant_id, restaurant_name, table_id, table_name, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status, order_status, special_requests, pre_ordered_items_json, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'RES-1003',
      'savya-rasa-omr',
      'Savya Rasa',
      'SR2',
      'Chettinad Booth (6 guests)',
      'Dr. Ramesh',
      'ramesh.dr@example.com',
      '+91 98888 77777',
      6,
      '2026-08-19',
      '20:30',
      'Confirmed',
      'Preparing',
      'Corner table preferred',
      JSON.stringify([]),
      'SMART-TABLE-RES-1003-SR'
    ]
  );

  // Sample Riders
  await queryRun(
    `INSERT INTO riders (id, name, phone, vehicle, status, cluster_zone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['RIDER-001', 'Murugan R', '+91 98765 43210', 'TN 01 AB 1234 (Honda Activa)', 'available', 'T. Nagar']
  );
  await queryRun(
    `INSERT INTO riders (id, name, phone, vehicle, status, cluster_zone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['RIDER-002', 'Dinesh S', '+91 87654 32109', 'TN 09 XY 9876 (TVS Jupiter)', 'on-trip', 'Anna Nagar']
  );

  // Sample Orders
  await queryRun(
    `INSERT INTO orders (id, restaurant_id, restaurant_name, fulfillment_type, guest_name, guest_email, guest_phone, status, order_status, delivery_address, delivery_distance_km, delivery_eta_mins, item_total, grand_total, rider_id, rider_name, pre_ordered_items_json, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ORD-5501',
      'pumpkin-tales-alwarpet',
      'Pumpkin Tales Restaurant - Alwarpet',
      'delivery',
      'Priya Raman',
      'priya.raman@example.com',
      '+91 90000 11111',
      'Confirmed',
      'Out for Delivery',
      '14, Poes Garden, Chennai, Tamil Nadu 600086',
      1.5,
      12,
      840.00,
      880.00,
      'RIDER-002',
      'Dinesh S',
      JSON.stringify([
        { id: 'pt1', name: 'Smashed Avocado & Poached Eggs Sourdough', qty: 1, price: 450 },
        { id: 'pt2', name: 'Artisanal Belgian Waffles with Berry Compote', qty: 1, price: 390 }
      ]),
      'SMART-TABLE-ORD-5501-PT'
    ]
  );
  await queryRun(
    `INSERT INTO orders (id, restaurant_id, restaurant_name, fulfillment_type, table_id, table_name, guest_name, guest_email, guest_phone, status, order_status, item_total, grand_total, pre_ordered_items_json, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ORD-5502',
      'sangeetha-veg-adyar',
      'Sangeetha Veg Restaurant',
      'dine-in',
      'SVA2',
      'GF Table 2 (4 guests)',
      'Vikram K',
      'vikram.k@example.com',
      '+91 91111 22222',
      'Confirmed',
      'Served',
      300.00,
      315.00,
      JSON.stringify([
        { id: 'sva1', name: 'Ghee Roast Dosa', qty: 1, price: 120 },
        { id: 'sva2', name: 'South Indian Mini Meals', qty: 1, price: 180 }
      ]),
      'SMART-TABLE-ORD-5502-SV'
    ]
  );

  console.log('✅ MySQL Database seeded successfully with Chennai Restaurants & Google Maps Links!');
};

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
