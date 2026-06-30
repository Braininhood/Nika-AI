"use client";

import { useParams } from "next/navigation";

import { GroupDetailView } from "@/components/admin/group-detail-view";

export default function AdminGroupDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  if (!id) {
    return <p className="text-sm text-ink-soft">Group not found.</p>;
  }
  return <GroupDetailView groupId={id} />;
}
