-- Bildirimler ve Mesajlar

-- Bildirimler (harcama onay/red, mesaj bildirimi)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('harcama_onaylandi', 'harcama_reddedildi', 'mesaj')),
  title TEXT NOT NULL,
  body TEXT,
  link_url TEXT,
  related_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesajlar (admin -> personel/ekip)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_profile_unread ON notifications(profile_id) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_profile_created ON notifications(profile_id, created_at DESC);
CREATE INDEX idx_messages_receiver_unread ON messages(receiver_id) WHERE read_at IS NULL;
CREATE INDEX idx_messages_receiver_created ON messages(receiver_id, created_at DESC);
CREATE INDEX idx_messages_sender_created ON messages(sender_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admin tüm erişim
CREATE POLICY "Admin full access notifications" ON notifications FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access messages" ON messages FOR ALL USING (public.get_user_role() = 'admin');

-- Kullanıcı kendi bildirimlerini okuyabilir ve okundu işaretleyebilir
CREATE POLICY "User own notifications" ON notifications FOR ALL USING (
  profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Kullanıcı kendi mesajlarını (gönderilen/alınan) okuyabilir
CREATE POLICY "User own messages" ON messages FOR ALL USING (
  sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR receiver_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Harcama onay/red bildirimi için trigger fonksiyonu
CREATE OR REPLACE FUNCTION notify_expense_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_personel_id UUID;
  v_ekip_id UUID;
  v_profile_id UUID;
  v_title TEXT;
  v_body TEXT;
  v_link TEXT;
  v_desc TEXT;
BEGIN
  v_desc := COALESCE(NEW.description, 'Harcama');
  
  IF TG_TABLE_NAME = 'personnel_expenses' THEN
    v_profile_id := NEW.personel_id;
    v_link := '/dashboard/personeller/' || NEW.personel_id;
  ELSE
    v_profile_id := NEW.ekip_id;
    v_link := '/dashboard/ekipler/' || NEW.ekip_id;
  END IF;

  IF NEW.status = 'onaylandi' THEN
    v_title := 'Harcama Onaylandı';
    v_body := v_desc || ' (' || NEW.amount || ' ₺) onaylandı.';
    INSERT INTO notifications (profile_id, type, title, body, link_url, related_id)
    VALUES (v_profile_id, 'harcama_onaylandi', v_title, v_body, v_link, NEW.id);
  ELSIF NEW.status = 'reddedildi' THEN
    v_title := 'Harcama Reddedildi';
    v_body := v_desc || ' (' || NEW.amount || ' ₺) reddedildi.';
    INSERT INTO notifications (profile_id, type, title, body, link_url, related_id)
    VALUES (v_profile_id, 'harcama_reddedildi', v_title, v_body, v_link, NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- personnel_expenses trigger
DROP TRIGGER IF EXISTS trg_personnel_expense_notify ON personnel_expenses;
CREATE TRIGGER trg_personnel_expense_notify
  AFTER UPDATE OF status ON personnel_expenses
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('onaylandi', 'reddedildi'))
  EXECUTE FUNCTION notify_expense_status_change();

-- team_expenses trigger
DROP TRIGGER IF EXISTS trg_team_expense_notify ON team_expenses;
CREATE TRIGGER trg_team_expense_notify
  AFTER UPDATE OF status ON team_expenses
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('onaylandi', 'reddedildi'))
  EXECUTE FUNCTION notify_expense_status_change();
