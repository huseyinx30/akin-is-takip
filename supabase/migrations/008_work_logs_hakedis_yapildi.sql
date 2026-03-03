-- Hakediş yapıldı durumu: tamamlanan işlerde hakedişin yapılıp yapılmadığını takip eder
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS hakedis_yapildi BOOLEAN DEFAULT FALSE;
