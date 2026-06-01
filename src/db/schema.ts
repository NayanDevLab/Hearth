// Hearth SQLite schema — all table definitions.
// Each module owns its tables; add new tables in the matching section.
// Bump DB_VERSION and add a migration in migrations/ when changing schema.

export const DB_VERSION = 4;

export const SQL_TABLES = {
  // ─── Tasks ────────────────────────────────────────────────
  tasks: `
    CREATE TABLE IF NOT EXISTS tasks (
      id             TEXT PRIMARY KEY,
      title          TEXT NOT NULL,
      assignee       TEXT,
      due_time       TEXT,
      tag            TEXT,
      done           INTEGER NOT NULL DEFAULT 0,
      recurrence     TEXT,
      recurrence_id  TEXT,
      category       TEXT,
      priority       TEXT NOT NULL DEFAULT 'normal',
      notes          TEXT,
      reminder       TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

  task_completions: `
    CREATE TABLE IF NOT EXISTS task_completions (
      id           TEXT PRIMARY KEY,
      task_id      TEXT NOT NULL,
      completed_by TEXT,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      on_time      INTEGER NOT NULL DEFAULT 1
    );
  `,

  // ─── Bills ───────────────────────────────────────────────
  bills: `
    CREATE TABLE IF NOT EXISTS bills (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      amount        REAL NOT NULL,
      currency      TEXT NOT NULL DEFAULT 'INR',
      due_date      TEXT,
      icon_color    TEXT,
      paid          INTEGER NOT NULL DEFAULT 0,
      recurrence    TEXT,
      category      TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

  // ─── Shopping ────────────────────────────────────────────
  shopping_lists: `
    CREATE TABLE IF NOT EXISTS shopping_lists (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      store         TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

  shopping_items: `
    CREATE TABLE IF NOT EXISTS shopping_items (
      id            TEXT PRIMARY KEY,
      list_id       TEXT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
      name          TEXT NOT NULL,
      quantity      REAL NOT NULL DEFAULT 1,
      unit          TEXT,
      category      TEXT,
      done          INTEGER NOT NULL DEFAULT 0,
      price         REAL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

  // ─── Pantry ──────────────────────────────────────────────
  pantry_items: `
    CREATE TABLE IF NOT EXISTS pantry_items (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      quantity      REAL NOT NULL DEFAULT 1,
      unit          TEXT,
      category      TEXT,
      expiry_date   TEXT,
      low_threshold  REAL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

  // ─── Item Locator ─────────────────────────────────────────
  rooms: `
    CREATE TABLE IF NOT EXISTS rooms (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      emoji         TEXT,
      sort_order    INTEGER NOT NULL DEFAULT 0
    );
  `,

  storage_spots: `
    CREATE TABLE IF NOT EXISTS storage_spots (
      id            TEXT PRIMARY KEY,
      room_id       TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      name          TEXT NOT NULL,
      sort_order    INTEGER NOT NULL DEFAULT 0
    );
  `,

  located_items: `
    CREATE TABLE IF NOT EXISTS located_items (
      id            TEXT PRIMARY KEY,
      spot_id       TEXT REFERENCES storage_spots(id) ON DELETE SET NULL,
      name          TEXT NOT NULL,
      category      TEXT,
      photo_uri     TEXT,
      notes         TEXT,
      last_seen     TEXT NOT NULL DEFAULT (datetime('now')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

  // ─── Maintenance ─────────────────────────────────────────
  maintenance_issues: `
    CREATE TABLE IF NOT EXISTS maintenance_issues (
      id            TEXT PRIMARY KEY,
      title         TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'open',
      priority      TEXT,
      photo_uri     TEXT,
      notes         TEXT,
      vendor_id     TEXT,
      cost          REAL,
      resolved_at   TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

  vendors: `
    CREATE TABLE IF NOT EXISTS vendors (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      trade         TEXT,
      phone         TEXT,
      rating        INTEGER,
      last_used     TEXT,
      notes         TEXT
    );
  `,

  appliances: `
    CREATE TABLE IF NOT EXISTS appliances (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      brand         TEXT,
      purchase_date TEXT,
      price         REAL,
      warranty_until TEXT,
      serial_no     TEXT,
      notes         TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

  // ─── Meals ───────────────────────────────────────────────
  meals: `
    CREATE TABLE IF NOT EXISTS meals (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      scheduled_at  TEXT,
      meal_type     TEXT,
      duration_min  INTEGER,
      cook          TEXT,
      notes         TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,

  // ─── Health ──────────────────────────────────────────────
  health_members: `
    CREATE TABLE IF NOT EXISTS health_members (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      blood_group   TEXT,
      allergies     TEXT,
      doctor_name   TEXT,
      doctor_phone  TEXT,
      notes         TEXT
    );
  `,

  medications: `
    CREATE TABLE IF NOT EXISTS medications (
      id            TEXT PRIMARY KEY,
      member_id     TEXT REFERENCES health_members(id) ON DELETE CASCADE,
      name          TEXT NOT NULL,
      dosage        TEXT,
      schedule      TEXT,
      stored_at_spot_id TEXT REFERENCES storage_spots(id) ON DELETE SET NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `,
} as const;
