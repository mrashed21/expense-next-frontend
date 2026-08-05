import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPdf = (filename: string, title: string, columns: string[], data: any[][]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  autoTable(doc, {
    startY: 36,
    head: [columns],
    body: data,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] },
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportToCsv = (filename: string, columns: string[], data: any[][]) => {
  const rows = [columns, ...data];
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
