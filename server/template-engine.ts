/**
 * Simple template engine for serving HTML pages with consistent header and footer
 */
import fs from 'fs';
import path from 'path';

// Cache templates in memory for better performance
const templateCache: Record<string, string> = {};

/**
 * Read a template file from disk or from cache
 */
function getTemplate(templatePath: string): string {
  if (templateCache[templatePath]) {
    return templateCache[templatePath];
  }
  
  try {
    const template = fs.readFileSync(templatePath, 'utf8');
    templateCache[templatePath] = template;
    return template;
  } catch (error) {
    console.error(`Error reading template: ${templatePath}`, error);
    return '';
  }
}

/**
 * Read a standalone template without header/footer
 */
export function getStandaloneTemplate(templateName: string): string {
  const templatePath = path.join(process.cwd(), 'public', 'templates', templateName);
  return getTemplate(templatePath);
}

/**
 * Render a page with header and footer templates
 */
export function renderPage(content: string, title?: string): string {
  const headerPath = path.join(process.cwd(), 'public', 'templates', 'header.html');
  const footerPath = path.join(process.cwd(), 'public', 'templates', 'footer.html');
  
  let header = getTemplate(headerPath);
  const footer = getTemplate(footerPath);
  
  // Replace title if provided
  if (title) {
    header = header.replace(/<title>.*?<\/title>/, `<title>${title} - PaySurity</title>`);
  }
  
  return header + content + footer;
}

/**
 * Render error page
 */
export function renderErrorPage(errorCode: number, message: string): string {
  const content = `
  <div class="container text-center py-8">
    <h1 class="text-blue">${errorCode}</h1>
    <h2 class="mb-4">Oops! ${message}</h2>
    <p class="mb-6">Sorry, something went wrong. Please try again or return to the homepage.</p>
    <a href="/" class="btn btn-primary">Return to Homepage</a>
  </div>
  `;
  
  return renderPage(content, 'Error');
}