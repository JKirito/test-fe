// src/abacus/components/home/review/types.ts

export interface PairedField {
  label: string;
  value: string | undefined;
}

export interface Question {
  question: string;
  answer?: string | undefined;
}

export type UploadValue = { type: 'file' | 'url'; value: File | string };

export type AttachmentValue = { value: File }; // Assuming attachment is always a file
