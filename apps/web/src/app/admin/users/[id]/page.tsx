import { UserDetailView } from "@/components/admin/user-detail-view";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetailView userId={id} />;
}
