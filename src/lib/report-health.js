(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.KemivalReportHealth = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function risk(value) {
    if (value > 80) return { label: 'Grave', css: 'danger' };
    if (value > 40) return { label: 'Elevato', css: 'purple' };
    if (value >= 21) return { label: 'Superiore', css: 'danger' };
    if (value >= 15) return { label: 'Intervallo di incertezza', css: 'warn' };
    return { label: 'Irrilevante per la salute', css: 'ok' };
  }
  function classify(row) {
    if (row.isCmr || row.healthAssessmentStatus === 'excluded_cmr') {
      return { value: null, label: 'CMR 1A/1B — Titolo IX, Capo II', css: 'danger', status: 'cmr' };
    }
    const value = row.Rtot;
    if (row.healthAssessmentStatus === 'needs_review' || row.review?.status !== 'confirmed' ||
        typeof value !== 'number' || !Number.isFinite(value) || value < 0.1) {
      return { value: null, label: '', css: 'warn', status: 'unresolved' };
    }
    return { value, ...risk(value), status: 'calculated' };
  }
  function summarize(rows) {
    const results = rows.map(classify);
    const values = results.filter(result => result.status === 'calculated').map(result => result.value);
    const maximum = values.length ? Math.max(...values) : null;
    const cmr = results.filter(result => result.status === 'cmr').length;
    const unresolved = results.filter(result => result.status === 'unresolved').length;
    const classification = cmr ? { label: 'Presenza di agenti CMR — percorso Capo II', css: 'danger' }
      : unresolved || maximum === null ? { label: '', css: 'warn' } : risk(maximum);
    return { maximum, cmr, unresolved, classification };
  }
  return Object.freeze({ classify, summarize });
});
