// Old index page - redirects to ProfileSelect (handled by App.tsx routing).
// Kept as a fallback to avoid 404s if anything links to /index.
import { Navigate } from "react-router-dom";
const Index = () => <Navigate to="/" replace />;
export default Index;
