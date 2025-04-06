// XLSX generator for PaySurity Business Requirements Document
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV data
const csvPath = path.join(__dirname, 'PaySurity_Business_Requirements_Document.csv');
const csvData = fs.readFileSync(csvPath, 'utf8');

// Parse CSV data
const rows = csvData.split('\n');
const headers = rows[0].split(',');
const data = [];

// Process CSV rows with proper handling of quoted fields
for (let i = 1; i < rows.length; i++) {
  if (!rows[i].trim()) continue;
  
  const values = [];
  let inQuote = false;
  let currentValue = '';
  
  for (let char of rows[i]) {
    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue); // Add the last value
  
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = values[index] || '';
  });
  data.push(obj);
}

// Create workbook and worksheet
const wb = XLSX.utils.book_new();

// Add main requirements sheet
const ws = XLSX.utils.json_to_sheet(data);

// Style the worksheet - column widths
const colWidths = [
  { wch: 10 }, // ID
  { wch: 18 }, // Category
  { wch: 20 }, // Sub-Category
  { wch: 25 }, // Requirement Name
  { wch: 50 }, // Description
  { wch: 10 }, // Priority
  { wch: 12 }, // Status
  { wch: 25 }, // Stakeholders
  { wch: 25 }, // Dependencies
  { wch: 35 }, // Technical Notes
  { wch: 40 }, // Decision Needed
];
ws['!cols'] = colWidths;

// Create summary sheet
const categoryStats = {};
const statusStats = {};
const priorityStats = {};

data.forEach(item => {
  if (!categoryStats[item.Category]) {
    categoryStats[item.Category] = 0;
  }
  categoryStats[item.Category]++;
  
  if (!statusStats[item.Status]) {
    statusStats[item.Status] = 0;
  }
  statusStats[item.Status]++;
  
  if (!priorityStats[item.Priority]) {
    priorityStats[item.Priority] = 0;
  }
  priorityStats[item.Priority]++;
});

const summaryData = [
  ['PaySurity Business Requirements Document'],
  ['Generated on', new Date().toLocaleString()],
  ['Total Requirements', data.length],
  [''],
  ['Categories Breakdown'],
  ...Object.entries(categoryStats).map(([cat, count]) => [cat, count]),
  [''],
  ['Status Breakdown'],
  ...Object.entries(statusStats).map(([status, count]) => [status, count]),
  [''],
  ['Priority Breakdown'],
  ...Object.entries(priorityStats).map(([prio, count]) => [prio, count])
];

const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
summaryWs['!cols'] = [{ wch: 30 }, { wch: 15 }];

// Add sheets to workbook
XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
XLSX.utils.book_append_sheet(wb, ws, 'Requirements');

// Create high-level breakdown sheet by category
const categories = [...new Set(data.map(item => item.Category))];
const breakdownData = [['Category', 'Sub-Category', 'Count']];

categories.forEach(category => {
  const subCategories = data
    .filter(item => item.Category === category)
    .reduce((acc, item) => {
      if (!acc[item['Sub-Category']]) {
        acc[item['Sub-Category']] = 0;
      }
      acc[item['Sub-Category']]++;
      return acc;
    }, {});
  
  Object.entries(subCategories).forEach(([subCat, count]) => {
    breakdownData.push([category, subCat, count]);
  });
  
  // Add empty row between categories
  breakdownData.push(['', '', '']);
});

const breakdownWs = XLSX.utils.aoa_to_sheet(breakdownData);
breakdownWs['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 10 }];

XLSX.utils.book_append_sheet(wb, breakdownWs, 'Breakdown');

// Save the workbook
const xlsxPath = path.join(__dirname, 'PaySurity_Business_Requirements_Document.xlsx');
XLSX.writeFile(wb, xlsxPath);

console.log('Excel file generated successfully at', xlsxPath);