# Nakra — Restaurants Menu Dashboard

Dashboard لإدارة المطاعم والكافيهات: منيو، QR codes، وسائل دفع (InstaPay / Vodafone Cash)، ودعوة صاحب المطعم يدير مطعمه بنفسه.

- **Backend:** Node.js + Express. "الداتابيز" ملفات JSON في `backend/src/data/`.
- **Frontend:** React (Vite) + Tailwind CSS v4 + React Router.

## Structure

```
Nakra/
├── backend/
│   ├── src/
│   │   ├── server.js / app.js     # تشغيل السيرفر وتجميع الـ app
│   │   ├── config/                # قراءة .env
│   │   ├── db/jsonStore.js        # قراءة/كتابة ملفات JSON بأمان (queue + atomic write)
│   │   ├── data/                  # users.json, restaurants.json, tokens.json
│   │   ├── middleware/            # auth (JWT), roles, upload (multer), validate, errors
│   │   ├── validators/            # zod schemas
│   │   ├── routes/                # تعريف الـ endpoints
│   │   ├── controllers/           # استقبال الـ request والرد
│   │   ├── services/              # المنطق: auth, mail, qr, restaurant, menu, invitation
│   │   ├── utils/                 # ids, slug, tokens
│   │   └── scripts/seed-superadmin.js
│   └── uploads/ (logos/, items/)  # الصور المرفوعة
└── frontend/
    └── src/
        ├── api/                   # استدعاءات الـ backend
        ├── context/AuthContext    # المستخدم الحالي والتوكن
        ├── routes/                # الراوتس + ProtectedRoute
        ├── layouts/               # Auth layout و Dashboard layout
        ├── pages/
        │   ├── auth/              # Login, ForgotPassword, ResetPassword, AcceptInvitation
        │   ├── dashboard/         # Overview
        │   ├── admins/            # إدارة الأدمنز (superadmin بس)
        │   ├── restaurants/       # قائمة / إضافة-تعديل / تفاصيل المطعم
        │   ├── owner/             # صفحة صاحب المطعم
        │   └── public/            # صفحة المنيو للزبون /m/:slug
        └── components/            # ui, restaurants, menu, qr
```

## Roles

| Role | يقدر يعمل إيه |
|---|---|
| `superadmin` | كل حاجة + يضيف/يمسح admins. بيتعمل أول مرة بـ `npm run seed` من `.env` |
| `admin` | يضيف/يعدل/يمسح مطاعم، المنيو، الـ QR، ويبعت invitation لصاحب المطعم |
| `owner` | يدير مطعمه هو بس (بيانات، منيو، دفع، QR) |

## Flows

- **إضافة admin:** الـ superadmin يكتب الإيميل → يتبعت للأدمن لينك `/reset-password/:token` يحط منه الباسورد.
- **Forgot password:** نفس لينك الـ reset.
- **Invitation للمطعم:** الأدمن يبعت دعوة على إيميل صاحب المطعم → لينك `/invite/:token` → يحط باسورد → يتعمل له user بـ role `owner` مربوط بالمطعم.
- التوكنز بتتخزن hashed، وليها expiry، وبتستخدم مرة واحدة.

## Data shape (JSON)

```jsonc
// users.json
{ "id": "u_..", "email": "", "passwordHash": "", "role": "superadmin|admin|owner",
  "restaurantId": null, "createdAt": "" }

// restaurants.json
{ "id": "r_..", "slug": "cafe-x", "name": "", "ownerName": "", "email": "", "phone": "",
  "logo": "/uploads/logos/..png",
  "payments": {
    "instapayLink": "",          // https://ipn.eg/S/...
    "vodafoneCashNumber": "",
    "vodafoneCashInstapayLink": ""
  },
  "categories": [
    { "id": "c_..", "name": "مشروبات",   // array order = display order
      "items": [ { "id": "i_..", "name": "", "description": "", "price": 0, "image": null, "isAvailable": true } ] }
  ],
  "createdAt": "", "updatedAt": "" }

// tokens.json  (reset password + invitations)
{ "id": "", "type": "reset|invite", "tokenHash": "sha256", "userId": null, "restaurantId": null,
  "email": "", "expiresAt": "", "usedAt": null, "revokedAt": null }
```

## QR codes (لكل مطعم)
1. لينك المنيو: `PUBLIC_MENU_URL/<slug>`
2. InstaPay
3. Vodafone Cash
4. Vodafone Cash عن طريق InstaPay

بتتولد على السيرفر بمكتبة `qrcode` وتقدر تحملها PNG من الداشبورد.

## Environments (local / dev / production)

ملف واحد بس لكل جزء: `backend/.env` و `frontend/.env` (الاتنين مش بيترفعوا على git).
الـ npm script بيحدد البيئة بـ `cross-env APP_ENV=...`، والكود بياخد الـ URLs اللي ليها نفس الـ prefix:

| Command (backend) | APP_ENV | URLs used from .env |
|---|---|---|
| `npm run local` | `local` | `LOCAL_*` (auto-restart on save) |
| `npm run dev` | `dev` | `DEV_*` (deployed dev server) |
| `npm start` | `production` | `PROD_*` |

- مثال: `LOCAL_FRONTEND_URL` و `DEV_FRONTEND_URL` و `PROD_FRONTEND_URL`.
- لو الهوستنج حط env var من غير prefix (زي `FRONTEND_URL` أو `PORT`)، هو اللي بيتاخد.
- **CORS:** في `LOCAL_CORS_ORIGINS` / `DEV_CORS_ORIGINS` / `PROD_CORS_ORIGINS`. الـ dev فيه `http://localhost:5173` عشان الفرونت اللي على جهازك يكلم الـ backend المرفوع.

Frontend (Vite modes) من `frontend/.env`:

| Command (frontend) | Variable | Backend it calls |
|---|---|---|
| `npm run local` | `VITE_API_URL_LOCAL` | `http://localhost:4000/api` |
| `npm run dev` | `VITE_API_URL_DEV` | الـ backend المرفوع |
| `npm run build` | `VITE_API_URL_PROD` | production backend |

## Run backend locally

```bash
cd backend
npm install
# 1) اكتب SUPERADMIN_EMAIL و SUPERADMIN_PASSWORD في backend/.env
npm run seed      # creates the superadmin once
npm run local     # http://localhost:4000
```

اختبار سريع: افتح http://localhost:4000/api/health

## Run frontend locally

```bash
cd frontend
npm install
npm run local     # http://localhost:5173  (backend must be running: npm run local in backend/)
```

### Frontend structure (no duplicated code)

- `components/ui/`: building blocks used everywhere (Button, Input, Modal, Card, ImageUpload, Tabs, ...).
- `hooks/useForm.js`: every form (values, validation, server errors, toast). `hooks/useApi.js` + `<AsyncContent>`: every page load (loading / error / retry). `hooks/useAction.js`: buttons that call the API.
- `context/ConfirmContext.jsx`: one confirm dialog for the app: `await confirm({...})`.
- `api/endpoints.js`: every backend URL in one file. `api/client.js`: token, JSON/FormData, errors.
- `utils/errors.js`: Arabic translations of backend error messages.
- Brand colors: `src/index.css` (`--color-brand-*`).

## Email (SMTP)

لو `SMTP_HOST` فاضي، الإيميلات (reset / invitation) بتتطبع في الـ terminal بتاع السيرفر بدل ما تتبعت.

Gmail (الأسهل):
1. فعّل 2-Step Verification على حساب Google.
2. من https://myaccount.google.com/apppasswords اعمل App Password اسمه Nakra (16 حرف).
3. في `backend/.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=the16charapppassword
   MAIL_FROM="Nakra <your@gmail.com>"
   ```
4. جرّب: `npm run mail:test -- your@gmail.com`

## Postman

في فولدر `postman/`:
- `Nakra.postman_collection.json`: كل الـ requests في 8 فولدرات بالترتيب.
- `Nakra-Local.postman_environment.json` و `Nakra-Dev.postman_environment.json`.

1. Postman > Import > اختار التلات ملفات.
2. اختار environment "Nakra - Local" من فوق على اليمين، واكتب `superadminEmail` و `superadminPassword`.
3. شغّل `npm run local` وابدأ بـ "Login as superadmin". التوكن والـ ids بيتحفظوا لوحدهم.
4. requests الصور (form-data): اختار صورة من Body قبل ما تبعت.

## Deploy (Vercel + GitHub)

Two Vercel projects from this repo, each connected to GitHub (every push deploys automatically):

| | `main` (production) | `development` |
|---|---|---|
| Dashboard (`frontend/`) | https://nakra-dashboard.vercel.app | https://nakra-dashboard-dev.vercel.app |
| API (`backend/`) | https://nakra-api.vercel.app | https://nakra-api-dev.vercel.app |

Workflow: work on `development` → push → test on the `-dev` links → merge into `main` → production.

- **Storage on Vercel:** the disk is not persistent, so the API uses a **private Vercel Blob** store (`nakra-data`)
  for the JSON data and the images (`backend/src/storage/`). Each environment has its own folder
  (`dev/`, `production/`): development never touches production data. Locally it still uses plain files.
- **Images** are served by the API at `/uploads/...` (the store is private).
- **Superadmin:** created automatically on the first request from `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`.
- **Environment variables:** URLs and `APP_ENV` are set per environment in each Vercel project.
  Secrets (JWT, SMTP, superadmin) are pushed from your local `backend/.env` with:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\vercel-secrets.ps1
  ```
  then redeploy (any push does it).
- **Frontend** reads the API URL from `VITE_API_URL` (set in the Vercel project per environment).

## API

كل الـ endpoints تحت `/api`. المحمي منها محتاج `Authorization: Bearer <token>`.

| Method | Path | Who |
|---|---|---|
| GET | `/health` | public |
| POST | `/auth/login` | public |
| GET | `/auth/me` | logged in |
| POST | `/auth/forgot-password` | public |
| GET / POST | `/auth/reset-password/:token` / `/auth/reset-password` | public (link) |
| GET / POST / DELETE | `/admins`, `/admins/:id`, `POST /admins/:id/resend-setup` | superadmin |
| GET | `/restaurants` | staff = all, owner = his own |
| POST | `/restaurants` (multipart, `logo`) | staff |
| GET / PATCH | `/restaurants/:id` (PATCH multipart, `logo`, `removeLogo`) | staff + owner |
| DELETE | `/restaurants/:id` | staff |
| GET | `/restaurants/:id/qr-codes` | staff + owner |
| POST / DELETE | `/restaurants/:id/invitation` | staff |
| DELETE | `/restaurants/:id/owner` | staff |
| POST / PATCH / DELETE | `/restaurants/:id/categories[/:categoryId]` | staff + owner |
| PUT | `/restaurants/:id/categories/order` `{ ids }` | staff + owner |
| POST / PATCH / DELETE | `/restaurants/:id/categories/:cid/items[/:itemId]` (multipart, `image`, `removeImage`) | staff + owner |
| PUT | `/restaurants/:id/categories/:cid/items/order` `{ ids }` | staff + owner |
| GET / POST | `/invitations/:token`, `/invitations/:token/accept` | public (link) |
| GET | `/public/menu/:slug` | public (customers) |

الصور: JPG / PNG / WEBP، أقصى حجم 3 MB، بتتخدم من `/uploads/...`.
