-- Layer B original content packs (royalty-free OET Coach audio/scripts).
-- NEVER upload official OET copyrighted MP3/PDF here — user PLV import only.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-packs',
  'content-packs',
  true,
  52428800,
  array['audio/mpeg', 'audio/wav', 'audio/mp4', 'application/json', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for published packs (manifest + audio)
create policy "content_packs_public_read"
on storage.objects for select
to public
using (bucket_id = 'content-packs');

-- Authenticated users can list (for admin UI later)
create policy "content_packs_authenticated_read"
on storage.objects for select
to authenticated
using (bucket_id = 'content-packs');

-- Only service role uploads via dashboard/CI (no user write to content-packs)
create policy "content_packs_service_insert"
on storage.objects for insert
to service_role
with check (bucket_id = 'content-packs');

create policy "content_packs_service_update"
on storage.objects for update
to service_role
using (bucket_id = 'content-packs');

create policy "content_packs_service_delete"
on storage.objects for delete
to service_role
using (bucket_id = 'content-packs');
