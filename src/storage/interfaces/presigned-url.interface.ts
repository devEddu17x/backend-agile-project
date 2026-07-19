export interface PresignedPut {
  key: string;
  putUrl: string;
  expiresAt: string;
  requiredHeaders: { [k: string]: string };
}
