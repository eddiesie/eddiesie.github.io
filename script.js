// 等 DOM 準備好，避免抓不到節點
document.addEventListener('DOMContentLoaded', () => {
  // 年份
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ===========================
   *  平滑捲動（導覽錨點）
   *  調整速度：SCROLL_DURATION（毫秒，越大越慢）
   * =========================== */
  const SCROLL_DURATION = 700; // ←★ 調速：預設 700ms，可改成 400/1000 等

  // 緩動函式（easeInOutCubic）
  const easeInOutCubic = t => (t < 0.5)
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function smoothScrollTo(targetY, duration){
    const startY = window.scrollY || window.pageYOffset;
    const diff = targetY - startY;
    let start;
    function step(ts){
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(t);
      window.scrollTo(0, Math.round(startY + diff * eased));
      if (elapsed < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const header = document.querySelector('.site-header');

  // 讓所有 href 以 # 開頭且對應到頁面元素的連結，都用平滑捲動
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const hash = a.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH - 8; // -8px 小緩衝
      smoothScrollTo(Math.max(0, y), SCROLL_DURATION); // ←★ 速度由上方變數控制
      history.pushState(null, '', hash); // 更新網址（不觸發原生跳轉）
    });
  });

  // 讓頁面上每一個 .rail-wrap 都有自己的左右鍵與拖曳捲動
  document.querySelectorAll('.rail-wrap').forEach((wrap) => {
    const rail = wrap.querySelector('.rail');
    const prevBtn = wrap.querySelector('.rail-btn.prev');
    const nextBtn = wrap.querySelector('.rail-btn.next');
    if (!rail || !prevBtn || !nextBtn) return;

    const step = () => Math.min(rail.clientWidth * 0.8, 600);

    // 點擊箭頭滑動
    prevBtn.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => rail.scrollBy({ left:  step(), behavior: 'smooth' }));

    // 滑鼠拖曳 / 觸控滑動
    let isDown = false, startX = 0, startLeft = 0;
    rail.addEventListener('pointerdown', (e) => {
      isDown = true;
      rail.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startLeft = rail.scrollLeft;
    });
    rail.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      rail.scrollLeft = startLeft - (e.clientX - startX);
    });
    ['pointerup','pointercancel','pointerleave'].forEach(ev =>
      rail.addEventListener(ev, () => { isDown = false; })
    );

    // 垂直滾輪 → 轉成水平瀏覽
    rail.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        rail.scrollBy({ left: e.deltaY });
        e.preventDefault();
      }
    }, { passive:false });

    // 鍵盤左右鍵也可操作
    rail.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') rail.scrollBy({ left: -step(), behavior:'smooth' });
      if (e.key === 'ArrowRight') rail.scrollBy({ left:  step(), behavior:'smooth' });
    });

    // 依邊界顯示/隱藏箭頭
    function updateArrows(){
      const max = rail.scrollWidth - rail.clientWidth - 1;
      if (rail.scrollLeft <= 2) prevBtn.classList.add('is-hidden'); else prevBtn.classList.remove('is-hidden');
      if (rail.scrollLeft >= max) nextBtn.classList.add('is-hidden'); else nextBtn.classList.remove('is-hidden');
    }
    rail.addEventListener('scroll', updateArrows, { passive:true });
    window.addEventListener('resize', updateArrows);
    window.addEventListener('load', updateArrows);
    updateArrows();
  });
});
