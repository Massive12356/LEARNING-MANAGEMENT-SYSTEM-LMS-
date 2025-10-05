// CSV parsing utility for bulk user imports
export interface CSVParseResult<T> {
  data: T[];
  errors: string[];
  totalRows: number;
}

export interface UserImportData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organizationId?: string;
  birthday?: string;
  country?: string;
  gender?: string;
  levelOfEducation?: string;
}

export function parseUserCSV(csvContent: string): CSVParseResult<UserImportData> {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  const data: UserImportData[] = [];

  if (lines.length < 2) {
    errors.push('CSV file must contain at least a header row and one data row');
    return { data, errors, totalRows: 0 };
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['firstname', 'lastname', 'email', 'role'];
  
  // Check required headers
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    return { data, errors, totalRows: lines.length - 1 };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(cell => cell.trim());
    const rowNumber = i + 1;

    if (row.length !== headers.length) {
      errors.push(`Row ${rowNumber}: Column count mismatch (expected ${headers.length}, got ${row.length})`);
      continue;
    }

    try {
      const rowData: any = {};
      
      headers.forEach((header, index) => {
        const value = row[index];
        
        // Map CSV headers to object properties
        switch (header.toLowerCase()) {
          case 'firstname':
            rowData.firstName = value;
            break;
          case 'lastname':
            rowData.lastName = value;
            break;
          case 'email':
            rowData.email = value;
            break;
          case 'role':
            rowData.role = value;
            break;
          case 'organizationid':
            rowData.organizationId = value;
            break;
          case 'birthday':
            rowData.birthday = value;
            break;
          case 'country':
            rowData.country = value;
            break;
          case 'gender':
            rowData.gender = value;
            break;
          case 'levelofeducation':
            rowData.levelOfEducation = value;
            break;
          default:
            // Ignore unknown columns
            break;
        }
      });

      // Validate required fields
      if (!rowData.firstName) {
        errors.push(`Row ${rowNumber}: First name is required`);
        continue;
      }

      if (!rowData.lastName) {
        errors.push(`Row ${rowNumber}: Last name is required`);
        continue;
      }

      if (!rowData.email) {
        errors.push(`Row ${rowNumber}: Email is required`);
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rowData.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`);
        continue;
      }

      // Validate role
      const validRoles = ['student', 'teacher', 'admin'];
      if (!validRoles.includes(rowData.role?.toLowerCase())) {
        errors.push(`Row ${rowNumber}: Invalid role (must be one of: ${validRoles.join(', ')})`);
        continue;
      }

      data.push(rowData as UserImportData);
    } catch (error) {
      errors.push(`Row ${rowNumber}: Parse error - ${error}`);
    }
  }

  return {
    data,
    errors,
    totalRows: lines.length - 1
  };
}

// Export CSV utility for reports
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Use provided columns or infer from first row
  const cols = columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key }));
  
  // Create header row
  const headers = cols.map(col => col.label).join(',');
  
  // Create data rows
  const rows = data.map(row => 
    cols.map(col => {
      const value = row[col.key];
      // Handle values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );

  // Combine headers and rows
  const csvContent = [headers, ...rows].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Sample CSV templates
export const sampleUserImportCSV = `firstName,lastName,email,role,organizationId,birthday,country,gender,levelOfEducation
John,Doe,john.doe@example.com,student,org-1,1995-05-15,United States,male,bachelor
Jane,Smith,jane.smith@example.com,student,org-1,1992-08-22,Canada,female,master
Mike,Johnson,mike.johnson@example.com,teacher,org-1,1985-12-03,United Kingdom,male,phd
Sarah,Wilson,sarah.wilson@example.com,admin,org-1,1988-09-10,Australia,female,master`;

export function downloadSampleCSV(type: 'users'): void {
  let csvContent: string;
  let filename: string;

  switch (type) {
    case 'users':
      csvContent = sampleUserImportCSV;
      filename = 'sample-user-import.csv';
      break;
    default:
      throw new Error('Unknown CSV template type');
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}