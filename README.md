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

## Environment

Use the following variables when needed:

- `VITE_SERVER_A_URL`
- `VITE_SERVER_B_URL`
