export interface Destination {
  location: string;
  title: string;
  image: string;
  size: 'wide' | 'narrow';
}

export interface TourPackage {
  id: string;
  days: string;
  rating: number;
  dates: string;
  title: string;
  /** place name used on the tab */
  place: string;
  /** price per person in Indian rupees (INR) */
  price: number;
  /** full-bleed background */
  bg: string;
  blurb: string;
  highlights: string[];
}

export interface Step {
  title: string;
  text: string;
  icon: 'search' | 'ticket' | 'payment' | 'compass';
}

export interface BlogPost {
  date: string;
  title: string;
  excerpt: string;
  image: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export interface NavLink {
  label: string;
  /** id of the section the link scrolls to */
  id: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Destinations', id: 'destinations' },
  { label: 'How It Works', id: 'how' },
  { label: 'Tours', id: 'packages' },
  { label: 'Stories', id: 'blog' },
  { label: 'Contact', id: 'contact' },
];

export const STATS = [
  { value: 10, suffix: 'M+', label: 'Total Customers' },
  { value: 9, suffix: '+', label: 'Years Of Experience', pad: 2 },
  { value: 12, suffix: 'K', label: 'Total Destinations' },
  { value: 5, suffix: '', label: 'Average Rating', decimals: 1, display: '5.0' },
];

export const DESTINATIONS: Destination[] = [
  { location: 'Munnar, Idukki', title: 'Munnar Tea Hills Tour', image: 'images/munnar.jpg', size: 'wide' },
  { location: 'Kovalam, Thiruvananthapuram', title: 'Kovalam Beach Tourism', image: 'images/kovalam.jpg', size: 'narrow' },
  { location: 'Varkala, Thiruvananthapuram', title: 'Varkala Cliff Tourism', image: 'images/varkala.jpg', size: 'narrow' },
  { location: 'Fort Kochi, Ernakulam', title: 'Fort Kochi Heritage Tour', image: 'images/kochi.jpg', size: 'wide' },
];

export const STEPS: Step[] = [
  {
    title: 'Find your destination',
    text: 'Embark on a journey to discover your dream destination, where adventure and relaxation await among the hills and backwaters.',
    icon: 'search',
  },
  {
    title: 'Book a ticket',
    text: 'Ensure a smooth travel experience by booking tickets to your preferred destination via our booking platform.',
    icon: 'ticket',
  },
  {
    title: 'Make payment',
    text: 'We offer a variety of payment options to meet your preferences and ensure a hassle-free transaction process.',
    icon: 'payment',
  },
  {
    title: 'Explore destination',
    text: "You'll be immersed in a captivating tapestry of sights, sounds and tastes as you wind your way through God's Own Country.",
    icon: 'compass',
  },
];

export const PACKAGES: TourPackage[] = [
  {
    id: 'munnar',
    days: '7 Days',
    rating: 4.9,
    dates: '22 Aug – 29 Aug',
    title: 'Munnar Tour Package',
    place: 'Munnar',
    price: 23999,
    bg: 'images/munnar.jpg',
    blurb:
      'Seven slow days in tea country: a sunrise above the clouds at Kolukkumalai, a walk with the Nilgiri tahr at Eravikulam, and mornings that smell of fresh-picked leaves.',
    highlights: ['Kolukkumalai sunrise', 'Eravikulam National Park', 'Tea estate walk', 'Mattupetty lake'],
  },
  {
    id: 'athirappilly',
    days: '5 Days',
    rating: 4.8,
    dates: '22 Aug – 27 Aug',
    title: 'Athirappilly Tour Package',
    place: 'Athirappilly',
    price: 17999,
    bg: 'images/journey-athirappilly.jpg',
    blurb:
      'Five days chasing water through the forest: the thundering Athirappilly Falls, the quieter Vazhachal gorge, and green trails along the Chalakudy river.',
    highlights: ['Athirappilly Falls', 'Vazhachal Falls', 'Chalakudy river', 'Forest trails'],
  },
  {
    id: 'alleppey',
    days: '3 Days',
    rating: 4.8,
    dates: '23 Aug – 25 Aug',
    title: 'Alleppey Tour Package',
    place: 'Alleppey',
    price: 13499,
    bg: 'images/journey-alleppey.jpg',
    blurb:
      'Three days drifting through the backwaters: a night on a houseboat across Vembanad Lake, village canals lined with coconut palms, and dinner cooked on board.',
    highlights: ['Houseboat night', 'Vembanad Lake', 'Kuttanad canals', 'Village canoe ride'],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Donald Sullivan',
    role: 'Founder Flex',
    quote:
      'This travel website is very informative and easy to use. I like how they present various destination options and travel packages with clear details. Offering pictures and destination descriptions helps me decide where I want to visit. Additionally, the ability to compare prices and reviews from other users is very helpful in decision making.',
  },
  {
    name: 'Meera Nair',
    role: 'Travel Blogger',
    quote:
      'Our Munnar and Alleppey trip was planned in minutes. The houseboat stay, the tea estate walk and the local guides were all exactly as described. I would happily book every holiday here.',
  },
  {
    name: 'Arjun Menon',
    role: 'Photographer',
    quote:
      'From the misty hills of Wayanad to the cliffs of Varkala, every itinerary felt thoughtfully put together. Transparent prices and genuine reviews made choosing the right package effortless.',
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    date: 'Nov 14, 2022',
    title: '2023 Kerala Travel Trends – what you need to know',
    excerpt: '2023 taught us valuable life lessons. Plans don’t always work out, flexibility in life is key, a…',
    image: 'images/blog-forest.jpg',
  },
  {
    date: 'Nov 18, 2022',
    title: 'Jeep Adventure is a new attraction for tourists visiting Munnar',
    excerpt: 'Jeep Adventure is one of the tourist attractions that has been popular recently. The sensation…',
    image: 'images/blog-jeep.jpg',
  },
];

export const FOOTER_COLUMNS = [
  { title: 'About', links: ['About Us', 'Blog', 'Careers', 'Jobs', 'In Press', 'Gallery'] },
  { title: 'Support', links: ['Contact Us', 'Online Chat', 'Whatsapp', 'Telegram', 'Ticketing', 'Call Center'] },
  { title: 'FAQ', links: ['Account', 'Booking', 'Payments', 'Return', 'Privacy Policy', 'Terms & Condition'] },
];
