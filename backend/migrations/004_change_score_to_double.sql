-- Change score column to DOUBLE to support games with decimal scores (like time-based games)
ALTER TABLE scores MODIFY COLUMN score DOUBLE NOT NULL;
