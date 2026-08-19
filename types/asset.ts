export interface Asset {
  id: string;

  internal_code: string;

  type: string;

  status: string;

  profile_id: string;

  metadata?: Record<string, unknown>;

  created_at?: string;

  updated_at?: string;
}