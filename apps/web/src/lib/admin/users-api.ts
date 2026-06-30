import { adminFetch } from "./api-utils";

export interface AdminUserStats {
  totalUsers: number;
  active7d: number;
  active30d: number;
  new7d: number;
  onboardingComplete: number;
  banned: number;
}

export interface AdminUserListItem {
  id: string;
  email: string | null;
  role: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  magicLinkPending: boolean;
  providers: string[];
  banned: boolean;
  profession: string | null;
  targetCountry: string | null;
  onboardingComplete: boolean;
  attemptCount: number;
  lastActivityAt: string | null;
}

export interface AdminUserActivity {
  attemptCount: number;
  lastActivityAt: string | null;
  bySkill: Record<string, number>;
  diagnosticCount: number;
  vocabularyCount: number;
}

export interface AdminUserProfile {
  id: string;
  email: string | null;
  profession: string | null;
  targetCountry: string | null;
  targetRegulator: string | null;
  onboardingComplete: boolean;
  examDate: string | null;
  studyGoal: string;
  aiConsent: boolean;
  aiConsentAt: string | null;
}

export interface AdminUserDetail {
  id: string;
  email: string | null;
  role: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  magicLinkPending: boolean;
  providers: string[];
  banned: boolean;
  bannedUntil: string | null;
  profile: AdminUserProfile | null;
  activity: AdminUserActivity;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  variables: string[];
  personalized: boolean;
}

export async function fetchAdminUserStats(accessToken: string): Promise<AdminUserStats> {
  return adminFetch(accessToken, "/api/v1/admin/users/stats");
}

export async function fetchAdminUsers(
  accessToken: string,
  params: { page?: number; perPage?: number; search?: string; role?: string },
): Promise<{ users: AdminUserListItem[]; page: number; perPage: number; total: number }> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.perPage) q.set("per_page", String(params.perPage));
  if (params.search) q.set("search", params.search);
  if (params.role) q.set("role", params.role);
  const suffix = q.toString() ? `?${q}` : "";
  return adminFetch(accessToken, `/api/v1/admin/users${suffix}`);
}

export async function fetchAdminUser(
  accessToken: string,
  userId: string,
): Promise<AdminUserDetail> {
  return adminFetch(accessToken, `/api/v1/admin/users/${userId}`);
}

export async function createAdminUser(
  accessToken: string,
  body: {
    email: string;
    role?: "learner" | "admin";
    sendInvite?: boolean;
    profession?: string;
    targetCountry?: string;
  },
): Promise<AdminUserDetail> {
  return adminFetch(accessToken, "/api/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email: body.email,
      role: body.role ?? "learner",
      send_invite: body.sendInvite ?? true,
      profession: body.profession,
      target_country: body.targetCountry,
    }),
  });
}

export async function updateAdminUser(
  accessToken: string,
  userId: string,
  body: {
    email?: string;
    role?: "learner" | "admin";
    banned?: boolean;
    profile?: {
      profession?: string;
      targetCountry?: string;
      onboardingComplete?: boolean;
      examDate?: string | null;
      studyGoal?: string;
    };
  },
): Promise<AdminUserDetail> {
  const payload: Record<string, unknown> = {};
  if (body.email !== undefined) payload.email = body.email;
  if (body.role !== undefined) payload.role = body.role;
  if (body.banned !== undefined) payload.banned = body.banned;
  if (body.profile) {
    payload.profile = {
      profession: body.profile.profession,
      target_country: body.profile.targetCountry,
      onboarding_complete: body.profile.onboardingComplete,
      exam_date: body.profile.examDate,
      study_goal: body.profile.studyGoal,
    };
  }
  return adminFetch(accessToken, `/api/v1/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(accessToken: string, userId: string): Promise<void> {
  await adminFetch(accessToken, `/api/v1/admin/users/${userId}`, { method: "DELETE" });
}

export async function fetchEmailTemplates(accessToken: string): Promise<EmailTemplate[]> {
  return adminFetch(accessToken, "/api/v1/admin/email/templates");
}

export async function sendAdminUserEmail(
  accessToken: string,
  userId: string,
  body: {
    templateId: string;
    fromAddress?: "noreply" | "support";
    subject?: string;
    variables?: Record<string, string>;
  },
): Promise<{ ok: boolean; messageId: string | null }> {
  return adminFetch(accessToken, `/api/v1/admin/users/${userId}/email`, {
    method: "POST",
    body: JSON.stringify({
      template_id: body.templateId,
      from_address: body.fromAddress ?? "noreply",
      subject: body.subject,
      variables: body.variables,
    }),
  });
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}
