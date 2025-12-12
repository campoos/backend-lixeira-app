-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS smart_trash;
USE smart_trash;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de análises da IA
CREATE TABLE IF NOT EXISTS ai_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    object_detected VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    is_organic BOOLEAN NOT NULL DEFAULT FALSE,
    image_path VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de logs da lixeira
CREATE TABLE IF NOT EXISTS trash_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_id INT NOT NULL,
    action ENUM('OPEN', 'DENY') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES ai_analysis(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de status do dispositivo
CREATE TABLE IF NOT EXISTS device_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('ONLINE', 'OFFLINE', 'ERROR') NOT NULL DEFAULT 'OFFLINE',
    battery_level INT CHECK (battery_level >= 0 AND battery_level <= 100),
    firmware_version VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir status inicial do dispositivo
INSERT INTO device_status (status, battery_level, firmware_version) 
VALUES ('OFFLINE', 100, '1.0.0');

-- Criar índices para melhorar o desempenho
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis(created_at);
CREATE INDEX idx_trash_logs_timestamp ON trash_logs(timestamp);
