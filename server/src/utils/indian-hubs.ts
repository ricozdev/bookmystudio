export interface IndianLocationHub {
  id: string;
  name: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: [number, number]; // [lng, lat] GeoJSON format
  tag?: string;
  isPopularHub?: boolean;
}

export const NEUTRAL_ALL_INDIA_HUB: IndianLocationHub = {
  id: 'all-india',
  name: 'All India',
  locality: '',
  city: 'All India',
  state: 'India',
  pincode: '',
  coordinates: [78.9629, 20.5937],
  tag: 'Nationwide Discovery',
  isPopularHub: false,
};

export const DEFAULT_LOCATION: IndianLocationHub = {
  id: 'hyd-madhapur',
  name: 'Madhapur, Hyderabad',
  locality: 'Madhapur',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500081',
  coordinates: [78.3845, 17.4483],
  tag: 'Production & Tech Hub',
  isPopularHub: true,
};

export const INDIAN_PRODUCTION_HUBS: IndianLocationHub[] = [
  // Hyderabad
  DEFAULT_LOCATION,
  {
    id: 'hyd-jubilee-hills',
    name: 'Jubilee Hills, Hyderabad',
    locality: 'Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    coordinates: [78.4073, 17.4319],
    tag: 'Film & Media District',
    isPopularHub: true,
  },
  {
    id: 'hyd-banjara-hills',
    name: 'Banjara Hills, Hyderabad',
    locality: 'Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    coordinates: [78.4482, 17.4156],
    tag: 'Creative Agencies',
    isPopularHub: true,
  },
  {
    id: 'hyd-ramoji',
    name: 'Ramoji Film City, Hyderabad',
    locality: 'Ramoji Film City',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '501512',
    coordinates: [78.6811, 17.2543],
    tag: 'Mega Studio Complex',
    isPopularHub: true,
  },
  {
    id: 'hyd-gachibowli',
    name: 'Gachibowli, Hyderabad',
    locality: 'Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    coordinates: [78.3489, 17.4401],
    tag: 'Broadcast & Tech Hub',
    isPopularHub: false,
  },
  {
    id: 'hyd-manikonda',
    name: 'Manikonda, Hyderabad',
    locality: 'Manikonda',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500089',
    coordinates: [78.3812, 17.4018],
    tag: 'Post-Production Studios',
    isPopularHub: false,
  },
  {
    id: 'hyd-begumpet',
    name: 'Begumpet, Hyderabad',
    locality: 'Begumpet',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500016',
    coordinates: [78.4673, 17.4448],
    tag: 'Central Soundstages',
    isPopularHub: false,
  },

  // Mumbai
  {
    id: 'mum-andheri-west',
    name: 'Andheri West, Mumbai',
    locality: 'Andheri West / Lokhandwala',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    coordinates: [72.8258, 19.1363],
    tag: 'Bollywood Casting & Soundstages',
    isPopularHub: true,
  },
  {
    id: 'mum-bandra-west',
    name: 'Bandra West, Mumbai',
    locality: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    coordinates: [72.8295, 19.0596],
    tag: 'Agency & Director Suites',
    isPopularHub: true,
  },
  {
    id: 'mum-goregaon-filmcity',
    name: 'Goregaon Film City, Mumbai',
    locality: 'Dadasaheb Phalke Chitranagari',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400065',
    coordinates: [72.8887, 19.1643],
    tag: 'National Film & TV Lot',
    isPopularHub: true,
  },
  {
    id: 'mum-juhu',
    name: 'Juhu, Mumbai',
    locality: 'Juhu',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400049',
    coordinates: [72.8266, 19.1075],
    tag: 'Production Houses',
    isPopularHub: false,
  },
  {
    id: 'mum-versova',
    name: 'Versova, Mumbai',
    locality: 'Versova',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400061',
    coordinates: [72.8143, 19.1326],
    tag: 'Writer & Crew Hub',
    isPopularHub: false,
  },
  {
    id: 'mum-lower-parel',
    name: 'Lower Parel, Mumbai',
    locality: 'Lower Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400013',
    coordinates: [72.8306, 18.9984],
    tag: 'Commercial Studios & Ad Agencies',
    isPopularHub: false,
  },

  // Bengaluru
  {
    id: 'blr-koramangala',
    name: 'Koramangala, Bengaluru',
    locality: 'Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    coordinates: [77.6245, 12.9352],
    tag: 'Content & Creator Studios',
    isPopularHub: true,
  },
  {
    id: 'blr-indiranagar',
    name: 'Indiranagar, Bengaluru',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    coordinates: [77.6412, 12.9784],
    tag: 'Design & Photo Lofts',
    isPopularHub: true,
  },
  {
    id: 'blr-hsr-layout',
    name: 'HSR Layout, Bengaluru',
    locality: 'HSR Layout',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560102',
    coordinates: [77.6389, 12.9121],
    tag: 'Podcast & Audio Suites',
    isPopularHub: false,
  },
  {
    id: 'blr-whitefield',
    name: 'Whitefield, Bengaluru',
    locality: 'Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    coordinates: [77.7499, 12.9698],
    tag: 'Large Floor Studios',
    isPopularHub: false,
  },

  // Chennai
  {
    id: 'chn-kodambakkam',
    name: 'Kodambakkam, Chennai',
    locality: 'Kodambakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600024',
    coordinates: [80.2223, 13.0524],
    tag: 'Kollywood Cinema Epicenter',
    isPopularHub: true,
  },
  {
    id: 'chn-vadapalani',
    name: 'Vadapalani, Chennai',
    locality: 'Vadapalani',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600026',
    coordinates: [80.2091, 13.0500],
    tag: 'Studios & Post Facilities',
    isPopularHub: true,
  },
  {
    id: 'chn-adyar',
    name: 'Adyar, Chennai',
    locality: 'Adyar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600020',
    coordinates: [80.2574, 13.0067],
    tag: 'Audio & Dubbing Suites',
    isPopularHub: false,
  },

  // Delhi NCR
  {
    id: 'del-noida-filmcity',
    name: 'Noida Film City, Delhi NCR',
    locality: 'Sector 16A, Film City',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    coordinates: [77.3195, 28.5682],
    tag: 'Broadcast Television Hub',
    isPopularHub: true,
  },
  {
    id: 'del-hauz-khas',
    name: 'Hauz Khas, New Delhi',
    locality: 'Hauz Khas / Shahpur Jat',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110016',
    coordinates: [77.2066, 28.5494],
    tag: 'Fashion & Art Photography',
    isPopularHub: true,
  },
  {
    id: 'del-gurugram-cybercity',
    name: 'Cyber City, Gurugram',
    locality: 'DLF Phase 2',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    coordinates: [77.0878, 28.4907],
    tag: 'Corporate Media & XR Stages',
    isPopularHub: false,
  },
  {
    id: 'del-connaught-place',
    name: 'Connaught Place, New Delhi',
    locality: 'Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    coordinates: [77.2167, 28.6315],
    tag: 'Central Delhi Heritage Locations',
    isPopularHub: false,
  },

  // Kochi
  {
    id: 'cok-kakkanad',
    name: 'Kakkanad, Kochi',
    locality: 'Kakkanad',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682030',
    coordinates: [76.3533, 10.0159],
    tag: 'Mollywood Media City',
    isPopularHub: true,
  },
  {
    id: 'cok-fort-kochi',
    name: 'Fort Kochi, Kochi',
    locality: 'Fort Kochi',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682001',
    coordinates: [76.2434, 9.9658],
    tag: 'Heritage & Waterfront Sets',
    isPopularHub: false,
  },

  // Goa
  {
    id: 'goa-panaji',
    name: 'Panaji, Goa',
    locality: 'Panaji',
    city: 'Panaji',
    state: 'Goa',
    pincode: '403001',
    coordinates: [73.8278, 15.4909],
    tag: 'Festival & Coastal Cinema',
    isPopularHub: true,
  },

  // Kolkata
  {
    id: 'kol-tollygunge',
    name: 'Tollygunge, Kolkata',
    locality: 'Tollygunge',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700033',
    coordinates: [88.3476, 22.4988],
    tag: 'Tollywood Historic Studios',
    isPopularHub: true,
  },

  // Pune
  {
    id: 'pun-koregaon-park',
    name: 'Koregaon Park, Pune',
    locality: 'Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    coordinates: [73.8943, 18.5362],
    tag: 'Boutique Creative Studios',
    isPopularHub: true,
  },
  {
    id: 'pun-baner',
    name: 'Baner, Pune',
    locality: 'Baner',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    coordinates: [73.7868, 18.5590],
    tag: 'Digital Media & Ad Studios',
    isPopularHub: false,
  },

  // Jaipur
  {
    id: 'jai-c-scheme',
    name: 'C-Scheme, Jaipur',
    locality: 'C-Scheme',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    coordinates: [75.8016, 26.9118],
    tag: 'Heritage & Fashion Sets',
    isPopularHub: true,
  },
  {
    id: 'jai-sitapura',
    name: 'Sitapura, Jaipur',
    locality: 'Sitapura Industrial Area',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302022',
    coordinates: [75.8456, 26.7725],
    tag: 'Film & Media Campus',
    isPopularHub: false,
  },

  // Chandigarh
  {
    id: 'chd-sector-17',
    name: 'Sector 17, Chandigarh',
    locality: 'Sector 17',
    city: 'Chandigarh',
    state: 'Chandigarh',
    pincode: '160017',
    coordinates: [76.7794, 30.7333],
    tag: 'Pollywood Music & Media Hub',
    isPopularHub: true,
  },
  {
    id: 'chd-it-park',
    name: 'IT Park, Chandigarh',
    locality: 'Rajiv Gandhi IT Park',
    city: 'Chandigarh',
    state: 'Chandigarh',
    pincode: '160101',
    coordinates: [76.8427, 30.7225],
    tag: 'Post-Production & VFX',
    isPopularHub: false,
  },

  // Ahmedabad
  {
    id: 'amd-sg-highway',
    name: 'SG Highway, Ahmedabad',
    locality: 'Sarkhej - Gandhinagar Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054',
    coordinates: [72.5077, 23.0338],
    tag: 'Commercial Stages & Ad Houses',
    isPopularHub: true,
  },

  // Lucknow
  {
    id: 'lko-gomti-nagar',
    name: 'Gomti Nagar, Lucknow',
    locality: 'Gomti Nagar',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226010',
    coordinates: [80.9992, 26.8504],
    tag: 'North Indian Cinema Hub',
    isPopularHub: true,
  },

  // Bhopal
  {
    id: 'bho-mp-nagar',
    name: 'MP Nagar, Bhopal',
    locality: 'Maharana Pratap Nagar',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462011',
    coordinates: [77.4344, 23.2332],
    tag: 'Central Film Locations & Production',
    isPopularHub: true,
  },

  // Indore
  {
    id: 'ind-vijay-nagar',
    name: 'Vijay Nagar, Indore',
    locality: 'Vijay Nagar',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    coordinates: [75.8942, 22.7533],
    tag: 'Commercial Studio & Live Stage',
    isPopularHub: true,
  },

  // Bhubaneswar
  {
    id: 'bhu-patia',
    name: 'Patia, Bhubaneswar',
    locality: 'Patia / Infocity',
    city: 'Bhubaneswar',
    state: 'Odisha',
    pincode: '751024',
    coordinates: [85.8189, 20.3533],
    tag: 'Ollywood & Digital Media',
    isPopularHub: true,
  },

  // Guwahati
  {
    id: 'gau-zoo-road',
    name: 'Zoo Road, Guwahati',
    locality: 'RG Baruah Road / Zoo Road',
    city: 'Guwahati',
    state: 'Assam',
    pincode: '781005',
    coordinates: [91.7766, 26.1633],
    tag: 'Northeast Cinema & Production',
    isPopularHub: true,
  },

  // Visakhapatnam
  {
    id: 'viz-rushikonda',
    name: 'Rushikonda, Visakhapatnam',
    locality: 'Rushikonda Beach & IT SEZ',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530045',
    coordinates: [83.3855, 17.7816],
    tag: 'Coastal Cinema & Studio District',
    isPopularHub: true,
  },

  // Coimbatore
  {
    id: 'cbe-rs-puram',
    name: 'RS Puram, Coimbatore',
    locality: 'R.S. Puram',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641002',
    coordinates: [76.9508, 11.0084],
    tag: 'Western Tamil Cinema & Commercials',
    isPopularHub: true,
  },

  // Patna
  {
    id: 'pat-fraser-road',
    name: 'Fraser Road, Patna',
    locality: 'Fraser Road',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    coordinates: [85.1376, 25.6093],
    tag: 'Regional Media & Film Services',
    isPopularHub: true,
  },

  // Thiruvananthapuram
  {
    id: 'trv-technopark',
    name: 'Technopark, Thiruvananthapuram',
    locality: 'Kazhakoottam / Technopark',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    pincode: '695581',
    coordinates: [76.8812, 8.5581],
    tag: 'Animation, VFX & Sound stages',
    isPopularHub: true,
  },

  // Dehradun
  {
    id: 'ddn-rajpur-road',
    name: 'Rajpur Road, Dehradun',
    locality: 'Rajpur Road',
    city: 'Dehradun',
    state: 'Uttarakhand',
    pincode: '248001',
    coordinates: [78.0667, 30.3473],
    tag: 'Himalayan Film & Location Base',
    isPopularHub: true,
  },
];

/**
 * Calculates straight-line distance in kilometers between two sets of [lng, lat] coordinates
 * using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  coord1: [number, number], // [lng, lat]
  coord2: [number, number]  // [lng, lat]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Searches local Indian hubs by text or 6-digit PIN code.
 */
export function searchLocalIndianHubs(query: string): IndianLocationHub[] {
  if (!query || !query.trim()) return INDIAN_PRODUCTION_HUBS.filter(h => h.isPopularHub);

  const q = query.trim().toLowerCase();
  const isPin = /^\d{1,6}$/.test(q);

  return INDIAN_PRODUCTION_HUBS.filter((hub) => {
    if (isPin) {
      return hub.pincode.startsWith(q);
    }
    return (
      hub.name.toLowerCase().includes(q) ||
      hub.locality.toLowerCase().includes(q) ||
      hub.city.toLowerCase().includes(q) ||
      hub.state.toLowerCase().includes(q) ||
      hub.pincode.includes(q) ||
      (hub.tag && hub.tag.toLowerCase().includes(q))
    );
  });
}

/**
 * Finds the nearest known Indian hub to the given coordinates.
 */
export function findNearestIndianHub(lng: number, lat: number): { hub: IndianLocationHub; distanceKm: number } {
  if (INDIAN_PRODUCTION_HUBS.length === 0) {
    return { hub: DEFAULT_LOCATION, distanceKm: 0 };
  }
  let nearestHub = INDIAN_PRODUCTION_HUBS[0];
  let minDistance = calculateHaversineDistanceKm([lng, lat], nearestHub.coordinates);

  for (let i = 1; i < INDIAN_PRODUCTION_HUBS.length; i++) {
    const hub = INDIAN_PRODUCTION_HUBS[i];
    const d = calculateHaversineDistanceKm([lng, lat], hub.coordinates);
    if (d < minDistance) {
      minDistance = d;
      nearestHub = hub;
    }
  }

  return { hub: nearestHub, distanceKm: minDistance };
}

