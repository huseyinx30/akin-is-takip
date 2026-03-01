-- Hakedişler fatura bazlı da eklenebilsin diye project_id opsiyonel yapılıyor
ALTER TABLE progress_payments
  ALTER COLUMN project_id DROP NOT NULL;
