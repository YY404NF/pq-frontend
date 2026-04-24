# pq-frontend

Vue 3 + Vite frontend for the PrivateQuery demo.

## Pages

- `/`: system introduction and architecture view
- `/process`: complete request/response protocol dashboard
- `/scene`: public catalog and private detail query flow

## Run

```bash
npm install
npm run dev
```

The dev server binds to `0.0.0.0` by default, so other devices on the same LAN can open it through your machine IP.

By default, frontend API requests use same-origin proxy paths:

- `/server-a` -> `http://127.0.0.1:8081`
- `/server-b` -> `http://127.0.0.1:8082`

In production builds, when `VITE_SERVER_A_URL` and `VITE_SERVER_B_URL` are not set, the frontend automatically targets:

- `http://<current-host>:18081`
- `http://<current-host>:18082`

The preview server now listens on port `15173`:

```bash
npm run preview -- --host 0.0.0.0 --port 15173
```

## Environment

Use the following variables when needed:

- `VITE_SERVER_A_URL`
- `VITE_SERVER_B_URL`
