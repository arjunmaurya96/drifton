// =====================================================================
//  Business + social links.
//  Name, address and email are from the client's T&C. Values marked DUMMY still need real details.
// =====================================================================

export const business = {
  name: 'DriftOn™ by AI Enterprises',
  legalName: 'AI Enterprises',
  address: 'Balraj Khanna Marg, Block O, West Patel Nagar, Patel Nagar, New Delhi, Delhi, 110008',
  phone: '', // add the customer-care number when available
  email: 'infodrifton@gmail.com',
  hours: 'Mon–Sat, 10:00 AM – 7:00 PM', // DUMMY
  // Google Business Profile & Maps
  rating: 4.8, // DUMMY
  reviewCount: 126, // DUMMY
  profileUrl: 'https://www.google.com/maps/place/Drifton/@28.651382,77.1606319,17z/data=!3m1!4b1!4m6!3m5!1s0x390d03c1cd6b8e63:0xa44078ab6eed2349!8m2!3d28.651382!4d77.1606319!16s%2Fg%2F11_00ywdr3?hl=en-US&entry=ttu&g_ep=EgoyMDI2MTExNS4wIKXMDSoASAFQAw%3D%3D', // the client's Google Business Profile link
  reviewUrl: 'https://www.google.com/maps/place/Drifton/@28.651382,77.1606319,17z/data=!3m1!4b1!4m6!3m5!1s0x390d03c1cd6b8e63:0xa44078ab6eed2349!8m2!3d28.651382!4d77.1606319!16s%2Fg%2F11_00ywdr3?hl=en-US&entry=ttu&g_ep=EgoyMDI2MTExNS4wIKXMDSoASAFQAw%3D%3D', // the profile's "write a review" link
  mapsUrl: 'https://www.google.com/maps/place/Drifton/@28.651382,77.1606319,17z/data=!3m1!4b1!4m6!3m5!1s0x390d03c1cd6b8e63:0xa44078ab6eed2349!8m2!3d28.651382!4d77.1606319!16s%2Fg%2F11_00ywdr3?hl=en-US&entry=ttu&g_ep=EgoyMDI2MTExNS4wIKXMDSoASAFQAw%3D%3D',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.1274577881745!2d77.1606319!3d28.651382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03c1cd6b8e63%3A0xa44078ab6eed2349!2sDrifton!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin',
  // Google Maps embed: business name + city or the exact address
  mapQuery: 'Drifton, Balraj Khanna Marg, Block O, West Patel Nagar, Patel Nagar, New Delhi, Delhi, 110008',
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
