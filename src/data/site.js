// =====================================================================
//  Business + social links.
//  Name, address and email are from the client's T&C. Values marked DUMMY still need real details.
// =====================================================================

export const business = {
  name: 'DriftOn™ by AI Enterprises',
  legalName: 'AI Enterprises',
  address: 'Block-O, No. 28, Balraj Khanna Marg, West Patel Nagar, New Delhi – 110008, India',
  phone: '', // add the customer-care number when available
  email: 'infodrifton@gmail.com',
  hours: 'Mon–Sat, 10:00 AM – 7:00 PM', // DUMMY
  // Google Business Profile & Maps
  rating: 4.8, // DUMMY
  reviewCount: 126, // DUMMY
  profileUrl: 'https://maps.app.goo.gl/ea8hYYkU7zMWvenP9', // the client's Google Business Profile link
  reviewUrl: 'https://maps.app.goo.gl/ea8hYYkU7zMWvenP9', // the profile's "write a review" link
  mapsUrl: 'https://maps.app.goo.gl/ea8hYYkU7zMWvenP9',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.1274577881745!2d77.15805697623916!3d28.651381975654316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03c1cd6b8e63%3A0xa44078ab6eed2349!2sDrifton!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin',
  // Google Maps embed: business name + city or the exact address
  mapQuery: 'Drifton, Balraj Khanna Marg, West Patel Nagar, New Delhi 110008',
  // Orders ship with Ekart — "Track" takes the customer to the Ekart tracking site
  trackUrl: 'https://www.ekartlogistics.com/',
  // Manufacturer details for the Terms page header — PLACEHOLDER, get the real details from the client
  manufacturer: { name: '[Manufacturer name]', address: '[Manufacturer address]', licence: '[Licence / registration no.]' },
};

// Footer social links ('#' = dummy). Set url to '' to hide an icon.
export const socials = [
  { id: 'instagram', color: 'linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF 75%,#515BD4)', label: 'Instagram', url: 'https://www.instagram.com/reels/Dd6qP9CRxax/' },
  { id: 'facebook', color: '#1877F2', label: 'Facebook', url: '#' },
  { id: 'youtube', color: '#FF0000', label: 'YouTube', url: '#' },
  { id: 'x', color: '#000000', label: 'X (Twitter)', url: '#' },
  { id: 'linkedin', color: '#0A66C2', label: 'LinkedIn', url: '#' },
  { id: 'whatsapp', color: '#25D366', label: 'WhatsApp', url: '#' },
  { id: 'pinterest', color: '#E60023', label: 'Pinterest', url: '#' },
];
