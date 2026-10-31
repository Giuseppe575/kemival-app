import writeExcelFile from 'write-excel-file/universal';

// Text values remain text, including strings beginning with '=' or '+'.
window.KemivalExcel = Object.freeze({
  async toBlob(rows) {
    const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
    const data = [headers.map(value => ({ value, fontWeight: 'bold' })), ...rows.map(row =>
      headers.map(key => {
        const value = row[key];
        return value == null ? null : typeof value === 'number'
          ? Number.isFinite(value) ? value : null
          : typeof value === 'boolean' ? value : { value: String(value), type: String };
      })
    )];
    return writeExcelFile(data, { sheet: 'KEMIVAL', fontFamily: 'Times New Roman', fontSize: 12 }).toBlob();
  }
});
