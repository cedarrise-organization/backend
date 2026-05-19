# Table Template

| Column 1     | Column 2     | Column 3     |
| :----------- | :----------- | :----------- |
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |

---

# Role Permissions

| Permission | Roles                        |
| :--------- | :--------------------------- |
| CREATE     | SuperAdmin, Admin, Volunteer |
| READ       | SuperAdmin, Admin, Volunteer |
| UPDATE     | SuperAdmin, Admin            |
| DELETE     | SuperAdmin                   |

---

# Cache Time-To-Live

| Values      | TTL             | Source         |
| :---------- | :-------------- | :------------- |
| PERMISSIONS | 600s (10 mins)  | `lib/cache.ts` |
| BLOGS       | 3600s (1 hr)    | `lib/cache.ts` |
| GALLERY     | 43200s (12 hrs) | `lib/cache.ts` |
| FORM_DATA   | 1800 (30 mins)  | `lib/cache.ts` |

---

# Cache Key Patterns

| Key Pattern                           | Description                                                                        | Source                                      |
| :------------------------------------ | :--------------------------------------------------------------------------------- | :------------------------------------------ |
| `cedarrise:permissions:{userId}`      | Stores a user's resolved permission names                                          | `utils/rbac.util.ts`                        |
| `cedarrise:lock:{key}`                | Distributed lock for cache-aside stampede prevention (5s expiry)                   | `lib/cache.ts`                              |
| `cedarrise:blogs:list:{page}:{limit}` | Cached paginated blog list. Set on read.                                           | `services/clientside/blog.services.ts`      |
| `cedarrise:blogs:single:{id}`         | Cached single blog post. Set on read/create, deleted on update/delete.             | `services/clientside/blog.services.ts`      |
| `cedarrise:gallery:ash`               | Cached ASH program photo URLs (public_id + secure_url). Set on read.               | `services/clientside/carousels.services.ts` |
| `cedarrise:gallery:tacots`            | Cached TACOTS program photo URLs (public_id + secure_url). Set on read.            | `services/clientside/carousels.services.ts` |
| `cedarrise:gallery:outreaches`        | Cached Outreaches program photo URLs (public_id + secure_url). Set on read.        | `services/clientside/carousels.services.ts` |
| `cedarrise:gallery:capacity`          | Cached Capacity Building program photo URLs (public_id + secure_url). Set on read. | `services/clientside/carousels.services.ts` |
| `cedarrise:ash:ashStudent:{id}`       | Cached newly registered ASH student record. Set on create.                         | `services/ash.services.ts`                  |

---

# Cookie Keys

| Cookie Name    | Value             | httpOnly | Source                                     |
| :------------- | :---------------- | :------- | :----------------------------------------- |
| `cedaraccess`  | JWT access token  | Yes      | `auth.controller.ts`, `auth.middleware.ts` |
| `cedarrefresh` | JWT refresh token | Yes      | `auth.controller.ts`, `auth.middleware.ts` |

---

# Auth Events (`AUTH_EVENTS`)

| Constant            | Event String        | Emitted When                                |
| :------------------ | :------------------ | :------------------------------------------ |
| `AUTH_LOGIN`        | `auth:login`        | User logs in successfully                   |
| `AUTH_LOGIN_FAIL`   | `auth:login:fail`   | Login attempt fails (bad email or password) |
| `AUTH_REFRESH`      | `auth:refresh`      | Refresh token is rotated successfully       |
| `AUTH_REFRESH_FAIL` | `auth:refresh:fail` | Refresh token rotation fails                |

---

# Admin Events (`ADMIN_EVENTS`)

| Constant      | Event String          | Emitted When                  |
| :------------ | :-------------------- | :---------------------------- |
| `ASSIGN_ROLE` | `admin:role-assigned` | A role is assigned to a user  |
| `REVOKE_ROLE` | `admin:role-revoked`  | A role is revoked from a user |
| `CREATE_USER` | `admin:create-user`   | A new user is created         |
| `DELETE_USER` | `admin:delete-user`   | A user is deleted             |

---

# DONATION Events (`FEATURE_EVENTS`)

| Constant          | Event String       | Emitted When                     |
| :---------------- | :----------------- | :------------------------------- |
| `DONATION_MADE`   | `donation:success` | A donation was made successfully |
| `DONATION_FAILED` | `donation:failed`  | A donation attempt failed        |

---

# Feature Events (`FEATURE_EVENTS`)

| Constant         | Event String     | Emitted When                 |
| :--------------- | :--------------- | :--------------------------- |
| `FEATURE_ACTION` | `feature:action` | Template / placeholder event |

# BullMQ Queues

| Queue Name      | Default Attempts | Backoff               | Concurrency | Source                    |
| :-------------- | :--------------- | :-------------------- | :---------- | :------------------------ |
| `feature-queue` | 3                | Exponential, 3s delay | 3           | `queues/feature.queue.ts` |

---

# Token Expiry

| Token Type             | Expiry     | Env Variable         |
| :--------------------- | :--------- | :------------------- |
| Access Token           | 15 minutes | `JWT_ACCESS_SECRET`  |
| Refresh Token          | 7 days     | `JWT_REFRESH_SECRET` |
| Refresh Token (DB row) | 7 days     | —                    |

---

# CLOUDINARY FOLDERS

| PAGE                         | PATH                                          |
| :--------------------------- | :-------------------------------------------- |
| Blogs                        | `/Cedarrise Initiative/BLOG`                  |
| Carousel — ASH               | `Cedarrise Initiative/ASH`                    |
| Carousel — TACOTS            | `Cedarrise Initiative/TACOTS`                 |
| Carousel — Outreaches        | `Cedarrise Initiative/OUTREACHES`             |
| Carousel — Capacity Building | `Cedarrise Initiative/CAPACITY BUILDING`      |
| ASH — Passport Photos        | `/Cedarrise Initiative/ASH-ASSETS/PASSPORTS`  |
| ASH — Last Results           | `/Cedarrise Initiative/ASH-ASSETS/RESULTS`    |
| ASH — Parent Signatures      | `/Cedarrise Initiative/ASH-ASSETS/SIGNATURES` |

---

# Error Codes

| Error Class         | Status Code | Code String        |
| :------------------ | :---------- | :----------------- |
| `ValidationError`   | 400         | `VALIDATION_ERROR` |
| `UnauthorizedError` | 401         | `UNAUTHORIZED`     |
| `ForbiddentError`   | 403         | `FORBIDDEN`        |
| `NotFoundError`     | 404         | `NOT_FOUND`        |
| `conflictError`     | 409         | `CONFLICT`         |

---

# Redis URL Map (by `NODE_ENV`)

| Environment   | Env Variable     |
| :------------ | :--------------- |
| `test`        | `REDIS_TEST_URL` |
| `development` | `REDIS_DEV_URL`  |
| `production`  | `REDIS_PROD_URL` |

---

# Database URL Map (by `NODE_ENV`)

| Environment   | Env Variable           |
| :------------ | :--------------------- |
| `test`        | `PG_DATABASE_TEST_URL` |
| `development` | `PG_DATABASE_DEV_URL`  |
| `production`  | `PG_DATABASE_PROD_URL` |
