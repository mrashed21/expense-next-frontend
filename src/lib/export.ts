import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPdf = (filename: string, title: string, columns: string[], data: any[][]) => {
  const doc = new jsPDF();
  
  // Header Background
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 23);
  
  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 220, 220);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
  
  autoTable(doc, {
    startY: 45,
    head: [columns],
    body: data,
    theme: "grid",
    headStyles: { 
      fillColor: [79, 70, 229], 
      textColor: 255, 
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
    },
    bodyStyles: { 
      fontSize: 9,
      textColor: 50,
      halign: 'center',
    },
    alternateRowStyles: { 
      fillColor: [249, 250, 251] 
    },
    styles: {
      cellPadding: 4,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    margin: { top: 45, bottom: 20 },
    didDrawPage: (dataArg) => {
      // Footer with page number
      const str = "Page " + doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, dataArg.settings.margin.left, pageHeight - 10);
    }
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
