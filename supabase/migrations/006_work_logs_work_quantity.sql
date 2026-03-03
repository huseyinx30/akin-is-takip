-- İş kayıtlarında saat yerine iş adedi (work_quantity)
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS work_quantity INTEGER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_logs' AND column_name = 'hours') THEN
    UPDATE work_logs SET work_quantity = ROUND(hours::numeric)::integer WHERE hours IS NOT NULL AND (work_quantity IS NULL OR work_quantity = 0);
    ALTER TABLE work_logs DROP COLUMN hours;
  END IF;
END $$;
