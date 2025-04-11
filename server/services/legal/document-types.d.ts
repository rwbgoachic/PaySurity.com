import { LegalDocument } from '@shared/schema';

declare global {
  namespace Express {
    interface Request {
      document?: LegalDocument;
    }
  }
}