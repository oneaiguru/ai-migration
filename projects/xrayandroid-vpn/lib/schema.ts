export const schemaSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'ultimate')),
    plan_interval TEXT CHECK (plan_interval IN ('month', 'year', 'lifetime')),
    plan_started_at DATETIME,
    plan_expires_at DATETIME,
    plan_cancel_at_period_end INTEGER DEFAULT 0,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    is_admin INTEGER DEFAULT 0,
    is_guest INTEGER DEFAULT 0,
    guest_id TEXT UNIQUE,
    email_verified INTEGER DEFAULT 0,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires DATETIME,
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    deleted_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_guest_id ON users(guest_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    auto_connect INTEGER DEFAULT 0,
    auto_connect_wifi INTEGER DEFAULT 0,
    kill_switch INTEGER DEFAULT 1,
    protocol TEXT DEFAULT 'vless' CHECK (protocol IN ('vless', 'vmess', 'trojan', 'shadowsocks')),
    split_tunneling_enabled INTEGER DEFAULT 0,
    split_tunneling_mode TEXT DEFAULT 'exclude' CHECK (split_tunneling_mode IN ('include', 'exclude')),
    split_tunneling_apps TEXT DEFAULT '[]',
    dns_mode TEXT DEFAULT 'auto' CHECK (dns_mode IN ('auto', 'cloudflare', 'google', 'custom')),
    dns_primary TEXT DEFAULT '1.1.1.1',
    dns_secondary TEXT DEFAULT '1.0.0.1',
    ipv6_enabled INTEGER DEFAULT 0,
    lan_bypass INTEGER DEFAULT 1,
    mtu INTEGER DEFAULT 1500,
    socks_port INTEGER DEFAULT 10808,
    udp_enabled INTEGER DEFAULT 1,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    notifications_enabled INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('android', 'ios', 'windows', 'macos', 'linux')),
    device_identifier TEXT NOT NULL,
    push_token TEXT,
    last_ip TEXT,
    last_active_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_identifier)
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code TEXT NOT NULL,
    city TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 443,
    protocol TEXT NOT NULL DEFAULT 'vless',
    config_json TEXT NOT NULL,
    load_percent INTEGER DEFAULT 0,
    max_users INTEGER DEFAULT 1000,
    current_users INTEGER DEFAULT 0,
    bandwidth_limit_gbps REAL DEFAULT 10.0,
    is_premium INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]',
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
    uptime_percent REAL DEFAULT 100.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_servers_country ON servers(country_code);
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_premium ON servers(is_premium);

CREATE TABLE IF NOT EXISTS user_favorite_servers (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, server_id)
);

CREATE TABLE IF NOT EXISTS vpn_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT REFERENCES devices(id) ON DELETE SET NULL,
    server_id TEXT NOT NULL REFERENCES servers(id),
    protocol TEXT NOT NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    duration_seconds INTEGER,
    bytes_down INTEGER DEFAULT 0,
    bytes_up INTEGER DEFAULT 0,
    disconnect_reason TEXT,
    client_ip TEXT,
    assigned_ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON vpn_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON vpn_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_server_id ON vpn_sessions(server_id);

CREATE TABLE IF NOT EXISTS usage_quotas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    bytes_used INTEGER DEFAULT 0,
    quota_limit INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_quotas_user_date ON usage_quotas(user_id, date);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    plan_id TEXT NOT NULL,
    payment_method TEXT,
    card_last4 TEXT,
    card_brand TEXT,
    receipt_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
`;
