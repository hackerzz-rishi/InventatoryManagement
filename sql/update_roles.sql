-- Modify role_id column length
ALTER TABLE user_master DROP FOREIGN KEY user_master_ibfk_1;
ALTER TABLE role_master MODIFY role_id VARCHAR(15);
ALTER TABLE user_master MODIFY role_id VARCHAR(15);
ALTER TABLE user_master ADD CONSTRAINT user_master_ibfk_1 FOREIGN KEY (role_id) REFERENCES role_master(role_id);

-- Insert the ROLE_OFFICE role
INSERT INTO role_master (role_id, role_name) VALUES
('ROLE_OFFICE', 'Office Staff')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);