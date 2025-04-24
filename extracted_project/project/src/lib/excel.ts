import { read, utils } from 'xlsx';
import { InventoryItem } from './db';

interface ExcelParseOptions {
  headerMapping?: Record<string, string>;
  requiredColumns?: string[];
}

export async function parseExcelFile(
  file: File,
  options: ExcelParseOptions = {}
): Promise<Partial<InventoryItem>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = utils.sheet_to_json(worksheet);

        // Map headers if provided
        const mappedData = jsonData.map(row => {
          const mappedRow: Record<string, any> = {};
          
          Object.entries(row).forEach(([key, value]) => {
            const mappedKey = options.headerMapping?.[key] || key;
            mappedRow[mappedKey] = value;
          });

          return mappedRow;
        });

        // Validate required columns
        if (options.requiredColumns) {
          const missingColumns = options.requiredColumns.filter(
            col => !mappedData[0]?.hasOwnProperty(col)
          );

          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }
        }

        resolve(mappedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}