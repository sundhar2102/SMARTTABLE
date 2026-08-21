const fs = require('fs');

const seedJsPath = './seed.js';
let seedJs = fs.readFileSync(seedJsPath, 'utf8');

const newRestaurants = `
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
];`;

seedJs = seedJs.replace('];\n\nexport const seedDatabase = async () => {', newRestaurants + '\n\nexport const seedDatabase = async () => {');
seedJs = seedJs.replace("console.log('✅ SQLite Database seeded successfully with Chennai Restaurants & Google Maps Links!');", "console.log('✅ MySQL Database seeded successfully with Chennai Restaurants & Google Maps Links!');");

const newInsertions = `
  // Additional Sample Users
  await queryRun(
    \`INSERT INTO users (id, name, email, role, restaurant_id) VALUES (?, ?, ?, ?, ?)\`,
    ['user-2', 'Priya Raman', 'priya.raman@example.com', 'customer', null]
  );
  await queryRun(
    \`INSERT INTO users (id, name, email, role, restaurant_id) VALUES (?, ?, ?, ?, ?)\`,
    ['user-3', 'Sathish Kumar', 'sathish.k@example.com', 'customer', null]
  );
  await queryRun(
    \`INSERT INTO users (id, name, email, role, restaurant_id) VALUES (?, ?, ?, ?, ?)\`,
    ['rider-1', 'Murugan R', 'murugan.r@example.com', 'rider', null]
  );
  await queryRun(
    \`INSERT INTO users (id, name, email, role, restaurant_id) VALUES (?, ?, ?, ?, ?)\`,
    ['restaurant-admin-2', 'Sangeetha Manager', 'admin@sangeethaadyar.com', 'admin', 'sangeetha-veg-adyar']
  );

  // Additional Reservations
  await queryRun(
    \`INSERT INTO reservations (id, restaurant_id, restaurant_name, table_id, table_name, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status, order_status, special_requests, pre_ordered_items_json, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
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
    \`INSERT INTO reservations (id, restaurant_id, restaurant_name, table_id, table_name, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status, order_status, special_requests, pre_ordered_items_json, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
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
    \`INSERT INTO riders (id, name, phone, vehicle, status, cluster_zone)
     VALUES (?, ?, ?, ?, ?, ?)\`,
    ['RIDER-001', 'Murugan R', '+91 98765 43210', 'TN 01 AB 1234 (Honda Activa)', 'available', 'T. Nagar']
  );
  await queryRun(
    \`INSERT INTO riders (id, name, phone, vehicle, status, cluster_zone)
     VALUES (?, ?, ?, ?, ?, ?)\`,
    ['RIDER-002', 'Dinesh S', '+91 87654 32109', 'TN 09 XY 9876 (TVS Jupiter)', 'on-trip', 'Anna Nagar']
  );

  // Sample Orders
  await queryRun(
    \`INSERT INTO orders (id, restaurant_id, restaurant_name, fulfillment_type, guest_name, guest_email, guest_phone, status, order_status, delivery_address, delivery_distance_km, delivery_eta_mins, item_total, grand_total, rider_id, rider_name, pre_ordered_items_json, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
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
    \`INSERT INTO orders (id, restaurant_id, restaurant_name, fulfillment_type, table_id, table_name, guest_name, guest_email, guest_phone, status, order_status, item_total, grand_total, pre_ordered_items_json, qr_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
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
`;

seedJs = seedJs.replace("console.log('✅ MySQL Database seeded successfully with Chennai Restaurants & Google Maps Links!');", newInsertions + "\n  console.log('✅ MySQL Database seeded successfully with Chennai Restaurants & Google Maps Links!');");

fs.writeFileSync('database/seed_updated.js', seedJs, 'utf8');
