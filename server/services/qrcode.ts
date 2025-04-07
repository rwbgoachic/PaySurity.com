import QRCode from 'qrcode';
import cryptoRandomString from 'crypto-random-string';

/**
 * Generates a cryptographically strong random string for use in QR code URLs
 * @param length Length of the string to generate
 * @returns Random string
 */
export function generateRandomString(length: number = 32): string {
  return cryptoRandomString({
    length,
    type: 'url-safe'
  });
}

/**
 * Generates a unique token for order modification
 * @returns Token string
 */
export function generateModificationToken(): string {
  return generateRandomString(48);
}

/**
 * Generates a QR code for a table or ordering URL
 * @param url The URL to encode in the QR code
 * @param options QR code options
 * @returns Promise resolving to a data URL containing the QR code
 */
export async function generateQRCode(url: string, options: QRCode.QRCodeToDataURLOptions = {}): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  };

  const mergedOptions = { ...defaultOptions, ...options };
  return await QRCode.toDataURL(url, mergedOptions);
}

/**
 * Generate a QR code for customer self-ordering
 * @param baseUrl Base URL of the application
 * @param merchantId Merchant ID
 * @param tableId Optional table ID
 * @param locationId Optional location ID
 * @returns Promise resolving to a data URL containing the QR code and the target URL
 */
export async function generateOrderQRCode(
  baseUrl: string,
  merchantId: number,
  tableId?: number,
  locationId?: number
): Promise<{ qrCodeDataUrl: string, targetUrl: string }> {
  const tableParam = tableId ? `&tableId=${tableId}` : '';
  const locationParam = locationId ? `&locationId=${locationId}` : '';
  
  // We're using the source parameter to track where orders come from
  const source = generateRandomString(8);
  const targetUrl = `${baseUrl}/order?merchantId=${merchantId}${tableParam}${locationParam}&source=${source}`;
  
  const qrCodeDataUrl = await generateQRCode(targetUrl);
  
  return {
    qrCodeDataUrl,
    targetUrl
  };
}

/**
 * Generate a URL and QR code for order modification
 * @param orderId Order ID
 * @param baseUrl Base URL of the application 
 * @returns Promise resolving to object with URL, token and QR code data URL
 */
export async function generateOrderModificationUrl(
  orderId: number,
  baseUrl: string
): Promise<{ url: string; token: string; qrCode: string }> {
  // Generate a random token for this modification
  const token = generateModificationToken();
  
  // Create the URL
  const url = `${baseUrl}/order-modify/${token}`;
  
  // Generate QR code
  const qrCode = await generateQRCode(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 250,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  
  return { url, token, qrCode };
}