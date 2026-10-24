
export interface StudioSpace {
  id: string;
  name: string;
  slug: string;
  category: any;
  categoryLabel: string;
  badgeTopLeft: string;
  badgeTopSecondary?: string;
  rating: number;
  reviewCount: number;
  location: string;
  submarket: string;
  description: string;
  specs: { sqFt: number; gridHeight: string; power: string; access: string };
  amenities: string[];
  equipmentHighlight: string;
  hourlyRate: number;
  dayRate10h: number;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  features: {
    camlockPower: boolean;
    driveInAccess: boolean;
    stc60Certified: boolean;
    northDaylight: boolean;
    gripPackageIncluded: boolean;
  };
}

export interface FilmingLocation {
  id: string;
  name: string;
  slug: string;
  category: any;
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  location: string;
  submarket: string;
  description: string;
  areaSqFt: number;
  ceilingHeight: string;
  powerSupply: string;
  vehicleAccess: string;
  curfewRestrictions: string;
  permitsRequired: string;
  amenities: string[];
  dayRate10h: number;
  hourlyRate: number;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  featured: boolean;
}

export interface ProductionCrewMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  category: any;
  rating: number;
  reviewCount: number;
  location: string;
  credits: string;
  bio: string;
  skills: string[];
  workingKit: string;
  dayRate10h: number;
  nextAvailable: string;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  unionAffiliation: string;
  standardKitIncluded: boolean;
  featured: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  slug: string;
  category: any;
  categoryLabel: string;
  brand: string;
  rating: number;
  dayRate: number;
  weeklyRate: number;
  replacementValue: number;
  description: string;
  keySpecs: string[];
  includedAccessories: string[];
  powerRequirement: string;
  mountType?: string;
  imageUrl: string;
  galleryImages: string[];
  imageAlt: string;
  featured: boolean;
}

export const INITIAL_STUDIOS: StudioSpace[] = [
  {
    id: 'studio-greenpoint',
    name: 'The Greenpoint Cove & Daylight Cyc',
    slug: 'the-greenpoint-cove',
    category: 'cyclorama',
    categoryLabel: 'Cyclorama Stage',
    badgeTopLeft: 'DAYLIGHT DRIVE-IN',
    badgeTopSecondary: 'Stage A',
    rating: 4.98,
    reviewCount: 38,
    location: 'Greenpoint Waterfront, Brooklyn',
    submarket: 'Greenpoint & Brooklyn Navy Yard',
    description:
      'A flagship commercial production cyclorama stage perched along the Brooklyn waterfront. Features an expansive 2-wall seamless white infinity cove, 22-foot high steel rigging grid with chain hoists, natural north-facing daylight skylights, and direct ground-level roll-up vehicle drive-in bay for automotive and heavy lighting access.',
    specs: {
      sqFt: 4200,
      gridHeight: '22ft Grid',
      power: '300A 3-Phase',
      access: 'Drive-in Bay',
    },
    amenities: [
      'Client production mezzanine lounge',
      'Dual hair and makeup vanity styling stations',
      'Dedicated green room with private restroom',
      'Ground roll-up vehicle drive-in door (14ft clearance)',
      'High-speed commercial gigabit fiber uplink',
      'In-house Profoto D2 lighting package & rolling C-stands',
    ],
    equipmentHighlight: 'Includes Profoto Flashtube, rolling stands & prime rigging package',
    hourlyRate: 175,
    dayRate10h: 1750,
    imageUrl: '/images/studios/greenpoint-cove.svg',
    galleryImages: [
      '/images/studios/greenpoint-cove.svg',
      '/images/studios/apex-stage-c.svg',
      '/images/studios/mercer-skylight.svg',
    ],
    imageAlt: 'The Greenpoint Cove two-wall seamless cyclorama studio with daylight factory windows and overhead grid',
    features: {
      camlockPower: true,
      driveInAccess: true,
      stc60Certified: false,
      northDaylight: true,
      gripPackageIncluded: true,
    },
  },
  {
    id: 'studio-apex',
    name: 'Apex Cinema Lot — Stage C Soundstage',
    slug: 'apex-cinema-lot-stage-c',
    category: 'soundstage',
    categoryLabel: 'Acoustic Soundstage',
    badgeTopLeft: '40 STC 64 CERTIFIED',
    badgeTopSecondary: 'Soundproof',
    rating: 5.0,
    reviewCount: 52,
    location: 'Long Island City Studio Complex',
    submarket: 'Long Island City / Queens Hub',
    description:
      'Purpose-built cinema soundstage certified at STC 64 acoustic attenuation. Designed for dialogue-critical narrative feature films and commercial broadcast wraps. Equipped with a motorized 28-foot steel box truss system, 600A three-phase Camlock power drop, whisper-quiet continuous HVAC, and acoustic bass traps.',
    specs: {
      sqFt: 8200,
      gridHeight: '28ft Truss',
      power: '600A Camlock',
      access: 'Silent Bass Trap',
    },
    amenities: [
      'STC 64 certified acoustic wall and ceiling sync baffles',
      'Silent continuous chilled-water HVAC (under NC-20 rating)',
      '600A 3-Phase Camlock distribution subpanel',
      'Attached multi-office production suite & craft services bay',
      'Direct load-in dock for two full-size grip box trucks',
      'DMX motorized automated lighting hoist controls',
    ],
    equipmentHighlight: 'ARRI Skypanel motorized grid, silent HVAC & dedicated production offices',
    hourlyRate: 295,
    dayRate10h: 2650,
    imageUrl: '/images/studios/apex-stage-c.svg',
    galleryImages: [
      '/images/studios/apex-stage-c.svg',
      '/images/studios/greenpoint-cove.svg',
      '/images/studios/hudson-harbor.svg',
    ],
    imageAlt: 'Apex Cinema Lot Stage C professional dark acoustic soundstage with high motorized truss and LED lighting',
    features: {
      camlockPower: true,
      driveInAccess: true,
      stc60Certified: true,
      northDaylight: false,
      gripPackageIncluded: true,
    },
  },
  {
    id: 'studio-mercer',
    name: 'The Mercer Skylight Loft & Commercial Kitchen',
    slug: 'the-mercer-skylight-loft',
    category: 'kitchen',
    categoryLabel: 'Daylight & Culinary Loft',
    badgeTopLeft: 'NATURAL DAYLIGHT',
    badgeTopSecondary: 'Floor 4 (Elevator)',
    rating: 4.92,
    reviewCount: 29,
    location: 'SoHo Cast Iron District, Manhattan',
    submarket: 'Downtown Manhattan / SoHo',
    description:
      'A luminous fourth-floor culinary loft inside an authentic 1890s SoHo cast-iron building. Boasts floor-to-ceiling arched windows, original bleached oak flooring, historic cast-iron columns, and a fully functional commercial restaurant cooking line with stainless mobile island ranges, 3-phase power subpanels, and prep stations.',
    specs: {
      sqFt: 3100,
      gridHeight: '16ft Ceilings',
      power: '3-Phase Subpanel',
      access: 'Freight Elevator',
    },
    amenities: [
      'Commercial 6-burner gas range & salamander broiler',
      'Dual convection ovens and stainless mobile prep islands',
      'Direct oversized freight elevator opens into studio space',
      'All-day uninterrupted natural skylight & western daylight exposure',
      'Styling wardrobe room with steamers & vanity mirrors',
      'Dedicated dish pit and commercial sanitizing station',
    ],
    equipmentHighlight: 'Working commercial cook range, 3-phase subpanel & mobile prep island',
    hourlyRate: 185,
    dayRate10h: 1665,
    imageUrl: '/images/studios/mercer-skylight.svg',
    galleryImages: [
      '/images/studios/mercer-skylight.svg',
      '/images/studios/hudson-harbor.svg',
      '/images/studios/greenpoint-cove.svg',
    ],
    imageAlt: 'The Mercer Skylight Loft bright sunlit space with hardwood floors and commercial culinary kitchen set',
    features: {
      camlockPower: true,
      driveInAccess: false,
      stc60Certified: false,
      northDaylight: true,
      gripPackageIncluded: false,
    },
  },
  {
    id: 'studio-hudson',
    name: 'Hudson Harbor Daylight & Wrap Cyc',
    slug: 'hudson-harbor-daylight',
    category: 'daylight',
    categoryLabel: 'Waterfront Daylight Cyc',
    badgeTopLeft: 'CHROMA KEY',
    badgeTopSecondary: 'Cyclorama',
    rating: 4.97,
    reviewCount: 44,
    location: 'Chelsea Arts District, Manhattan',
    submarket: 'Chelsea Arts District',
    description:
      'High-altitude creative studio in the heart of Chelsea Arts District overlooking the Hudson River. Features 80% continuous floor-to-ceiling glass wall facade with motorized diffusion and blackout shades, a dual wraparound cyclorama cove, and 400A clean power for fashion editorials, beauty, and music videos.',
    specs: {
      sqFt: 5200,
      gridHeight: '24ft Cyc',
      power: '400A Service',
      access: '80% Glass Walls',
    },
    amenities: [
      'Dual wraparound white seamless cove (convertible to green screen)',
      'Automated motorized daylight-to-blackout blackout solar shades',
      'Panoramic sunset views over Hudson River & maritime piers',
      'VIP talent green room with private en-suite bath',
      '400A three-phase electrical distribution panels',
      'Separate freight elevator dock with 8,000 lb capacity',
    ],
    equipmentHighlight: 'Dual wraparound white cove, daylight-to-blackout automated motorized shades',
    hourlyRate: 210,
    dayRate10h: 1890,
    imageUrl: '/images/studios/hudson-harbor.svg',
    galleryImages: [
      '/images/studios/hudson-harbor.svg',
      '/images/studios/greenpoint-cove.svg',
      '/images/studios/apex-stage-c.svg',
    ],
    imageAlt: 'Hudson Harbor Daylight studio with floor-to-ceiling panoramic glass windows and wrap-around cove',
    features: {
      camlockPower: false,
      driveInAccess: false,
      stc60Certified: false,
      northDaylight: true,
      gripPackageIncluded: true,
    },
  },
];

export const INITIAL_LOCATIONS: FilmingLocation[] = [
  {
    id: 'loc-bushwick-warehouse',
    name: 'Bushwick Industrial Brick Warehouse & Timber Dock',
    slug: 'bushwick-brick-warehouse',
    category: 'warehouse',
    categoryLabel: 'Warehouse / Industrial',
    rating: 4.96,
    reviewCount: 31,
    location: 'Bushwick Industrial Zone, Brooklyn',
    submarket: 'Brooklyn Hub',
    description:
      'Authentic early-20th-century manufacturing warehouse featuring raw textured brick masonry, 24-foot clear span timber trusses, multi-pane steel factory sash windows, and an expansive polished concrete floor. Includes private off-street parking for 8 grip box trucks and drive-in roll-up doors.',
    areaSqFt: 6500,
    ceilingHeight: '24ft Clear Timber',
    powerSupply: '400A 3-Phase Camlock',
    vehicleAccess: 'Ground roll-up drive-in door (16ft clearance)',
    curfewRestrictions: '24/7 filming allowed (industrial M3-1 zoning)',
    permitsRequired: 'Standard NYC Mayor’s Office Film Permit (MOFTB)',
    amenities: [
      'Direct ground-level truck bay load-in',
      'Raw distressed brick and distressed steel beams',
      'Private enclosed staging lot for production basecamp',
      'High-speed on-site fiber internet',
      'Dual 200A camlock disconnects',
    ],
    dayRate10h: 2400,
    hourlyRate: 250,
    imageUrl: '/images/locations/bushwick-brick-warehouse.svg',
    galleryImages: [
      '/images/locations/bushwick-brick-warehouse.svg',
      '/images/locations/red-hook-dock.svg',
      '/images/locations/tribeca-cast-iron-loft.svg',
    ],
    imageAlt: 'Bushwick Industrial Brick Warehouse interior with tall factory windows and timber beams',
    featured: true,
  },
  {
    id: 'loc-tribeca-loft',
    name: 'Tribeca Architectural Corinthian Cast-Iron Loft',
    slug: 'tribeca-cast-iron-loft',
    category: 'loft',
    categoryLabel: 'Architectural Loft',
    rating: 4.98,
    reviewCount: 22,
    location: 'Tribeca Historic District, Manhattan',
    submarket: 'Downtown Manhattan',
    description:
      'Impeccably restored landmark loft featuring fluted Corinthian cast-iron structural columns, 18-foot ceilings with historic crown moldings, bleached wide-plank white oak flooring, and oversized arched southern windows providing museum-grade natural diffusion.',
    areaSqFt: 4800,
    ceilingHeight: '18ft Architectural',
    powerSupply: '200A Dedicated Subpanel',
    vehicleAccess: 'Curbside street loading with freight elevator',
    curfewRestrictions: 'Curfew at 22:00 for sound; overnight by special HOA permit',
    permitsRequired: 'Standard NYC MOFTB & building interior film agreement',
    amenities: [
      'Original 19th-century cast-iron fluted columns',
      'Curated high-end architectural designer furniture props',
      'High-capacity keyed freight elevator direct to space',
      'Sound dampening acoustic subflooring',
      'Private producer suite and client green room',
    ],
    dayRate10h: 3200,
    hourlyRate: 340,
    imageUrl: '/images/locations/tribeca-cast-iron-loft.svg',
    galleryImages: [
      '/images/locations/tribeca-cast-iron-loft.svg',
      '/images/studios/mercer-skylight.svg',
      '/images/locations/bushwick-brick-warehouse.svg',
    ],
    imageAlt: 'Tribeca Architectural Loft with arched windows, white walls, and cast-iron columns',
    featured: true,
  },
  {
    id: 'loc-red-hook-dock',
    name: 'Red Hook Maritime Pier & Container Terminal',
    slug: 'red-hook-dock-terminal',
    category: 'industrial',
    categoryLabel: 'Open Maritime Dock',
    rating: 4.93,
    reviewCount: 19,
    location: 'Red Hook Maritime Basin, Brooklyn',
    submarket: 'Waterfront Brooklyn',
    description:
      'A rare, unrestricted 14,000 square foot open asphalt marine dock and pier facility with unobstructed views of the Statue of Liberty, shipping channels, maritime cranes, and industrial container stacks. Accommodates heavy cranes, stunt vehicles, and major feature camera tracking rigs.',
    areaSqFt: 14000,
    ceilingHeight: 'Open Sky Unrestricted',
    powerSupply: '1200A Twin-Pack Generator Tap',
    vehicleAccess: 'Direct unobstructed heavy equipment & semi-truck access',
    curfewRestrictions: 'No curfew (active maritime industrial sector)',
    permitsRequired: 'NYC Small Business Services (SBS) Waterfront & MOFTB',
    amenities: [
      'Direct deep-water barge and camera boat mooring access',
      'Unrestricted open 360-degree sky views and horizon sunset',
      'Heavy-load asphalt rated for 80,000 lb mobile crane outriggers',
      'Secure gated 24/7 access control guard post',
      'Fresh water and waste utility tie-ins on dock',
    ],
    dayRate10h: 4200,
    hourlyRate: 450,
    imageUrl: '/images/locations/red-hook-dock.svg',
    galleryImages: [
      '/images/locations/red-hook-dock.svg',
      '/images/locations/greenpoint-industrial-rooftop.svg',
      '/images/studios/hudson-harbor.svg',
    ],
    imageAlt: 'Red Hook Waterfront dock terminal with shipping containers and open harbor views',
    featured: true,
  },
  {
    id: 'loc-greenpoint-rooftop',
    name: 'Greenpoint Skyline Panorama Industrial Rooftop',
    slug: 'greenpoint-industrial-rooftop',
    category: 'rooftop',
    categoryLabel: 'Rooftop Deck',
    rating: 4.95,
    reviewCount: 27,
    location: 'Greenpoint Historic Industrial District, Brooklyn',
    submarket: 'Greenpoint Waterfront',
    description:
      'Expansive 8,000 square foot commercial gravel rooftop deck situated atop an active industrial textile facility. Provides unobstructed 360-degree panoramic skyline vistas of Midtown and Downtown Manhattan, authentic vintage cedar water tower props, and perimeter steel safety railings.',
    areaSqFt: 8000,
    ceilingHeight: 'Open Sky',
    powerSupply: '200A Rooftop Generator Tap',
    vehicleAccess: 'Internal 10,000 lb industrial freight elevator',
    curfewRestrictions: 'Outdoor wrap at 23:00 per city noise regulations',
    permitsRequired: 'Standard NYC MOFTB filming permit',
    amenities: [
      'Historic authentic weathered wood cedar water tower',
      'Perimeter safety tie-off points and camera harness lines',
      'Direct freight elevator access with wide double doors',
      'Covered indoor staging holding area on floor 5',
      'Full southern and western sunset exposure over Manhattan',
    ],
    dayRate10h: 2800,
    hourlyRate: 300,
    imageUrl: '/images/locations/greenpoint-industrial-rooftop.svg',
    galleryImages: [
      '/images/locations/greenpoint-industrial-rooftop.svg',
      '/images/locations/bushwick-brick-warehouse.svg',
      '/images/studios/greenpoint-cove.svg',
    ],
    imageAlt: 'Greenpoint Industrial Rooftop overlooking Manhattan skyline and water tower',
    featured: true,
  },
];

export const INITIAL_CREW: ProductionCrewMember[] = [
  {
    id: 'crew-elena',
    name: 'Elena Rostova',
    slug: 'elena-rostova-gaffer',
    role: 'GAFFER & TECH LIGHTING',
    category: 'grip_sound',
    rating: 4.99,
    reviewCount: 42,
    location: 'Brooklyn, NY (Local Hire)',
    credits: 'Commercials · Music Videos · HBO Series',
    bio:
      'IATSE Local 52 Chief Lighting Technician with over 12 years of commercial, high-end fashion editorial, and narrative production experience. Specializes in advanced DMX networking, large-scale cyclorama pre-lights, and high-speed lighting rigs with specialized flicker-free LED and HMI engines.',
    skills: [
      'Advanced Wireless DMX & CRMX LumenRadio networks',
      'ARRI Skypanel / Orbiter motorized grid setups',
      'Camlock 3-Phase power balancing & generator safety',
      'High-speed Phantom / 1000fps flicker-free lighting',
      'Softbox rigging & speedrail grid construction',
    ],
    workingKit: 'Working Kit: Aputure 600c Pro · E-Hazed Cart · Broncolor Para 88',
    dayRate10h: 950,
    nextAvailable: 'Nov 18',
    imageUrl: '/images/crew/elena-rostova.svg',
    galleryImages: ['/images/crew/elena-rostova.svg', '/images/studios/greenpoint-cove.svg'],
    imageAlt: 'Elena Rostova, Chief Lighting Technician & Gaffer with lighting fixture',
    unionAffiliation: 'IATSE Local 52',
    standardKitIncluded: true,
    featured: true,
  },
  {
    id: 'crew-marcus',
    name: 'Marcus Vance',
    slug: 'marcus-vance-dp',
    role: 'DIRECTOR OF PHOTOGRAPHY',
    category: 'camera_lighting',
    rating: 5.0,
    reviewCount: 58,
    location: 'New York, NY (Local Hire)',
    credits: 'Vogue · Zero Zero Campaign · High Mobility',
    bio:
      'Commercial DP and IATSE Local 600 camera operator known for kinetic handheld cinematography, high-speed car-to-car camera tracking, and deep textural natural lighting. Regularly lenses global campaigns for luxury automotive, athletic apparel, and beauty brands.',
    skills: [
      'RED V-Raptor 8K VV & ARRI LF sensor workflows',
      'Cooke S4/i & Master Prime optical character matching',
      'Car rigging & high-speed vibration isolation gimbals',
      'Live color grading with Pomfort Livegrade',
      'Steadicam and handheld body rig operating',
    ],
    workingKit: 'Working Kit: RED V-Raptor 8K VV · Cook S4/i Primes · Car Rigging Kit',
    dayRate10h: 750,
    nextAvailable: 'Nov 20',
    imageUrl: '/images/crew/marcus-vance.svg',
    galleryImages: ['/images/crew/marcus-vance.svg', '/images/studios/apex-stage-c.svg'],
    imageAlt: 'Marcus Vance, Director of Photography with RED camera rig on set',
    unionAffiliation: 'IATSE Local 600',
    standardKitIncluded: true,
    featured: true,
  },
  {
    id: 'crew-tariq',
    name: 'Tariq Simmons',
    slug: 'tariq-simmons-sound-mixer',
    role: 'PRODUCTION SOUND MIXER',
    category: 'grip_sound',
    rating: 4.97,
    reviewCount: 39,
    location: 'Queens / Brooklyn, NY (Local Hire)',
    credits: 'Narrative Features · A24 · Netflix Originals',
    bio:
      'Production Sound Mixer dedicated to dialogue fidelity in acoustic studio environments and demanding urban locations. Deploys enterprise multi-channel digital wireless systems with real-time frequency coordination, ensuring pristine multi-track recordings under high RF density.',
    skills: [
      'Sound Devices 833 / Scorpio 32-bit float recording',
      'Wisycom multi-channel ultra-wideband wireless systems',
      'Schoeps CMIT 5U & DPA 4060 miniature lavalier miking',
      'Ambient Lockit wireless timecode sync ecosystems',
      'RF venue scanning & multi-transmitter frequency coordination',
    ],
    workingKit: 'Working Kit: Sound Devices 833 · 4x Wisycom Wireless · Schoeps CMIT',
    dayRate10h: 900,
    nextAvailable: 'Nov 19',
    imageUrl: '/images/crew/tariq-simmons.svg',
    galleryImages: ['/images/crew/tariq-simmons.svg', '/images/studios/apex-stage-c.svg'],
    imageAlt: 'Tariq Simmons, Production Sound Recordist with wireless audio rig and headphones',
    unionAffiliation: 'IATSE Local 52',
    standardKitIncluded: true,
    featured: true,
  },
  {
    id: 'crew-chloe',
    name: 'Chloe Desroches',
    slug: 'chloe-desroches-hair-makeup',
    role: 'HAIR/MAKEUP DEPT HEAD',
    category: 'styling_art',
    rating: 4.95,
    reviewCount: 36,
    location: 'Manhattan, NY (Local Hire)',
    credits: 'NYFW Editorial · Dazed & Confused · Clean Beauty',
    bio:
      'Key Hair and Makeup Designer with a strong background in high-fashion editorial, beauty campaigns, and high-definition 8K camera skin prep. Certified in safe studio sanitation protocols and modern airbrush application techniques.',
    skills: [
      'High-definition 8K camera skincare prep & finishing',
      'Editorial hair sculpting & thermal Dyson styling',
      'Custom airbrush makeup application & prosthetic blending',
      'Strict union hygiene & studio sanitation compliance',
      'On-set continuity monitoring with calibrated photo iPads',
    ],
    workingKit: 'Working Kit: Dyson Pro Kit · Full Sanitation Station · Airbrush Kit',
    dayRate10h: 800,
    nextAvailable: 'Nov 18',
    imageUrl: '/images/crew/chloe-desroches.svg',
    galleryImages: ['/images/crew/chloe-desroches.svg', '/images/studios/mercer-skylight.svg'],
    imageAlt: 'Chloe Desroches, Hair & Makeup Department Head in studio vanity room',
    unionAffiliation: 'IATSE Local 798',
    standardKitIncluded: true,
    featured: true,
  },
];

export const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'eq-alexa-35',
    name: 'ARRI Alexa 35 Cinema Camera Production Package',
    slug: 'arri-alexa-35-production-kit',
    category: 'cameras',
    categoryLabel: 'Cinema Camera Package',
    brand: 'ARRI',
    rating: 5.0,
    dayRate: 1450,
    weeklyRate: 4350,
    replacementValue: 85000,
    description:
      'The industry gold standard cinema camera system featuring the Super 35 4.6K sensor with 17 stops of dynamic range, ARRI REVEAL Color Science, and native high-speed recording up to 120fps. Fully built production package ready for cinema and high-end commercial wraps.',
    keySpecs: [
      '4.6K Super 35 CMOS Sensor with 17 Stops Dynamic Range',
      'ARRIRAW and Apple ProRes onboard recording up to 120 fps',
      'LPL Mount with PL-to-LPL optical adapter included',
      'Dual 2TB Codex High-Performance Compact Drives',
      'ARRI MVF-2 OLED Viewfinder with heated eyecup',
    ],
    includedAccessories: [
      'Codex Compact Drive 2TB (x2) & USB-C Reader',
      'B-Mount Battery Station & 4x 150Wh B-Mount Batteries',
      'ARRI Production Cage (CCH-1, MSB-3, Bridgeplate BP-8)',
      '19mm and 15mm lightweight steel iris rods',
      'Pelican 1615 Air Hard Flight Case',
    ],
    powerRequirement: '24V B-Mount High Voltage',
    mountType: 'ARRI LPL / PL Adapter',
    imageUrl: '/images/equipment/arri-alexa-35.svg',
    galleryImages: ['/images/equipment/arri-alexa-35.svg', '/images/studios/apex-stage-c.svg'],
    imageAlt: 'ARRI Alexa 35 Cinema Camera Package with cage and lens mount',
    featured: true,
  },
  {
    id: 'eq-aputure-cs15',
    name: 'Aputure Electro Storm CS15 1500W RGB Fixture',
    slug: 'aputure-electro-storm-cs15',
    category: 'lighting',
    categoryLabel: 'High-Output Color LED',
    brand: 'Aputure',
    rating: 4.97,
    dayRate: 450,
    weeklyRate: 1350,
    replacementValue: 12000,
    description:
      'Ultra-powerful 1500W point-source full-color LED engine outputting light comparable to an 1800W HMI fixture. Dual accessory electronic mount with motorized yoke capability, IP65 weather-resistance, and wireless CRMX control for studio stage cyclorama pre-lighting.',
    keySpecs: [
      '1,500W High-Output Full-Color RGBACL LED Engine',
      'High-speed PWM Dimming with 0.1% stepless precision',
      'CRI ≥98, TLCI ≥98, SSI (D56) 86, SSI (Tungsten) 89',
      'Wireless LumenRadio CRMX, Art-net, sACN & DMX512',
      'IP65 Dust and Water-Resistant Heavy-Duty Alloy Enclosure',
    ],
    includedAccessories: [
      'Electro Storm CS15 Control Ballast & 100ft Camlock/AC Head Cable',
      'Removable Dual-Mount 35-Degree Reflector Bell',
      'Motorized Yoke with Junior 1-1/8in Mounting Pin',
      'Hard Molded Rolling Transport Flight Case',
    ],
    powerRequirement: '120V-240V AC / 15A max draw',
    mountType: 'Aputure Electronic A-Mount & Standard Bowens',
    imageUrl: '/images/equipment/aputure-electro-storm.svg',
    galleryImages: ['/images/equipment/aputure-electro-storm.svg', '/images/studios/greenpoint-cove.svg'],
    imageAlt: 'Aputure Electro Storm CS15 1500W color LED studio fixture',
    featured: true,
  },
  {
    id: 'eq-sound-devices-833',
    name: 'Sound Devices 833 8-Channel / 12-Track Field Recorder',
    slug: 'sound-devices-833-audio-kit',
    category: 'audio',
    categoryLabel: 'Audio Field Recorder Kit',
    brand: 'Sound Devices',
    rating: 4.99,
    dayRate: 350,
    weeklyRate: 1050,
    replacementValue: 6500,
    description:
      'Ultra-compact professional 8-channel, 12-track production audio recorder with 6 discrete Kashmir microphone preamplifiers, 32-bit float recording capabilities, integrated Dugan automixing, and internal SSD recording redundancy.',
    keySpecs: [
      '6 Ultra-Low Noise Kashmir Mic Preamps with Analog Limiters',
      '8 Channels, 12 Tracks of simultaneous WAV broadcast audio',
      'Dual SD card slots & internal 256GB SSD storage',
      'Ultra-accurate Ambient Lockit internal timecode generator',
      'Full Dugan and Sound Devices MixAssist automated mixing algorithms',
    ],
    includedAccessories: [
      'Orca OR-30 Audio Production Bag & Harness',
      '4x TA3 to XLR Male Audio Output Breakout Adapters',
      'Dual Hirose 4-Pin Smart Battery Power Distribution Cups',
      '4x Audioroot 98Wh Smart Lithium Batteries & Dual Charger',
      'Pelican Storm Transport Case',
    ],
    powerRequirement: '10-18V DC Hirose / Sony L-Mount',
    mountType: 'Audio Harness / C-Stand Mount',
    imageUrl: '/images/equipment/sound-devices-833.svg',
    galleryImages: ['/images/equipment/sound-devices-833.svg', '/images/studios/apex-stage-c.svg'],
    imageAlt: 'Sound Devices 833 audio recorder with gain faders and LCD meters',
    featured: true,
  },
  {
    id: 'eq-fisher-10',
    name: 'J.L. Fisher Model 10 Hydraulic Studio Camera Dolly',
    slug: 'fisher-10-camera-dolly',
    category: 'grip',
    categoryLabel: 'Hydraulic Camera Dolly',
    brand: 'J.L. Fisher',
    rating: 4.98,
    dayRate: 550,
    weeklyRate: 1650,
    replacementValue: 24000,
    description:
      'The industry premier hydraulic camera dolly for smooth elevation changes and tracking shots on studio concrete and steel tracks. Features an effortless hydraulic center boom arm, three steering modes (Crab, Conventional, Round), and 500 lb load rating.',
    keySpecs: [
      'Smooth hydraulic center lift arm with nitrogen accumulator',
      'Three selectable steering modes: Crab, Conventional, and Rounding',
      'Maximum payload capacity: 500 lbs (226 kg)',
      'Boom travel elevation: 13.75 inches up to 63.5 inches',
      'Operates on both smooth stage concrete and straight/curved dolly track',
    ],
    includedAccessories: [
      'Pneumatic Floor Wheels and Track Skate Wheels Set',
      'Leveling Mitchell Camera Mount Head with Tie-Down',
      'Swivel Operator Seat with 6-inch and 12-inch risers',
      'Push Bar Handle and Removable Front Deck Boards',
      '80 feet of Precision Straight Steel Dolly Track (5x 8ft, 4x 10ft)',
    ],
    powerRequirement: 'Manual Hydraulic Foot Pump & Charge',
    mountType: 'Standard Mitchell Base',
    imageUrl: '/images/equipment/fisher-dolly.svg',
    galleryImages: ['/images/equipment/fisher-dolly.svg', '/images/locations/red-hook-dock.svg'],
    imageAlt: 'J.L. Fisher Model 10 Camera Dolly with track wheels on studio rails',
    featured: true,
  },
];

