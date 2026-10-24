# Deploy Bloodlink to Vercel

Current production website: **https://bloodlink-dun-beta.vercel.app**.
API health: **https://bloodlink-dun-beta.vercel.app/api/v1/health**.
The production deployment connects to MongoDB Atlas. The live Postman run passed 36 requests and 98 assertions on 24 October 2026.

Bloodlink can run as one Vercel project. React is served as static files, and the Express API runs through one Vercel Function. The frontend and backend feature folders retain their existing structure.

```text
bloodlink/
├── api/
│   └── index.js       # Vercel adapter for the Express application
├── backend/           # Express, RCSM modules, and Mongoose
├── frontend/          # React and Vite
├── package.json       # Node 22.x and root build/start/test scripts
└── vercel.json        # Install, build, output, and routing configuration
```

## Configure a hosted MongoDB database

Use MongoDB Atlas or another MongoDB server that accepts connections from Vercel. The local address `mongodb://127.0.0.1:27017` refers to the deployed function itself and cannot connect to MongoDB running on your computer.

Create a database user with access to the intended database and configure the provider's network access rules for Vercel. Atlas requires an appropriate IP access list; Vercel's default outbound addresses are dynamic. Use a connection string provided by your MongoDB host, with any username/password characters correctly URL-encoded.

Required server environment variables:

| Variable | Value |
| --- | --- |
| `MONGODB_URL` | Your hosted MongoDB connection string, for example `mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/` |
| `MONGODB_NAME` | `blood_donor_finder` |

Keep the connection string in Vercel's environment variables. Do not commit it, paste it into frontend code, or name it with a `VITE_` prefix. Vite variables are included in the browser build. The frontend uses the same-origin API path `/api/v1` and does not need a database credential or a separate backend URL.

## Deploy the project

1. Sign in to Vercel and link/import the **bloodlink folder** as the project root. For a repository containing a parent folder, set Root Directory to `bloodlink`; when deploying from the extracted bloodlink folder, use that folder directly.
2. Use the **Other** framework preset. The repository's `vercel.json` supplies the install command, frontend build command, output directory, and API/SPA routing.
3. In the Vercel project, open **Settings → Environment Variables**. Add `MONGODB_URL` and `MONGODB_NAME` for Production and, if used, Preview. Environment changes apply to a new deployment, so redeploy after changing them.
4. Run the production deployment from the bloodlink root:

   ```sh
   npx vercel --prod
   ```

   On the first run, follow the CLI sign-in and project-linking prompts. Select the intended account/team and project. If the project has not been created yet, you can run `npx vercel link` first, configure its environment variables in the dashboard, and then run the production command.

The configuration installs backend production dependencies and frontend build dependencies, runs the React build, and publishes `frontend/dist`. API requests are routed to `api/index.js`; React page routes fall back to `index.html` so direct links such as `/donors` and `/requests` work.

The adapter initializes the Express application without starting a listening server and reuses the application/database connection between requests when Vercel retains the function instance. The local Mongo helper is not started or deployed as a cloud database.

## Verify a deployment

After Vercel reports a successful deployment, open its assigned URL and check:

- `/api/v1/health` returns a successful JSON response.
- Donor search, donor creation, availability changes, and blood-request creation work against the hosted database.
- Reloading `/donors` and `/requests` opens the React pages.
- An unknown `/api/v1/...` route returns a JSON error rather than the React page.

If the UI loads but API calls fail, check the Vercel Function logs, the Mongo connection string, database user permissions, and network access rules. A successful frontend build alone does not confirm the database is connected.

## Data on the hosted site

Local MongoDB data is not copied automatically during deployment. A new hosted database starts empty; add donors and blood requests through the app to populate it. Use fictional sample records for a demo. If existing data is needed, perform an explicit database migration separately rather than including local database files in the deployment.

## Run locally

Use Node.js 22.x. Install the child projects from the bloodlink root:

```sh
npm ci --prefix backend
npm ci --prefix frontend
```

Copy `backend/.env.example` to `backend/.env` and configure MongoDB. For the provided local development database, run this in its own terminal:

```sh
npm --prefix backend run db:dev
```

That helper is for local development only. If using a hosted MongoDB connection locally, the helper is unnecessary.

From the root, build the frontend and start Express:

```sh
npm run build
npm start
```

Open `http://127.0.0.1:3000`. Run backend tests with `npm test` while a test-accessible MongoDB server is available. For frontend development with hot reload, run `npm --prefix frontend run dev` alongside the backend; Vite proxies `/api` to the local backend.

## References

- [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Vite on Vercel and SPA routing](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Mongoose connection reuse in serverless functions](https://mongoosejs.com/docs/lambda.html)
- [MongoDB Atlas IP access lists](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
