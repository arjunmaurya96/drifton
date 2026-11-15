import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center gap-5 py-36 text-center">
      <h1 className="h2">Page not found</h1>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-navy">Back to home</Link>
    </div>
  );
}
