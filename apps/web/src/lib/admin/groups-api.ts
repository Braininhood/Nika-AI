import { adminFetch } from "./api-utils";

export interface UserGroupSummary {
  id: string;
  name: string;
  description: string | null;
  kind: "manual" | "profession" | "country";
  filterValue: string | null;
  memberCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UserGroupMember {
  id: string;
  email: string | null;
  profession: string | null;
  addedAt: string | null;
}

export interface UserGroupDetail extends UserGroupSummary {
  members: UserGroupMember[];
}

export interface SmartSegment {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export interface EmailPreview {
  subject: string;
  html: string;
  plainText: string;
}

export interface EmailCampaignResult {
  audienceSize: number;
  sent: number;
  failed: number;
  skipped: number;
  dryRun: boolean;
  errors: string[];
}

export type EmailAudience =
  | { type: "users"; userIds: string[] }
  | { type: "group"; groupId: string }
  | { type: "segment"; segmentId: string };

export async function fetchGroups(accessToken: string): Promise<UserGroupSummary[]> {
  return adminFetch(accessToken, "/api/v1/admin/groups");
}

export async function fetchSegments(accessToken: string): Promise<SmartSegment[]> {
  return adminFetch(accessToken, "/api/v1/admin/segments");
}

export async function fetchGroup(accessToken: string, groupId: string): Promise<UserGroupDetail> {
  return adminFetch(accessToken, `/api/v1/admin/groups/${groupId}`);
}

export async function createGroup(
  accessToken: string,
  body: {
    name: string;
    description?: string;
    kind?: "manual" | "profession" | "country";
    filterValue?: string;
  },
): Promise<UserGroupSummary> {
  return adminFetch(accessToken, "/api/v1/admin/groups", {
    method: "POST",
    body: JSON.stringify({
      name: body.name,
      description: body.description,
      kind: body.kind ?? "manual",
      filter_value: body.filterValue,
    }),
  });
}

export async function updateGroup(
  accessToken: string,
  groupId: string,
  body: { name?: string; description?: string },
): Promise<UserGroupSummary> {
  return adminFetch(accessToken, `/api/v1/admin/groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteGroup(accessToken: string, groupId: string): Promise<void> {
  await adminFetch(accessToken, `/api/v1/admin/groups/${groupId}`, { method: "DELETE" });
}

export async function addGroupMembers(
  accessToken: string,
  groupId: string,
  userIds: string[],
): Promise<UserGroupDetail> {
  return adminFetch(accessToken, `/api/v1/admin/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify({ user_ids: userIds }),
  });
}

export async function removeGroupMember(
  accessToken: string,
  groupId: string,
  userId: string,
): Promise<UserGroupDetail> {
  return adminFetch(accessToken, `/api/v1/admin/groups/${groupId}/members/${userId}`, {
    method: "DELETE",
  });
}

export async function previewEmail(
  accessToken: string,
  body: {
    templateId: string;
    sampleUserId?: string;
    sampleEmail?: string;
    subject?: string;
    variables?: Record<string, string>;
  },
): Promise<EmailPreview> {
  return adminFetch(accessToken, "/api/v1/admin/email/preview", {
    method: "POST",
    body: JSON.stringify({
      template_id: body.templateId,
      sample_user_id: body.sampleUserId,
      sample_email: body.sampleEmail,
      subject: body.subject,
      variables: body.variables,
    }),
  });
}

export async function sendEmailCampaign(
  accessToken: string,
  body: {
    templateId: string;
    fromAddress?: "noreply" | "support";
    subject?: string;
    variables?: Record<string, string>;
    dryRun?: boolean;
    audience: EmailAudience;
  },
): Promise<EmailCampaignResult> {
  const payload: Record<string, unknown> = {
    template_id: body.templateId,
    from_address: body.fromAddress ?? "noreply",
    subject: body.subject,
    variables: body.variables ?? {},
    dry_run: body.dryRun ?? false,
    audience_type: body.audience.type,
  };
  if (body.audience.type === "users") payload.user_ids = body.audience.userIds;
  if (body.audience.type === "group") payload.group_id = body.audience.groupId;
  if (body.audience.type === "segment") payload.segment_id = body.audience.segmentId;

  return adminFetch(accessToken, "/api/v1/admin/email/campaign", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
