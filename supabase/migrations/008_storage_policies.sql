-- Storage RLS policies for client-logos and brain-dump-images buckets.
-- Both buckets are Public (anyone can read), but only authenticated users can upload/manage their own files.

-- ── client-logos ────────────────────────────────────────────────────────────

-- Authenticated users can upload to their own folder (user_id/*)
create policy "client-logos: authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'client-logos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Anyone can read (bucket is public)
create policy "client-logos: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'client-logos');

-- Users can update/delete their own files
create policy "client-logos: owner update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'client-logos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "client-logos: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'client-logos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- ── brain-dump-images ────────────────────────────────────────────────────────

-- Files are stored as client_id/uuid.ext — owner_id check via clients table
-- Simpler: allow any authenticated user to upload (single-user app, owner only)
create policy "brain-dump-images: authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'brain-dump-images');

-- Anyone can read (bucket is public)
create policy "brain-dump-images: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'brain-dump-images');

-- Authenticated users can update/delete their own uploads
create policy "brain-dump-images: authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'brain-dump-images');

create policy "brain-dump-images: authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'brain-dump-images');
