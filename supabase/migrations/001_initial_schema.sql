-- İş Takip Sistemi - Veritabanı Şeması
-- Roller: admin, personel, ekip

-- Profiller (auth.users ile eşleşir)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'personel', 'ekip')),
  full_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Şehirler
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT
);

-- Firmalar
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tax_number TEXT,
  tax_office TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projeler
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'tamamlandi', 'beklemede')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proje Hizmetleri (Kurulum, Montaj, Servis, Demontaj)
CREATE TABLE project_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('kurulum', 'montaj', 'servis', 'demontaj')),
  description TEXT,
  status TEXT DEFAULT 'planlandi' CHECK (status IN ('planlandi', 'devam', 'tamamlandi')),
  assigned_personel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_ekip_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faturalar
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  invoice_no TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT DEFAULT 'kesildi' CHECK (status IN ('kesildi', 'odendi', 'beklemede')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hakedişler
CREATE TABLE progress_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ürünler
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT DEFAULT 'adet',
  purchase_price DECIMAL(15,2) NOT NULL,
  sale_price DECIMAL(15,2) NOT NULL,
  stock DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mal Alımları
CREATE TABLE product_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  purchase_date DATE NOT NULL,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Şirket Giderleri
CREATE TABLE company_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('demirbas', 'giyim', 'arac_vergi', 'yakit', 'yemek', 'diger')),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personel Harcamaları
CREATE TABLE personnel_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personel_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  expense_date DATE NOT NULL,
  location TEXT,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'beklemede' CHECK (status IN ('beklemede', 'onaylandi', 'reddedildi')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ekip Harcamaları
CREATE TABLE team_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ekip_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  expense_date DATE NOT NULL,
  location TEXT,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'beklemede' CHECK (status IN ('beklemede', 'onaylandi', 'reddedildi')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İş Kayıtları (Personel/Ekip nerede ne iş yaptı)
CREATE TABLE work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ekip_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  work_date DATE NOT NULL,
  description TEXT NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN ('kurulum', 'montaj', 'servis', 'demontaj')),
  hours DECIMAL(5,2),
  status TEXT DEFAULT 'beklemede' CHECK (status IN ('beklemede', 'onaylandi', 'reddedildi')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT work_log_assignee CHECK (personel_id IS NOT NULL OR ekip_id IS NOT NULL)
);

-- Personel Ödemeleri
CREATE TABLE personnel_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personel_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  description TEXT,
  payment_type TEXT DEFAULT 'avans' CHECK (payment_type IN ('avans', 'maas', 'hakedis', 'diger')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ekip Ödemeleri
CREATE TABLE team_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ekip_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  description TEXT,
  payment_type TEXT DEFAULT 'avans' CHECK (payment_type IN ('avans', 'hakedis', 'diger')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kullanıcı rolü helper fonksiyonu
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Aktifleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Admin tüm yetkilere sahip (public.get_user_role() SECURITY DEFINER ile profiles'a erişir)
CREATE POLICY "Admin full access" ON profiles FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "User read own profile" ON profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User update own profile" ON profiles FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admin full access companies" ON companies FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access projects" ON projects FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Authenticated read projects" ON projects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access project_services" ON project_services FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access invoices" ON invoices FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access progress_payments" ON progress_payments FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access products" ON products FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access product_purchases" ON product_purchases FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access company_expenses" ON company_expenses FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access personnel_expenses" ON personnel_expenses FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access team_expenses" ON team_expenses FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access work_logs" ON work_logs FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access personnel_payments" ON personnel_payments FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Admin full access team_payments" ON team_payments FOR ALL USING (public.get_user_role() = 'admin');

-- Şehirler herkese okuma
CREATE POLICY "Cities readable by all" ON cities FOR SELECT USING (true);
CREATE POLICY "Admin cities write" ON cities FOR ALL USING (public.get_user_role() = 'admin');

-- Personel kendi verilerini görebilir ve ekleyebilir
CREATE POLICY "Personel own expenses" ON personnel_expenses FOR ALL USING (
  personel_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR public.get_user_role() = 'admin'
);
CREATE POLICY "Personel own work logs" ON work_logs FOR ALL USING (
  personel_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR public.get_user_role() = 'admin'
);
CREATE POLICY "Personel own payments" ON personnel_payments FOR SELECT USING (
  personel_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR public.get_user_role() = 'admin'
);

-- Ekip kendi verilerini görebilir ve ekleyebilir
CREATE POLICY "Ekip own expenses" ON team_expenses FOR ALL USING (
  ekip_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR public.get_user_role() = 'admin'
);
CREATE POLICY "Ekip own work logs" ON work_logs FOR ALL USING (
  ekip_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR public.get_user_role() = 'admin'
);
CREATE POLICY "Ekip own payments" ON team_payments FOR SELECT USING (
  ekip_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR public.get_user_role() = 'admin'
);

-- Profil oluşturma trigger (yeni kullanıcı kaydında)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'personel'), COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Türkiye illeri seed
INSERT INTO cities (name, code) VALUES
('Adana', '01'), ('Adıyaman', '02'), ('Afyonkarahisar', '03'), ('Ağrı', '04'), ('Amasya', '05'),
('Ankara', '06'), ('Antalya', '07'), ('Artvin', '08'), ('Aydın', '09'), ('Balıkesir', '10'),
('Bilecik', '11'), ('Bingöl', '12'), ('Bitlis', '13'), ('Bolu', '14'), ('Burdur', '15'),
('Bursa', '16'), ('Çanakkale', '17'), ('Çankırı', '18'), ('Çorum', '19'), ('Denizli', '20'),
('Diyarbakır', '21'), ('Edirne', '22'), ('Elazığ', '23'), ('Erzincan', '24'), ('Erzurum', '25'),
('Eskişehir', '26'), ('Gaziantep', '27'), ('Giresun', '28'), ('Gümüşhane', '29'), ('Hakkari', '30'),
('Hatay', '31'), ('Isparta', '32'), ('Mersin', '33'), ('İstanbul', '34'), ('İzmir', '35'),
('Kars', '36'), ('Kastamonu', '37'), ('Kayseri', '38'), ('Kırklareli', '39'), ('Kırşehir', '40'),
('Kocaeli', '41'), ('Konya', '42'), ('Kütahya', '43'), ('Malatya', '44'), ('Manisa', '45'),
('Kahramanmaraş', '46'), ('Mardin', '47'), ('Muğla', '48'), ('Muş', '49'), ('Nevşehir', '50'),
('Niğde', '51'), ('Ordu', '52'), ('Rize', '53'), ('Sakarya', '54'), ('Samsun', '55'),
('Siirt', '56'), ('Sinop', '57'), ('Sivas', '58'), ('Tekirdağ', '59'), ('Tokat', '60'),
('Trabzon', '61'), ('Tunceli', '62'), ('Şanlıurfa', '63'), ('Uşak', '64'), ('Van', '65'),
('Yozgat', '66'), ('Zonguldak', '67'), ('Aksaray', '68'), ('Bayburt', '69'), ('Karaman', '70'),
('Kırıkkale', '71'), ('Batman', '72'), ('Şırnak', '73'), ('Bartın', '74'), ('Ardahan', '75'),
('Iğdır', '76'), ('Yalova', '77'), ('Karabük', '78'), ('Kilis', '79'), ('Osmaniye', '80'), ('Düzce', '81');
