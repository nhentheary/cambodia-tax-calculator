/* ── RESPONSIVE NAVIGATION ── */
const siteSearchIndex = [
  { terms: ['salary', 'tax on salary', 'tos', 'employee', 'resident', 'non-resident'], url: 'salary-tax.html' },
  { terms: ['vat', 'value added tax', 'invoice', 'input vat', 'output vat', 'export'], url: 'value-added-tax.html' },
  { terms: ['withholding', 'withholding tax', 'wht', 'royalty', 'interest', 'dividend'], url: 'withholding-tax.html' },
  { terms: ['specific', 'specific tax', 'goods', 'services'], url: 'specific-tax.html' },
  { terms: ['accommodation', 'accommodation tax', 'hotel', 'guesthouse', 'resort', 'lodging'], url: 'accommodation-tax.html' },
  { terms: ['prepayment', 'profit', 'tax on profit', 'profit tax', 'ptoi', 'top'], url: 'tax-on-profit.html' },
  { terms: ['minimum', 'minimum tax', 'turnover'], url: 'minimum-tax.html' },
  { terms: ['income', 'tax on income', 'toi', 'company tax'], url: 'tax-on-income.html' },
  { terms: ['patent', 'patent tax', 'business registration', 'branch'], url: 'patent-tax.html' },
  { terms: ['property', 'property tax', 'immovable property', 'land', 'building'], url: 'property-tax.html' },
  { terms: ['transfer', 'transfer tax', 'ownership', 'stamp'], url: 'transfer-tax.html' },
  { terms: ['summary', 'rates', 'brackets', 'tax summary'], url: 'tax-summary.html' },
  { terms: ['guide', 'law', 'laws', 'sub-decree', 'sub-decrees', 'prakas'], url: 'tax-guide.html' },
  { terms: ['calculate', 'calculator', 'calculation'], url: 'calculate.html' }
];

function handleSiteSearch(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector('input[type="search"]');
  const query = (input?.value || '').trim();

  if (!query) {
    input?.focus();
    return false;
  }

  const normalized = query.toLowerCase();
  const result = siteSearchIndex.find(item =>
    item.terms.some(term => normalized.includes(term) || term.includes(normalized))
  );
  const destination = result ? result.url : 'tax-guide.html';
  window.location.href = destination + '?q=' + encodeURIComponent(query);
  return false;
}

function hydrateSiteSearch() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (!query) return;
  document.querySelectorAll('.site-search-input').forEach(input => {
    input.value = query;
  });
}

function applyRouteActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'home.html';
  const guidePages = new Set([
    'tax-guide.html',
    'salary-tax.html',
    'value-added-tax.html',
    'withholding-tax.html',
    'specific-tax.html',
    'tax-on-profit.html',
    'minimum-tax.html',
    'tax-on-income.html',
    'patent-tax.html',
    'property-tax.html',
    'accommodation-tax.html',
    'transfer-tax.html'
  ]);
  const activeId =
    path === 'calculate.html' ? 'nav-calc' :
    path === 'tax-summary.html' ? 'nav-summary' :
    guidePages.has(path) ? 'nav-guide' :
    'nav-home';

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.id === activeId);
  });
}

function initResponsiveNav() {
  const topBar = document.querySelector('.top-bar');
  const nav = document.querySelector('.nav-bar');
  if (!topBar || !nav || document.querySelector('.hamburger-btn')) return;

  const button = document.createElement('button');
  button.className = 'hamburger-btn';
  button.type = 'button';
  button.setAttribute('aria-label', 'Open navigation menu');
  button.setAttribute('aria-controls', 'site-navigation');
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = '<span></span><span></span><span></span>';
  nav.id = nav.id || 'site-navigation';

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.hidden = true;
  document.body.appendChild(overlay);

  function setOpen(open) {
    button.classList.toggle('active', open);
    nav.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    overlay.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  button.addEventListener('click', () => setOpen(!nav.classList.contains('active')));
  overlay.addEventListener('click', () => setOpen(false));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) setOpen(false);
  });

  topBar.appendChild(button);
}

/* ── HERO MINI CALC ── */
let hTax = 'salary';
function hccSelect(t, el) {
  hTax = t;
  document.querySelectorAll('.hmc-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderHccFields();
  document.getElementById('hcc-result').classList.remove('show');
}
function renderHccFields() {
  const cfg = taxCfg[hTax];
  const values = readCalcValues('hf_', cfg);
  const result = document.getElementById('hcc-result');
  if (result) {
    result.classList.remove('show');
    result.closest('.hmc-calc-grid')?.classList.remove('has-result');
  }
  let h = '';
  visibleFields(cfg, values).forEach(f => {
    h += '<div class="hmc-field-label">' + f.label + '</div>';
    if (f.type==='number') h += '<input class="hmc-input" id="hf_'+f.id+'" type="number" placeholder="'+f.ph+'" min="0" value="'+(values[f.id]||'')+'">';
    else h += '<select class="hmc-select" id="hf_'+f.id+'" onchange="renderHccFields();document.getElementById(\'hcc-result\').classList.remove(\'show\')">' + f.opts.map(o=>'<option value="'+o[0]+'" '+(fieldValue(f,values)===o[0]?'selected':'')+'>'+o[1]+'</option>').join('') + '</select>';
  });
  document.getElementById('hcc-fields').innerHTML = h;
}
function hccCalc() {
  const cfg = taxCfg[hTax]; const v = {};
  cfg.fields.forEach(f => { const el = document.getElementById('hf_'+f.id); v[f.id] = el ? el.value : ''; });
  const res = cfg.calc(v); const el = document.getElementById('hcc-result');
  let h = res.rows.map(r => '<div class="hmc-row"><span>'+r[0]+'</span><span>'+r[1]+'</span></div>').join('');
  h += '<div class="hmc-row hmc-final"><span>'+res.final[0]+'</span><span>'+res.final[1]+'</span></div>';
  if (res.afterRows) h += res.afterRows.map(r => '<div class="hmc-row hmc-after"><span>'+r[0]+'</span><span>'+r[1]+'</span></div>').join('');
  el.innerHTML = h;
  el.closest('.hmc-calc-grid')?.classList.add('has-result');
  el.classList.add('show');
}

/* ── MAIN CALC ── */
let mTax = 'salary';
function fieldValue(f, values) {
  return values[f.id] || f.default || (f.opts ? f.opts[0][0] : '');
}
function readCalcValues(prefix, cfg) {
  const values = {};
  cfg.fields.forEach(f => {
    const el = document.getElementById(prefix+f.id);
    values[f.id] = el ? el.value : '';
  });
  return values;
}
function visibleFields(cfg, values) {
  return cfg.fields.filter(f => {
    if (!f.showWhen) return true;
    if (f.showWhen.all) {
      return f.showWhen.all.every(rule => {
        const dep = cfg.fields.find(d => d.id === rule.id) || {id:rule.id};
        return fieldValue(dep, values) === rule.value;
      });
    }
    const dep = cfg.fields.find(d => d.id === f.showWhen.id) || {id:f.showWhen.id};
    return fieldValue(dep, values) === f.showWhen.value;
  });
}
function mainSelect(t, el) {
  mTax = t;
  document.querySelectorAll('.tl-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  renderMain();
  renderTaxDescription();
  document.getElementById('cp-result').classList.remove('show');
}
function renderMain() {
  const cfg = taxCfg[mTax];
  const values = readCalcValues('mf_', cfg);
  document.getElementById('cp-name').textContent = cfg.name;
  document.getElementById('cp-about').textContent = cfg.about;
  if (mTax === 'patent') {
    renderMainPatentCalculator();
    renderTaxDescription();
    return;
  }
  let h = '';
  visibleFields(cfg, values).forEach(f => {
    let inp = f.type==='number'
      ? '<input class="cp-input" id="mf_'+f.id+'" type="number" placeholder="'+f.ph+'" min="0" value="'+(values[f.id]||'')+'">'
      : '<select class="cp-select" id="mf_'+f.id+'" onchange="renderMain();document.getElementById(\'cp-result\').classList.remove(\'show\')">'+f.opts.map(o=>'<option value="'+o[0]+'" '+(fieldValue(f,values)===o[0]?'selected':'')+'>'+o[1]+'</option>').join('')+'</select>';
    h += '<div><label class="cp-field-label">'+f.label+'</label>'+inp+'</div>';
  });
  document.getElementById('cp-inputs').innerHTML = h;
}
function renderTaxDescription() {
  const cfg = taxCfg[mTax];
  const titleEl = document.getElementById('desc-title');
  const bodyEl = document.getElementById('desc-body');
  const formulaEl = document.getElementById('desc-formula');
  const addEl = document.getElementById('desc-additional');
  if (!titleEl || !bodyEl || !formulaEl || !addEl) return;
  titleEl.textContent = cfg.name;
  bodyEl.textContent = cfg.about || 'Tax details and calculation rules for the selected tax type.';
  formulaEl.textContent = cfg.formula || 'Exchange rate: 1 USD = 4,000 KHR';
  if (mTax === 'specific') {
    addEl.innerHTML = '<h4>Goods and Services</h4><p>Goods tax uses specific SPT rates for alcohol, beer, cigarettes, cigars, soft drinks, and cement. Services use 10% for passenger transport, entertainment and 3% for telecommunications.</p>';
  } else if (mTax === 'accommodation') {
    addEl.innerHTML = '<h4>Notes and Conditions</h4><p>Applies to accommodation services provided by hotels, guesthouses, resorts, serviced apartments, and similar lodging establishments in Cambodia.</p>';
  } else if (mTax === 'transfer') {
    addEl.innerHTML = '<h4>Transfer Tax example</h4><p>General property transfer is calculated as Tax Base × 4%. First-time direct family transfers may be exempt, while gift or inheritance transfers apply deductions per the selected rule.</p>';
  } else {
    addEl.innerHTML = '<p>Review the formula and tax notes above before entering values. The calculator will show category, type, rate, base amount, and final tax.</p>';
  }
}
function mainCalc() {
  if (mTax === 'patent' && document.getElementById('cp-inputs')) {
    calculateMainPatentTax();
    return;
  }
  const cfg = taxCfg[mTax]; const v = {};
  cfg.fields.forEach(f => { const el = document.getElementById('mf_'+f.id); v[f.id] = el ? el.value : ''; });
  const res = cfg.calc(v); const el = document.getElementById('cp-result');
  if (res.error) {
    el.innerHTML = '<div class="cr-error">' + res.error + '</div>';
    el.classList.add('show');
    return;
  }
  let h = res.rows.map(r => '<div class="cr-row"><span>'+r[0]+'</span><span>'+r[1]+'</span></div>').join('');
  if (res.brkts) {
    h += '<div class="cr-bracket"><div class="cr-bracket-label">Bracket breakdown</div>';
    res.brkts.forEach(b => { h += '<div class="cr-brow '+(b.hit&&b.amt>0?'hit':'')+'"><span>'+b.l+'</span><span>'+b.u+'</span></div>'; });
    h += '</div>';
  }
  h += '<div class="cr-row cr-final"><span>'+res.final[0]+'</span><span>'+res.final[1]+'</span></div>';
  if (res.afterRows) h += res.afterRows.map(r => '<div class="cr-row cr-after"><span>'+r[0]+'</span><span>'+r[1]+'</span></div>').join('');
  el.innerHTML = h; el.classList.add('show');
}
function resetMainCalc() {
  const cfg = taxCfg[mTax];
  if (!cfg) return;
  cfg.fields.forEach(f => {
    const el = document.getElementById('mf_' + f.id);
    if (!el) return;
    if (f.type === 'number') el.value = '';
    else el.value = f.default || (f.opts ? f.opts[0][0] : '');
  });
  renderMain();
  const result = document.getElementById('cp-result');
  if (result) {
    result.innerHTML = '';
    result.classList.remove('show');
  }
}

/* ── MAIN PATENT CALC ── */
const mainPatentRates = {
  small: { label: 'Small Taxpayer', amount: 400000 },
  medium: { label: 'Medium Taxpayer', amount: 1200000 },
  large: { label: 'Large Taxpayer (Annual Turnover ≤ 10 Billion KHR)', amount: 3000000 },
  large_high: { label: 'Large Taxpayer (Annual Turnover > 10 Billion KHR)', amount: 5000000 }
};
function mainPatentFmt(value) {
  return typeof formatCurrencyPairFromKhr === 'function'
    ? formatCurrencyPairFromKhr(value, 'KHR')
    : '៛' + Number(value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
}
function renderMainPatentCalculator() {
  document.getElementById('cp-inputs').innerHTML =
    '<div class="patent-category-grid main-patent-wide">' +
      '<label class="patent-option"><input type="radio" name="main-patent-category" value="small" checked onchange="calculateMainPatentTax()"><span><strong>Small Taxpayer</strong><em>KHR 400,000 per branch</em></span></label>' +
      '<label class="patent-option"><input type="radio" name="main-patent-category" value="medium" onchange="calculateMainPatentTax()"><span><strong>Medium Taxpayer</strong><em>KHR 1,200,000 per branch</em></span></label>' +
      '<label class="patent-option"><input type="radio" name="main-patent-category" value="large" onchange="calculateMainPatentTax()"><span><strong>Large Taxpayer</strong><em>Turnover ≤ 10 Billion KHR · KHR 3,000,000</em></span></label>' +
      '<label class="patent-option"><input type="radio" name="main-patent-category" value="large_high" onchange="calculateMainPatentTax()"><span><strong>Large Taxpayer</strong><em>Turnover > 10 Billion KHR · KHR 5,000,000</em></span></label>' +
    '</div>' +
    '<div class="patent-business-grid main-patent-wide">' +
      '<div class="patent-business-box">' +
        '<div class="patent-box-head"><div><div class="patent-box-title">Old Business</div><div class="patent-box-note">Left side: existing activities and branches</div></div></div>' +
        '<label class="cp-field-label" for="main-old-activity-count">Number of Business Activities</label>' +
        '<input class="cp-input" id="main-old-activity-count" type="number" min="0" step="1" value="0" oninput="renderMainPatentActivities(\'old\')">' +
        '<div class="patent-activity-list" id="main-old-activity-list"></div>' +
      '</div>' +
      '<div class="patent-business-box">' +
        '<div class="patent-box-head"><div><div class="patent-box-title">New Business</div><div class="patent-box-note">Right side: new activities and branches</div></div></div>' +
        '<label class="cp-field-label" for="main-new-commencement">Commencement Date</label>' +
        '<select class="cp-select" id="main-new-commencement" onchange="calculateMainPatentTax()"><option value="1">January 1 - June 30 (100%)</option><option value="0.5">July 1 - December 31 (50%)</option></select>' +
        '<label class="cp-field-label patent-spaced-label" for="main-new-activity-count">Number of Business Activities</label>' +
        '<input class="cp-input" id="main-new-activity-count" type="number" min="0" step="1" value="0" oninput="renderMainPatentActivities(\'new\')">' +
        '<div class="patent-activity-list" id="main-new-activity-list"></div>' +
      '</div>' +
    '</div>';
  renderMainPatentActivities('old');
  renderMainPatentActivities('new');
}
function mainPatentActivityCount(type) {
  const input = document.getElementById('main-' + type + '-activity-count');
  return Math.max(0, parseInt(input.value, 10) || 0);
}
function renderMainPatentActivities(type) {
  const list = document.getElementById('main-' + type + '-activity-list');
  const count = mainPatentActivityCount(type);
  const previous = {};
  list.querySelectorAll('input[data-activity-index]').forEach(input => {
    previous[input.dataset.activityIndex] = input.value;
  });
  let html = '';
  for (let i = 1; i <= count; i++) {
    const value = previous[i] || '';
    html += '<label class="patent-activity-row"><span>Activity ' + i + ' branches</span><input class="cp-input" data-activity-index="' + i + '" type="number" min="0" step="1" placeholder="0" value="' + value + '" oninput="calculateMainPatentTax()"></label>';
  }
  list.innerHTML = html || '<div class="patent-empty">No activities entered.</div>';
  calculateMainPatentTax();
}
function sumMainPatentBranches(type) {
  let total = 0;
  document.querySelectorAll('#main-' + type + '-activity-list input[data-activity-index]').forEach(input => {
    total += Math.max(0, parseInt(input.value, 10) || 0);
  });
  return total;
}
function mainPatentRow(label, value, extraClass) {
  return '<div class="cr-row ' + (extraClass || '') + '"><span>' + label + '</span><span>' + value + '</span></div>';
}
function calculateMainPatentTax() {
  const selected = document.querySelector('input[name="main-patent-category"]:checked');
  const category = mainPatentRates[selected ? selected.value : 'small'];
  const oldActivities = mainPatentActivityCount('old');
  const newActivities = mainPatentActivityCount('new');
  const oldBranches = sumMainPatentBranches('old');
  const newBranches = sumMainPatentBranches('new');
  const commencement = parseFloat(document.getElementById('main-new-commencement').value) || 1;
  const oldSubtotal = oldBranches * category.amount;
  const newSubtotal = newBranches * category.amount * commencement;
  const totalBranches = oldBranches + newBranches;
  const finalTotal = oldSubtotal + newSubtotal;
  const commencementLabel = commencement === 1 ? 'January 1 - June 30 (100%)' : 'July 1 - December 31 (50%)';
  const result = document.getElementById('cp-result');
  result.innerHTML =
    mainPatentRow('Taxpayer Category', category.label) +
    mainPatentRow('Taxpayer Amount', mainPatentFmt(category.amount)) +
    mainPatentRow('Number of Old Business Activities', oldActivities.toLocaleString()) +
    mainPatentRow('Total Old Business Branches', oldBranches.toLocaleString()) +
    mainPatentRow('Number of New Business Activities', newActivities.toLocaleString()) +
    mainPatentRow('Total New Business Branches', newBranches.toLocaleString()) +
    mainPatentRow('New Business Commencement', commencementLabel) +
    mainPatentRow('Subtotal Old Business Patent Tax', mainPatentFmt(oldSubtotal), 'cr-after') +
    mainPatentRow('Subtotal New Business Patent Tax', mainPatentFmt(newSubtotal), 'cr-after') +
    mainPatentRow('Grand Total Branches (Old + New)', totalBranches.toLocaleString()) +
    mainPatentRow('Final Total Patent Tax Payable', mainPatentFmt(finalTotal), 'cr-final');
  result.classList.add('show');
}

/* ── MODAL ── */
function openModal(type) {
  const d = modalInfo[type];
  document.getElementById('modal-box').innerHTML =
    '<button class="modal-close" onclick="closeModal()">✕</button>' +
    '<span class="sum-tag '+d.tc+'" style="margin-bottom:12px;display:inline-flex">'+d.tag+'</span>' +
    '<h2>'+d.title+'</h2><p>'+d.body+'</p>' +
    '<div class="modal-formula">'+d.formula+'</div>' +
    '<div class="modal-example">'+d.example+'</div>';
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(e) {
  if (!e || e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }
}

document.addEventListener('DOMContentLoaded', initResponsiveNav);
document.addEventListener('DOMContentLoaded', hydrateSiteSearch);
document.addEventListener('DOMContentLoaded', applyRouteActiveNav);
document.addEventListener('DOMContentLoaded', () => {
  renderMain();
  renderTaxDescription();
});
