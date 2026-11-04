# hardwarecheckout-Team-6-
generic hardware checkout page

A small hardware-as-a-service app. Users sign in, create or join a project, and check hardware sets in and out of a shared pool.

- Frontend: React + Vite, React Router (`frontend/`)
- Backend: Flask + PyMongo (`backend/`)
- Database: MongoDB, database name `haas`, collections `users`, `projects`, `hardware`

## Running it locally

You need Python 3, Node, and a MongoDB connection string. Ask the team for the shared Atlas string, or run Mongo locally with Docker:

```bash
docker run -d --name haas-mongo -p 27017:27017 -v haas-mongo-data:/data/db mongo:7
```

### One-time setup

Backend:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

The copied `.env` already points at local Docker Mongo, so it works as is. To use the shared Atlas database instead, see "Using MongoDB Atlas" below. Then seed the hardware sets:

```bash
python seed.py
```

`seed.py` only creates the hardware sets if there are none, so it is safe to run against a shared database. It never wipes live checkouts unless you pass `--reset` on purpose. It also creates the unique indexes that make duplicate user IDs and project IDs fail with a 409.

Frontend:

```bash
cd frontend
npm install
```

On a Mac, port 5000 is taken by AirPlay Receiver, so run the backend on 5001 and tell the frontend where it is:

```bash
cp .env.example .env.local
```

That sets `VITE_API_URL=http://127.0.0.1:5001` (the file is gitignored).

### Every time

Terminal 1, backend:

```bash
cd backend
source venv/bin/activate
flask --app app run --port 5001
```

Terminal 2, frontend:

```bash
cd frontend
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Using the app

1. **Create an account.** Go to **Login**, click **Create an account**, enter a user ID and password, and submit. The pop-up closes and the page says "Account created. Log in to continue."
2. **Log in.** Enter the same user ID and password. The nav bar now shows **Log out (your ID)**. Every page except Home and Login needs you to be logged in.
3. **Create a project.** Go to **Projects**. Under **Create a project**, fill in a Project ID, Name and Description and click **Create**. You become its first member, and it appears under **Your projects**.
4. **Or join an existing project.** Under **Use an existing project**, type a Project ID someone else created and click **Join**.
5. **Check hardware out and in.** Go to **Hardware**. Pick a project in the dropdown. For HWSet1 or HWSet2, type a quantity and click **Check out** or **Check in**. The table shows Capacity, Available, and how many your project currently holds. A message appears under the row, for example "checked out 5 of HWSet1".
6. **Log out** with the button in the nav bar.

Things that will trip you up:

- User IDs cannot contain spaces or `!`. The backend cipher only handles printable characters from `"` to `~`. Passwords have no such limit.
- A page refresh logs you out. Login state lives in React memory only.
- Checking out more than is available, or checking in more than your project holds, is rejected with a message and changes nothing.
- Hardware is shared by all projects: if project A holds 60 of HWSet1, project B can only see 40 available.

## API

All routes are under `/api` and take and return JSON.

| Method | Route | Body | Result |
|---|---|---|---|
| POST | `/register` | `userid`, `password` | 201, or 409 if the user exists |
| POST | `/login` | `userid`, `password` | user ID and project list, or 401 |
| POST | `/projects` | `projectId`, `name`, `description`, `userid` | 201, or 409 if the ID exists |
| POST | `/projects/join` | `projectId`, `userid` | joined, or 404 if no such project |
| GET | `/projects/<projectId>` | none | project details and `hwCheckedOut` |
| GET | `/hardware` | none | every set with `name`, `capacity`, `available` |
| POST | `/hardware/checkout` | `projectId`, `hwName`, `qty` | updated, or 409 if not enough is available |
| POST | `/hardware/checkin` | `projectId`, `hwName`, `qty` | updated, or 409 if the project does not hold that many |

## How it fits together

- `frontend/src/api.js` is the only file that talks to the backend. Pages call its functions and never build URLs themselves.
- `App.jsx` holds the logged-in user, their project list and the selected project, and passes them down as props.
- `backend/security.py` encrypts user IDs with a character shift plus a reversal before they are stored, and hashes passwords with Werkzeug. The plain user ID and password are never saved.
- Checkout and check-in use a conditional Mongo update (`available >= qty`), so two people cannot check out the same units at the same moment.

## Using MongoDB Atlas

The app reads one setting, `MONGODB_URI`, so local Mongo and Atlas need no code changes.

1. In Atlas, create a database user and copy the connection string from **Connect > Drivers**.
2. Under **Network Access**, allow your IP. For Heroku, Atlas needs `0.0.0.0/0` because Heroku IPs change.
3. Put the string in `backend/.env`, replacing `<user>` and `<password>`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/?retryWrites=true&w=majority
```

4. Seed once for the whole team with `python seed.py`. Teammates sharing the database do not need to seed again.

Never commit the real string. `.env` is gitignored, and `.env.example` only holds placeholders. Share the real string through a private channel, not the repo. A password with special characters such as `@` or `/` must be URL-encoded in the string.

Everyone pointing at the same Atlas database shares the same users, projects and hardware counts, which is also how the deployed app will behave.

## Deploying the backend to Heroku

`backend/Procfile` and `gunicorn` in `requirements.txt` are already set up. Heroku builds from the repo root, so deploy the `backend/` folder as its own app:

```bash
heroku create <app-name>
heroku config:set MONGODB_URI='<atlas string>' CORS_ORIGINS='<hosted frontend url>' --app <app-name>
git subtree push --prefix backend heroku main
```

Check `https://<app-name>.herokuapp.com/api/hardware` returns the hardware JSON. For the frontend, build with `VITE_API_URL` set to the Heroku URL (`npm run build`) and host the `frontend/dist` folder on any static host. Single-page apps need that host to serve `index.html` for unknown paths.

## Not done yet

- Actually deploying to Heroku and hosting the frontend (the config for it is in place).
- A shared Atlas database for the team.
- Automated tests.
