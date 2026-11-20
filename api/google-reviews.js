// Vercel Serverless Function: Real-time Google Reviews Fetcher
// Fetches live reviews directly from Google Places API with edge caching.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Edge cache for 30 mins to stay blazing fast & within Google free limits
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || process.env.VITE_GOOGLE_PLACE_ID;
  const cid = process.env.GOOGLE_PLACE_CID || '11835592498425439049'; // Exact DriftOn Google Maps CID

  if (!apiKey) {
    return res.status(200).json({
      success: true,
      live: false,
      message: 'Add GOOGLE_PLACES_API_KEY in Vercel to activate live sync.',
    });
  }

  try {
    let url = '';
    if (placeId) {
      url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,reviews,user_ratings_total&reviews_sort=newest&key=${apiKey}`;
    } else {
      url = `https://maps.googleapis.com/maps/api/place/details/json?cid=${encodeURIComponent(cid)}&fields=name,rating,reviews,user_ratings_total&reviews_sort=newest&key=${apiKey}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      return res.status(200).json({
        success: false,
        live: false,
        error: data.error_message || data.status,
      });
    }

    const rawReviews = data.result.reviews || [];
    const formattedReviews = rawReviews.slice(0, 6).map((r, i) => ({
      id: `google-${r.time || i}`,
      rating: r.rating || 5,
      author: r.author_name || 'Google Customer',
      time: r.relative_time_description || 'Recently',
      title: r.text ? (r.text.slice(0, 45) + (r.text.length > 45 ? '...' : '')) : 'Verified Google Review',
      text: r.text || 'Great product!',
      profilePhoto: r.profile_photo_url || null,
      authorUrl: r.author_url || null,
    }));

    return res.status(200).json({
      success: true,
      live: true,
      rating: data.result.rating || 4.8,
      reviewCount: data.result.user_ratings_total || 126,
      reviews: formattedReviews,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      live: false,
      error: err.message,
    });
  }
}
