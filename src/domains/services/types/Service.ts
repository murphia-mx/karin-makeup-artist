/**
 * Represents a business service offered by Karin Makeup Artist.
 * Normalized to prevent hardcoded strings and enable powerful BI aggregations.
 */
export interface Service {
  id: string; // UUID
  slug: string; // Unique identifier for URLs (e.g. 'novias', 'social')
  name: string; // Display name
  description: string | null;
  active: boolean; // Enables soft delete/hiding
  display_order: number; // For UI sorting
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
