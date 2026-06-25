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

| Values          | TTL             | Source         |
| :-------------- | :-------------- | :------------- |
| PERMISSIONS     | 600s (10 mins)  | `lib/cache.ts` |
| BLOGS           | 3600s (1 hr)    | `lib/cache.ts` |
| GALLERY         | 43200s (12 hrs) | `lib/cache.ts` |
| FORM_DATA       | 1800 (30 mins)  | `lib/cache.ts` |
| LISTS           | 600 (10 mins)   | `lib/cache.ts` |
| DASHBOARD_CARDS | 3600s (1 hr)    | `lib/cache.ts` |
| USERS           | 1800 (30 mins)  | `lib/cache.ts` |

---

# Cache Key Patterns

| Key Pattern                                                                         | Description                                                                                                                                                            | Source                                      |
| :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ |
| `cedarrise:permissions:{userId}`                                                    | Stores a user's resolved permission names                                                                                                                              | `utils/rbac.util.ts`                        |
| `cedarrise:lock:{key}`                                                              | Distributed lock for cache-aside stampede prevention (5s expiry)                                                                                                       | `lib/cache.ts`                              |
| `cedarrise:blogs:list:{page}:{limit}`                                               | Cached paginated blog list. Set on read.                                                                                                                               | `services/clientside/blog.services.ts`      |
| `cedarrise:blogs:single:{id}`                                                       | Cached single blog post. Set on read/create, deleted on update/delete.                                                                                                 | `services/clientside/blog.services.ts`      |
| `cedarrise:gallery:ash`                                                             | Cached ASH program photo URLs (public_id + secure_url). Set on read.                                                                                                   | `services/clientside/carousels.services.ts` |
| `cedarrise:gallery:tacots`                                                          | Cached TACOTS program photo URLs (public_id + secure_url). Set on read.                                                                                                | `services/clientside/carousels.services.ts` |
| `cedarrise:gallery:outreaches`                                                      | Cached Outreaches program photo URLs (public_id + secure_url). Set on read.                                                                                            | `services/clientside/carousels.services.ts` |
| `cedarrise:gallery:capacity`                                                        | Cached Capacity Building program photo URLs (public_id + secure_url). Set on read.                                                                                     | `services/clientside/carousels.services.ts` |
| `cedarrise:ash:ashStudents:{id}`                                                     | Cached single ASH student record. Set on read.                                                                                                                         | `services/ash.services.ts`                  |
| `cedarrise:ash:ashStudents:{page}:{limit}:{orderBy}:{status}:{sortBy}`              | Cached paginated ASH student list, sorted and filtered by status. Set on read.                                                                                         | `services/ash.services.ts`                  |
| `cedarrise:ash:feedback:{id}`                                                       | Cached single ASH programme feedback record. Set on create and read.                                                                                                   | `services/ash.services.ts`                  |
| `cedarrise:ash:feedback:{page}:{limit}`                                             | Cached paginated ASH programme feedback list. Set on read.                                                                                                             | `services/ash.services.ts`                  |
| `cedarrise:ash:termlytracking:{id}`                                                 | Cached single ASH termly tracking record. Set on create and read, deleted on delete.                                                                                   | `services/ash.services.ts`                  |
| `cedarrise:ash:termlytracking:{page}:{limit}:{orderBy}:{sortBy}`                    | Cached paginated ASH termly tracking list, sorted by field. Set on read.                                                                                               | `services/ash.services.ts`                  |
| `cedarrise:ash:weeklyattendance:{id}`                                               | Cached single ASH weekly attendance record. Set on create and read, deleted on delete.                                                                                 | `services/ash.services.ts`                  |
| `cedarrise:ash:weeklyattendance:{page}:{limit}`                                     | Cached paginated ASH weekly attendance list. Set on read.                                                                                                              | `services/ash.services.ts`                  |
| `cedarrise:ash:exit:{id}`                                                           | Cached single ASH exit record. Set on create and read, deleted on delete.                                                                                              | `services/ash.services.ts`                  |
| `cedarrise:ash:exit:{page}:{limit}:{orderBy}:{sortBy}`                              | Cached paginated ASH exit record list, sorted by field. Set on read.                                                                                                   | `services/ash.services.ts`                  |
| `cedarrise:ashtrackercardsdata`                                                     | Cached ASH trackers card metrics (total records, high-risk students, avg attendance rate, completed exits). Set on read.                                               | `services/ash.services.ts`                  |
| `cedarrise:tacots:tacotsRecommendation:{id}`                                        | Cached single TACOTS recommendation record. Set on create and read.                                                                                                    | `services/tacots.services.ts`               |
| `cedarrise:tacots:tacotsRecommendation:{page}:{limit}:{orderBy}:{status}:{sortBy}`  | Cached paginated TACOTS recommendation list, sorted and filtered by status. Set on read.                                                                               | `services/tacots.services.ts`               |
| `cedarrise:tacots:feedback:{id}`                                                    | Cached single TACOTS feedback record. Set on create and read.                                                                                                          | `services/tacots.services.ts`               |
| `cedarrise:tacots:feedback:{page}:{limit}`                                          | Cached paginated TACOTS feedback list. Set on read.                                                                                                                    | `services/tacots.services.ts`               |
| `cedarrise:tacots:onboarding:{id}`                                                  | Cached single TACOTS onboarding record. Set on create and read, deleted on delete.                                                                                     | `services/tacots.services.ts`               |
| `cedarrise:tacots:onboarding:{page}:{limit}:{orderBy}:{sortBy}`                     | Cached paginated TACOTS onboarding list, sorted by field. Set on read.                                                                                                 | `services/tacots.services.ts`               |
| `cedarrise:tacots:tracking:{id}`                                                    | Cached single TACOTS tracking record. Set on create and read, deleted on delete.                                                                                       | `services/tacots.services.ts`               |
| `cedarrise:tacots:tracking:{page}:{limit}:{orderBy}:{sortBy}`                       | Cached paginated TACOTS tracking list, sorted by field. Set on read.                                                                                                   | `services/tacots.services.ts`               |
| `cedarrise:tacots:exit:{id}`                                                        | Cached single TACOTS exit record. Set on create and read, deleted on delete.                                                                                           | `services/tacots.services.ts`               |
| `cedarrise:tacots:exit:{page}:{limit}:{orderBy}:{sortBy}`                           | Cached paginated TACOTS exit list, sorted by field. Set on read.                                                                                                       | `services/tacots.services.ts`               |
| `cedarrise:tacotstrackercardsdata`                                                  | Cached TACOTS trackers card metrics (total records, high-risk students, onboarding rate, completed exits). Set on read.                                                | `services/tacots.services.ts`               |
| `cedarrise:volunteer:voluntee:{id}`                                                 | Cached single volunteer registration record. Set on create and read.                                                                                                   | `services/volunteer.services.ts`            |
| `cedarrise:volunteer:volunteers:{page}:{limit}:{orderBy}:{status}:{sortBy}`         | Cached paginated volunteer list, sorted and filtered by status. Set on read.                                                                                           | `services/volunteer.services.ts`            |
| `cedarrise:volunteer:feedback:{id}`                                                 | Cached single volunteer feedback record. Set on create and read.                                                                                                       | `services/volunteer.services.ts`            |
| `cedarrise:volunteer:feedback:{page}:{limit}`                                       | Cached paginated volunteer feedback list. Set on read.                                                                                                                 | `services/volunteer.services.ts`            |
| `cedarrise:capacity:evaluation:{id}`                                                | Cached single capacity building evaluation record. Set on create and read, deleted on delete.                                                                          | `services/capacity.services.ts`             |
| `cedarrise:capacity:evaluation:{page}:{limit}:{orderBy}:{sortBy}`                   | Cached paginated capacity building evaluation list, sorted by field. Set on read.                                                                                      | `services/capacity.services.ts`             |
| `cedarrise:capacitycardsdata`                                                       | Cached capacity building cards data (participants, partnered organizations, volunteers engaged, workshops). Set on read.                                               | `services/capacity.services.ts`             |
| `cedarrise:outreaches:outreach:{id}`                                                | Cached single outreach tracker record. Set on create and read, deleted on delete.                                                                                      | `services/outreaches.services.ts`           |
| `cedarrise:outreaches:{page}:{limit}:{orderBy}:{sortBy}`                            | Cached paginated outreach tracker list, sorted by field. Set on read.                                                                                                  | `services/outreaches.services.ts`           |
| `cedarrise:outreachcardsdata`                                                       | Cached outreach cards data (communities engaged, beneficiaries reached, volunteers, events). Set on read.                                                              | `services/outreaches.services.ts`           |
| `cedarrise:lookup:ash`                                                              | Cached lightweight list of accepted ASH students (id + name) for dropdown population. Set on read.                                                                     | `services/lookup.services.ts`               |
| `cedarrise:lookup:recommended`                                                      | Cached lightweight list of SELECTED TACOTS recommendations (id + name) for dropdown. Set on read.                                                                      | `services/lookup.services.ts`               |
| `cedarrise:lookup:onboarded`                                                        | Cached lightweight list of TACOTS onboarded students (id + name) for dropdown. Set on read.                                                                            | `services/lookup.services.ts`               |
| `cedarrise:lookup:volunteers`                                                       | Cached lightweight list of accepted volunteers (id + name) for dropdown. Set on read.                                                                                  | `services/lookup.services.ts`               |
| `cedarrise:lookup:userroles`                                                        | Cached list of roles assigned to a user (id, name, description, isDefault). Set on read.                                                                               | `services/admin.services.ts`                |
| `cedarrise:lookup:users`                                                            | Cached lightweight list of all users (id, name, email, department). Set on read.                                                                                       | `services/admin.services.ts`                |
| `cedarrise:lookup:users:{page}:{limit}`                                             | Cached paginated users list (ordered by name ascending). Set on read, bypassed on search.                                                                              | `services/admin.services.ts`                |
| `cedarrise:dashboard:cards`                                                         | Cached aggregate dashboard card metrics (volunteer, capacity, outreach, ASH, TACOTS). Set on read.                                                                     | `services/dashboard.services.ts`            |
| `cedarrise:dashboard:student-performance`                                           | Cached student performance chart data (graduation rate, attendance, test scores, dropout trend, risk). Set on read.                                                    | `services/dashboard.services.ts`            |
| `cedarrise:dashboard:enrollment`                                                    | Cached enrollment & recruitment chart data (application numbers, gender diversity, class distribution, acceptance rate, geographical distribution). Set on read.       | `services/dashboard.services.ts`            |
| `cedarrise:dashboard:institutional-effectiveness`                                   | Cached institutional effectiveness chart data (community service hours, mentorship hours, spend per student, total accumulated hours, student benchmark). Set on read. | `services/dashboard.services.ts`            |
| `cedarrise:dashboard:notifications`                                                 | Cached paginated active notifications list (ordered by most recent). Set on read.                                                                                      | `services/dashboard.services.ts`            |
| `cedarrise:dashboard:projects`                                                      | Cached list of all projects. Set on read, deleted on project creation, status update, or deletion.                                                                     | `services/general.services.ts`              |
| `cedarrise:general:receipts:{page}:{limit}:{orderBy}:{sortBy}`                      | Cached paginated receipts list. Set on read, bypassed on search.                                                                                                       | `services/general.services.ts`              |
| `cedarrise:general:googleform`                                                      | Cached active Google Form details (src + title). Set on read, cleared on upload.                                                                                       | `services/general.services.ts`              |
| `cedarrise:general:metadata`                                                        | Cached general uploads' page metadata (active projects, receipts, users, and photos). Set on read.                                                                     | `services/general.services.ts`              |

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
| `AUTH_LOGIN_FAIL`   | `auth:login-fail`   | Login attempt fails (bad email or password) |
| `AUTH_REFRESH`      | `auth:refresh`      | Refresh token is rotated successfully       |
| `AUTH_REFRESH_FAIL` | `auth:refresh-fail` | Refresh token rotation fails                |

---

# Admin Events (`ADMIN_EVENTS`)

| Constant      | Event String          | Emitted When                  |
| :------------ | :-------------------- | :---------------------------- |
| `ASSIGN_ROLE` | `admin:role-assigned` | A role is assigned to a user  |
| `REVOKE_ROLE` | `admin:role-revoked`  | A role is revoked from a user |
| `CREATE_USER` | `admin:create-user`   | A new user is created         |
| `DELETE_USER` | `admin:delete-user`   | A user is deleted             |

---

# DONATION Events (`DONATE_EVENTS`)

| Constant          | Event String       | Emitted When                     |
| :---------------- | :----------------- | :------------------------------- |
| `DONATION_MADE`   | `donation:success` | A donation was made successfully |
| `DONATION_FAILED` | `donation:failed`  | A donation attempt failed        |

---

# ASH Events (`ASH_EVENTS`)

| Constant           | Event String       | Emitted When                 |
| :----------------- | :----------------- | :--------------------------- |
| `STUDENT_ACCEPTED` | `student:accepted` | Student is accepted into ash |
| `STUDENT_REJECTED` | `student:rejected` | Student is rejected from ash |

---

# TACOTS Events (`TACOTS_EVENTS`)

| Constant             | Event String         | Emitted When                    |
| :------------------- | :------------------- | :------------------------------ |
| `APPLICANT_ACCEPTED` | `applicant:accepted` | Student is accepted into tacots |
| `APPLICANT_REJECTED` | `applicant:rejected` | Student is rejected from tacots |

---

# Feature Events (`FEATURE_EVENTS`)

| Constant         | Event String     | Emitted When                 |
| :--------------- | :--------------- | :--------------------------- |
| `FEATURE_ACTION` | `feature:action` | Template / placeholder event |

---

# BullMQ Queues

| Queue Name           | Default Attempts | Backoff               | Concurrency | Scheduled Job                              | Source                                  |
| :------------------- | :--------------- | :-------------------- | :---------- | :----------------------------------------- | :-------------------------------------- |
| `asset-removal`      | 3                | Exponential, 3s delay | 3           | —                                          | `queues/deleteCloudinaryAsset.queue.ts` |
| `notification-queue` | 3                | Exponential, 3s delay | 1           | `weekly-notification-check` (Sun 6 PM WAT) | `queues/notifications.queue.ts`         |

---

# BullMQ Queues Example

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

| PAGE                         | PATH                                                    |
| :--------------------------- | :------------------------------------------------------ |
| Blogs                        | `/Cedarrise Initiative/BLOG`                            |
| Carousel — ASH               | `Cedarrise Initiative/ASH`                              |
| Carousel — TACOTS            | `Cedarrise Initiative/TACOTS`                           |
| Carousel — Outreaches        | `Cedarrise Initiative/OUTREACHES`                       |
| Carousel — Capacity Building | `Cedarrise Initiative/CAPACITY BUILDING`                |
| RECEIPTS — Receipt image     | `/Cedarrise Initiative/RECEIPTS`                        |
| ASH — Passport Photos        | `/Cedarrise Initiative/ASH-ASSETS/PASSPORTS`            |
| ASH — Last Results           | `/Cedarrise Initiative/ASH-ASSETS/RESULTS`              |
| ASH — Parent Signatures      | `/Cedarrise Initiative/ASH-ASSETS/SIGNATURES`           |
| TACOTS — Passport Photos     | `/Cedarrise Initiative/TACOTS-ASSETS/PASSPORTS`         |
| ASH — Termly Results         | `/Cedarrise Initiative/ASH-ASSETS/TERMLY-RESULTS`       |
| TACOTS — Last Results        | `/Cedarrise Initiative/TACOTS-ASSETS/RESULTS`           |
| TACOTS — Parent Signatures   | `/Cedarrise Initiative/TACOTS-ASSETS/SIGNATURES`        |
| TACOTS — Admission Letters   | `/Cedarrise Initiative/TACOTS-ASSETS/ADMISSION-LETTERS` |
| TACOTS — Term Results        | `/Cedarrise Initiative/TACOTS-ASSETS/TERM-RESULTS`      |
| TACOTS — Payment Evidence    | `/Cedarrise Initiative/TACOTS-ASSETS/PAYMENT-EVIDENCE`  |

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
