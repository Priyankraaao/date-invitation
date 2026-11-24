const intro = document.querySelector('#intro');
const letter = document.querySelector('#letter');
const plans = document.querySelector('#plans');
let selectedPlan = '';
let selectedOpinion = '';
const celebration = document.querySelector('#celebration');
// Measure every page at the current width, then share the tallest height.
function sizeBook() {
  const pages = [intro, letter, plans, celebration];
  const main = document.querySelector('main');
  if (window.matchMedia('(min-width: 900px)').matches) {
    main.style.setProperty('--book-height', `${Math.max(420, window.innerHeight - 76)}px`);
    return;
  }
  main.style.removeProperty('--book-height');
  const pageWidth = pages.find(page => !page.classList.contains('hidden')).getBoundingClientRect().width;
  const heights = pages.map(page => {
    const wasHidden = page.classList.contains('hidden');
    page.style.width = `${pageWidth}px`;
    if (wasHidden) {
      page.classList.remove('hidden');
      page.style.position = 'absolute';
      page.style.visibility = 'hidden';
      page.style.pointerEvents = 'none';
    }
    const height = page.getBoundingClientRect().height;
    if (wasHidden) {
      page.classList.add('hidden');
      page.style.removeProperty('position');
      page.style.removeProperty('visibility');
      page.style.removeProperty('pointer-events');
    }
    page.style.removeProperty('width');
    return height;
  });
  main.style.setProperty('--book-height', `${Math.ceil(Math.max(...heights))}px`);
}
sizeBook();
if (document.fonts) document.fonts.ready.then(sizeBook);
let bookResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(bookResizeTimer);
  bookResizeTimer = setTimeout(sizeBook, 150);
});
let turningPage = false;
function show(section) {
  if (turningPage) return;
  const pages = [intro, letter, plans, celebration];
  const current = pages.find(page => !page.classList.contains('hidden'));
  if (current === section) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const backward = pages.indexOf(section) < pages.indexOf(current);
  const rect = current.getBoundingClientRect();
  const spread = window.matchMedia('(min-width: 900px)').matches;
  let leaf;
  if (!reduced) {
    leaf = document.createElement('div');
    leaf.className = 'turning-leaf';
    leaf.setAttribute('aria-hidden', 'true');
    leaf.inert = true;
    const half = spread ? rect.width / 2 : rect.width;
    leaf.style.cssText = `left:${rect.left + (spread ? half : 0)}px;top:${rect.top + window.scrollY}px;width:${half}px;height:${rect.height}px`;
    const front = document.createElement('div');
    front.className = 'turn-front';
    const copy = current.cloneNode(true);
    copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    copy.removeAttribute('id');
    copy.style.cssText = `width:${rect.width}px;max-width:none;height:${rect.height}px;margin:0;`;
    if (spread) { copy.style.marginLeft = `-${half}px`; copy.style.paddingLeft = `${half + 30}px`; }
    front.append(copy);
    const back = document.createElement('div');
    back.className = 'turn-back';
    back.innerHTML = '<span>✿</span>';
    leaf.append(front, back);
    document.body.append(leaf);
  }
  pages.forEach(item => item.classList.toggle('hidden', item !== section));
  document.body.classList.toggle('book-open', section !== intro);
  const finish = () => {
    leaf?.remove();
    turningPage = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    const heading = section.querySelector('h1, h2');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  };
  if (reduced) { finish(); return; }
  turningPage = true;
  // Keep the sheet opaque as it passes over the spine, with a real reverse side.
  const animation = leaf.animate([
    { transform: backward ? 'perspective(2200px) rotateY(-180deg)' : 'perspective(2200px) rotateY(0deg)' },
    { transform: backward ? 'perspective(2200px) rotateY(0deg)' : 'perspective(2200px) rotateY(-180deg)' }
  ], { duration: 1150, easing: 'cubic-bezier(.35,.05,.2,1)', fill: 'forwards' });
  // Explicitly swap faces at the spine. This also avoids mirrored glyphs
  // in browsers that flatten nested 3D layers with clipping or shadows.
  const frontFace = leaf.querySelector('.turn-front');
  const backFace = leaf.querySelector('.turn-back');
  const updateFaces = () => {
    if (!leaf.isConnected) return;
    const progress = animation.effect.getComputedTiming().progress ?? 0;
    const frontVisible = backward ? progress >= 0.5 : progress < 0.5;
    frontFace.style.visibility = frontVisible ? 'visible' : 'hidden';
    backFace.style.visibility = frontVisible ? 'hidden' : 'visible';
    if (animation.playState === 'running') requestAnimationFrame(updateFaces);
  };
  updateFaces();
  animation.finished.then(finish, finish);
}
document.querySelector('#open-letter').addEventListener('click', () => show(letter));
document.querySelector('#open-button').addEventListener('click', () => show(letter));
document.querySelector('#back').addEventListener('click', () => show(intro));
document.querySelector('#reread').addEventListener('click', () => show(plans));
document.querySelector('#plans-back').addEventListener('click', () => show(letter));
document.querySelector('#later').addEventListener('click', () => {
  document.querySelector('#response-note').textContent = "27 November is the plan. Text me and we’ll sort the time ♡";
});
document.querySelector('#yes').addEventListener('click', () => {
  show(plans);
});
document.querySelector('#plan-form').addEventListener('submit', event => {
  event.preventDefault();
  selectedPlan = new FormData(event.currentTarget).get('plan');
  selectedOpinion = document.querySelector('#opinion').value.trim();
  document.querySelector('#chosen-plan').textContent = selectedPlan;
  document.querySelector('#chosen-opinion').textContent = selectedOpinion;
  document.querySelector('#copy-status').textContent = 'Your pick is ready. Send it in our chat ♡';
  show(celebration);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.querySelector('#confetti');
  for (let i = 0; i < 45; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.textContent = ['♡', '♥', '✧', '✿'][i % 4];
    piece.style.cssText = `left:${Math.random()*100}%;font-size:${12+Math.random()*20}px;animation-duration:${3+Math.random()*3}s;animation-delay:${Math.random()*.8}s;color:${['#a33255','#d798ae','#c77690'][i%3]}`;
    container.append(piece);
    setTimeout(() => piece.remove(), 7000);
  }
});
document.querySelector('#copy').addEventListener('click', async () => {
  const message = `It's a date ♡ My pick: ${selectedPlan}.${selectedOpinion ? ` My thoughts: ${selectedOpinion}` : ''} See you on Friday, 27 November 2026! Let’s sort the time.`;
  try {
    await navigator.clipboard.writeText(message);
    document.querySelector('#copy-status').textContent = 'Copied! Paste it in our chat ♡';
  } catch {
    document.querySelector('#copy-status').textContent = message;
  }
});
