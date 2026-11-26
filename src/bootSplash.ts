const BOOT_SPLASH_ID = "boot-splash";
const HIDE_CLASS = "boot-splash--hide";

export function dismissBootSplash() {
  const splash = document.getElementById(BOOT_SPLASH_ID);
  if (!splash || splash.classList.contains(HIDE_CLASS)) {
    return;
  }

  splash.classList.add(HIDE_CLASS);
  splash.setAttribute("aria-busy", "false");

  const remove = () => {
    splash.remove();
  };

  splash.addEventListener("transitionend", remove, { once: true });
  window.setTimeout(remove, 280);
}