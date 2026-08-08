export interface ValidationModel {
  score: number; // 0-100
  passed: { id: string; label: string; impact: number }[];
  missing: { id: string; label: string; action: string; impact: number }[];
  categories: {
    seo: number;
    conversion: number;
    trust: number;
    completeness: number;
  };
}
