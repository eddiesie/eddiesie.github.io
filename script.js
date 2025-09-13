// 等 DOM 準備好，避免抓不到節點
document.addEventListener('DOMContentLoaded', () => {
  // 年份
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // 橫向滑動控制（作品一覽）
  const rail = document.getElementById('rail');
  const prevBtn = document.querySelector('.rail-btn.prev');
  const nextBtn = document.querySelector('.rail-btn.next');

  if (rail && prevBtn && nextBtn) {
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

    // 垂直滾輪 → 轉成水平瀏覽；同時避免出現底部滑塊
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
  }
});
