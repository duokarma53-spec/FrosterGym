# LIVE SCHEMA AUDIT

*Generated automatically from the live PostgreSQL schema.*

## 1. Tables & Columns

### Table: `activity_logs`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `user_id` | `uuid` | YES | none |  |
| `action` | `text` | NO | none |  |
| `entity_type` | `text` | YES | none |  |
| `entity_id` | `text` | YES | none |  |
| `details` | `jsonb` | YES | '{}'::jsonb |  |
| `ip_address` | `text` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `attendance`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `check_in_time` | `timestamp with time zone` | NO | now() |  |
| `check_out_time` | `timestamp with time zone` | YES | none |  |
| `date` | `date` | NO | CURRENT_DATE |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |

### Table: `attendance_devices`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `branch_id` | `uuid` | YES | none |  |
| `device_name` | `text` | NO | none |  |
| `device_type` | `text` | NO | none |  |
| `device_identifier` | `text` | YES | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `last_ping` | `timestamp with time zone` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `batch_members`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `batch_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `joined_at` | `timestamp with time zone` | YES | now() |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `batches`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `time_slot` | `text` | NO | none |  |
| `trainer_id` | `uuid` | YES | none |  |
| `description` | `text` | YES | none |  |
| `max_capacity` | `integer` | YES | 0 |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `body_measurements`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `measurement_date` | `date` | YES | CURRENT_DATE |  |
| `weight` | `numeric` | YES | none |  |
| `height` | `numeric` | YES | none |  |
| `bmi` | `numeric` | YES | none |  |
| `body_fat_percentage` | `numeric` | YES | none |  |
| `chest` | `numeric` | YES | none |  |
| `waist` | `numeric` | YES | none |  |
| `hip` | `numeric` | YES | none |  |
| `arm` | `numeric` | YES | none |  |
| `thigh` | `numeric` | YES | none |  |
| `custom_measurements` | `jsonb` | YES | '{}'::jsonb |  |
| `notes` | `text` | YES | none |  |
| `recorded_by` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `branches`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `address` | `text` | YES | none |  |
| `phone` | `text` | YES | none |  |
| `manager_id` | `uuid` | YES | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `device_sessions`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `user_id` | `uuid` | NO | none |  |
| `device_name` | `text` | YES | none |  |
| `device_type` | `text` | YES | none |  |
| `ip_address` | `text` | YES | none |  |
| `user_agent` | `text` | YES | none |  |
| `last_active` | `timestamp with time zone` | YES | now() |  |
| `is_active` | `boolean` | YES | true |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `diet_plans`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `description` | `text` | YES | none |  |
| `breakfast` | `text` | YES | none |  |
| `mid_morning` | `text` | YES | none |  |
| `lunch` | `text` | YES | none |  |
| `evening` | `text` | YES | none |  |
| `dinner` | `text` | YES | none |  |
| `notes` | `text` | YES | none |  |
| `created_by` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `enquiries`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `branch_id` | `uuid` | YES | none |  |
| `name` | `text` | NO | none |  |
| `phone` | `text` | YES | none |  |
| `email` | `text` | YES | none |  |
| `source` | `text` | YES | none |  |
| `interested_plan` | `text` | YES | none |  |
| `budget` | `numeric` | YES | none |  |
| `notes` | `text` | YES | none |  |
| `assigned_to` | `uuid` | YES | none |  |
| `follow_up_date` | `date` | YES | none |  |
| `status` | `text` | NO | 'new'::text |  |
| `converted_member_id` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `enquiry_followups`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `enquiry_id` | `uuid` | NO | none |  |
| `notes` | `text` | YES | none |  |
| `follow_up_date` | `date` | YES | none |  |
| `status` | `text` | NO | 'pending'::text |  |
| `created_by` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `expense_categories`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `icon` | `text` | YES | none |  |
| `color` | `text` | YES | none |  |
| `is_default` | `boolean` | YES | false |  |
| `is_active` | `boolean` | YES | true |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `expenses`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `title` | `text` | NO | none |  |
| `category` | `text` | NO | none |  |
| `amount` | `numeric` | NO | none |  |
| `expense_date` | `date` | NO | CURRENT_DATE |  |
| `payment_method` | `text` | NO | none |  |
| `notes` | `text` | YES | none |  |
| `recorded_by` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `gym_settings`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `key` | `text` | NO | none |  |
| `value` | `jsonb` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `gyms`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `name` | `text` | NO | none |  |
| `slug` | `text` | NO | none |  |
| `owner_id` | `uuid` | NO | none |  |
| `logo_url` | `text` | YES | none |  |
| `phone` | `text` | YES | none |  |
| `email` | `text` | YES | none |  |
| `address` | `text` | YES | none |  |
| `settings` | `jsonb` | YES | '{}'::jsonb |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `invoice_items`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `invoice_id` | `uuid` | NO | none |  |
| `description` | `text` | NO | none |  |
| `quantity` | `integer` | YES | 1 |  |
| `unit_price` | `numeric` | YES | none |  |
| `total` | `numeric` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `invoices`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `invoice_number` | `text` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `membership_id` | `uuid` | YES | none |  |
| `payment_id` | `uuid` | YES | none |  |
| `issue_date` | `date` | NO | CURRENT_DATE |  |
| `due_date` | `date` | YES | none |  |
| `subtotal` | `numeric` | NO | 0 |  |
| `tax_amount` | `numeric` | NO | 0 |  |
| `total_amount` | `numeric` | NO | 0 |  |
| `status` | `text` | NO | 'paid'::text |  |
| `pdf_url` | `text` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `member_custom_fields`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `field_name` | `text` | NO | none |  |
| `field_type` | `text` | NO | none |  |
| `options` | `jsonb` | YES | none |  |
| `is_required` | `boolean` | YES | false |  |
| `sort_order` | `integer` | YES | 0 |  |
| `is_active` | `boolean` | YES | true |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `member_diet_plans`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `diet_plan_id` | `uuid` | NO | none |  |
| `start_date` | `date` | NO | CURRENT_DATE |  |
| `end_date` | `date` | YES | none |  |
| `assigned_by` | `uuid` | YES | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `member_workout_plans`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `workout_plan_id` | `uuid` | NO | none |  |
| `trainer_id` | `uuid` | YES | none |  |
| `start_date` | `date` | YES | none |  |
| `end_date` | `date` | YES | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `assigned_by` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `members`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `member_id` | `text` | NO | none |  |
| `full_name` | `text` | NO | none |  |
| `phone` | `text` | NO | none |  |
| `email` | `text` | YES | none |  |
| `date_of_birth` | `date` | YES | none |  |
| `gender` | `text` | YES | none |  |
| `address` | `text` | YES | none |  |
| `emergency_contact` | `text` | YES | none |  |
| `photo_url` | `text` | YES | none |  |
| `notes` | `text` | YES | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |
| `deleted_at` | `timestamp with time zone` | YES | none |  |
| `branch_id` | `uuid` | YES | none |  |
| `custom_fields` | `jsonb` | YES | '{}'::jsonb |  |
| `referral_source` | `text` | YES | none |  |
| `occupation` | `text` | YES | none |  |
| `blood_group` | `text` | YES | none |  |
| `goal` | `text` | YES | none |  |

### Table: `membership_freezes`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `membership_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `start_date` | `date` | NO | none |  |
| `end_date` | `date` | NO | none |  |
| `reason` | `text` | YES | none |  |
| `adjusted_days` | `integer` | YES | 0 |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_by` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `membership_history`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `membership_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `action` | `text` | NO | none |  |
| `details` | `jsonb` | YES | '{}'::jsonb |  |
| `performed_by` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `membership_plans`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `duration_months` | `integer` | NO | 1 |  |
| `duration_days` | `integer` | NO | 0 |  |
| `price` | `numeric` | NO | 0 |  |
| `description` | `text` | YES | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `memberships`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `plan_id` | `uuid` | YES | none |  |
| `start_date` | `date` | NO | none |  |
| `end_date` | `date` | NO | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `original_amount` | `numeric` | NO | 0 |  |
| `discount_amount` | `numeric` | NO | 0 |  |
| `discount_type` | `text` | NO | 'fixed'::text |  |
| `final_amount` | `numeric` | NO | 0 |  |
| `paid_amount` | `numeric` | NO | 0 |  |
| `due_amount` | `numeric` | NO | 0 |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `message_templates`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `category` | `text` | NO | none |  |
| `content` | `text` | NO | none |  |
| `variables` | `jsonb` | YES | '[]'::jsonb |  |
| `is_active` | `boolean` | YES | true |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `notifications`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `recipient_id` | `uuid` | NO | none |  |
| `type` | `text` | NO | none |  |
| `title` | `text` | NO | none |  |
| `message` | `text` | YES | none |  |
| `is_read` | `boolean` | YES | false |  |
| `link` | `text` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `payments`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `membership_id` | `uuid` | YES | none |  |
| `amount` | `numeric` | NO | none |  |
| `payment_date` | `timestamp with time zone` | NO | now() |  |
| `payment_method` | `text` | NO | none |  |
| `status` | `text` | NO | 'completed'::text |  |
| `reference_number` | `text` | YES | none |  |
| `notes` | `text` | YES | none |  |
| `processed_by` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `profiles`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | uuid_generate_v4() | ✅ |
| `user_id` | `uuid` | NO | none |  |
| `gym_id` | `uuid` | YES | none |  |
| `full_name` | `text` | NO | ''::text |  |
| `email` | `text` | NO | ''::text |  |
| `phone` | `text` | YES | ''::text |  |
| `avatar_url` | `text` | YES | none |  |
| `role` | `text` | NO | 'staff'::text |  |
| `is_active` | `boolean` | YES | true |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `pt_memberships`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `member_id` | `uuid` | NO | none |  |
| `trainer_id` | `uuid` | NO | none |  |
| `pt_plan_id` | `uuid` | NO | none |  |
| `start_date` | `date` | NO | none |  |
| `end_date` | `date` | NO | none |  |
| `original_amount` | `numeric` | NO | 0 |  |
| `discount_amount` | `numeric` | NO | 0 |  |
| `final_amount` | `numeric` | NO | 0 |  |
| `paid_amount` | `numeric` | NO | 0 |  |
| `due_amount` | `numeric` | NO | 0 |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `pt_plans`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `duration_months` | `integer` | YES | 0 |  |
| `duration_days` | `integer` | YES | 0 |  |
| `price` | `numeric` | NO | 0 |  |
| `description` | `text` | YES | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `services`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `price` | `numeric` | NO | 0 |  |
| `duration_text` | `text` | YES | none |  |
| `description` | `text` | YES | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `staff`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `role` | `text` | NO | none |  |
| `phone` | `text` | YES | none |  |
| `email` | `text` | YES | none |  |
| `permissions` | `ARRAY` | YES | '{}'::text[] |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |

### Table: `staff_permissions`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `user_id` | `uuid` | NO | none |  |
| `module_name` | `text` | NO | none |  |
| `can_view` | `boolean` | NO | false |  |
| `can_create` | `boolean` | NO | false |  |
| `can_edit` | `boolean` | NO | false |  |
| `can_delete` | `boolean` | NO | false |  |
| `created_at` | `timestamp with time zone` | NO | now() |  |

### Table: `trainers`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `profile_id` | `uuid` | YES | none |  |
| `name` | `text` | NO | none |  |
| `phone` | `text` | YES | none |  |
| `email` | `text` | YES | none |  |
| `specialization` | `text` | YES | none |  |
| `photo_url` | `text` | YES | none |  |
| `status` | `text` | NO | 'active'::text |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `workout_plan_items`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `workout_plan_id` | `uuid` | NO | none |  |
| `day_of_week` | `integer` | NO | none |  |
| `exercise_name` | `text` | NO | none |  |
| `sets` | `integer` | YES | none |  |
| `reps` | `integer` | YES | none |  |
| `weight` | `numeric` | YES | none |  |
| `duration_minutes` | `integer` | YES | none |  |
| `rest_seconds` | `integer` | YES | none |  |
| `notes` | `text` | YES | none |  |
| `sort_order` | `integer` | YES | 0 |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

### Table: `workout_plans`
| Column | Data Type | Nullable | Default | PK |
|---|---|---|---|---|
| `id` | `uuid` | NO | gen_random_uuid() | ✅ |
| `gym_id` | `uuid` | NO | none |  |
| `name` | `text` | NO | none |  |
| `description` | `text` | YES | none |  |
| `goal` | `text` | YES | none |  |
| `created_by` | `uuid` | YES | none |  |
| `created_at` | `timestamp with time zone` | YES | now() |  |
| `updated_at` | `timestamp with time zone` | YES | now() |  |

## 2. Foreign Keys

| Table.Column | References |
|---|---|
| `profiles.gym_id` | `public.gyms(id)` |
| `gym_settings.gym_id` | `public.gyms(id)` |
| `membership_plans.gym_id` | `public.gyms(id)` |
| `members.gym_id` | `public.gyms(id)` |
| `memberships.gym_id` | `public.gyms(id)` |
| `memberships.member_id` | `public.members(id)` |
| `memberships.plan_id` | `public.membership_plans(id)` |
| `branches.manager_id` | `public.profiles(id)` |
| `body_measurements.gym_id` | `public.gyms(id)` |
| `body_measurements.member_id` | `public.members(id)` |
| `payments.gym_id` | `public.gyms(id)` |
| `payments.member_id` | `public.members(id)` |
| `payments.membership_id` | `public.memberships(id)` |
| `payments.processed_by` | `public.profiles(id)` |
| `attendance.gym_id` | `public.gyms(id)` |
| `attendance.member_id` | `public.members(id)` |
| `diet_plans.gym_id` | `public.gyms(id)` |
| `diet_plans.created_by` | `public.profiles(id)` |
| `member_diet_plans.gym_id` | `public.gyms(id)` |
| `member_diet_plans.member_id` | `public.members(id)` |
| `member_diet_plans.diet_plan_id` | `public.diet_plans(id)` |
| `member_diet_plans.assigned_by` | `public.profiles(id)` |
| `batch_members.batch_id` | `public.batches(id)` |
| `batch_members.member_id` | `public.members(id)` |
| `expenses.gym_id` | `public.gyms(id)` |
| `expenses.recorded_by` | `public.profiles(id)` |
| `invoices.gym_id` | `public.gyms(id)` |
| `invoices.member_id` | `public.members(id)` |
| `invoices.membership_id` | `public.memberships(id)` |
| `invoices.payment_id` | `public.payments(id)` |
| `branches.gym_id` | `public.gyms(id)` |
| `members.branch_id` | `public.branches(id)` |
| `membership_freezes.gym_id` | `public.gyms(id)` |
| `membership_freezes.membership_id` | `public.memberships(id)` |
| `membership_freezes.member_id` | `public.members(id)` |
| `membership_freezes.created_by` | `public.profiles(id)` |
| `membership_history.gym_id` | `public.gyms(id)` |
| `membership_history.membership_id` | `public.memberships(id)` |
| `membership_history.member_id` | `public.members(id)` |
| `membership_history.performed_by` | `public.profiles(id)` |
| `services.gym_id` | `public.gyms(id)` |
| `pt_plans.gym_id` | `public.gyms(id)` |
| `trainers.gym_id` | `public.gyms(id)` |
| `trainers.profile_id` | `public.profiles(id)` |
| `pt_memberships.gym_id` | `public.gyms(id)` |
| `pt_memberships.member_id` | `public.members(id)` |
| `pt_memberships.trainer_id` | `public.trainers(id)` |
| `pt_memberships.pt_plan_id` | `public.pt_plans(id)` |
| `batches.gym_id` | `public.gyms(id)` |
| `batches.trainer_id` | `public.trainers(id)` |
| `batch_members.gym_id` | `public.gyms(id)` |
| `body_measurements.recorded_by` | `public.profiles(id)` |
| `enquiries.gym_id` | `public.gyms(id)` |
| `enquiries.branch_id` | `public.branches(id)` |
| `enquiries.assigned_to` | `public.profiles(id)` |
| `enquiries.converted_member_id` | `public.members(id)` |
| `enquiry_followups.gym_id` | `public.gyms(id)` |
| `enquiry_followups.enquiry_id` | `public.enquiries(id)` |
| `enquiry_followups.created_by` | `public.profiles(id)` |
| `workout_plans.gym_id` | `public.gyms(id)` |
| `workout_plans.created_by` | `public.profiles(id)` |
| `attendance_devices.gym_id` | `public.gyms(id)` |
| `attendance_devices.branch_id` | `public.branches(id)` |
| `workout_plan_items.gym_id` | `public.gyms(id)` |
| `workout_plan_items.workout_plan_id` | `public.workout_plans(id)` |
| `member_workout_plans.gym_id` | `public.gyms(id)` |
| `member_workout_plans.member_id` | `public.members(id)` |
| `member_workout_plans.workout_plan_id` | `public.workout_plans(id)` |
| `member_workout_plans.trainer_id` | `public.trainers(id)` |
| `member_workout_plans.assigned_by` | `public.profiles(id)` |
| `member_custom_fields.gym_id` | `public.gyms(id)` |
| `invoice_items.gym_id` | `public.gyms(id)` |
| `invoice_items.invoice_id` | `public.invoices(id)` |
| `notifications.gym_id` | `public.gyms(id)` |
| `notifications.recipient_id` | `public.profiles(id)` |
| `message_templates.gym_id` | `public.gyms(id)` |
| `activity_logs.gym_id` | `public.gyms(id)` |
| `activity_logs.user_id` | `public.profiles(id)` |
| `expense_categories.gym_id` | `public.gyms(id)` |
| `device_sessions.gym_id` | `public.gyms(id)` |
| `device_sessions.user_id` | `public.profiles(id)` |
| `staff_permissions.gym_id` | `public.gyms(id)` |
| `staff.gym_id` | `public.gyms(id)` |

## 3. RLS Policies

#### Policy: `Owner can update own gym` (Table: `gyms`)
- **Operation:** UPDATE
- **USING:** `(owner_id = auth.uid())`

#### Policy: `Users can access gym expenses` (Table: `expenses`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Users can access gym invoices` (Table: `invoices`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `branches`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Users can view gym settings` (Table: `gym_settings`)
- **Operation:** SELECT
- **USING:** `(gym_id IN ( SELECT profiles.gym_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))`

#### Policy: `Owner can manage gym settings` (Table: `gym_settings`)
- **Operation:** ALL
- **USING:** `(gym_id IN ( SELECT gyms.id
   FROM gyms
  WHERE (gyms.owner_id = auth.uid())))`

#### Policy: `Users can access gym membership plans` (Table: `membership_plans`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Users can access gym members` (Table: `members`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Users can access gym memberships` (Table: `memberships`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Users can access gym payments` (Table: `payments`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Users can access gym attendance` (Table: `attendance`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Users can access gym diet plans` (Table: `diet_plans`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Users can access gym member diet plans` (Table: `member_diet_plans`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `membership_freezes`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `membership_history`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `services`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `pt_plans`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `trainers`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `pt_memberships`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `batches`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `batch_members`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `body_measurements`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `enquiries`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `enquiry_followups`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `workout_plans`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `workout_plan_items`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `member_workout_plans`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `member_custom_fields`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `invoice_items`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `notifications`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `message_templates`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `activity_logs`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `expense_categories`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `device_sessions`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Gym users can access their gym data` (Table: `attendance_devices`)
- **Operation:** ALL
- **USING:** `user_belongs_to_gym(gym_id)`

#### Policy: `Staff permissions are viewable by users in the same gym` (Table: `staff_permissions`)
- **Operation:** SELECT
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Owners can manage staff permissions` (Table: `staff_permissions`)
- **Operation:** ALL
- **USING:** `(EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'owner'::text) AND (profiles.gym_id = staff_permissions.gym_id))))`

#### Policy: `Owners can update their own gym` (Table: `gyms`)
- **Operation:** UPDATE
- **USING:** `((id = get_gym_id()) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'owner'::text)))))`

#### Policy: `Users can view members in their gym` (Table: `members`)
- **Operation:** SELECT
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can insert members if they have permission` (Table: `members`)
- **Operation:** INSERT
- **WITH CHECK:** `(gym_id = get_gym_id())`

#### Policy: `Users can update members if they have permission` (Table: `members`)
- **Operation:** UPDATE
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can delete members if they have permission` (Table: `members`)
- **Operation:** DELETE
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can view payments in their gym` (Table: `payments`)
- **Operation:** SELECT
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can insert payments if they have permission` (Table: `payments`)
- **Operation:** INSERT
- **WITH CHECK:** `(gym_id = get_gym_id())`

#### Policy: `Users can update payments if they have permission` (Table: `payments`)
- **Operation:** UPDATE
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can delete payments if they have permission` (Table: `payments`)
- **Operation:** DELETE
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can view memberships in their gym` (Table: `memberships`)
- **Operation:** SELECT
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can insert memberships if they have permission` (Table: `memberships`)
- **Operation:** INSERT
- **WITH CHECK:** `(gym_id = get_gym_id())`

#### Policy: `Users can update memberships if they have permission` (Table: `memberships`)
- **Operation:** UPDATE
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can delete memberships if they have permission` (Table: `memberships`)
- **Operation:** DELETE
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can view their gym` (Table: `gyms`)
- **Operation:** SELECT
- **USING:** `(id = get_gym_id())`

#### Policy: `Owners can update their gym` (Table: `gyms`)
- **Operation:** UPDATE
- **USING:** `((id = get_gym_id()) AND (owner_id = auth.uid()))`

#### Policy: `Users can view profiles in their gym` (Table: `profiles`)
- **Operation:** SELECT
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can update their own profile` (Table: `profiles`)
- **Operation:** UPDATE
- **USING:** `(user_id = auth.uid())`

#### Policy: `Owners can manage gym profiles` (Table: `profiles`)
- **Operation:** ALL
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can view staff in their gym` (Table: `staff`)
- **Operation:** SELECT
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can insert staff in their gym` (Table: `staff`)
- **Operation:** INSERT
- **WITH CHECK:** `(gym_id = get_gym_id())`

#### Policy: `Users can update staff in their gym` (Table: `staff`)
- **Operation:** UPDATE
- **USING:** `(gym_id = get_gym_id())`

#### Policy: `Users can delete staff in their gym` (Table: `staff`)
- **Operation:** DELETE
- **USING:** `(gym_id = get_gym_id())`

## 4. RPC Functions

### Function: `handle_updated_at()`
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$

```

### Function: `handle_new_user()`
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  new_gym_id UUID;
  user_name TEXT;
  user_email TEXT;
BEGIN
  user_email := NEW.email;
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(user_email, '@', 1)
  );

  -- Create a gym for the new user (they become owner)
  INSERT INTO public.gyms (name, slug, owner_id)
  VALUES (
    user_name || '''s Gym',
    LOWER(REPLACE(user_name, ' ', '-')) || '-' || SUBSTR(NEW.id::text, 1, 8),
    NEW.id
  )
  RETURNING id INTO new_gym_id;

  -- Create the owner profile
  INSERT INTO public.profiles (user_id, gym_id, full_name, email, role)
  VALUES (NEW.id, new_gym_id, user_name, user_email, 'owner');

  -- Insert default gym settings
  INSERT INTO public.gym_settings (gym_id, key, value) VALUES
    (new_gym_id, 'currency', '"INR"'),
    (new_gym_id, 'timezone', '"Asia/Kolkata"'),
    (new_gym_id, 'date_format', '"DD/MM/YYYY"'),
    (new_gym_id, 'gym_name', to_jsonb(user_name || '''s Gym'));

  RETURN NEW;
END;
$function$

```

### Function: `user_belongs_to_gym(check_gym_id uuid)`
```sql
CREATE OR REPLACE FUNCTION public.user_belongs_to_gym(check_gym_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN check_gym_id = public.get_user_gym_id();
END;
$function$

```

### Function: `get_gym_id()`
```sql
CREATE OR REPLACE FUNCTION public.get_gym_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT gym_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$function$

```

### Function: `get_user_gym_id()`
```sql
CREATE OR REPLACE FUNCTION public.get_user_gym_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_gym_id UUID;
BEGIN
  SELECT gym_id INTO v_gym_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  RETURN v_gym_id;
END;
$function$

```

## 5. Triggers

| Table | Trigger | Action |
|---|---|---|
| `profiles` | `set_profiles_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `gyms` | `set_gyms_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `gym_settings` | `set_gym_settings_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `membership_plans` | `set_membership_plans_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `members` | `set_members_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `memberships` | `set_memberships_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `payments` | `set_payments_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `diet_plans` | `set_diet_plans_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `member_diet_plans` | `set_member_diet_plans_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `expenses` | `set_expenses_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `invoices` | `set_invoices_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `branches` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `membership_freezes` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `membership_history` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `services` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `pt_plans` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `trainers` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `pt_memberships` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `batches` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `batch_members` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `body_measurements` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `enquiries` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `enquiry_followups` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `workout_plans` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `workout_plan_items` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `member_workout_plans` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `member_custom_fields` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `invoice_items` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `notifications` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `message_templates` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `activity_logs` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `expense_categories` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `device_sessions` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |
| `attendance_devices` | `set_updated_at` | `EXECUTE FUNCTION handle_updated_at()` |

## 6. Known Schema Problems & Validations

**CRITICAL FINDING:** The column `profile_id` DOES exist in the following tables:
- `trainers`

