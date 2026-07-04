import { useState } from 'react';
export function useExport() {
  const [exporting, setExporting] = useState(false);
  const exportCSV = (data, filename = 'export.csv') => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(r => headers.map(h => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    download(csv, filename, 'text/csv');
  };
  const exportJSON = (data, filename = 'export.json') => {
    download(JSON.stringify(data, null, 2), filename, 'application/json');
  };
  const download = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return { exportCSV, exportJSON, exporting };
}