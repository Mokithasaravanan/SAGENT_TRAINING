-- Allow direct NGO donations without a campaign
ALTER TABLE donations MODIFY campaign_id BIGINT NULL;
ALTER TABLE donations MODIFY amount DECIMAL(15,2) NULL;
-- Reset NGO admin passwords to default 'password' 
-- UPDATE users SET password = '$2a$10$7EqJtq98hPqEX7fNZaFWoO5dZxXfjJrZhx9xGVo4G6iQYF0ic4n5i' WHERE role='ADMIN' AND ngo_id IS NOT NULL;
-- Remove old NGO admin accounts 
-- DELETE FROM users WHERE role='ADMIN' AND email IN ('310623205090@srmrmp.edu.in','310623205091@eec.srmrmp.edu.in','310623205092@eec.srmrmp.edu.in','310623205093@eec.srmrmp.edu.in','310623205094@eec.srmrmp.edu.in','310623205095@eec.srmrmp.edu.in');
