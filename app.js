// Fotos de la galería. cat: esc = Escuelas, dep = Deporte, com = Comunidad.
// Para agregar una foto: ponla en img/full y img/thumb con el mismo nombre y súmala aquí.
const CATS = { esc: 'Escuelas', dep: 'Deporte', com: 'Comunidad' };
const FOTOS = {
  esc: ['01','03','13','15','16','17','18','28','29','30','35','37','38','40','41','44','52','56','57','58','66','67','68','69','70','72','73','74','75'],
  dep: ['04','05','07','08','09','10','11','12','19','20','21','24','26','31','32','34','39','43','46','59','64','71'],
  com: ['02','06','14','22','23','25','27','33','36','42','45','47','48','49','50','51','53','54','55','60','61','62','63','65'],
};
const CAPS = {
  '05': 'Techumbre', '08': 'Techumbre', '12': 'Bicentenario',
  '66': 'Jardín de Niños Jacinto García · Ciénega de Flores',
  '67': 'Jardín de Niños Jacinto García · Ciénega de Flores',
  '68': 'Jardín de Niños Jacinto García',
  '69': 'Jardín de Niños Villas de Palmanova · Juárez',
  '70': 'Jardín de Niños Villas de Palmanova · Juárez',
  '71': 'Real de Loreto · Pesquería',
  '72': 'Secundaria Real de Loreto · Pesquería',
  '73': 'Secundaria Vistas de San Juan · Juárez',
  '74': 'Secundaria Vistas de San Juan · Juárez',
  '75': 'Vistas de San Juan · Juárez',
};
// Fotos de dron en formato 4:3 (el resto es 3:2)
const CUATRO_TERCIOS = new Set(['04','07','10','12','16','17','19','20','71']);

// Mezcla las categorías para que la vista "Todas" alterne escuelas, deporte y comunidad
const lista = [];
const max = Math.max(...Object.values(FOTOS).map(a => a.length));
for (let i = 0; i < max; i++) {
  for (const cat of Object.keys(FOTOS)) {
    const id = FOTOS[cat][i];
    if (id) lista.push({ id, cat, cap: CAPS[id] || CATS[cat] });
  }
}

const gallery = document.getElementById('gallery');
gallery.innerHTML = lista.map((f, i) => {
  const h = CUATRO_TERCIOS.has(f.id) ? 675 : 600;
  return `<button class="gal-item" data-cat="${f.cat}" data-i="${i}" type="button" aria-label="Ver foto: ${f.cap}">
    <img src="img/thumb/f${f.id}.jpg" width="900" height="${h}" alt="${f.cap}" loading="lazy" decoding="async">
    <figcaption>${f.cap}</figcaption>
  </button>`;
}).join('');

// Filtros
const items = [...gallery.children];
const filtros = document.querySelectorAll('.filter');
filtros.forEach(btn => {
  const f = btn.dataset.f;
  btn.querySelector('span').textContent = f === 'all' ? lista.length : FOTOS[f].length;
  btn.addEventListener('click', () => {
    filtros.forEach(b => b.classList.toggle('is-on', b === btn));
    items.forEach(el => { el.hidden = f !== 'all' && el.dataset.cat !== f; });
  });
});

// Visor de fotos
const lb = document.getElementById('lb');
const lbImg = document.getElementById('lbImg');
const lbCap = document.getElementById('lbCap');
let actual = 0;
const visibles = () => items.filter(el => !el.hidden);

function abrir(el) {
  const f = lista[el.dataset.i];
  actual = visibles().indexOf(el);
  lbImg.src = `img/full/f${f.id}.jpg`;
  lbImg.alt = f.cap;
  lbCap.textContent = f.cap;
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
}
function cerrar() {
  lb.hidden = true;
  document.body.style.overflow = '';
  visibles()[actual]?.focus();
}
function mover(d) {
  const v = visibles();
  actual = (actual + d + v.length) % v.length;
  abrir(v[actual]);
}

gallery.addEventListener('click', e => {
  const el = e.target.closest('.gal-item');
  if (el) abrir(el);
});
document.getElementById('lbX').onclick = cerrar;
document.getElementById('lbPrev').onclick = () => mover(-1);
document.getElementById('lbNext').onclick = () => mover(1);
lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'FIGURE') cerrar(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') cerrar();
  if (e.key === 'ArrowRight') mover(1);
  if (e.key === 'ArrowLeft') mover(-1);
});
let x0 = null;
lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
  x0 = null;
});

// Carrusel de portada: cambia de foto cada 6 segundos
const slides = [...document.querySelectorAll('#heroSlides img')];
const dots = document.querySelector('.hero__dots');
let slide = 0, timer;
slides.forEach((img, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', `Foto ${i + 1} de ${slides.length}`);
  b.addEventListener('click', () => { mostrar(i); reiniciar(); });
  dots.append(b);
});
function mostrar(i) {
  slide = i;
  slides.forEach((img, j) => img.classList.toggle('is-on', j === i));
  [...dots.children].forEach((d, j) => d.classList.toggle('is-on', j === i));
  // Precarga la siguiente para que el cambio sea instantáneo
  slides[(i + 1) % slides.length].loading = 'eager';
}
function reiniciar() {
  clearInterval(timer);
  timer = setInterval(() => { if (!document.hidden) mostrar((slide + 1) % slides.length); }, 6000);
}
mostrar(0);
reiniciar();

// Contadores animados de la numeralia
const fmt = new Intl.NumberFormat('es-MX');
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const obs = new IntersectionObserver(entries => {
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    obs.unobserve(target);
    const fin = +target.dataset.count, pre = target.dataset.prefix || '', suf = target.dataset.suffix || '';
    if (reducir) return;
    const t0 = performance.now(), dur = 1400;
    const paso = t => {
      const p = Math.min((t - t0) / dur, 1);
      target.textContent = pre + fmt.format(Math.round(fin * (1 - Math.pow(1 - p, 3)))) + suf;
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));


// Carrusel de septiembre: escuelas entregadas
const ESCUELAS = [
  { nombre: 'Jardín de Niños “Jacinto García”', lugar: 'Ciénega de Flores, N.L.', fotos: ['67', '68', '66'] },
  { nombre: 'Secundaria “Real de Loreto”', lugar: 'Pesquería, N.L.', fotos: ['71', '72'] },
  { nombre: 'Secundaria “Vistas de San Juan”', lugar: 'Juárez, N.L.', fotos: ['73', '74', '75'] },
  { nombre: 'Jardín de Niños “Villas de Palmanova”', lugar: 'Juárez, N.L.', fotos: ['69', '70'] },
];
const septFotos = ESCUELAS.flatMap((e, n) => e.fotos.map(id => ({ id, n, ...e })));
const track = document.getElementById('septTrack');
track.innerHTML = septFotos.map(f =>
  `<img src="img/full/f${f.id}.jpg" alt="${f.nombre}, ${f.lugar}" loading="lazy" decoding="async">`).join('');
const septImgs = [...track.children];
const septBtns = [...document.querySelectorAll('#septSchools button')];
const septCap = document.getElementById('septCap');
const septCount = document.getElementById('septCount');
let septI = 0, septTimer;

function septMarcar(i) {
  septI = i;
  const f = septFotos[i];
  septCap.innerHTML = `${f.nombre}<small>${f.lugar}</small>`;
  septCount.textContent = `${i + 1} / ${septFotos.length}`;
  septBtns.forEach((b, n) => b.classList.toggle('is-on', n === f.n));
}
function septIr(i) {
  i = (i + septFotos.length) % septFotos.length;
  track.scrollTo({ left: septImgs[i].offsetLeft });
  septMarcar(i);
}
function septReiniciar() {
  clearInterval(septTimer);
  septTimer = setInterval(() => { if (!document.hidden) septIr(septI + 1); }, 6000);
}
// Detecta la foto visible cuando se desliza con el dedo o el trackpad
const septObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) septMarcar(septImgs.indexOf(e.target)); });
}, { root: track, threshold: .6 });
septImgs.forEach(img => septObs.observe(img));

document.querySelector('#septCarousel .carousel__prev').addEventListener('click', () => { septIr(septI - 1); septReiniciar(); });
document.querySelector('#septCarousel .carousel__next').addEventListener('click', () => { septIr(septI + 1); septReiniciar(); });
septBtns.forEach(b => b.addEventListener('click', () => { septIr(+b.dataset.go); septReiniciar(); }));
track.addEventListener('pointerdown', septReiniciar);
septMarcar(0);
septReiniciar();

// Flechas del carrusel de portada
document.querySelector('.hero__prev').addEventListener('click', () => { mostrar((slide - 1 + slides.length) % slides.length); reiniciar(); });
document.querySelector('.hero__next').addEventListener('click', () => { mostrar((slide + 1) % slides.length); reiniciar(); });
