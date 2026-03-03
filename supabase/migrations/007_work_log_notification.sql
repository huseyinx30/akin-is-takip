-- İş kaydı bildirimi: personel/ekip iş kaydı ekleyince admin'e bildirim

-- notifications type'a is_kaydi ekle
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('harcama_onaylandi', 'harcama_reddedildi', 'mesaj', 'is_kaydi'));

-- work_logs INSERT trigger: admin'lere bildirim oluştur
CREATE OR REPLACE FUNCTION notify_work_log_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_assignee_name TEXT;
  v_project_name TEXT;
  v_body TEXT;
  v_link TEXT;
  v_admin RECORD;
BEGIN
  v_link := '/dashboard/isler/devam-eden?project=' || NEW.project_id;
  
  SELECT full_name INTO v_assignee_name FROM profiles WHERE id = COALESCE(NEW.personel_id, NEW.ekip_id);
  SELECT name INTO v_project_name FROM projects WHERE id = NEW.project_id;
  
  v_body := COALESCE(v_assignee_name, 'Personel/Ekip') || ' - ' || COALESCE(v_project_name, 'Proje') || 
    ' - ' || NEW.work_type || ' (' || COALESCE(NEW.work_quantity::text, '-') || ' adet)';
  
  FOR v_admin IN SELECT id FROM profiles WHERE role = 'admin'
  LOOP
    INSERT INTO notifications (profile_id, type, title, body, link_url, related_id)
    VALUES (v_admin.id, 'is_kaydi', 'Yeni İş Kaydı', v_body, v_link, NEW.id);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_work_log_notify ON work_logs;
CREATE TRIGGER trg_work_log_notify
  AFTER INSERT ON work_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_work_log_insert();
