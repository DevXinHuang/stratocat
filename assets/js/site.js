(() => {
  function setActiveNav() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const href = link.getAttribute("href");
      const active = href === page || (page === "" && href === "index.html");
      if (active) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function setupMobileMenu() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-menu]");
    if (!menuButton || !menu) return;

    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("menu-open", !expanded);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    setupMobileMenu();
  });
})();
