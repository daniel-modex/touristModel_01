export interface Place {
  name: string;
  location: string;
  image: string;
  rating: number;
  /** price per night / person in Indian rupees */
  price: number;
  unit: string;
}

export interface Category {
  id: string;
  label: string;
  /** SVG path data (viewBox 0 0 32 32, stroked, no fill) */
  icon: string[];
  places: Place[];
}

/** Thin line icons, one visual language: 32px grid, 1.4 stroke, round caps. */
const ICONS = {
  beaches: [
    'M21.5 11.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z',
    'M9 24c0-5.5 1-10 4.5-13',
    'M13.5 11c-2.5-3-7-3-9 .5M13.5 11c.5-3.5 4.5-5 7-3.5M13.5 11c-3.5 1-5.5 4-5.5 6.5M13.5 11c3 0 5 2 5.5 4.5',
    'M3 25.5c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 7 0 3.5 1.5 5 .5',
    'M3 29.5c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 7 0 3.5 1.5 5 .5',
  ],
  backwaters: [
    'M7 24c0-4.5.5-8 3.5-11',
    'M10.5 13c-2.5-2.5-6-2.5-8 0M10.5 13c.5-3 4-4.5 6.5-3M10.5 13c-3 .5-4.5 3-4.5 5.5M10.5 13c2.5.5 4.5 2.5 5 5',
    'M18 22h10l-1.5 3.5h-7z',
    'M23 22v-5l-3 3',
    'M3 28.5c2.5-1.5 4.5-1.5 7 0s4.5 1.5 7 0 4.5-1.5 7 0 3.5 1 5 0',
  ],
  hills: [
    'M2.5 26l9-14 5 8 3.5-5 9.5 11z',
    'M7 8l-3 5h6z',
    'M7 13v3',
    'M21 9l-2 3h4z',
    'M21 12v2',
  ],
  houseboats: [
    'M4 19.5h24l-3 6.5H7z',
    'M8.5 19.5v-5h15v5',
    'M6 14.5c3-5 17-5 20 0',
    'M12 17h2.5M17.5 17H20',
    'M3 29.5c3-1.5 5-1.5 8 0s5 1.5 8 0 5-1.5 8 0',
  ],
  waterfalls: [
    'M3 6.5h9l1.5 4v17.5',
    'M29 6.5h-9l-1.5 4',
    'M16 9.5v15M18.5 9.5v17M21 9.5v14',
    'M9 29c4-2.5 14-2.5 19 0',
  ],
  wildlife: [
    'M8.5 15c-1.5 0-2.5-1.5-2.5-3.2s1-3 2.5-3 2.5 1.4 2.5 3.1S10 15 8.5 15z',
    'M14.5 11c-1.5 0-2.5-1.8-2.5-3.6S13 4 14.5 4 17 5.6 17 7.4 16 11 14.5 11z',
    'M21 11c-1.5 0-2.5-1.8-2.5-3.6S19.5 4 21 4s2.5 1.6 2.5 3.4S22.5 11 21 11z',
    'M26.5 15c-1.5 0-2.5-1.5-2.5-3.2s1-3 2.5-3 2.5 1.4 2.5 3.1S28 15 26.5 15z',
    'M9.5 24.5c0-4.5 3.5-8 8-8s8 3.5 8 8c0 3-3 3.8-8 2.5-5 1.3-8 .5-8-2.5z',
  ],
  tea: [
    'M16 28.5V14',
    'M16 14C9.5 14 6.5 10 6.5 5.5 13 5.5 16 9 16 14z',
    'M16 19c6.5 0 9.5-4 9.5-8.5C19 10.5 16 14 16 19z',
    'M16 14c0-4 1-7 3.5-9.5',
    'M3 29h26',
  ],
  heritage: [
    'M4.5 28.5v-4h23v4',
    'M8 24.5v-5h16v5',
    'M11.5 19.5v-4.5h9v4.5',
    'M14 15v-3.5h4V15',
    'M16 11.5V5M14.5 7.5h3',
    'M14 28.5v-3a2 2 0 0 1 4 0v3',
  ],
  adventure: [
    'M2.5 27L16 6l13.5 21z',
    'M16 27l-4.5-8M16 27l4.5-8',
    'M16 6V2.5l4 1.5-4 1.5',
    'M1.5 27h29',
  ],
  countryside: [
    'M3 13.5a5.5 5.5 0 0 1 11 0',
    'M3 20c8-3.5 18-3.5 26 0',
    'M3 25c8-3.5 18-3.5 26 0',
    'M3 30c8-3.5 18-3.5 26 0',
    'M19 15.5l4.5-4.5 4.5 4.5v3.5h-9z',
  ],
} as const;

export const CATEGORIES: Category[] = [
  {
    id: 'beaches',
    label: 'Beaches',
    icon: [...ICONS.beaches],
    places: [
      { name: 'Kovalam Beach', location: 'Thiruvananthapuram', image: 'images/kovalam.jpg', rating: 4.7, price: 4200, unit: 'night' },
      { name: 'Varkala Cliff', location: 'Thiruvananthapuram', image: 'images/varkala.jpg', rating: 4.8, price: 3600, unit: 'night' },
      { name: 'Marari Beach', location: 'Alappuzha', image: 'images/cat-marari.jpg', rating: 4.6, price: 5400, unit: 'night' },
    ],
  },
  {
    id: 'backwaters',
    label: 'Backwaters',
    icon: [...ICONS.backwaters],
    places: [
      { name: 'Alleppey Backwaters', location: 'Alappuzha', image: 'images/pkg-backwaters.jpg', rating: 4.8, price: 3900, unit: 'night' },
      { name: 'Kumarakom Lake Resort', location: 'Kottayam', image: 'images/cat-kumarakom.jpg', rating: 4.7, price: 6800, unit: 'night' },
      { name: 'Nedumudy Canals', location: 'Kuttanad', image: 'images/cat-nedumudy.jpg', rating: 4.6, price: 2800, unit: 'night' },
    ],
  },
  {
    id: 'hills',
    label: 'Hill Stations',
    icon: [...ICONS.hills],
    places: [
      { name: 'Munnar Tea Hills', location: 'Idukki', image: 'images/munnar.jpg', rating: 4.9, price: 4500, unit: 'night' },
      { name: 'Vagamon Meadows', location: 'Idukki', image: 'images/cat-vagamon.jpg', rating: 4.6, price: 3200, unit: 'night' },
      { name: 'Anamudi, Eravikulam', location: 'Munnar', image: 'images/cat-anamudi.jpg', rating: 4.8, price: 3800, unit: 'night' },
    ],
  },
  {
    id: 'houseboats',
    label: 'Houseboats',
    icon: [...ICONS.houseboats],
    places: [
      { name: 'Punnamada Houseboat', location: 'Alappuzha', image: 'images/cat-houseboat-punnamada.jpg', rating: 4.8, price: 9500, unit: 'night' },
      { name: 'Nedumudy Cruise', location: 'Kuttanad', image: 'images/cat-houseboat-nedumudy.jpg', rating: 4.7, price: 8200, unit: 'night' },
      { name: 'Kumarakom Houseboat', location: 'Kottayam', image: 'images/cat-houseboat-kumarakom.jpg', rating: 4.7, price: 10500, unit: 'night' },
    ],
  },
  {
    id: 'waterfalls',
    label: 'Waterfalls',
    icon: [...ICONS.waterfalls],
    places: [
      { name: 'Athirappilly Falls', location: 'Thrissur', image: 'images/cat-athirappilly.jpg', rating: 4.8, price: 1800, unit: 'person' },
      { name: 'Soochipara Falls', location: 'Wayanad', image: 'images/cat-soochipara.jpg', rating: 4.6, price: 1400, unit: 'person' },
      { name: 'Athirappilly Viewpoint', location: 'Thrissur', image: 'images/cat-athirappilly-view.jpg', rating: 4.7, price: 1600, unit: 'person' },
    ],
  },
  {
    id: 'wildlife',
    label: 'Wildlife',
    icon: [...ICONS.wildlife],
    places: [
      { name: 'Periyar Lake Cruise', location: 'Thekkady', image: 'images/cat-periyar-lake.jpg', rating: 4.7, price: 2200, unit: 'person' },
      { name: 'Elephant Camp', location: 'Thekkady', image: 'images/cat-elephant.jpg', rating: 4.8, price: 2800, unit: 'person' },
      { name: 'Nilgiri Tahr Trail', location: 'Eravikulam', image: 'images/cat-tahr.jpg', rating: 4.8, price: 1900, unit: 'person' },
    ],
  },
  {
    id: 'tea',
    label: 'Tea Estates',
    icon: [...ICONS.tea],
    places: [
      { name: 'Mattupetty Estate', location: 'Munnar', image: 'images/hero-poster.jpg', rating: 4.8, price: 4800, unit: 'night' },
      { name: 'Kolukkumalai Sunrise', location: 'Munnar', image: 'images/cat-kolukkumalai.jpg', rating: 4.9, price: 3500, unit: 'night' },
      { name: 'Vagamon Tea Gardens', location: 'Idukki', image: 'images/cat-vagamon-tea.jpg', rating: 4.6, price: 3000, unit: 'night' },
    ],
  },
  {
    id: 'heritage',
    label: 'Heritage',
    icon: [...ICONS.heritage],
    places: [
      { name: 'Fort Kochi Walk', location: 'Ernakulam', image: 'images/kochi.jpg', rating: 4.7, price: 1500, unit: 'person' },
      { name: 'Padmanabhaswamy Temple', location: 'Thiruvananthapuram', image: 'images/cat-padmanabha.jpg', rating: 4.9, price: 1200, unit: 'person' },
      { name: 'Theyyam Performance', location: 'Kannur', image: 'images/cat-theyyam.jpg', rating: 4.9, price: 1500, unit: 'person' },
    ],
  },
  {
    id: 'adventure',
    label: 'Adventure',
    icon: [...ICONS.adventure],
    places: [
      { name: 'Munnar Jeep Safari', location: 'Idukki', image: 'images/blog-jeep.jpg', rating: 4.8, price: 2400, unit: 'person' },
      { name: 'Periyar Stream Trek', location: 'Thekkady', image: 'images/blog-forest.jpg', rating: 4.7, price: 2100, unit: 'person' },
      { name: 'Chembra Peak Trek', location: 'Wayanad', image: 'images/cat-chembra.jpg', rating: 4.8, price: 1800, unit: 'person' },
    ],
  },
  {
    id: 'countryside',
    label: 'Countryside',
    icon: [...ICONS.countryside],
    places: [
      { name: 'Kuttanad Paddy Fields', location: 'Alappuzha', image: 'images/cat-kuttanad.jpg', rating: 4.6, price: 2600, unit: 'night' },
      { name: 'Palakkad Villages', location: 'Palakkad', image: 'images/cat-palakkad.jpg', rating: 4.5, price: 2400, unit: 'night' },
      { name: 'Misty Vattathani', location: 'Palakkad', image: 'images/cat-vattathani.jpg', rating: 4.7, price: 2900, unit: 'night' },
    ],
  },
];
