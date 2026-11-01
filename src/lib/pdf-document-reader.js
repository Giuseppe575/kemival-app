(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.KemivalPdfReader = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX_BYTES = 25 * 1024 * 1024;
  const MAX_PAGES = 200;
  async function read(file, { pdfjs, readFile, layoutPages, signal, timeoutMs = 45000 }) {
    if (!file || !Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_BYTES) {
      throw new Error('Ogni PDF deve avere una dimensione compresa tra 1 byte e 25 MB.');
    }
    let task, pdf, timer, abort;
    let stopped = false;
    const cancelled = new Promise((_resolve, reject) => {
      abort = () => { stopped = true; reject(new Error('Importazione annullata.')); };
      signal?.addEventListener('abort', abort, { once: true });
      timer = setTimeout(() => { stopped = true; reject(new Error('Tempo massimo di lettura del PDF superato.')); }, timeoutMs);
    });
    const check = () => { if (stopped || signal?.aborted) throw new Error('Importazione annullata.'); };
    const operation = async () => {
      check();
      const data = await readFile(file, signal);
      check();
      task = pdfjs.getDocument({ data, isEvalSupported: false, stopAtErrors: true });
      pdf = await task.promise;
      check();
      if (!Number.isInteger(pdf.numPages) || pdf.numPages < 1 || pdf.numPages > MAX_PAGES) {
        throw new Error('Il PDF supera il limite di 200 pagine o non contiene pagine valide.');
      }
      const rawPages = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        check();
        const page = await pdf.getPage(p);
        try {
          const textContent = await page.getTextContent();
          check();
          const viewport = page.getViewport({ scale: 1 });
          rawPages.push({ pageNumber: p, width: viewport.width, height: viewport.height, textContent });
        } finally { page.cleanup?.(); }
      }
      const pages = layoutPages(rawPages);
      return { pages, text: pages.map(page => page.text).join('\n\f\n') };
    };
    try { return await Promise.race([operation(), cancelled]); }
    finally {
      stopped = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      // Destroy the loading task, including its worker, on success, error, abort and timeout.
      try { if (task) await task.destroy(); else if (pdf) await pdf.destroy(); } catch { /* best effort cleanup */ }
    }
  }
  return Object.freeze({ read, MAX_BYTES, MAX_PAGES });
});
