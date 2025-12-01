import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force unregister all service workers to fix loading issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(() => {
        console.log('Service Worker unregistered:', registration);
      });
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
