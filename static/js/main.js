/* ── Elements ── */
const dropZone   = document.getElementById('dropZone');
const dropInner  = document.getElementById('dropInner');
const fileInput  = document.getElementById('fileInput');
const preview    = document.getElementById('preview');
const analyseBtn = document.getElementById('analyseBtn');
const btnLabel   = document.getElementById('btnLabel');
const btnSpinner = document.getElementById('btnSpinner');
const resultsCard= document.getElementById('resultsCard');
const resultsList= document.getElementById('resultsList');
const resetBtn   = document.getElementById('resetBtn');
const errorBanner= document.getElementById('errorBanner');

let selectedFile = null;

/* ── Drag & drop ── */
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
['dragleave', 'dragend'].forEach(ev =>
  dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-over'))
);
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
dropZone.addEventListener('click', e => {
  if (e.target !== fileInput && !e.target.classList.contains('link-btn')) {
    fileInput.click();
  }
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

/* ── File handler ── */
function handleFile(file) {
  hideError();
  selectedFile = file;

  const reader = new FileReader();
  reader.onload = ev => {
    preview.src = ev.target.result;
    preview.classList.remove('hidden');
    dropInner.classList.add('hidden');
  };
  reader.readAsDataURL(file);

  analyseBtn.disabled = false;
}

/* ── Analyse ── */
analyseBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  setLoading(true);
  hideError();
  resultsCard.classList.add('hidden');

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    const res  = await fetch('/predict', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok || data.error) throw new Error(data.error || 'Server error');
    renderResults(data.predictions);
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
});

/* ── Render predictions ── */
function renderResults(predictions) {
  resultsList.innerHTML = '';

  predictions.forEach((pred, i) => {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.style.animationDelay = `${i * 60}ms`;

    item.innerHTML = `
      <div class="result-row">
        <span class="result-label">${escHtml(pred.label)}</span>
        <span class="result-pct">${pred.confidence.toFixed(1)}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: 0%" data-w="${pred.confidence}"></div>
      </div>`;

    resultsList.appendChild(item);
  });

  resultsCard.classList.remove('hidden');

  // Animate bars after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
    });
  });

  resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Reset ── */
resetBtn.addEventListener('click', () => {
  selectedFile = null;
  preview.src = '';
  preview.classList.add('hidden');
  dropInner.classList.remove('hidden');
  analyseBtn.disabled = true;
  resultsCard.classList.add('hidden');
  fileInput.value = '';
  hideError();
});

/* ── Helpers ── */
function setLoading(on) {
  analyseBtn.disabled = on;
  btnLabel.textContent = on ? 'Analysing…' : 'Analyse Image';
  btnSpinner.classList.toggle('hidden', !on);
}
function showError(msg) {
  errorBanner.textContent = '⚠ ' + msg;
  errorBanner.classList.remove('hidden');
}
function hideError() {
  errorBanner.classList.add('hidden');
  errorBanner.textContent = '';
}
function escHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
