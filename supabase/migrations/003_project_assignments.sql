-- Proje atamaları: Personel ve ekip hangi projelere erişebilir
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, profile_id)
);

ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access project_assignments" ON project_assignments FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "User read own assignments" ON project_assignments FOR SELECT USING (
  profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Projeler: Personel ve ekip sadece atandıkları projeleri görebilir
DROP POLICY IF EXISTS "Authenticated read projects" ON projects;
CREATE POLICY "Personel ekip assigned projects only" ON projects FOR SELECT USING (
  public.get_user_role() = 'admin'
  OR (
    public.get_user_role() IN ('personel', 'ekip')
    AND auth.uid() IS NOT NULL
    AND (
      id IN (SELECT project_id FROM project_assignments WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
      OR id IN (SELECT project_id FROM work_logs WHERE personel_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR ekip_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
      OR id IN (SELECT project_id FROM project_services WHERE assigned_personel_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR assigned_ekip_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    )
  )
);
