export const THEME_KEY = "theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

// Runs before paint from the root layout so the first frame already has the right theme.
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||(t!=="light"&&matchMedia("${DARK_QUERY}").matches))document.documentElement.classList.add("dark")}catch(e){}`;
