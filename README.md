# Blood Donor Finder

A small React and Express project for finding available blood donors by blood group and city, registering donors, and managing blood requests. The backend follows **Route → Controller → Service → Model (RCSM)**; React supplies the View. MongoDB stores donors and requests.

## Reference structure and packages

The project follows the coding conventions of [Ranjit-Dit/Ecommerce-Website](https://github.com/Ranjit-Dit/Ecommerce-Website/tree/14e2083) for the backend and [sandesh-bhattarai/react-33](https://github.com/sandesh-bhattarai/react-33/tree/4d806a6) for the frontend, adapted to this project's features.

| Part | Conventions used |
| --- | --- |
| Backend | CommonJS; feature modules with `.router.js`, `.controller.js`, `.service.js`, `.model.js`, and `.request.js`; controller/service classes; Joi DTOs; shared middleware and constants |
| Backend packages | Express 4, Joi 17, Mongoose 8, cors, dotenv; nodemon for development |
| Frontend | Feature pages and services; shared components; central routing and Axios configuration; class-based HTTP service |
| Frontend packages | React 18, Vite 6 with SWC, Axios, React Router 7, React Hook Form, Yup, React Toastify, React Icons, Tailwind CSS 3 |

Ecommerce-specific authentication, payment, upload, cloud-image, and chat packages are omitted because this project does not use those features. The reference repositories are not runtime dependencies.

## Run locally

Install **Node.js 22.12 or newer**. From the `bloodlink/` project folder, install both packages and build React:

```sh
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix frontend run build
```

Start the local MongoDB helper in one terminal, starting from `bloodlink/`, and leave it running:

```sh
cd backend
npm run db:dev
```

This helper downloads and runs a real MongoDB 8.0.17 server using `mongodb-memory-server-core`. The first run needs internet access. It listens only on `127.0.0.1:27017`, keeps database files in `backend/.local-mongo/`, and caches the MongoDB binary in `backend/.cache/mongodb-binaries/`. Data persists between helper restarts. If MongoDB already runs on port 27017, use that server instead of starting the helper.

Start Express in a second terminal, also starting from `bloodlink/`:

```sh
cd backend
npm start
```

Open **http://127.0.0.1:3000**. Express serves the built React app and the API at **http://127.0.0.1:3000/api/v1**. Check `GET /api/v1/health` before using the app.

For your own local MongoDB or Atlas connection, copy `backend/.env.example` to `backend/.env` and set:

```dotenv
PORT=3000
HOST=127.0.0.1
MONGODB_URL=mongodb://127.0.0.1:27017
MONGODB_NAME=blood_donor_finder
```

These defaults also work without a `backend/.env` file. Backend scripts load that file relative to their location. Keep real credentials out of shared files. If using your own MongoDB/Atlas server, the local helper is unnecessary.

| Working directory | Command | Purpose |
| --- | --- | --- |
| `backend/` | `npm start` | Run Express and serve the built frontend from `../frontend/dist/` |
| `backend/` | `npm run dev` | Run Express with nodemon |
| `frontend/` | `npm run dev` | Run Vite at `http://127.0.0.1:5173` |
| `frontend/` | `npm run build` | Build React into `frontend/dist/` |
| `backend/` | `npm run db:dev` | Start the persistent local MongoDB helper |
| `backend/` | `npm run data:migrate` | Import retained JSON records into MongoDB |
| `backend/` | `npm test` | Run backend integration tests against isolated test databases |
| `backend/` | `npm run test:postman` | Run the Postman collection through Newman |

During development, leave MongoDB running and run `cd backend` then `npm run dev` in a terminal opened at `bloodlink/`. In another terminal opened at `bloodlink/`, run `cd frontend` then `npm run dev`, and open port 5173. Vite proxies `/api` requests to Express on port 3000. Update the proxy target in `frontend/vite.config.js` if changing the backend port. Set `VITE_BASE_URL` in `frontend/.env` to override the frontend API base URL; it defaults to `/api/v1`. The frontend and backend have separate `package.json` files; there is no root package.

## Existing JSON data and snapshots

The earlier `backend/data/db.json` is retained as a migration source; the running API now reads and writes MongoDB. With MongoDB running, run this from `backend/`:

```sh
npm run data:migrate
```

The migration imports existing donors and requests, leaves the original JSON file intact, and is safe to rerun without inserting the same source records twice. MongoDB generates ObjectId identifiers, so migrated records use new API IDs. Existing JSON IDs are not API IDs for this version.

The previously delivered React/MVC snapshot ZIP is unchanged. To try this version from scratch, use a new `MONGODB_NAME` rather than deleting the retained JSON source.

## Using the frontend

- `/`: search available donors by blood group and city.
- `/donors`: register and edit donors, change availability, and delete records.
- `/requests`: create blood requests, find matching donors, and update or reopen request status.
- Use **Load demo data** for fictional sample records. These are stored in MongoDB like other records.
- Call the returned phone number on a supported device or copy a prepared contact message. Communication is manual; the app does not send SMS or email.

## Test with Postman

1. Start MongoDB, then start Express with `npm start` from `backend/`.
2. In Postman, select **Import** and import both files from `backend/postman/`:
   - `Blood-Donor-Finder.postman_collection.json`
   - `Local.postman_environment.json`
3. Select the **Blood Donor Finder - Local** environment (`baseUrl`: `http://127.0.0.1:3000`).
4. Open **Blood Donor Finder - Local API**, choose **Run**, and keep all requests selected in their numbered order.
5. Set **Iterations** to **1**, run the collection, and review its assertions.

The collection creates unique dummy donors and a request, saves their IDs, and removes its records during cleanup. Run the full collection in order. If you stop before cleanup, use the saved IDs with the final DELETE requests. It checks filtering, availability, matching, contact drafts, phone uniqueness, validation, status changes, deletion, and missing records.

For the same checks in another terminal, run this from `backend/`:

```sh
npm run test:postman
```

To pass the included environment explicitly, also run this from `backend/`:

```sh
npm run test:postman -- --environment postman/Local.postman_environment.json
```

Backend tests use the running local MongoDB by default. Set `TEST_MONGODB_URI` to change their connection. They create databases named `blood_donor_test_<UUID>` and drop only those test databases; they do not use the application database.

## API

All routes below use `/api/v1`; `/api` remains a compatibility alias. Body requests use `Content-Type: application/json`. No authentication is required.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/health` | Check the API |
| POST / GET | `/api/v1/donors` | Register / list donors |
| GET / PATCH / DELETE | `/api/v1/donors/:id` | Read / edit / delete a donor |
| PATCH | `/api/v1/donors/:id/availability` | Set donor availability |
| POST / GET | `/api/v1/requests` | Create / list blood requests |
| GET / DELETE | `/api/v1/requests/:id` | Read / delete a request |
| GET | `/api/v1/requests/:id/matches` | Find available donors and prepare contact text |
| PATCH | `/api/v1/requests/:id/status` | Change request status |

Donor list filters: `bloodGroup`, `city`, `available`. Request list filters: `bloodGroup`, `city`, `status`, `urgency`. Lists return all matches without pagination; blood requests are ordered by urgency, then newest first.

### Register a donor

Send `POST {{baseUrl}}/api/v1/donors`:

```json
{
  "name": "Asha Rao",
  "bloodGroup": "O+",
  "phone": "9000000001",
  "city": "Pune",
  "area": "Shivajinagar",
  "available": true
}
```

`name`, `bloodGroup`, `phone`, and `city` are required. `area` defaults to `""`, and `available` defaults to `true`. Phone strings accept 7–15 digits with an optional leading `+`; spaces, hyphens, and parentheses are removed. Duplicate normalized donor phones return `409`.

Valid blood groups: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`. Lowercase blood groups are normalized. Text is trimmed and repeated whitespace is collapsed. City matching is exact and ignores case.

```text
GET {{baseUrl}}/api/v1/donors?bloodGroup=O%2B&city=Pune&available=true
```

Encode `+` as `%2B` in query strings. To change availability, send `{ "available": false }` to `PATCH /api/v1/donors/:id/availability`. Other edits accept a nonempty subset of donor fields at `PATCH /api/v1/donors/:id`.

### Create a blood request

Send `POST {{baseUrl}}/api/v1/requests`:

```json
{
  "patientName": "Sample Patient",
  "bloodGroup": "O+",
  "city": "Pune",
  "hospital": "City Hospital",
  "requesterName": "Sample Coordinator",
  "phone": "9000000002",
  "units": 2,
  "urgency": "urgent",
  "message": "Please contact the hospital desk."
}
```

All fields except `urgency` and `message` are required. `units` is an integer from 1–20. `urgency` is `normal` or `urgent` (default `urgent`); `message` defaults to `""`. New requests have `status: "open"`.

`GET /api/v1/requests/:id/matches` returns donors who are available and have the same blood group and city, with a `contactMessage` for each donor. Matching is allowed only for open requests. Change status with `PATCH /api/v1/requests/:id/status` and `{ "status": "fulfilled" }`; allowed statuses are `open`, `fulfilled`, and `cancelled`.

### Responses and validation

Success responses follow the reference envelope:

```json
{
  "success": true,
  "data": { "id": "507f1f77bcf86cd799439011" },
  "message": "Donor registered successfully.",
  "status": "DONOR_CREATE_SUCCESS",
  "options": null
}
```

Records include MongoDB `_id`, a string `id` alias, and timestamps. Use the returned ID for subsequent requests. Lists return an array in `data` and a `count`. Errors return `{ "success": false, "data": null, "message": "Explanation", "status": "ERROR_CODE", "options": null }`; validation errors may include field details in `data` and `detail`.

HTTP codes: `200` read/update/delete; `201` create; `400` invalid fields, query parameters, or malformed JSON; `404` missing record/route or invalid record ID; `409` duplicate phone or matching a closed request; `413` JSON bodies over 16 KB. Joi validates request bodies and queries before controllers run. Use JSON booleans in bodies, and `available=true`/`available=false` in queries.

## Project layout and request flow

```text
bloodlink/
├── .gitignore
├── README.md
├── TEST-RESULTS.txt
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js                       Server startup
│   ├── package.json
│   ├── package-lock.json
│   ├── nodemon.json
│   ├── data/
│   │   └── db.json                    Legacy migration source
│   ├── scripts/
│   │   ├── mongo-local.js
│   │   └── migrate-json.js
│   ├── postman/
│   │   ├── Blood-Donor-Finder.postman_collection.json
│   │   └── Local.postman_environment.json
│   ├── test/
│   │   └── api.test.js
│   └── src/
│       ├── app.js                     Compatibility export of the Express factory
│       ├── config/
│       │   ├── express.config.js      App setup and sibling React build serving
│       │   ├── router.config.js       Feature routing
│       │   └── db.config.js           MongoDB connection
│       ├── constants/
│       │   ├── domain.constant.js
│       │   ├── http-status-code.constant.js
│       │   └── response-status.constant.js
│       ├── middlewares/
│       │   ├── request-validator.middleware.js
│       │   └── error-handler.middleware.js
│       ├── modules/
│       │   ├── donor/
│       │   │   ├── donor.router.js
│       │   │   ├── donor.controller.js
│       │   │   ├── donor.service.js
│       │   │   ├── donor.model.js
│       │   │   └── donor.request.js
│       │   └── blood-request/
│       │       ├── blood-request.router.js
│       │       ├── blood-request.controller.js
│       │       ├── blood-request.service.js
│       │       ├── blood-request.model.js
│       │       └── blood-request.request.js
│       └── utilities/
│           ├── http-error.helper.js
│           ├── request.helper.js
│           └── response.helper.js
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── dist/                          Generated production build
    └── src/
        ├── main.jsx
        ├── assets/css/main.css
        ├── config/
        │   ├── axios.config.jsx
        │   └── routing.config.jsx
        ├── constants/blood-group.constant.js
        ├── context/community.context.jsx
        ├── services/http-service.js
        ├── utilities/
        │   ├── helpers.jsx
        │   └── validation.jsx
        ├── pages/
        │   ├── layout/home-layout.page.jsx
        │   ├── errors/not-found.page.jsx
        │   ├── donor/
        │   │   ├── donor-search.page.jsx
        │   │   ├── donor-list.page.jsx
        │   │   ├── donor-form.component.jsx
        │   │   ├── donor-card.component.jsx
        │   │   ├── donor-results.component.jsx
        │   │   └── donor.service.js
        │   └── blood-request/
        │       ├── blood-request-list.page.jsx
        │       ├── blood-request-form.component.jsx
        │       ├── blood-request-card.component.jsx
        │       ├── blood-request-matches.component.jsx
        │       └── blood-request.service.js
        └── components/
            ├── sidebar/sidebar.component.jsx
            ├── headers/header.component.jsx
            ├── footers/footer.component.jsx
            ├── form/input.component.jsx
            ├── buttons/button.component.jsx
            ├── icons/icons.component.jsx
            ├── modal/
            │   ├── modal.component.jsx
            │   └── community-modal.component.jsx
            ├── feedback/empty-state.component.jsx
            └── community/
                ├── community-stats.component.jsx
                └── page-heading.component.jsx
```

A donor registration follows `donor.router.js` → Joi validation → `donor.controller.js` → `donor.service.js` → `donor.model.js` → MongoDB. Controllers handle HTTP; services enforce business rules; models define persistence. React calls the same API as Postman through Axios feature services.

This is a local learning project with manual availability and city-based matching. Matching identical blood groups does not establish medical eligibility or clinical compatibility. Contact information is visible without authentication; use fictional data for testing.
# BloodLink
