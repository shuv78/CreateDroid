import { useState } from 'react';
export function usePDF() {
  const [generating, setGenerating] = useState(false);
  const generatePDF = async (title, data, columns) => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      doc.setFontSize(18); doc.text(title, 14, 22);
      doc.setFontSize(11); doc.text(new Date().toLocaleDateString(), 14, 30);
      if (data && data.length) { autoTable(doc, { head: [columns], body: data.map(r => columns.map(c => r[c])) }); }
      const blob = doc.output('blob');
      return URL.createObjectURL(blob);
    } catch (e) { console.error('PDF error:', e); return null; }
    finally { setGenerating(false); }
  };
  return { generating, generatePDF };
}