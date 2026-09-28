(() => {
  const TICK_MS = 3000;        // delay between actions
  const MAX_IDLE_TICKS = 4;    // stop after ~12s with nothing to do
  const MAX_APPLIES = 100;     // safety cap

  let applyCount = 0, idle = 0;
  const openedCards = new WeakSet();

  const isVisible = el => el && el.offsetParent !== null && !el.disabled;
  const textOf = el => (el.innerText || el.value || '').trim();
  const clickable = () => [...document.querySelectorAll(
    'button, a, [role="button"], input[type="button"], input[type="submit"]'
  )].filter(isVisible);

  const findBulk = () => {
    const el = document.querySelector('button[ng-click*="applyBulk"]');
    return isVisible(el) ? el : null;
  };

  const findApply = () => {
    const legacy = document.querySelector('.apply[ng-click*="submitChoice"] .new-btn, .apply[ng-click*="submitChoice"]');
    if (isVisible(legacy)) return legacy;
    // "Apply" / "Apply now" — \b excludes "Applied"
    return clickable().find(el => /^apply\b/i.test(textOf(el)) && !/not interested/i.test(textOf(el)));
  };

  const findNextViewJob = () =>
    clickable().find(el => /view job/i.test(textOf(el)) && !openedCards.has(el));

  const log = (msg, color) => console.log(`%c${msg}`, `color:${color};font-weight:bold`);

  const id = setInterval(() => {
    if (applyCount >= MAX_APPLIES) return stop('Safety cap reached');

    const bulk = findBulk();
    if (bulk) { bulk.click(); applyCount++; idle = 0;
      return log(`✅ [${applyCount}] Bulk Apply at ${new Date().toLocaleTimeString()}`, 'blue'); }

    const apply = findApply();
    if (apply) { apply.click(); applyCount++; idle = 0;
      return log(`✅ [${applyCount}] Apply at ${new Date().toLocaleTimeString()}`, 'teal'); }

    const view = findNextViewJob();
    if (view) { openedCards.add(view); view.click(); idle = 0;
      return log('🚀 Opened next job', 'green'); }

    if (++idle >= MAX_IDLE_TICKS) stop('No more jobs found');
  }, TICK_MS);

  function stop(reason) {
    clearInterval(id);
    log(`🏁 ${reason}. Total applied: ${applyCount}`, '#2196F3');
  }

  window.stopAutoApply = () => stop('Stopped manually');
  log('▶️ Auto-apply started. Run stopAutoApply() to stop.', 'green');
})();
