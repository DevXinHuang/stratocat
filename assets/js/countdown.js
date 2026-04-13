(() => {
  function format(value) {
    return String(value).padStart(2, "0");
  }

  function setCountdown() {
    const data = window.StratocatData;
    const schedule = data && data.schedule ? data.schedule : null;
    const targetIso = schedule && schedule.nextLaunchIso ? schedule.nextLaunchIso : null;
    const scheduleStatus = schedule && schedule.status ? schedule.status : "scheduled";

    const daysEl = document.querySelector("#countdown-days");
    const hoursEl = document.querySelector("#countdown-hours");
    const minsEl = document.querySelector("#countdown-minutes");
    const secsEl = document.querySelector("#countdown-seconds");
    const stateEl = document.querySelector("#countdown-state");

    if (!daysEl || !hoursEl || !minsEl || !secsEl || !stateEl) {
      return;
    }

    if (!targetIso || scheduleStatus === "completed") {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      stateEl.textContent = "Mission 3 scheduling details are being finalized. Check back soon for the live countdown.";
      return;
    }

    const target = new Date(targetIso).getTime();

    function tick() {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minsEl.textContent = "00";
        secsEl.textContent = "00";
        stateEl.textContent = "Mission 3 launch window is open. Switch this page to live status when tracking begins.";
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
      stateEl.textContent = "Mission 3 launch window is counting down.";
    }

    tick();
    setInterval(tick, 1000);
  }

  document.addEventListener("DOMContentLoaded", setCountdown);
})();
