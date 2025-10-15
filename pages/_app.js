import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

export default function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const t = saved || (prefersDark ? "dark" : "light");
      setTheme(t);
      document.documentElement.setAttribute("data-theme", t);
    } catch {}
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
  }

  return (
    <>
      <Component {...pageProps} theme={theme} toggleTheme={toggleTheme} />
      <Toaster position="top-right" theme={theme === "dark" ? "dark" : "light"} />
    </>
  );
}