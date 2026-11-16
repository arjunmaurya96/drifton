// Simple brand-style glyphs for footer social links (drawn, not official logos).
const P = {
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" /></>,
  facebook: <path d="M14 8h3V4.5h-3c-2.5 0-4 1.6-4 4.2V11H7.5v3.5H10V21h3.6v-6.5h2.9l.5-3.5h-3.4V9.1c0-.7.3-1.1 1.4-1.1z" fill="currentColor" />,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="currentColor" /><path d="M10 9.2v5.6l5-2.8z" fill="#0F1A3C" /></>,
  x: <path d="M4 4h4.6l3.8 5.2L16.8 4H20l-6 7.1L20.5 20h-4.6l-4.1-5.6L7 20H3.8l6.3-7.4z" fill="currentColor" />,
  linkedin: <><rect x="3.5" y="9" width="3.6" height="11" fill="currentColor" /><circle cx="5.3" cy="5.4" r="2.1" fill="currentColor" /><path d="M10 9h3.4v1.6c.6-1 1.9-1.9 3.7-1.9 3 0 3.9 1.9 3.9 4.8V20h-3.6v-5.8c0-1.5-.4-2.5-1.8-2.5-1.5 0-2 1.1-2 2.6V20H10z" fill="currentColor" /></>,
  whatsapp: <><path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 8.3c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.6c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.6c0 .3-.1.6-.4.8-.6.4-1.5.6-2.6.2-2.3-.8-4.3-2.8-5.1-5.1-.3-1.1-.1-2 .1-2.7z" fill="currentColor" /></>,
  pinterest: <path d="M12 2.8a9.2 9.2 0 00-3.4 17.8c-.1-.8-.2-2 0-2.9l1.2-5.1s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.7 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.5 1.9 1.9 0 3.3-2 3.3-4.8 0-2.5-1.8-4.3-4.4-4.3-3 0-4.7 2.2-4.7 4.6 0 .9.3 1.9.8 2.4.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.4-.6-2.2-2.7-2.2-4.3 0-3.5 2.5-6.7 7.3-6.7 3.8 0 6.8 2.7 6.8 6.4 0 3.8-2.4 6.9-5.8 6.9-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.3 1-.9 2.2-1.4 2.9A9.2 9.2 0 1012 2.8z" fill="currentColor" />,
};
export default function SocialIcon({ id, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{P[id]}</svg>;
}
