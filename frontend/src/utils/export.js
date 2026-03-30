import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToCSV = (data, filename = "report") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (data, title = "Transaction Report", filename = "report") => {
  const doc = jsPDF();

  // Add Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  // Add Date
  const date = new Date().toLocaleDateString();
  doc.text(`Generated on: ${date}`, 14, 30);

  // Define Columns
  const columns = [
    { title: "No.", dataKey: "no" },
    { title: "Description", dataKey: "description" },
    { title: "Category", dataKey: "category" },
    { title: "Type", dataKey: "type" },
    { title: "Amount", dataKey: "amount" },
    { title: "Date", dataKey: "date" }
  ];

  // Prepare Rows
  const rows = data.map((item, index) => ({
    no: index + 1,
    description: item.description || item.title,
    category: item.category,
    type: item.type,
    amount: `${item.type === 'income' ? '+' : '-'}$${item.amount}`,
    date: new Date(item.date).toLocaleDateString()
  }));

  // Generate Table
  doc.autoTable({
    columns,
    body: rows,
    startY: 40,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [13, 148, 136] }, // Teal-600
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  doc.save(`${filename}.pdf`);
};
