import { Gem, Flower, Leaf, Drop } from './Icons.jsx';

const Hex = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l8 4.6v9.8l-8 4.6-8-4.6V7.1z" opacity=".9" />
    <path d="M12 7l4 2.3v4.6L12 16.2 8 13.9V9.3z" fill="#000" opacity=".35" />
  </svg>
);
const Sprig = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M12 22V6" />
    {[6, 9.5, 13].map((y) => (
      <g key={y}>
        <ellipse cx="9.2" cy={y} rx="2.6" ry="1.5" transform={`rotate(-35 9.2 ${y})`} fill="currentColor" stroke="none" />
        <ellipse cx="14.8" cy={y} rx="2.6" ry="1.5" transform={`rotate(35 14.8 ${y})`} fill="currentColor" stroke="none" />
      </g>
    ))}
    <ellipse cx="12" cy="3.6" rx="1.5" ry="2.2" fill="currentColor" stroke="none" />
  </svg>
);

const map = {
  gem: () => <Gem size={26} />,
  flower: () => <Flower size={26} />,
  leaf: () => <Leaf size={26} sw={1.8} />,
  drop: () => <Drop size={26} />,
  hex: () => <Hex />,
  sprig: () => <Sprig />,
};

export default function IngredientIcon({ icon }) {
  const I = map[icon] || map.leaf;
  return <I />;
}
