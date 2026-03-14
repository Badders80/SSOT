export type FieldClassification = 'STATIC' | 'REUSABLE' | 'INPUT' | 'DERIVED';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'url' | 'dropdown' | 'boolean' | 'array';

export type TemplateField = {
  key: string;
  label: string;
  type: FieldType;
  classification: FieldClassification;
  autoFillSource?: string;
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
};

export type TemplateSection = {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
};

export type TemplateCategory = 'Listing' | 'Legal' | 'Compliance' | 'Reporting' | 'Other';

export type TemplateSchema = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  version: string;
  source: 'wizard' | 'manual';
  example_count?: number;
  sections: TemplateSection[];
  created_at: string;
  updated_at: string;
};

export type GeneratedDocument = {
  id: string;
  templateId: string;
  templateName: string;
  horseId?: string;
  horseName?: string;
  trainerId?: string;
  trainerName?: string;
  data: Record<string, unknown>;
  generatedAt: string;
  fileName: string;
  status: 'draft' | 'approved' | 'archived';
};

export type ReusableEntityContent = {
  slug: string;
  name: string;
  countryCode: string;
  description: string;
  status: 'draft' | 'approved' | 'archived';
  source: string;
};
