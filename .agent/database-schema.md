# Database Schema Reference

This file contains the complete database schema for the auction-website-admin project.

---

## Tables Overview

### 1. `dropdowns`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| category | text | NO | - |
| label | text | NO | - |
| is_active | boolean | YES | true |
| order_index | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

### 2. `pooling_schedule`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| trade_id | uuid | NO | - |
| location | text | NO | - |
| pooling_date | text | NO | - |
| order_index | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

### 3. `submissions`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| trade_number | text | NO | - |
| phone_number | text | NO | - |
| device_fingerprint | text | YES | - |
| name | text | NO | - |
| details | text | NO | - |
| weight | integer | NO | - |
| type | text | NO | - |
| depot | text | NO | - |
| submitted_at | timestamp with time zone | YES | now() |

### 4. `trades`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| trade_number | text | NO | - |
| trade_date | text | NO | - |
| is_active | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |

---

## Raw JSON Schema

```json
[
  {
    "table_name": "dropdowns",
    "columns": [
      { "column": "id", "type": "uuid", "nullable": "NO", "default": "uuid_generate_v4()" },
      { "column": "category", "type": "text", "nullable": "NO", "default": null },
      { "column": "label", "type": "text", "nullable": "NO", "default": null },
      { "column": "is_active", "type": "boolean", "nullable": "YES", "default": "true" },
      { "column": "order_index", "type": "integer", "nullable": "YES", "default": "0" },
      { "column": "created_at", "type": "timestamp with time zone", "nullable": "YES", "default": "now()" }
    ]
  },
  {
    "table_name": "pooling_schedule",
    "columns": [
      { "column": "id", "type": "uuid", "nullable": "NO", "default": "uuid_generate_v4()" },
      { "column": "trade_id", "type": "uuid", "nullable": "NO", "default": null },
      { "column": "location", "type": "text", "nullable": "NO", "default": null },
      { "column": "pooling_date", "type": "text", "nullable": "NO", "default": null },
      { "column": "order_index", "type": "integer", "nullable": "YES", "default": "0" },
      { "column": "created_at", "type": "timestamp with time zone", "nullable": "YES", "default": "now()" }
    ]
  },
  {
    "table_name": "submissions",
    "columns": [
      { "column": "id", "type": "uuid", "nullable": "NO", "default": "uuid_generate_v4()" },
      { "column": "trade_number", "type": "text", "nullable": "NO", "default": null },
      { "column": "phone_number", "type": "text", "nullable": "NO", "default": null },
      { "column": "device_fingerprint", "type": "text", "nullable": "YES", "default": null },
      { "column": "name", "type": "text", "nullable": "NO", "default": null },
      { "column": "details", "type": "text", "nullable": "NO", "default": null },
      { "column": "weight", "type": "integer", "nullable": "NO", "default": null },
      { "column": "type", "type": "text", "nullable": "NO", "default": null },
      { "column": "depot", "type": "text", "nullable": "NO", "default": null },
      { "column": "submitted_at", "type": "timestamp with time zone", "nullable": "YES", "default": "now()" }
    ]
  },
  {
    "table_name": "trades",
    "columns": [
      { "column": "id", "type": "uuid", "nullable": "NO", "default": "uuid_generate_v4()" },
      { "column": "trade_number", "type": "text", "nullable": "NO", "default": null },
      { "column": "trade_date", "type": "text", "nullable": "NO", "default": null },
      { "column": "is_active", "type": "boolean", "nullable": "YES", "default": "false" },
      { "column": "created_at", "type": "timestamp with time zone", "nullable": "YES", "default": "now()" }
    ]
  }
]
```

---

## SQL Query to Generate This Schema

```sql
SELECT
    t.table_name,
    json_agg(
        json_build_object(
            'column', c.column_name,
            'type', c.data_type,
            'nullable', c.is_nullable,
            'default', c.column_default
        )
        ORDER BY c.ordinal_position
    ) AS columns
FROM
    information_schema.tables t
INNER JOIN
    information_schema.columns c ON t.table_name = c.table_name
WHERE
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND c.table_schema = 'public'
GROUP BY
    t.table_name;
```

---

*Last Updated: 2026-01-08*
