/**
 * Generates a QR code data URL for the given text
 * 
 * This is a client-side utility for generating QR codes dynamically
 * without requiring a server roundtrip. We're using the qrcode.react
 * library which is already included in the project's dependencies.
 */
export async function generateQRCode(
  text: string,
  options: {
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    foreground?: string;
    background?: string;
  } = {}
): Promise<string> {
  // Dynamically import the QRCode component from qrcode.react
  const QRCodeReact = await import('qrcode.react');
  
  // Create a temporary div to hold the QR code
  const tempDiv = document.createElement('div');
  document.body.appendChild(tempDiv);
  
  // Set default options
  const size = options.size || 256;
  const level = options.level || 'H';
  const foreground = options.foreground || '#000000';
  const background = options.background || '#ffffff';
  
  // Render the QR code to the temporary div
  const QRCode = QRCodeReact.default;
  const ReactDOM = await import('react-dom');
  
  return new Promise((resolve) => {
    ReactDOM.render(
      QRCode({
        value: text,
        size: size,
        level: level,
        fgColor: foreground,
        bgColor: background,
        renderAs: 'canvas'
      }),
      tempDiv,
      () => {
        // Get the rendered canvas
        const canvas = tempDiv.querySelector('canvas');
        if (canvas) {
          // Convert canvas to data URL
          const dataUrl = canvas.toDataURL('image/png');
          // Clean up
          ReactDOM.unmountComponentAtNode(tempDiv);
          document.body.removeChild(tempDiv);
          resolve(dataUrl);
        } else {
          console.error('Failed to generate QR code: Canvas not found');
          // Clean up
          ReactDOM.unmountComponentAtNode(tempDiv);
          document.body.removeChild(tempDiv);
          resolve('');
        }
      }
    );
  });
}
