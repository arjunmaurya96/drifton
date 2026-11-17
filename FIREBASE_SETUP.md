# Firebase setup — DriftOn

Jab tak Firebase keys nahi daloge, website aur admin panel **demo mode** me chalte rahenge (kuch tootega nahi).
Keys daalte hi orders, enquiries aur admin panel real database se chalne lagenge.

## 1. Firebase project banao
1. https://console.firebase.google.com → **Add project** → naam: `drifton` → Google Analytics off (zarurat nahi) → Create.

## 2. Firestore database on karo
1. Left menu → **Build → Firestore Database** → **Create database**.
2. Location: **asia-south1 (Mumbai)** → **Start in production mode** → Enable.
3. **Rules** tab kholo → repo ki `firestore.rules` file ka pura content paste karo → **Publish**.

## 3. Login (Email/Password) on karo
1. **Build → Authentication** → Get started → **Email/Password** → Enable → Save.
2. **Users** tab → **Add user** → admin ka email + strong password daalo (ye admin panel ka login hoga).
3. Us user ka **User UID** copy karo.

## 4. Us user ko admin banao
1. Firestore Database → **Start collection** → Collection ID: `admins`.
2. Document ID: **wahi UID paste karo** → ek field daalo: `name` (string) = `Owner` → Save.

> Jis user ka `admins/{uid}` document nahi hoga, wo admin panel me login nahi kar payega.

## 5. Web app keys lo
1. Project settings (⚙️) → **Your apps** → Web icon `</>` → naam `drifton-web` → Register.
2. Jo `firebaseConfig` dikhega usme se values copy karo.

## 6. Keys project me daalo
**Local (apne computer pe):** `.env.example` ko copy karke `.env.local` banao aur values bharo:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=drifton-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=drifton-xxxx
VITE_FIREBASE_STORAGE_BUCKET=drifton-xxxx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
Fir `npm run dev` dobara chalao. (`.env.local` git me push nahi hoti.)

**Vercel (live site):** Project → Settings → **Environment Variables** → upar wale 6 naam + values add karo → **Redeploy**.

Vercel ka domain bhi add karo: Firebase → Authentication → Settings → **Authorized domains** → `drifton.co.in` (aur `xxx.vercel.app`).

## 7. Pehli baar admin panel
1. `/admin` kholo → step 3 wale email/password se login.
2. Upar blue strip aayegi **"Publish defaults"** → click karo. Isse prices, offers, coupons aur settings database me save ho jayenge.
3. Ab jo bhi admin panel me badloge (price, offer on/off, coupon, product hide, announcement text) wo website pe dikhega.

## Database me kya kya save hota hai
| Collection | Kya hai |
|---|---|
| `orders/JSR-drifton-0041` | Har order (pehla order JSR-drifton-0041 se start) |
| `counters/orders` | Agla order number |
| `enquiries` | Contact page ke messages (distributor, retailer, etc.) |
| `config/store` | Prices, offers, coupons, products, settings |
| `reviews` | Reviews (admin publish/hide karta hai) |
| `admins/{uid}` | Kaun admin hai |

## Free plan (Spark)
Roz ~50,000 reads aur ~20,000 writes free — shuru ke liye kaafi hai. Card ki zarurat nahi.
