-- Ödeme tipine 'harcama' ekle
ALTER TABLE personnel_payments DROP CONSTRAINT IF EXISTS personnel_payments_payment_type_check;
ALTER TABLE personnel_payments ADD CONSTRAINT personnel_payments_payment_type_check 
  CHECK (payment_type IN ('avans', 'maas', 'hakedis', 'diger', 'harcama'));

ALTER TABLE team_payments DROP CONSTRAINT IF EXISTS team_payments_payment_type_check;
ALTER TABLE team_payments ADD CONSTRAINT team_payments_payment_type_check 
  CHECK (payment_type IN ('avans', 'hakedis', 'diger', 'harcama'));
