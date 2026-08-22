// Authentic Chennai Restaurants Dataset with Precise GPS Coordinates, Phone Numbers, Operating Hours & Google Maps

export const INITIAL_RESTAURANTS = [
  {
    id: 'on-de-roof-chennai',
    name: 'On DE Roof Restaurant',
    tagline: 'Vibrant rooftop dining with panoramic views, Asian delicacies & signature sizzling bowls',
    cuisine: 'Indo-Chinese & Asian Fusion',
    cuisineTag: 'indo_chinese',
    isPureVeg: false,
    cuisineHighlights: ['Crispy Lotus Stem', 'Dragon Chicken', 'Schezwan Sizzlers'],
    priceRange: '₹₹₹',
    priceLevel: 3,
    rating: 4.2,
    reviewsCount: 3833,
    location: '3rd floor, 4, AA Block 2nd St, Lapis Lagoon, Shanthi Colony, Anna Nagar, Chennai, Tamil Nadu 600040',
    city: 'Chennai',
    distanceKm: 1.8,
    lat: 13.0844506,
    lng: 80.2170742,
    phoneNumber: '+91 78453 94944',
    hours: {
      monday: '13:00-16:00, 18:30-02:00',
      tuesday: '13:00-16:00, 18:30-02:00',
      wednesday: '13:00-16:00, 18:30-02:00',
      thursday: '13:00-16:00, 18:30-02:00',
      friday: '13:00-16:00, 18:30-02:00',
      saturday: '13:00-16:00, 18:30-02:00',
      sunday: '13:00-16:00, 18:30-02:00'
    },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=On+DE+Roof+Restaurant+Anna+Nagar+Chennai',
    image: '/luxury_rooftop_dining.jpg',
    crowdLevel: 'medium',
    waitEstimate: '15-25 min',
    partiesInQueue: 2,
    openingHours: '1:00 PM - 4:00 PM, 6:30 PM - 2:00 AM',
    aiWalkInProbability: 65,
    sections: ['Sky Rooftop Deck', 'Lapis Lagoon Lounge', 'Asian Hearth'],
    menu: [
      {
        category: 'Signature Indo-Chinese Starters',
        items: [
          { id: 'odr1', name: 'Wok Tossed Chilli Garlic Tiger Prawns', price: 580, desc: 'Crispy king prawns tossed with fresh scallions, crushed garlic, and aged dark soy glaze.', tags: ['chef', 'gf', 'spicy'] },
          { id: 'odr2', name: 'Crispy Lotus Stem in Kashmiri Honey Chilli', price: 380, desc: 'Golden-fried lotus root glazed in Kashmiri chili honey and toasted sesame seeds.', tags: ['v', 'chef'] },
          { id: 'odr3', name: 'Dragon Chicken Dumplings (6 pcs)', price: 420, desc: 'Steamed crystal dumplings with minced spicy chicken, ginger, and chili oil dip.', tags: ['chef', 'spicy'] }
        ]
      },
      {
        category: 'Wok Specialties & Sizzlers',
        items: [
          { id: 'odr4', name: 'Schezwan Sizzling Claypot Rice', price: 460, desc: 'Aromatic Jasmine rice sizzling with wok veggies, paneer/chicken, and spicy Schezwan gravy.', tags: ['chef', 'spicy'] },
          { id: 'odr5', name: 'Kung Pao Chicken with Cashews', price: 520, desc: 'Tender chicken cubes with dried red chilies, Sichuan pepper, and crunchy toasted cashews.', tags: ['chef'] }
        ]
      },
      {
        category: 'Beverages & Desserts',
        items: [
          { id: 'odr6', name: 'Jasmine Boba Pearl Iced Tea', price: 220, desc: 'Chilled Taiwanese milk tea with fresh tapioca pearls and floral jasmine aroma.', tags: ['v'] }
        ]
      }
    ],
    tables: [
      { id: 'ODR1', name: 'Rooftop Table 1', capacity: 2, section: 'Sky Rooftop Deck', status: 'available', shape: 'round' },
      { id: 'ODR2', name: 'Rooftop Table 2', capacity: 4, section: 'Sky Rooftop Deck', status: 'occupied', minsRemaining: 20, shape: 'rect' },
      { id: 'ODR3', name: 'Lapis Booth 1', capacity: 6, section: 'Lapis Lagoon Lounge', status: 'available', shape: 'booth' },
      { id: 'ODR4', name: 'Lagoon Table 4', capacity: 4, section: 'Lapis Lagoon Lounge', status: 'reserved', reservationName: 'Shanthi Colony Group (8:30 PM)', shape: 'rect' },
      { id: 'ODR5', name: 'Hearth Table 5', capacity: 2, section: 'Asian Hearth', status: 'available', shape: 'round' }
    ],
    hourlyCrowdForecast: [
      { time: '1 PM', level: 45 }, { time: '3 PM', level: 30 }, { time: '7 PM', level: 75 },
      { time: '9 PM', level: 92 }, { time: '11 PM', level: 85 }, { time: '1 AM', level: 60 }
    ]
  },
  {
    id: 'pumpkin-tales-alwarpet',
    name: 'Pumpkin Tales Restaurant - Alwarpet',
    tagline: 'Artisanal multi-cuisine breakfast, sourdough toasts, specialty coffees & global brunch',
    cuisine: 'Artisanal Cafe & Global Brunch',
    cuisineTag: 'artisanal_cafe',
    isPureVeg: false,
    cuisineHighlights: ['Sourdough Toasts', 'Truffle Risotto', 'Nitro Cold Brew'],
    priceRange: '₹₹',
    priceLevel: 2,
    rating: 4.6,
    reviewsCount: 6797,
    location: 'First Floor, 37, Bheemanna Garden St, Sriram Colony, Alwarpet, Chennai, Tamil Nadu 600018',
    city: 'Chennai',
    distanceKm: 2.1,
    lat: 13.0337519,
    lng: 80.2552267,
    phoneNumber: '+91 99529 96446',
    hours: {
      monday: '07:00-22:30',
      tuesday: '07:00-22:30',
      wednesday: '07:00-22:30',
      thursday: '07:00-22:30',
      friday: '07:00-22:30',
      saturday: '07:00-22:30',
      sunday: '07:00-22:30'
    },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pumpkin+Tales+Alwarpet+Chennai',
    image: '/artisanal_cafe_interior.jpg',
    crowdLevel: 'high',
    waitEstimate: '20-30 min',
    partiesInQueue: 4,
    openingHours: '7:00 AM - 10:30 PM',
    aiWalkInProbability: 42,
    sections: ['Garden Courtyard', 'Bakehouse Hall', 'Verandah Booths'],
    menu: [
      {
        category: 'All-Day Breakfast & Sourdough',
        items: [
          { id: 'pt1', name: 'Smashed Avocado & Poached Eggs Sourdough', price: 450, desc: 'Hass avocado on toasted artisanal sourdough, free-range poached eggs, feta, and chili flakes.', tags: ['chef', 'v'] },
          { id: 'pt2', name: 'Artisanal Belgian Waffles with Berry Compote', price: 390, desc: 'Crispy fluffy waffles topped with warm mixed berries, maple syrup, and whipped mascarpone.', tags: ['v'] }
        ]
      },
      {
        category: 'Global Mains & Bowls',
        items: [
          { id: 'pt3', name: 'Wild Mushroom & Truffle Oil Risotto', price: 540, desc: 'Creamy Arborio rice with porcini mushrooms, parmesan crisps, and white truffle aroma.', tags: ['v', 'gf', 'chef'] },
          { id: 'pt4', name: 'Pumpkin & Roasted Almond Soup', price: 320, desc: 'Velvety roasted butternut squash soup garnished with toasted almonds and herb croutons.', tags: ['v', 'gf'] }
        ]
      },
      {
        category: 'Specialty Coffee & Beverages',
        items: [
          { id: 'pt5', name: 'Nitro Cold Brew & Single Origin Pour-over', price: 260, desc: 'Smooth nitrogen-infused Arabica cold brew with natural creamy head.', tags: ['v', 'gf'] }
        ]
      }
    ],
    tables: [
      { id: 'PT1', name: 'Courtyard Table 1', capacity: 2, section: 'Garden Courtyard', status: 'available', shape: 'round' },
      { id: 'PT2', name: 'Courtyard Table 2', capacity: 4, section: 'Garden Courtyard', status: 'occupied', minsRemaining: 15, shape: 'rect' },
      { id: 'PT3', name: 'Bakehouse Booth', capacity: 4, section: 'Bakehouse Hall', status: 'reserved', reservationName: 'Ananya & Friends (10:00 AM)', shape: 'booth' },
      { id: 'PT4', name: 'Verandah Table 1', capacity: 6, section: 'Verandah Booths', status: 'available', shape: 'rect' }
    ],
    hourlyCrowdForecast: [
      { time: '8 AM', level: 65 }, { time: '10 AM', level: 90 }, { time: '1 PM', level: 85 },
      { time: '4 PM', level: 55 }, { time: '7 PM', level: 88 }, { time: '9 PM', level: 70 }
    ]
  },
  {
    id: 'sky-asian-dining-t-nagar',
    name: 'SKY - Curated Asian Dining',
    tagline: 'Luxury high-altitude Asian gastronomy, dim sum bar & bespoke cocktails at The Residency Towers',
    cuisine: 'Pan-Asian & Dim Sum Bar',
    cuisineTag: 'indo_chinese',
    isPureVeg: false,
    cuisineHighlights: ['Truffle Edamame Dim Sum', 'Gold Leaf Har Gao', 'Robata Salmon'],
    priceRange: '₹₹₹₹',
    priceLevel: 4,
    rating: 4.5,
    reviewsCount: 649,
    location: 'The Residency Towers, 115, Sir Thyagaraya Rd, T. Nagar, Chennai, Tamil Nadu 600017',
    city: 'Chennai',
    distanceKm: 1.2,
    lat: 13.0404583,
    lng: 80.2436779,
    phoneNumber: '+91 70101 23000',
    hours: {
      monday: '12:00-23:00',
      tuesday: '12:00-23:00',
      wednesday: '12:00-23:00',
      thursday: '12:00-23:00',
      friday: '12:00-23:00',
      saturday: '12:00-23:00',
      sunday: '12:00-23:00'
    },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=SKY+Curated+Asian+Dining+The+Residency+Towers+T+Nagar+Chennai',
    image: '/fine_dining_interior.jpg',
    crowdLevel: 'medium',
    waitEstimate: '10-15 min',
    partiesInQueue: 1,
    openingHours: '12:00 PM - 11:00 PM',
    aiWalkInProbability: 75,
    sections: ['Skyline Glass Room', 'Teppanyaki Counter', 'Moonlight Terrace'],
    menu: [
      {
        category: 'Dim Sum & Small Plates',
        items: [
          { id: 'sky1', name: 'Truffle Edamame Crystal Dim Sum', price: 620, desc: 'Delicate translucent parcels filled with steamed edamame, water chestnuts, and black truffle pate.', tags: ['v', 'chef'] },
          { id: 'sky2', name: 'Prawn Har Gao with Gold Leaf', price: 720, desc: 'Steamed tiger prawn dumplings with bamboo shoots topped with edible 24k gold leaf.', tags: ['chef', 'gf'] }
        ]
      },
      {
        category: 'Robata Grills & Curated Asian Mains',
        items: [
          { id: 'sky3', name: 'Norwegian Salmon Robata Teriyaki', price: 1250, desc: 'Charcoal-grilled Atlantic salmon glazed in house-made 12-year mirin teriyaki reduction.', tags: ['gf', 'chef'] },
          { id: 'sky4', name: 'Thai Green Curry with Jasmine Fragrant Rice', price: 780, desc: 'Simmered in fresh galangal, kaffir lime, pea aubergines, and rich first-press coconut milk.', tags: ['v', 'gf'] }
        ]
      },
      {
        category: 'Desserts & Mixology',
        items: [
          { id: 'sky5', name: 'Matcha Fondant Lava Cake', price: 480, desc: 'Warm green tea molten cake with black sesame ice cream and almond tuile.', tags: ['v'] }
        ]
      }
    ],
    tables: [
      { id: 'SKY1', name: 'Skyline Table 1', capacity: 2, section: 'Skyline Glass Room', status: 'available', shape: 'round' },
      { id: 'SKY2', name: 'Skyline Table 2', capacity: 4, section: 'Skyline Glass Room', status: 'occupied', minsRemaining: 18, shape: 'rect' },
      { id: 'SKY3', name: 'Teppanyaki Seat 1-4', capacity: 4, section: 'Teppanyaki Counter', status: 'available', shape: 'rect' },
      { id: 'SKY4', name: 'Moonlight VIP Terrace', capacity: 6, section: 'Moonlight Terrace', status: 'reserved', reservationName: 'Dr. Subramanian (8:00 PM)', shape: 'booth' }
    ],
    hourlyCrowdForecast: [
      { time: '12 PM', level: 35 }, { time: '2 PM', level: 55 }, { time: '7 PM', level: 70 },
      { time: '8 PM', level: 90 }, { time: '10 PM', level: 75 }
    ]
  },
  {
    id: 'padmam-veg-t-nagar',
    name: 'Padmam Veg Restaurant',
    tagline: 'Authentic South Indian pure vegetarian culinary heritage, Ghee Podi dosas & traditional thalis',
    cuisine: 'Pure Vegetarian & South Indian Thali',
    cuisineTag: 'pure_veg',
    isPureVeg: true,
    cuisineHighlights: ['Ghee Podi Dosa', 'Mini Sambar Idli', 'Royal Meals Thali', 'Degree Filter Coffee'],
    priceRange: '₹₹',
    priceLevel: 2,
    rating: 4.4,
    reviewsCount: 4157,
    location: '18/54, Venkatanarayana Rd, T. Nagar, Chennai, Tamil Nadu 600017',
    city: 'Chennai',
    distanceKm: 0.9,
    lat: 13.0365465,
    lng: 80.236093,
    phoneNumber: '+91 89398 08084',
    hours: {
      monday: '07:00-22:30',
      tuesday: '07:00-22:30',
      wednesday: '07:00-22:30',
      thursday: '07:00-22:30',
      friday: '07:00-22:30',
      saturday: '07:00-22:30',
      sunday: '07:00-22:30'
    },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Padmam+Veg+Restaurant+Venkatanarayana+Rd+T+Nagar+Chennai',
    image: '/luxury_hotel_buffet.jpg',
    crowdLevel: 'high',
    waitEstimate: '15-20 min',
    partiesInQueue: 3,
    openingHours: '7:00 AM - 10:30 PM',
    aiWalkInProbability: 50,
    sections: ['Main AC Hall', 'Thali Section', 'Family Dining Floor'],
    menu: [
      {
        category: 'Tiffin & Dosai Specialties',
        items: [
          { id: 'pad1', name: 'Special Ghee Podi Masala Dosa', price: 180, desc: 'Crispy golden crepe roasted in pure cow ghee, coated with gun powder podi & potato masala.', tags: ['v', 'chef'] },
          { id: 'pad2', name: 'Mini Ghee Sambar Idli (14 pcs)', price: 140, desc: 'Bite-sized soft steamed rice cakes immersed in piping hot Madras shallot sambar and melted ghee.', tags: ['v', 'chef'] }
        ]
      },
      {
        category: 'Traditional South Indian Thalis',
        items: [
          { id: 'pad3', name: 'Padmam Royal South Indian Meals Thali', price: 320, desc: '14-item traditional feast with poriyal, kootu, avial, sambar, rasam, payasam, appalam & curd.', tags: ['v', 'chef'] }
        ]
      },
      {
        category: 'Beverages & Sweets',
        items: [
          { id: 'pad4', name: 'Degree Filter Coffee in Brass Dabarah', price: 60, desc: 'Freshly brewed Kumbakonam roasted chicory blend frothed with full cream milk.', tags: ['v', 'gf'] }
        ]
      }
    ],
    tables: [
      { id: 'PAD1', name: 'Main Hall Table 1', capacity: 2, section: 'Main AC Hall', status: 'available', shape: 'round' },
      { id: 'PAD2', name: 'Main Hall Table 2', capacity: 4, section: 'Main AC Hall', status: 'occupied', minsRemaining: 12, shape: 'rect' },
      { id: 'PAD3', name: 'Thali Table 1', capacity: 4, section: 'Thali Section', status: 'occupied', minsRemaining: 25, shape: 'rect' },
      { id: 'PAD4', name: 'Family Table 1', capacity: 6, section: 'Family Dining Floor', status: 'available', shape: 'rect' }
    ],
    hourlyCrowdForecast: [
      { time: '8 AM', level: 80 }, { time: '10 AM', level: 60 }, { time: '1 PM', level: 95 },
      { time: '4 PM', level: 50 }, { time: '8 PM', level: 90 }, { time: '10 PM', level: 45 }
    ]
  },
  {
    id: 'ignna-cocktail-bar-nungambakkam',
    name: 'IGNNA Cocktail Bar & Rooftop Restaurant - Sterling Road',
    tagline: 'Chic open-air rooftop bar, flame-grilled skewers & craft mixology overlooking Nungambakkam',
    cuisine: 'Chettinad Tacos & Charcoal Grill Bar',
    cuisineTag: 'chettinad_grill',
    isPureVeg: false,
    cuisineHighlights: ['Chettinad Kari Sukka', 'Peri Peri Skewers', 'Cottage Cheese Tikka'],
    priceRange: '₹₹₹',
    priceLevel: 3,
    rating: 4.4,
    reviewsCount: 1047,
    location: '58, Sterling Rd, Nungambakkam, Chennai, Tamil Nadu 600034',
    city: 'Chennai',
    distanceKm: 2.8,
    lat: 13.0643121,
    lng: 80.236816,
    phoneNumber: '+91 90476 43786',
    hours: {
      monday: '12:00-23:30',
      tuesday: '12:00-23:30',
      wednesday: '12:00-23:30',
      thursday: '12:00-23:30',
      friday: '12:00-23:30',
      saturday: '12:00-23:30',
      sunday: '12:00-23:30'
    },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Absolute+Barbecues+T+Nagar+Chennai',
    image: '/luxury_rooftop_dining.jpg',
    crowdLevel: 'high',
    waitEstimate: '10-20 min',
    partiesInQueue: 2,
    openingHours: '12:00 PM - 11:30 PM',
    aiWalkInProbability: 68,
    sections: ['Rooftop Open Lounge', 'Bar High Tops', 'Sterling Deck'],
    menu: [
      {
        category: 'Charcoal Grills & Skewers',
        items: [
          { id: 'ign1', name: 'Chettinad Mutton Kari Sukka Tacos', price: 540, desc: 'Slow-roasted tender lamb in stone-ground Chettinad spices served in warm parotta tacos.', tags: ['chef', 'spicy'] },
          { id: 'ign2', name: 'Smoked Cottage Cheese Tikka Skewers', price: 420, desc: 'Charcoal-grilled paneer steaks with bell peppers and roasted cumin rub.', tags: ['v', 'gf'] }
        ]
      },
      {
        category: 'Gourmet Mains & Sliders',
        items: [
          { id: 'ign3', name: 'Gunpowder Spiced Crispy Calamari', price: 480, desc: 'Golden squid rings tossed in spicy Madras gunpowder podi and curry leaf aioli.', tags: ['chef', 'spicy'] }
        ]
      },
      {
        category: 'Signature Cocktails & Mocktails',
        items: [
          { id: 'ign4', name: 'Chennai Filter Coffee Whiskey Sour', price: 480, desc: 'Bourbon infused with freshly brewed South Indian peaberry decoction and nutmeg.', tags: ['chef'] }
        ]
      }
    ],
    tables: [
      { id: 'IGN1', name: 'Rooftop Lounge 1', capacity: 2, section: 'Rooftop Open Lounge', status: 'available', shape: 'round' },
      { id: 'IGN2', name: 'Rooftop Lounge 2', capacity: 4, section: 'Rooftop Open Lounge', status: 'occupied', minsRemaining: 25, shape: 'rect' },
      { id: 'IGN3', name: 'Bar High Top 1', capacity: 2, section: 'Bar High Tops', status: 'available', shape: 'round' },
      { id: 'IGN4', name: 'Sterling VIP Deck', capacity: 8, section: 'Sterling Deck', status: 'reserved', reservationName: 'Chennai Tech Meet (8:00 PM)', shape: 'booth' }
    ],
    hourlyCrowdForecast: [
      { time: '1 PM', level: 30 }, { time: '5 PM', level: 45 }, { time: '7 PM', level: 75 },
      { time: '9 PM', level: 95 }, { time: '11 PM', level: 80 }
    ]
  },
  {
    id: 'six-o-one-the-park',
    name: "Six 'O' One",
    tagline: 'Iconic 24-hour luxury dining, Mediterranean thin-crust pizzas, global buffet & midnight dessert bar',
    cuisine: '24/7 Mughlai Biryani & Global Buffet',
    cuisineTag: 'biryani_mughlai',
    isPureVeg: false,
    cuisineHighlights: ['24/7 Dum Mutton Biryani', 'Global Buffet Spread', 'Wood-Fired Burrata Pizza'],
    priceRange: '₹₹₹₹',
    priceLevel: 4,
    rating: 4.8,
    reviewsCount: 2076,
    location: '601, Anna Salai, near US Embassy, Gangai Karai Puram, T. Nagar, Chennai, Tamil Nadu 600006',
    city: 'Chennai',
    distanceKm: 1.5,
    lat: 13.0529021,
    lng: 80.2496841,
    phoneNumber: '+91 44 4267 6000',
    hours: {
      monday: 'Open 24 hours',
      tuesday: 'Open 24 hours',
      wednesday: 'Open 24 hours',
      thursday: 'Open 24 hours',
      friday: 'Open 24 hours',
      saturday: 'Open 24 hours',
      sunday: 'Open 24 hours'
    },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Buhari+Hotel+Anna+Nagar+Chennai',
    image: '/fine_dining_interior.jpg',
    crowdLevel: 'medium',
    waitEstimate: 'Immediate (0-5 min)',
    partiesInQueue: 0,
    openingHours: 'Open 24 hours',
    aiWalkInProbability: 90,
    sections: ['24/7 Buffet Atrium', 'Wood-Fired Pizzeria', 'VIP Glass Lounge'],
    menu: [
      {
        category: '24/7 Global Buffet & Italian',
        items: [
          { id: 'so1', name: 'Grand Global Buffet Spread Experience', price: 1850, desc: 'Lavish spread with live sushi, Mediterranean counters, Indian claypots & dessert island.', tags: ['chef'] },
          { id: 'so2', name: 'Wood-Fired Burrata & Truffle Pizza', price: 890, desc: 'Handcrafted sourdough crust, San Marzano tomato sauce, fresh Puglia burrata, and truffle glaze.', tags: ['v', 'chef'] }
        ]
      },
      {
        category: 'Midnight Kitchen Specials',
        items: [
          { id: 'so3', name: 'Dum Mutton Biryani with Mirchi Salan (24/7)', price: 750, desc: 'Slow-braised tender lamb dum biryani available round the clock with garlic raita.', tags: ['chef', 'gf', 'spicy'] }
        ]
      },
      {
        category: 'Desserts',
        items: [
          { id: 'so4', name: 'Classic Venetian Tiramisu al Mascarpone', price: 450, desc: 'Espresso-soaked Savoiardi ladyfingers layered with rich Italian mascarpone cream.', tags: ['v'] }
        ]
      }
    ],
    tables: [
      { id: 'SO1', name: 'Atrium Table 1', capacity: 2, section: '24/7 Buffet Atrium', status: 'available', shape: 'round' },
      { id: 'SO2', name: 'Atrium Table 2', capacity: 4, section: '24/7 Buffet Atrium', status: 'available', shape: 'rect' },
      { id: 'SO3', name: 'Pizzeria Booth', capacity: 4, section: 'Wood-Fired Pizzeria', status: 'occupied', minsRemaining: 10, shape: 'booth' },
      { id: 'SO4', name: 'VIP Lounge Suite', capacity: 8, section: 'VIP Glass Lounge', status: 'available', shape: 'rect' }
    ],
    hourlyCrowdForecast: [
      { time: '1 AM', level: 40 }, { time: '8 AM', level: 60 }, { time: '1 PM', level: 80 },
      { time: '8 PM', level: 85 }, { time: '11 PM', level: 65 }
    ]
  },
  {
    id: 'avartana-itc-grand-chola',
    name: 'Avartana',
    tagline: 'Progressive avant-garde South Indian culinary art, molecular textures & bespoke degustation menus',
    cuisine: 'South Indian Avant-Garde Fine Dining',
    cuisineTag: 'south_indian',
    isPureVeg: false,
    cuisineHighlights: ['7-Course Maya Degustation', 'Tomato Rasam Infusion', 'Ghee Roast Lobster', 'Coconut Stew'],
    priceRange: '₹₹₹₹',
    priceLevel: 4,
    rating: 4.7,
    reviewsCount: 4020,
    location: 'ITC Grand Chola, Little Mount, Guindy, Chennai, Tamil Nadu 600032',
    city: 'Chennai',
    distanceKm: 3.5,
    lat: 13.010511,
    lng: 80.220708,
    phoneNumber: '+91 44 2220 0000',
    hours: {
      monday: '18:30-23:00',
      tuesday: '18:30-23:00',
      wednesday: '18:30-23:00',
      thursday: '18:30-23:00',
      friday: '18:30-23:00',
      saturday: '12:00-14:30, 18:30-23:00',
      sunday: '12:00-14:30, 18:30-23:00'
    },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Crowne+Plaza+Chennai+Adyar+Park',
    image: '/luxury_hotel_buffet.jpg',
    crowdLevel: 'low',
    waitEstimate: 'Prior Booking Required',
    partiesInQueue: 3,
    openingHours: '6:30 PM - 11:00 PM (Lunch on Sat-Sun: 12:00 PM - 2:30 PM)',
    aiWalkInProbability: 30,
    sections: ['The Tasting Salon', 'Banana Leaf Glass Room', 'Private Sommelier Suite'],
    menu: [
      {
        category: 'Signature Degustation Menus',
        items: [
          { id: 'av1', name: 'Maya 7-Course Avant-Garde South Indian Tasting', price: 3800, desc: 'Seven progressive courses blending southern spices with modern molecular gastronomy.', tags: ['chef', 'gf'] },
          { id: 'av2', name: 'Anika 11-Course Grand Culinary Odyssey', price: 5800, desc: 'Eleven-course masterpiece including infused distilled rasam, lobster ghee roast, and raw mango sorbet.', tags: ['chef', 'gf'] }
        ]
      },
      {
        category: 'Avant-Garde Signatures',
        items: [
          { id: 'av3', name: 'Distilled Tomato Rasam Infusion in French Press', price: 650, desc: 'Clarified aromatic heirloom tomato broth infused tableside with crushed coriander and pepper.', tags: ['v', 'gf', 'chef'] },
          { id: 'av4', name: 'Asparagus Coconut Spheres with Chili Crisp', price: 850, desc: 'Delicate coconut liquid sphere encapsulating spiced asparagus and tempered mustard seeds.', tags: ['v', 'gf'] }
        ]
      }
    ],
    tables: [
      { id: 'AV1', name: 'Salon Table 1', capacity: 2, section: 'The Tasting Salon', status: 'occupied', minsRemaining: 35, shape: 'round' },
      { id: 'AV2', name: 'Salon Table 2', capacity: 2, section: 'The Tasting Salon', status: 'available', shape: 'round' },
      { id: 'AV3', name: 'Banana Leaf Table', capacity: 4, section: 'Banana Leaf Glass Room', status: 'reserved', reservationName: 'Kapoor Degustation (7:30 PM)', shape: 'rect' },
      { id: 'AV4', name: 'Sommelier Suite', capacity: 6, section: 'Private Sommelier Suite', status: 'available', shape: 'rect' }
    ],
    hourlyCrowdForecast: [
      { time: '6 PM', level: 40 }, { time: '7 PM', level: 85 }, { time: '8 PM', level: 98 },
      { time: '9 PM', level: 95 }, { time: '10 PM', level: 60 }
    ]
  },
  {
    id: 'annalakshmi-restaurant-egmore',
    name: 'Annalakshmi Restaurant',
    tagline: 'Celebrated artistic pure vegetarian thali sanctuary, cultural ambiance & traditional heritage recipes',
    cuisine: 'Pure Vegetarian Grand Heritage Thali',
    cuisineTag: 'pure_veg',
    isPureVeg: true,
    cuisineHighlights: ['Grand Maharaja Thali', 'Vazhaipoo Vadai', 'Mor Kuzhambu', 'Mysore Pak'],
    priceRange: '₹₹₹',
    priceLevel: 3,
    rating: 4.5,
    reviewsCount: 12546,
    location: 'No 6 Mayor Ramanathan Salai, Spur Tank Road, Sulaiman Zackria Avenue, Egmore, Chennai, Tamil Nadu 600031',
    city: 'Chennai',
    distanceKm: 3.2,
    lat: 13.0720701,
    lng: 80.252048,
    phoneNumber: '+91 94081 23333',
    hours: {
      monday: 'Closed',
      tuesday: '12:00-14:30, 19:00-21:00',
      wednesday: '12:00-14:30, 19:00-21:00',
      thursday: '12:00-14:30, 19:00-21:00',
      friday: '12:00-14:30, 19:00-21:00',
      saturday: '12:00-14:30, 19:00-21:00',
      sunday: '12:00-14:30, 19:00-22:00'
    },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Copper+Chimney+Cathedral+Rd+Gopalapuram+Chennai',
    image: '/artisanal_cafe_interior.jpg',
    crowdLevel: 'high',
    waitEstimate: '15-20 min',
    partiesInQueue: 2,
    openingHours: 'Tue-Sun: 12:00 PM - 2:30 PM, 7:00 PM - 9:00 PM (Monday Closed)',
    aiWalkInProbability: 60,
    sections: ['Temple Heritage Hall', 'Cultural Courtyard', 'Bhakti Dining Suite'],
    menu: [
      {
        category: 'Royal Pure Vegetarian Feast',
        items: [
          { id: 'ann1', name: 'Grand Annalakshmi Cultural Raja Bhojanam Thali', price: 650, desc: 'Lavish traditional South Indian platter with 16 royal delicacies served with care and love.', tags: ['v', 'chef'] },
          { id: 'ann2', name: 'Special Elaneer (Tender Coconut) Payasam', price: 180, desc: 'Exquisite dessert made of young tender coconut pulp, cardamom, cashew milk, and saffron.', tags: ['v', 'gf', 'chef'] }
        ]
      },
      {
        category: 'Traditional Specialties',
        items: [
          { id: 'ann3', name: 'Authentic Mysore Bisi Bele Bath with Ghee', price: 220, desc: 'Spiced lentil and rice specialty tempered with whole cashews, shallots, and fragrant ghee.', tags: ['v', 'gf'] },
          { id: 'ann4', name: 'Kashi Halwa with Roasted Dry Fruits', price: 160, desc: 'Traditional ash gourd dessert cooked in pure ghee with saffron and crushed pistachios.', tags: ['v', 'gf'] }
        ]
      }
    ],
    tables: [
      { id: 'ANN1', name: 'Temple Hall Table 1', capacity: 4, section: 'Temple Heritage Hall', status: 'available', shape: 'rect' },
      { id: 'ANN2', name: 'Temple Hall Table 2', capacity: 6, section: 'Temple Heritage Hall', status: 'occupied', minsRemaining: 15, shape: 'rect' },
      { id: 'ANN3', name: 'Courtyard Table', capacity: 4, section: 'Cultural Courtyard', status: 'available', shape: 'round' },
      { id: 'ANN4', name: 'Bhakti Family Suite', capacity: 8, section: 'Bhakti Dining Suite', status: 'reserved', reservationName: 'Ramanathan Family (1:00 PM)', shape: 'booth' }
    ],
    hourlyCrowdForecast: [
      { time: '12 PM', level: 40 }, { time: '1 PM', level: 85 }, { time: '2 PM', level: 60 },
      { time: '7 PM', level: 70 }, { time: '8 PM', level: 90 }, { time: '9 PM', level: 50 }
    ]
  }
];

export const INITIAL_RESERVATIONS = [
  {
    id: 'RES-8921',
    restaurantId: 'avartana-itc-grand-chola',
    restaurantName: 'Avartana',
    tableId: 'AV3',
    tableName: 'Banana Leaf Table (4 guests)',
    guestName: 'Rajesh Kapoor',
    guestEmail: 'rajesh.kapoor@example.com',
    guestPhone: '+91 98201 23456',
    partySize: 4,
    date: '2026-08-14',
    time: '19:30',
    status: 'Confirmed',
    orderStatus: 'Preparing',
    specialRequests: 'Anniversary tasting menu celebration (mild spice)',
    preOrderedItems: [
      { id: 'av1', name: 'Maya 7-Course Avant-Garde South Indian Tasting', qty: 2, price: 3800 },
      { id: 'av3', name: 'Distilled Tomato Rasam Infusion in French Press', qty: 2, price: 650 }
    ],
    qrCode: 'SMART-TABLE-RES-8921-AV',
    createdAt: '2026-08-14T14:20:00Z'
  },
  {
    id: 'RES-4412',
    restaurantId: 'on-de-roof-chennai',
    restaurantName: 'On DE Roof Restaurant',
    tableId: 'ODR1',
    tableName: 'Rooftop Table 1 (Sky Rooftop Deck)',
    guestName: 'Karthik Subramanian',
    guestEmail: 'karthik.subramanian@example.com',
    guestPhone: '+91 98840 12345',
    partySize: 2,
    date: '2026-08-15',
    time: '20:00',
    status: 'Confirmed',
    orderStatus: 'Pending Acceptance',
    specialRequests: 'Corner table with rooftop view, extra spicy prawns',
    preOrderedItems: [
      { id: 'odr1', name: 'Wok Tossed Chilli Garlic Tiger Prawns', qty: 1, price: 580 },
      { id: 'odr4', name: 'Schezwan Sizzling Claypot Rice', qty: 1, price: 460 },
      { id: 'odr6', name: 'Jasmine Boba Pearl Iced Tea', qty: 2, price: 220 }
    ],
    qrCode: 'SMART-TABLE-RES-4412-ODR',
    createdAt: '2026-08-15T09:10:00Z',
    fulfillmentType: 'dine_in'
  },
  {
    id: 'RES-7734',
    restaurantId: 'on-de-roof-chennai',
    restaurantName: 'On DE Roof Restaurant',
    tableId: 'ODR3',
    tableName: 'Lapis Booth 1 (Lapis Lagoon Lounge)',
    guestName: 'Pooja Narayanan',
    guestEmail: 'pooja.n@example.com',
    guestPhone: '+91 97910 88765',
    partySize: 4,
    date: '2026-08-15',
    time: '19:45',
    status: 'Confirmed',
    orderStatus: 'Accepted',
    specialRequests: 'Table near window, non-alcoholic drinks preferred',
    preOrderedItems: [
      { id: 'odr2', name: 'Crispy Lotus Stem in Kashmiri Honey Chilli', qty: 2, price: 380 },
      { id: 'odr5', name: 'Kung Pao Chicken with Cashews', qty: 1, price: 520 }
    ],
    qrCode: 'SMART-TABLE-RES-7734-ODR',
    createdAt: '2026-08-15T08:30:00Z',
    fulfillmentType: 'dine_in'
  },
  {
    id: 'RES-5509',
    restaurantId: 'padmam-veg-t-nagar',
    restaurantName: 'Padmam Veg Restaurant',
    tableId: 'PAD1',
    tableName: 'Heritage AC Table 1',
    guestName: 'Venkatesh Iyer',
    guestEmail: 'venkat.iyer@example.com',
    guestPhone: '+91 94440 33211',
    partySize: 3,
    date: '2026-08-15',
    time: '19:15',
    status: 'Confirmed',
    orderStatus: 'Pending Acceptance',
    specialRequests: 'Pure vegetarian Jain preparation without onions or garlic',
    preOrderedItems: [
      { id: 'pad1', name: 'Special Ghee Podi Masala Dosa', qty: 2, price: 180 },
      { id: 'pad2', name: 'Mini Ghee Sambar Idli (14 pcs)', qty: 1, price: 140 }
    ],
    qrCode: 'SMART-TABLE-RES-5509-PAD',
    createdAt: '2026-08-15T10:00:00Z',
    fulfillmentType: 'dine_in'
  },
  {
    id: 'ORD-DLV-8821',
    restaurantId: 'on-de-roof-chennai',
    restaurantName: 'On DE Roof Restaurant',
    fulfillmentType: 'delivery',
    guestName: 'Karthik Subramanian',
    guestEmail: 'karthik.subramanian@example.com',
    guestPhone: '+91 98401 12345',
    partySize: 1,
    date: '2026-08-15',
    time: '20:00',
    status: 'Confirmed',
    orderStatus: 'On the Way',
    deliveryAddress: 'Flat 4B, Emerald Residency, Shanthi Colony, Anna Nagar, Chennai',
    deliveryLocality: 'Anna Nagar',
    deliveryDistanceKm: 1.4,
    deliveryEtaMins: 14,
    deliveryFee: 35,
    tipAmount: 30,
    surgeFee: 0,
    itemTotal: 960,
    grandTotal: 1025,
    deliveryOtp: '7392',
    riderId: 'rider-1',
    riderName: 'Ramesh Kumar',
    riderPhone: '+91 98840 77123',
    riderVehicle: 'EV Scooter (TN 01 BX 4490)',
    riderRating: 4.9,
    riderProgressPercent: 65,
    preOrderedItems: [
      { id: 'odr1', name: 'Wok Tossed Chilli Garlic Tiger Prawns', qty: 1, price: 580 },
      { id: 'odr2', name: 'Crispy Lotus Stem in Kashmiri Honey Chilli', qty: 1, price: 380 }
    ],
    qrCode: 'SMART-DELIVERY-8821',
    createdAt: '2026-08-15T10:35:00Z'
  },
  {
    id: 'ORD-TKW-3319',
    restaurantId: 'avartana-itc-grand-chola',
    restaurantName: 'Avartana - ITC Grand Chola',
    fulfillmentType: 'takeaway',
    guestName: 'Divya Ramesh',
    guestEmail: 'divya.r@example.com',
    guestPhone: '+91 98400 99881',
    partySize: 1,
    date: '2026-08-15',
    time: '20:30',
    status: 'Confirmed',
    orderStatus: 'Ready for Pickup',
    pickupSlot: '20:15 - 20:30',
    pickupPin: '5512',
    itemTotal: 1100,
    grandTotal: 1100,
    preOrderedItems: [
      { id: 'av1', name: 'Crispy Chilli Coriander Lobster Bites', qty: 1, price: 1100 }
    ],
    qrCode: 'SMART-TAKEAWAY-3319',
    createdAt: '2026-08-15T09:40:00Z'
  }
];

export const INITIAL_RIDERS = [
  {
    id: 'rider-1',
    name: 'Ramesh Kumar',
    phone: '+91 98840 77123',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    vehicle: 'Ather 450X EV (TN 01 BX 4490)',
    rating: 4.9,
    tripsCompleted: 1420,
    todayEarnings: 840,
    todayTrips: 9,
    status: 'delivering',
    currentOrderId: 'ORD-DLV-8821',
    clusterZone: 'Anna Nagar',
    lat: 13.0850,
    lng: 80.2180,
    batteryLevel: '82%',
    shiftStartTime: '16:00'
  },
  {
    id: 'rider-2',
    name: 'Vignesh Sundaram',
    phone: '+91 97909 33412',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    vehicle: 'Ola S1 Pro (TN 09 CU 1982)',
    rating: 4.85,
    tripsCompleted: 890,
    todayEarnings: 620,
    todayTrips: 6,
    status: 'available',
    currentOrderId: null,
    clusterZone: 'T. Nagar',
    lat: 13.0410,
    lng: 80.2390,
    batteryLevel: '94%',
    shiftStartTime: '17:30'
  },
  {
    id: 'rider-3',
    name: 'Priya Murugan',
    phone: '+91 94441 55667',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    vehicle: 'Honda Activa 6G (TN 07 DA 7711)',
    rating: 4.95,
    tripsCompleted: 2150,
    todayEarnings: 1150,
    todayTrips: 13,
    status: 'available',
    currentOrderId: null,
    clusterZone: 'Alwarpet & Mylapore',
    lat: 13.0340,
    lng: 80.2560,
    batteryLevel: 'Fuel 80%',
    shiftStartTime: '14:00'
  }
];

export const SAVED_CUSTOMER_ADDRESSES = [
  {
    id: 'addr-1',
    label: 'Home (Anna Nagar)',
    tag: 'home',
    address: 'Flat 4B, Emerald Residency, Shanthi Colony, Anna Nagar, Chennai - 600040',
    locality: 'Anna Nagar',
    lat: 13.0855,
    lng: 80.2185
  },
  {
    id: 'addr-2',
    label: 'Work (T. Nagar Tech Park)',
    tag: 'work',
    address: 'Tower B, 5th Floor, G.N. Chetty Road, T. Nagar, Chennai - 600017',
    locality: 'T. Nagar',
    lat: 13.0420,
    lng: 80.2410
  },
  {
    id: 'addr-3',
    label: 'Studio (Alwarpet)',
    tag: 'other',
    address: '14/2, Sriram Colony, Alwarpet, Chennai - 600018',
    locality: 'Alwarpet',
    lat: 13.0350,
    lng: 80.2570
  }
];

export const PROMO_COUPONS = [
  {
    code: 'FIRSTBITE',
    title: 'Flat 20% OFF',
    discountPercent: 20,
    maxDiscount: 120,
    minOrderValue: 300,
    desc: '20% off on your first on-demand hyperlocal order!'
  },
  {
    code: 'SUPERFAST',
    title: 'Free Delivery',
    discountPercent: 0,
    flatDiscount: 35,
    freeDelivery: true,
    minOrderValue: 250,
    desc: '100% Free Hyperlocal Delivery on orders above ₹250'
  },
  {
    code: 'GOURMET20',
    title: '₹150 Flat OFF',
    discountPercent: 0,
    flatDiscount: 150,
    minOrderValue: 600,
    desc: 'Save ₹150 on artisanal & fine-dining restaurant orders'
  },
  {
    code: 'CHAIRFREE',
    title: 'VIP Table Reservation Pass',
    discountPercent: 0,
    flatDiscount: 50,
    minOrderValue: 0,
    desc: 'Zero reservation fees on premium dining bookings'
  }
];

export const MARKETPLACE_SETTINGS = {
  platformName: 'SmartTable Hyperlocal Hub',
  city: 'Chennai',
  commissionRate: 0.15,
  baseDeliveryFee: 29,
  deliveryFeePerKm: 10,
  freeDeliveryThreshold: 500,
  platformFee: 5,
  gstRate: 0.05,
  rainSurgeActive: false,
  rainSurgeFee: 25,
  rushHourSurgeActive: false,
  rushHourMultiplier: 1.25,
  liveActiveRiders: 48,
  liveActiveMerchants: 64,
  avgDeliveryTimeMin: 22,
  todayTotalOrders: 382,
  todayGmvTotal: 248900
};

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    title: 'Order En Route! 🛵💨',
    message: 'Rider Ramesh is 6 mins away with your sizzling order from On DE Roof.',
    timestamp: 'Just now',
    type: 'delivery',
    read: false
  },
  {
    id: 'NOTIF-2',
    title: 'Table Confirmed at Avartana! 🎉',
    message: 'Your table for 4 guests is confirmed for today at 7:30 PM.',
    timestamp: '10 mins ago',
    type: 'booking',
    read: false
  },
  {
    id: 'NOTIF-3',
    title: 'Zero Wait Alert Near You ⚡',
    message: "Six 'O' One (1.5 km away) has 3 free tables right now with 0 min wait!",
    timestamp: '20 mins ago',
    type: 'alert',
    read: false
  }
];

// Restaurant Partner Registration Applications Queue for Super Admin Review
export const INITIAL_RESTAURANT_APPLICATIONS = [
  {
    id: 'REG-2026-8812',
    name: 'Anjappar Chettinad Heritage',
    tagline: 'Authentic woodfired spicy Chettinad mutton sukka, claypot biryani & banana leaf feasts',
    cuisine: 'Authentic Chettinad & South Indian',
    cuisineTag: 'chettinad_south_indian',
    isPureVeg: false,
    cuisineHighlights: ['Chettinad Mutton Sukka', 'Seeraga Samba Biryani', 'Nattu Kozhi Varuval'],
    priceRange: '₹₹₹',
    priceLevel: 3,
    location: '42, Usman Road, Panagal Park, T. Nagar, Chennai, Tamil Nadu 600017',
    city: 'Chennai',
    zone: 'T. Nagar',
    lat: 13.0405,
    lng: 80.2335,
    ownerName: 'Sundhara Pandian',
    ownerEmail: 'sundhar.anjappar@gmail.com',
    ownerPhone: '+91 98401 22334',
    settlementUpiId: 'sundhar8074@axl',
    fssaiLicense: '12423002000892',
    gstin: '33AAACA1234F1Z5',
    totalCapacity: 64,
    tablesCount: 12,
    sections: ['Heritage AC Dining', 'Family Booth Lounge', 'Mezzanine Balcony'],
    openingHours: '11:30 AM - 11:00 PM',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    submittedAt: 'Today at 08:30 AM',
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    notes: 'Prime commercial location in T. Nagar. High footfall dining corridor with dedicated valet parking.',
    complianceScore: 98,
    proposedMenuSample: [
      { name: 'Chettinad Pepper Mutton Masala', price: 480, desc: 'Tender goat cooked in roasted black pepper, stone flower, and shallots.', tags: ['chef', 'spicy'] },
      { name: 'Seeraga Samba Thalappakatti Chicken Biryani', price: 390, desc: 'Aromatic short-grain rice dum cooked with country chicken and whole spices.', tags: ['chef'] },
      { name: 'Meen Pollichathu in Banana Leaf', price: 520, desc: 'Seer fish fillet wrapped in charred banana leaf with shallot tomato masala.', tags: ['chef', 'gf'] },
      { name: 'Elaneer Payasam (Tender Coconut)', price: 180, desc: 'Creamy chilled tender coconut milk pudding with pulp chunks.', tags: ['v', 'gf'] }
    ],
    proposedTables: [
      { id: 'ANJ1', name: 'Heritage Table 1', capacity: 2, section: 'Heritage AC Dining', status: 'available', shape: 'round' },
      { id: 'ANJ2', name: 'Heritage Table 2', capacity: 4, section: 'Heritage AC Dining', status: 'available', shape: 'rect' },
      { id: 'ANJ3', name: 'Family Booth 1', capacity: 6, section: 'Family Booth Lounge', status: 'available', shape: 'booth' },
      { id: 'ANJ4', name: 'Family Booth 2', capacity: 6, section: 'Family Booth Lounge', status: 'available', shape: 'booth' },
      { id: 'ANJ5', name: 'Balcony Table 1', capacity: 4, section: 'Mezzanine Balcony', status: 'available', shape: 'rect' },
      { id: 'ANJ6', name: 'Balcony VIP Table', capacity: 8, section: 'Mezzanine Balcony', status: 'available', shape: 'rect' }
    ]
  },
  {
    id: 'REG-2026-8815',
    name: 'The Madras Botanical Bistro',
    tagline: 'Glasshouse European brunch, woodfired sourdough pizzas & specialty nitro coffees',
    cuisine: 'Continental & Mediterranean Cafe',
    cuisineTag: 'artisanal_cafe',
    isPureVeg: false,
    cuisineHighlights: ['Burrata Truffle Pizza', 'Avocado Sourdough', 'Nitro Cold Brew'],
    priceRange: '₹₹₹',
    priceLevel: 3,
    location: '18, Poes Garden 2nd St, Alwarpet, Chennai, Tamil Nadu 600086',
    city: 'Chennai',
    zone: 'Alwarpet',
    lat: 13.0418,
    lng: 80.2520,
    ownerName: 'Lavanya Sridhar',
    ownerEmail: 'lavanya@madrasbistro.in',
    ownerPhone: '+91 98402 77889',
    settlementUpiId: 'sundhar8074@axl',
    fssaiLicense: '12423001000456',
    gstin: '33AABCT9981K1Z2',
    totalCapacity: 48,
    tablesCount: 8,
    sections: ['Glasshouse Greenhouse', 'Garden Patio', 'Artisan Bakery Bar'],
    openingHours: '8:00 AM - 10:30 PM',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    submittedAt: 'Today at 07:15 AM',
    status: 'pending',
    notes: 'Serene botanical conservatory garden concept with high-end demographic appeal.',
    complianceScore: 96,
    proposedMenuSample: [
      { name: 'Woodfired Burrata & Heirloom Truffle Pizza', price: 620, desc: 'Fresh Pugliese burrata, roasted cherry tomatoes, basil, and black truffle oil.', tags: ['v', 'chef'] },
      { name: 'Smashed Haas Avocado on Sourdough', price: 440, desc: 'Crushed avocado, Danish feta, pomegranate arils, and organic microgreens.', tags: ['v'] },
      { name: 'Pistachio Baklava Latte', price: 290, desc: 'Espresso with roasted pistachio milk and cardamom infused foam.', tags: ['v'] }
    ],
    proposedTables: [
      { id: 'MBB1', name: 'Glasshouse Table 1', capacity: 2, section: 'Glasshouse Greenhouse', status: 'available', shape: 'round' },
      { id: 'MBB2', name: 'Glasshouse Table 2', capacity: 4, section: 'Glasshouse Greenhouse', status: 'available', shape: 'rect' },
      { id: 'MBB3', name: 'Garden Patio Booth', capacity: 6, section: 'Garden Patio', status: 'available', shape: 'booth' },
      { id: 'MBB4', name: 'Bakery Bar Table', capacity: 2, section: 'Artisan Bakery Bar', status: 'available', shape: 'round' }
    ]
  },
  {
    id: 'REG-2026-8819',
    name: 'Kailash Parbat Pure Veg Thali & Chaat',
    tagline: 'Royal Rajasthani & Punjabi thalis, Sindhi koki, and authentic Delhi street chaats',
    cuisine: 'Pure Vegetarian North Indian & Chaat',
    cuisineTag: 'pure_veg',
    isPureVeg: true,
    cuisineHighlights: ['Royal Sindhi Thali', 'Paneer Lababdar', 'Dahi Puri Platter'],
    priceRange: '₹₹',
    priceLevel: 2,
    location: '88, Ormes Road, Kilpauk, Chennai, Tamil Nadu 600010',
    city: 'Chennai',
    zone: 'Kilpauk',
    lat: 13.0825,
    lng: 80.2430,
    ownerName: 'Manish Chawla',
    ownerEmail: 'manish.kp@kilpauk.com',
    ownerPhone: '+91 98403 44556',
    settlementUpiId: 'sundhar8074@axl',
    fssaiLicense: '12423004000911',
    gstin: '33AABCK3321L1Z9',
    totalCapacity: 80,
    tablesCount: 16,
    sections: ['Royal Maharaja Hall', 'Chaat Live Street Counter', 'Saffron Family Suite'],
    openingHours: '11:00 AM - 11:00 PM',
    coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    submittedAt: 'Yesterday at 06:45 PM',
    status: 'pending',
    notes: 'Established multi-generational pure vegetarian family brand. 100% strictly vegetarian kitchen.',
    complianceScore: 100,
    proposedMenuSample: [
      { name: 'Royal Sindhi Special Thali', price: 420, desc: 'Sindhi kadhi, koki, aloo tuk, dal pakwan, paneer subzi, sweet boondi, and pulav.', tags: ['v', 'chef'] },
      { name: 'Kailash Special Dahi Papdi Chaat', price: 210, desc: 'Crispy wafers, sweet yoghurt, tamarind mint chutneys, and nylon sev.', tags: ['v'] },
      { name: 'Paneer Makhani Sizzler with Jeera Rice', price: 460, desc: 'Grilled cottage cheese skewers with rich tomato butter gravy on sizzling bed.', tags: ['v', 'chef'] }
    ],
    proposedTables: [
      { id: 'KP1', name: 'Maharaja Table 1', capacity: 4, section: 'Royal Maharaja Hall', status: 'available', shape: 'rect' },
      { id: 'KP2', name: 'Maharaja Table 2', capacity: 4, section: 'Royal Maharaja Hall', status: 'available', shape: 'rect' },
      { id: 'KP3', name: 'Family Suite Booth 1', capacity: 8, section: 'Saffron Family Suite', status: 'available', shape: 'booth' },
      { id: 'KP4', name: 'Chaat Counter Table', capacity: 2, section: 'Chaat Live Street Counter', status: 'available', shape: 'round' }
    ]
  },
  {
    id: 'REG-2026-8804',
    name: 'Kobe Sizzlers & Teppanyaki',
    tagline: 'Iconic sizzling platters, smoked garlic meats, teppanyaki noodles & sizzling brownies',
    cuisine: 'Sizzlers & Pan-Asian Grill',
    cuisineTag: 'sizzlers',
    isPureVeg: false,
    cuisineHighlights: ['Steak Sizzler', 'Paneer Shashlik', 'Sizzling Brownie'],
    priceRange: '₹₹₹',
    priceLevel: 3,
    location: '12, College Road, Nungambakkam, Chennai, Tamil Nadu 600006',
    city: 'Chennai',
    zone: 'Nungambakkam',
    lat: 13.0645,
    lng: 80.2420,
    ownerName: 'Farhan Merchant',
    ownerEmail: 'farhan@kobesizzlers.in',
    ownerPhone: '+91 98404 11223',
    settlementUpiId: 'sundhar8074@axl',
    fssaiLicense: '12423005000778',
    gstin: '33AABCK8899N1Z4',
    totalCapacity: 56,
    tablesCount: 10,
    sections: ['Main Sizzler Hall', 'Teppanyaki Counter', 'Garden Alcove'],
    openingHours: '12:00 PM - 11:00 PM',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    submittedAt: '3 days ago',
    status: 'approved',
    approvedAt: '2 days ago',
    notes: 'Approved and active on platform. Full telemetry and live table reservation enabled.',
    complianceScore: 95,
    proposedMenuSample: [
      { name: 'Kobe Special Tenderloin Sizzler', price: 680, desc: 'Smoky grilled steak with butter garlic mushroom sauce, french fries, and steamed veggies.', tags: ['chef'] },
      { name: 'Paneer Shashlik Sizzler with Rice', price: 490, desc: 'Cottage cheese cubes marinated in herbs, grilled on skewers with pepper sauce.', tags: ['v', 'chef'] }
    ],
    proposedTables: [
      { id: 'KB1', name: 'Sizzler Table 1', capacity: 2, section: 'Main Sizzler Hall', status: 'available', shape: 'round' },
      { id: 'KB2', name: 'Sizzler Table 2', capacity: 4, section: 'Main Sizzler Hall', status: 'available', shape: 'rect' }
    ]
  },
  {
    id: 'REG-2026-8798',
    name: 'Dhabba Express Highway Kitchen',
    tagline: 'Rustic Punjabi highway claypot gravies and tandoori naans',
    cuisine: 'North Indian Highway Dhaba',
    cuisineTag: 'north_indian',
    isPureVeg: false,
    cuisineHighlights: ['Butter Chicken', 'Garlic Naan', 'Dal Makhani'],
    priceRange: '₹₹',
    priceLevel: 2,
    location: 'Food Street OMR, Navalur, Chennai, Tamil Nadu 603103',
    city: 'Chennai',
    zone: 'OMR',
    lat: 12.8450,
    lng: 80.2260,
    ownerName: 'Gurpreet Singh',
    ownerEmail: 'gurpreet.omr@dhaba.in',
    ownerPhone: '+91 98405 99887',
    settlementUpiId: 'sundhar8074@axl',
    fssaiLicense: '12421009000123',
    gstin: '33AABCD5544P1Z8',
    totalCapacity: 40,
    tablesCount: 8,
    sections: ['Open Dhaba Seating', 'AC Hall'],
    openingHours: '12:00 PM - 02:00 AM',
    coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    submittedAt: '5 days ago',
    status: 'rejected',
    rejectionReason: 'Expired FSSAI License: Registration requires active FSSAI certificate valid for 2026-2027.',
    notes: 'Requested merchant to renew FSSAI license certificate and re-upload.',
    complianceScore: 62,
    proposedMenuSample: [
      { name: 'Highway Butter Chicken Masala', price: 380, desc: 'Smoky chicken in rich tomato butter gravy.', tags: ['spicy'] }
    ],
    proposedTables: []
  }
];

// DEV / DEMO SEED ACCOUNTS (clearly flagged for local testing)
export const DEV_DEMO_ACCOUNTS = {
  admin: {
    username: 'admin@smarttable.ai',
    password: 'admin123',
    acceptedPasswords: ['admin', 'admin123'],
    email: 'admin@smarttable.ai',
    name: 'Platform Super Admin',
    role: 'admin',
    badge: 'Super Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  owner: {
    username: 'owner@restaurant.com',
    password: 'owner123',
    acceptedPasswords: ['owner', 'owner123'],
    email: 'owner@restaurant.com',
    name: 'Sundhara Pandian (Owner)',
    role: 'owner',
    restaurantId: 'on-de-roof-chennai',
    restaurantName: 'On DE Roof Restaurant',
    badge: 'Restaurant Partner / Owner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  user: {
    username: 'user@example.com',
    password: 'user123',
    acceptedPasswords: ['user', 'user123'],
    email: 'user@example.com',
    name: 'Hema Sundar (Verified Diner)',
    role: 'customer',
    phone: '+91 98400 12345',
    badge: 'VIP Foodie Member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  }
};

// Registered Platform Diners / Users
export const INITIAL_USERS = [
  {
    id: 'USR-101',
    name: 'Hema Sundar',
    username: 'hemasundar',
    password: 'password123',
    email: 'hemasundar@example.com',
    phone: '+91 98400 12345',
    role: 'customer',
    status: 'active', // 'active' | 'deactivated'
    totalBookings: 8,
    totalSpent: 6420,
    favoriteCuisine: 'South Indian Tasting',
    city: 'Chennai',
    joinedDate: '2026-01-15',
    lastActive: 'Just now',
    loyaltyPoints: 320
  },
  {
    id: 'USR-102',
    name: 'Karthik Subramanian',
    username: 'karthik',
    password: 'password123',
    email: 'karthik.subramanian@example.com',
    phone: '+91 98401 55432',
    role: 'customer',
    status: 'active',
    totalBookings: 14,
    totalSpent: 12850,
    favoriteCuisine: 'Indo-Chinese & Asian Fusion',
    city: 'Chennai',
    joinedDate: '2026-02-01',
    lastActive: '2 hours ago',
    loyaltyPoints: 750
  },
  {
    id: 'USR-103',
    name: 'Ananya Sharma',
    username: 'ananya',
    password: 'password123',
    email: 'ananya.sharma@example.com',
    phone: '+91 98840 99881',
    role: 'customer',
    status: 'active',
    totalBookings: 5,
    totalSpent: 4200,
    favoriteCuisine: 'Artisanal Cafe & Brunch',
    city: 'Chennai',
    joinedDate: '2026-03-10',
    lastActive: 'Yesterday',
    loyaltyPoints: 210
  },
  {
    id: 'USR-104',
    name: 'Venkatesh Iyer',
    username: 'venkat',
    password: 'password123',
    email: 'venkat.iyer@example.com',
    phone: '+91 94440 33211',
    role: 'customer',
    status: 'active',
    totalBookings: 9,
    totalSpent: 5180,
    favoriteCuisine: 'Pure Vegetarian Traditional',
    city: 'Chennai',
    joinedDate: '2026-02-18',
    lastActive: '3 days ago',
    loyaltyPoints: 440
  },
  {
    id: 'USR-105',
    name: 'Rohan Mehta',
    username: 'rohan',
    password: 'password123',
    email: 'rohan.mehta@example.com',
    phone: '+91 97909 11223',
    role: 'customer',
    status: 'deactivated',
    totalBookings: 1,
    totalSpent: 850,
    favoriteCuisine: 'Mughlai Biryani',
    city: 'Chennai',
    joinedDate: '2026-04-02',
    lastActive: '2 weeks ago',
    loyaltyPoints: 0,
    deactivationReason: 'Repeated unnotified no-shows'
  }
];

// Registered Restaurant Owners
export const INITIAL_OWNERS = [
  {
    id: 'OWN-201',
    name: 'K. Rajasekhar',
    username: 'rajasekhar',
    password: 'password123',
    email: 'rajasekhar@on-de-roof.com',
    phone: '+91 78453 94944',
    restaurantId: 'on-de-roof-chennai',
    restaurantName: 'On DE Roof Restaurant',
    location: 'Anna Nagar, Chennai',
    fssaiLicense: '12422002000412',
    gstin: '33AABCO7711Q1Z3',
    status: 'active',
    complianceScore: 98,
    settlementUpiId: 'sundhar8074@axl',
    totalTablesManaged: 5,
    joinedDate: '2025-11-20',
    monthlyPayout: 184500
  },
  {
    id: 'OWN-202',
    name: 'Chitra Subramaniam',
    username: 'chitra',
    password: 'password123',
    email: 'chitra@pumpkintales.com',
    phone: '+91 99529 96446',
    restaurantId: 'pumpkin-tales-alwarpet',
    restaurantName: 'Pumpkin Tales Restaurant',
    location: 'Alwarpet, Chennai',
    fssaiLicense: '12423001000889',
    gstin: '33AABCP4412M1Z8',
    status: 'active',
    complianceScore: 99,
    settlementUpiId: 'sundhar8074@axl',
    totalTablesManaged: 4,
    joinedDate: '2025-12-05',
    monthlyPayout: 215000
  },
  {
    id: 'OWN-203',
    name: 'Chef Ajit Bangera',
    username: 'ajit',
    password: 'password123',
    email: 'ajit.bangera@itchotels.in',
    phone: '+91 44 2220 0000',
    restaurantId: 'avartana-itc-grand-chola',
    restaurantName: 'Avartana - ITC Grand Chola',
    location: 'Guindy, Chennai',
    fssaiLicense: '12421008000991',
    gstin: '33AAACI0011K1Z2',
    status: 'active',
    complianceScore: 100,
    settlementUpiId: 'sundhar8074@axl',
    totalTablesManaged: 5,
    joinedDate: '2025-10-15',
    monthlyPayout: 492000
  },
  {
    id: 'OWN-204',
    name: 'M. Padmanabhan',
    username: 'padmanabhan',
    password: 'password123',
    email: 'padmanabhan@padmam.in',
    phone: '+91 44 2815 1122',
    restaurantId: 'padmam-veg-t-nagar',
    restaurantName: 'Padmam Veg Restaurant',
    location: 'T. Nagar, Chennai',
    fssaiLicense: '12423003000551',
    gstin: '33AABCP9922R1Z5',
    status: 'active',
    complianceScore: 96,
    settlementUpiId: 'sundhar8074@axl',
    totalTablesManaged: 5,
    joinedDate: '2026-01-10',
    monthlyPayout: 142000
  },
  {
    id: 'OWN-205',
    name: 'Gurpreet Singh',
    username: 'gurpreet',
    password: 'password123',
    email: 'gurpreet.omr@dhaba.in',
    phone: '+91 98405 99887',
    restaurantId: 'dhabba-express-omr',
    restaurantName: 'Dhabba Express Highway Kitchen',
    location: 'OMR, Chennai',
    fssaiLicense: '12421009000123',
    gstin: '33AABCD5544P1Z8',
    status: 'deactivated',
    complianceScore: 62,
    settlementUpiId: 'sundhar8074@axl',
    totalTablesManaged: 8,
    joinedDate: '2026-02-14',
    monthlyPayout: 0,
    deactivationReason: 'FSSAI License Renewal overdue by 45 days'
  }
];

// Disputes & Flagged Accounts for Admin Resolution Center
export const INITIAL_DISPUTES = [
  {
    id: 'DSP-901',
    orderOrReservationId: 'RES-7734',
    restaurantName: 'On DE Roof Restaurant',
    restaurantId: 'on-de-roof-chennai',
    userName: 'Karthik Subramanian',
    userEmail: 'karthik.subramanian@example.com',
    amount: 580,
    reason: 'Pre-ordered Wok Chilli Garlic Prawns was unavailable during arrival; billing adjusted incorrectly.',
    status: 'pending', // 'pending' | 'resolved' | 'refunded' | 'dismissed'
    category: 'Billing / Pre-order',
    gateway: 'Razorpay',
    createdAt: 'Today, 09:15 AM',
    notes: 'Customer requests refund of ₹580 to original payment method via Razorpay.'
  },
  {
    id: 'DSP-902',
    orderOrReservationId: 'RES-5509',
    restaurantName: 'Padmam Veg Restaurant',
    restaurantId: 'padmam-veg-t-nagar',
    userName: 'Venkatesh Iyer',
    userEmail: 'venkat.iyer@example.com',
    amount: 140,
    reason: 'Special diet requirement (Jain meal) delay of 35 minutes.',
    status: 'resolved',
    category: 'Service Quality',
    gateway: 'UPI',
    createdAt: 'Yesterday, 07:30 PM',
    notes: 'Restaurant manager issued apology voucher and settled dispute directly.'
  },
  {
    id: 'DSP-903',
    orderOrReservationId: 'RES-4412',
    restaurantName: 'The Residency - SKY Asian',
    restaurantId: 'sky-asian-dining-t-nagar',
    userName: 'Priya Nambiar',
    userEmail: 'priya.n@example.com',
    amount: 1200,
    reason: 'Double charge during online card authorization via Stripe gateway.',
    status: 'pending',
    category: 'Payment Gateway Error',
    gateway: 'Stripe',
    createdAt: '2 days ago',
    notes: 'Stripe charge ID ch_3N8vK291 verified. Refund eligible for immediate release.'
  }
];


