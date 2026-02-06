import type Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { addDays, addMonths, formatDate, formatDateOnly } from "./utils";

const PASSWORD_HASH = "password123";

type ServerBlueprint = {
  country: string;
  code: string;
  city: string;
  nodes: number;
  tags?: string[];
  premium?: boolean;
};

type ServerSeed = {
  id: string;
  name: string;
  country: string;
  country_code: string;
  city: string;
  ip_address: string;
  port: number;
  protocol: string;
  config_json: string;
  load_percent: number;
  max_users: number;
  current_users: number;
  bandwidth_limit_gbps: number;
  is_premium: number;
  tags: string;
  status: string;
  uptime_percent: number;
};

const citySlugOverrides: Record<string, string> = {
  Amsterdam: "ams",
  Frankfurt: "fra",
  "New York": "nyc",
  "Los Angeles": "lax",
  London: "lon",
  Tokyo: "tok",
  Singapore: "sin",
  Paris: "par",
  Dubai: "dxb",
};

const serverBlueprints: ServerBlueprint[] = [
  { country: "Netherlands", code: "NL", city: "Amsterdam", nodes: 2, tags: ["streaming", "recommended"] },
  { country: "Netherlands", code: "NL", city: "Rotterdam", nodes: 1, tags: ["p2p"] },
  { country: "Netherlands", code: "NL", city: "Utrecht", nodes: 1 },
  { country: "Germany", code: "DE", city: "Frankfurt", nodes: 2, tags: ["gaming"] },
  { country: "Germany", code: "DE", city: "Berlin", nodes: 1 },
  { country: "Germany", code: "DE", city: "Munich", nodes: 1 },
  { country: "Germany", code: "DE", city: "Hamburg", nodes: 1 },
  { country: "United States", code: "US", city: "New York", nodes: 3, tags: ["streaming"] },
  { country: "United States", code: "US", city: "Los Angeles", nodes: 2, tags: ["streaming"] },
  { country: "United States", code: "US", city: "Chicago", nodes: 1 },
  { country: "United States", code: "US", city: "Miami", nodes: 1 },
  { country: "United States", code: "US", city: "Seattle", nodes: 1 },
  { country: "United States", code: "US", city: "Dallas", nodes: 1 },
  { country: "United States", code: "US", city: "San Jose", nodes: 1, tags: ["gaming"] },
  { country: "United Kingdom", code: "GB", city: "London", nodes: 2, tags: ["recommended"] },
  { country: "United Kingdom", code: "GB", city: "Manchester", nodes: 1 },
  { country: "France", code: "FR", city: "Paris", nodes: 2, tags: ["streaming"] },
  { country: "France", code: "FR", city: "Marseille", nodes: 1 },
  { country: "Canada", code: "CA", city: "Toronto", nodes: 2 },
  { country: "Canada", code: "CA", city: "Vancouver", nodes: 1 },
  { country: "Japan", code: "JP", city: "Tokyo", nodes: 2, tags: ["streaming"] },
  { country: "Japan", code: "JP", city: "Osaka", nodes: 1 },
  { country: "Singapore", code: "SG", city: "Singapore", nodes: 2, tags: ["recommended"] },
  { country: "Australia", code: "AU", city: "Sydney", nodes: 2 },
  { country: "Australia", code: "AU", city: "Melbourne", nodes: 1 },
  { country: "India", code: "IN", city: "Mumbai", nodes: 2 },
  { country: "India", code: "IN", city: "Delhi", nodes: 1 },
  { country: "South Korea", code: "KR", city: "Seoul", nodes: 2, tags: ["gaming"] },
  { country: "Brazil", code: "BR", city: "Sao Paulo", nodes: 2 },
  { country: "Brazil", code: "BR", city: "Rio de Janeiro", nodes: 1 },
  { country: "Spain", code: "ES", city: "Madrid", nodes: 1 },
  { country: "Spain", code: "ES", city: "Barcelona", nodes: 1 },
  { country: "Italy", code: "IT", city: "Milan", nodes: 1 },
  { country: "Italy", code: "IT", city: "Rome", nodes: 1 },
  { country: "Sweden", code: "SE", city: "Stockholm", nodes: 1 },
  { country: "Switzerland", code: "CH", city: "Zurich", nodes: 1 },
  { country: "Turkey", code: "TR", city: "Istanbul", nodes: 1 },
  { country: "United Arab Emirates", code: "AE", city: "Dubai", nodes: 1 },
];

function slugifyCity(city: string) {
  return (
    citySlugOverrides[city] ??
    city
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
  );
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createIp(rand: () => number) {
  const octet = () => Math.floor(rand() * 200) + 20;
  return `185.${octet()}.${octet()}.${octet()}`;
}

function buildServerSeeds() {
  const rand = mulberry32(42);
  const servers: ServerSeed[] = [];

  serverBlueprints.forEach((blueprint) => {
    const slug = slugifyCity(blueprint.city);
    for (let i = 1; i <= blueprint.nodes; i += 1) {
      const nodeIndex = String(i).padStart(2, "0");
      const id = `srv_${blueprint.code.toLowerCase()}_${slug}_${nodeIndex}`;
      const isPremium = blueprint.premium ?? rand() > 0.6;
      const load = Math.floor(rand() * 70) + 15;
      const status = id.includes("_03") ? "maintenance" : rand() > 0.95 ? "offline" : "online";
      const maxUsers = isPremium ? 1400 : 900;
      const currentUsers = Math.floor((load / 100) * maxUsers);
      const ip = createIp(rand);
      const config = {
        address: ip,
        port: 443,
        id: randomUUID(),
        encryption: "none",
        flow: "xtls-rprx-vision",
        network: "tcp",
        security: "tls",
        sni: "freegate.local",
      };

      servers.push({
        id,
        name: blueprint.nodes > 1 ? `${blueprint.city} ${nodeIndex}` : blueprint.city,
        country: blueprint.country,
        country_code: blueprint.code,
        city: blueprint.city,
        ip_address: ip,
        port: 443,
        protocol: "vless",
        config_json: JSON.stringify(config),
        load_percent: load,
        max_users: maxUsers,
        current_users: currentUsers,
        bandwidth_limit_gbps: isPremium ? 20 : 10,
        is_premium: isPremium ? 1 : 0,
        tags: JSON.stringify(blueprint.tags ?? []),
        status,
        uptime_percent: status === "online" ? 99.9 : 94.2,
      });
    }
  });

  return servers;
}

export function seedDatabase(db: Database.Database) {
  const existing = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };
  if (existing.count > 0) {
    return;
  }

  const now = new Date();
  const today = formatDateOnly(now);
  const premiumStart = addDays(now, -10);
  const premiumEnd = addDays(now, 20);
  const adminStart = addDays(now, -40);
  const adminEnd = addMonths(now, 11);

  const users = [
    {
      id: "usr_admin",
      email: "admin@freegate.local",
      password_hash: PASSWORD_HASH,
      name: "Avery Admin",
      plan: "ultimate",
      plan_interval: "year",
      plan_started_at: formatDate(adminStart),
      plan_expires_at: formatDate(adminEnd),
      plan_cancel_at_period_end: 0,
      is_admin: 1,
      is_guest: 0,
      guest_id: null,
      email_verified: 1,
      created_at: formatDate(addDays(now, -120)),
      updated_at: formatDate(addDays(now, -2)),
      last_login_at: formatDate(addDays(now, -1)),
    },
    {
      id: "usr_premium",
      email: "premium@freegate.local",
      password_hash: PASSWORD_HASH,
      name: "Jordan Premium",
      plan: "premium",
      plan_interval: "month",
      plan_started_at: formatDate(premiumStart),
      plan_expires_at: formatDate(premiumEnd),
      plan_cancel_at_period_end: 0,
      is_admin: 0,
      is_guest: 0,
      guest_id: null,
      email_verified: 1,
      created_at: formatDate(addDays(now, -90)),
      updated_at: formatDate(addDays(now, -3)),
      last_login_at: formatDate(addDays(now, -1)),
    },
    {
      id: "usr_free",
      email: "free@freegate.local",
      password_hash: PASSWORD_HASH,
      name: "Taylor Free",
      plan: "free",
      plan_interval: "month",
      plan_started_at: formatDate(addDays(now, -5)),
      plan_expires_at: null,
      plan_cancel_at_period_end: 0,
      is_admin: 0,
      is_guest: 0,
      guest_id: null,
      email_verified: 0,
      created_at: formatDate(addDays(now, -5)),
      updated_at: formatDate(addDays(now, -2)),
      last_login_at: formatDate(addDays(now, -1)),
    },
    {
      id: "usr_guest",
      email: "guest@freegate.local",
      password_hash: PASSWORD_HASH,
      name: null,
      plan: "free",
      plan_interval: "month",
      plan_started_at: formatDate(addDays(now, -1)),
      plan_expires_at: null,
      plan_cancel_at_period_end: 0,
      is_admin: 0,
      is_guest: 1,
      guest_id: "guest_seed_001",
      email_verified: 0,
      created_at: formatDate(addDays(now, -1)),
      updated_at: formatDate(addDays(now, -1)),
      last_login_at: formatDate(addDays(now, -1)),
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, email, password_hash, name, plan, plan_interval, plan_started_at,
      plan_expires_at, plan_cancel_at_period_end, is_admin, is_guest, guest_id,
      email_verified, created_at, updated_at, last_login_at
    ) VALUES (
      @id, @email, @password_hash, @name, @plan, @plan_interval, @plan_started_at,
      @plan_expires_at, @plan_cancel_at_period_end, @is_admin, @is_guest, @guest_id,
      @email_verified, @created_at, @updated_at, @last_login_at
    )
  `);

  const insertSettings = db.prepare(`
    INSERT INTO user_settings (
      user_id, auto_connect, auto_connect_wifi, kill_switch, protocol,
      split_tunneling_enabled, split_tunneling_mode, split_tunneling_apps,
      dns_mode, dns_primary, dns_secondary, ipv6_enabled, lan_bypass,
      mtu, socks_port, udp_enabled, theme, language, notifications_enabled
    ) VALUES (
      @user_id, @auto_connect, @auto_connect_wifi, @kill_switch, @protocol,
      @split_tunneling_enabled, @split_tunneling_mode, @split_tunneling_apps,
      @dns_mode, @dns_primary, @dns_secondary, @ipv6_enabled, @lan_bypass,
      @mtu, @socks_port, @udp_enabled, @theme, @language, @notifications_enabled
    )
  `);

  const insertDevice = db.prepare(`
    INSERT INTO devices (
      id, user_id, name, type, device_identifier, last_ip, last_active_at, created_at
    ) VALUES (
      @id, @user_id, @name, @type, @device_identifier, @last_ip, @last_active_at, @created_at
    )
  `);

  const insertServer = db.prepare(`
    INSERT INTO servers (
      id, name, country, country_code, city, ip_address, port, protocol, config_json,
      load_percent, max_users, current_users, bandwidth_limit_gbps, is_premium, tags, status,
      uptime_percent, created_at, updated_at
    ) VALUES (
      @id, @name, @country, @country_code, @city, @ip_address, @port, @protocol, @config_json,
      @load_percent, @max_users, @current_users, @bandwidth_limit_gbps, @is_premium, @tags, @status,
      @uptime_percent, @created_at, @updated_at
    )
  `);

  const insertFavorite = db.prepare(
    "INSERT INTO user_favorite_servers (user_id, server_id) VALUES (?, ?)"
  );

  const insertSession = db.prepare(`
    INSERT INTO vpn_sessions (
      id, user_id, device_id, server_id, protocol, started_at, ended_at,
      duration_seconds, bytes_down, bytes_up, disconnect_reason, client_ip, assigned_ip
    ) VALUES (
      @id, @user_id, @device_id, @server_id, @protocol, @started_at, @ended_at,
      @duration_seconds, @bytes_down, @bytes_up, @disconnect_reason, @client_ip, @assigned_ip
    )
  `);

  const insertQuota = db.prepare(`
    INSERT INTO usage_quotas (
      user_id, date, bytes_used, quota_limit, created_at, updated_at
    ) VALUES (
      @user_id, @date, @bytes_used, @quota_limit, @created_at, @updated_at
    )
  `);

  const insertPayment = db.prepare(`
    INSERT INTO payments (
      id, user_id, stripe_payment_id, amount_cents, currency, status, plan_id,
      payment_method, card_last4, card_brand, receipt_url, created_at
    ) VALUES (
      @id, @user_id, @stripe_payment_id, @amount_cents, @currency, @status, @plan_id,
      @payment_method, @card_last4, @card_brand, @receipt_url, @created_at
    )
  `);

  const servers = buildServerSeeds();

  db.transaction(() => {
    users.forEach((user) => insertUser.run(user));

    insertSettings.run({
      user_id: "usr_admin",
      auto_connect: 1,
      auto_connect_wifi: 1,
      kill_switch: 1,
      protocol: "vless",
      split_tunneling_enabled: 0,
      split_tunneling_mode: "exclude",
      split_tunneling_apps: JSON.stringify([]),
      dns_mode: "auto",
      dns_primary: "1.1.1.1",
      dns_secondary: "1.0.0.1",
      ipv6_enabled: 1,
      lan_bypass: 1,
      mtu: 1500,
      socks_port: 10808,
      udp_enabled: 1,
      theme: "system",
      language: "en",
      notifications_enabled: 1,
    });

    insertSettings.run({
      user_id: "usr_premium",
      auto_connect: 1,
      auto_connect_wifi: 0,
      kill_switch: 1,
      protocol: "vless",
      split_tunneling_enabled: 1,
      split_tunneling_mode: "exclude",
      split_tunneling_apps: JSON.stringify(["com.bank.app", "com.google.maps"]),
      dns_mode: "custom",
      dns_primary: "1.1.1.1",
      dns_secondary: "1.0.0.1",
      ipv6_enabled: 0,
      lan_bypass: 1,
      mtu: 1500,
      socks_port: 10808,
      udp_enabled: 1,
      theme: "system",
      language: "en",
      notifications_enabled: 1,
    });

    insertSettings.run({
      user_id: "usr_free",
      auto_connect: 0,
      auto_connect_wifi: 0,
      kill_switch: 1,
      protocol: "vless",
      split_tunneling_enabled: 0,
      split_tunneling_mode: "exclude",
      split_tunneling_apps: JSON.stringify([]),
      dns_mode: "auto",
      dns_primary: "1.1.1.1",
      dns_secondary: "1.0.0.1",
      ipv6_enabled: 0,
      lan_bypass: 1,
      mtu: 1500,
      socks_port: 10808,
      udp_enabled: 1,
      theme: "system",
      language: "en",
      notifications_enabled: 1,
    });

    insertSettings.run({
      user_id: "usr_guest",
      auto_connect: 0,
      auto_connect_wifi: 0,
      kill_switch: 1,
      protocol: "vless",
      split_tunneling_enabled: 0,
      split_tunneling_mode: "exclude",
      split_tunneling_apps: JSON.stringify([]),
      dns_mode: "auto",
      dns_primary: "1.1.1.1",
      dns_secondary: "1.0.0.1",
      ipv6_enabled: 0,
      lan_bypass: 1,
      mtu: 1500,
      socks_port: 10808,
      udp_enabled: 1,
      theme: "system",
      language: "en",
      notifications_enabled: 1,
    });

    insertDevice.run({
      id: "dev_premium_01",
      user_id: "usr_premium",
      name: "Samsung Galaxy S23",
      type: "android",
      device_identifier: "android-001",
      last_ip: "172.16.12.54",
      last_active_at: formatDate(addDays(now, -1)),
      created_at: formatDate(addDays(now, -80)),
    });

    insertDevice.run({
      id: "dev_premium_02",
      user_id: "usr_premium",
      name: "OnePlus 11",
      type: "android",
      device_identifier: "android-002",
      last_ip: "172.16.12.88",
      last_active_at: formatDate(addDays(now, -2)),
      created_at: formatDate(addDays(now, -70)),
    });

    insertDevice.run({
      id: "dev_free_01",
      user_id: "usr_free",
      name: "Pixel 6",
      type: "android",
      device_identifier: "android-003",
      last_ip: "10.10.12.32",
      last_active_at: formatDate(addDays(now, -1)),
      created_at: formatDate(addDays(now, -4)),
    });

    insertDevice.run({
      id: "dev_admin_01",
      user_id: "usr_admin",
      name: "Admin Console",
      type: "windows",
      device_identifier: "win-001",
      last_ip: "10.10.50.18",
      last_active_at: formatDate(addDays(now, -1)),
      created_at: formatDate(addDays(now, -100)),
    });

    servers.forEach((server) =>
      insertServer.run({
        ...server,
        created_at: formatDate(addDays(now, -120)),
        updated_at: formatDate(addDays(now, -1)),
      })
    );

    insertFavorite.run("usr_premium", "srv_nl_ams_01");
    insertFavorite.run("usr_premium", "srv_us_nyc_01");
    insertFavorite.run("usr_premium", "srv_jp_tok_01");

    const premiumSessionStart = addDays(now, -1);
    insertSession.run({
      id: "sess_hist_001",
      user_id: "usr_premium",
      device_id: "dev_premium_01",
      server_id: "srv_nl_ams_01",
      protocol: "vless",
      started_at: formatDate(premiumSessionStart),
      ended_at: formatDate(addDays(premiumSessionStart, 0)),
      duration_seconds: 3600,
      bytes_down: 1073741824,
      bytes_up: 268435456,
      disconnect_reason: "user",
      client_ip: "100.10.10.10",
      assigned_ip: "185.200.1.2",
    });

    insertQuota.run({
      user_id: "usr_free",
      date: today,
      bytes_used: 419430400,
      quota_limit: 524288000,
      created_at: formatDate(now),
      updated_at: formatDate(now),
    });

    for (let i = 0; i < 7; i += 1) {
      const day = addDays(now, -i);
      insertQuota.run({
        user_id: "usr_premium",
        date: formatDateOnly(day),
        bytes_used: 6500000000 - i * 900000000,
        quota_limit: null,
        created_at: formatDate(day),
        updated_at: formatDate(day),
      });
    }

    insertQuota.run({
      user_id: "usr_guest",
      date: today,
      bytes_used: 102400000,
      quota_limit: 524288000,
      created_at: formatDate(now),
      updated_at: formatDate(now),
    });

    insertPayment.run({
      id: "pay_premium_001",
      user_id: "usr_premium",
      stripe_payment_id: "pi_mock_001",
      amount_cents: 499,
      currency: "usd",
      status: "succeeded",
      plan_id: "premium_monthly",
      payment_method: "card",
      card_last4: "4242",
      card_brand: "visa",
      receipt_url: "/receipts/rcpt_001",
      created_at: formatDate(premiumStart),
    });
  })();
}
