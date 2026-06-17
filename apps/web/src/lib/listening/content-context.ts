import { blocksForUser } from "@/content/listening";
import { loadUserProfile } from "@/lib/profile/service";

export async function loadListeningContentContext(userId?: string) {
  const profile = await loadUserProfile(userId);
  const blocks = blocksForUser(profile?.profession, profile?.targetCountry);

  return {
    profile,
    profession: profile?.profession,
    targetCountry: profile?.targetCountry,
    skillMap: profile?.skillMap,
    blocks,
  };
}
