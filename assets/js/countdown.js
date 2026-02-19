(() => {
  function format(value) {
    return String(value).padStart(2, "0");
  }

  function setCountdown() {
    const data = window.StratocatData;
    const targetIso =
      data && data.schedule && data.schedule.nextLaunchIso
        ? data.schedule.nextLaunchIso
        : "2026-02-28T08:00:00-07:00";

    const target = new Date(targetIso).getTime();
    const daysEl = document.querySelector("#countdown-days");
    const hoursEl = document.querySelector("#countdown-hours");
    const minsEl = document.querySelector("#countdown-minutes");
    const secsEl = document.querySelector("#countdown-seconds");
    const stateEl = document.querySelector("#countdown-state");

    if (!daysEl || !hoursEl || !minsEl || !secsEl || !stateEl) {
      return;
    }

    function tick() {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minsEl.textContent = "00";
        secsEl.textContent = "00";
        stateEl.textContent = "Launch window is open or complete. Update this page with live status.";
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      daysEl.textContent = format(days);
      hoursEl.textContent = format(hours);
      minsEl.textContent = format(mins);
      secsEl.textContent = format(secs);
      stateEl.textContent = "Mission 2 launch window is counting down.";
    }

    tick();
    setInterval(tick, 1000);
  }

  document.addEventListener("DOMContentLoaded", setCountdown);
})();
