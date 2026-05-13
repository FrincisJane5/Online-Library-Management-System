// Import createRoot from React DOM — this is the modern React 18 way to mount the app
import { createRoot } from "react-dom/client";

// Import the root App component that contains all routes and global state
import App from "./App.tsx";

// Import global CSS styles (Tailwind base + custom variables)
import "./index.css";

// Find the <div id="root"> in index.html, create a React root on it,
// then render the <App /> component inside it — this boots the entire application
createRoot(document.getElementById("root")!).render(<App />);
