/* ── SCROLL REVEAL ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hcc-fields')) renderHccFields();
  if (document.getElementById('cp-inputs')) renderMain();
});
