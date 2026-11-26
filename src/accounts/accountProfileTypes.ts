export type AccountUserProfile = {
  id: number;
  username: string;
  display_name: string;
  bio: string | null;
  online: boolean;
  last_seen: string | null;
  created_at: string | null;
  verified: boolean;
  verification_status: string;
  suspended: boolean;
  suspension_reason: string | null;
  suspended_until: string | null;
  deleted: boolean;
};

export type ModerationEvent = {
  id: number;
  created_at: string | null;
  source: string;
  reason_code: string | null;
  reason_detail: string | null;
  text_preview: string | null;
};

export type AccountProfileCache = {
  profile: AccountUserProfile;
  events: ModerationEvent[];
  displayName: string;
  bio: string;
};