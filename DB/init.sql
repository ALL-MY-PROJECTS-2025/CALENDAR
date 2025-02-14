-- Create exporter user and grant permissions
CREATE USER IF NOT EXISTS 'dbconn'@'%' IDENTIFIED BY 'Zhfldk11!';
GRANT ALL PRIVILEGES ON *.* TO 'dbconn'@'%';
GRANT SELECT ON performance_schema.* TO 'dbconn'@'%';
GRANT SELECT ON sys.* TO 'dbconn'@'%';
GRANT SELECT ON *.* TO 'dbconn'@'%';
FLUSH PRIVILEGES;
