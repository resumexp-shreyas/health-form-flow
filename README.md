# UW Brain: health-form-flow (frontend)

React + TypeScript + Vite single-page app for the UW Brain health insurance proposal form. It talks to the Django backend in `../Backend AI logic/uwbrain/uwbrain` (see `src/assets/Karma.jsx` for the API base URL: `http://localhost:8000/` on localhost, a hosted URL otherwise).

Stack: Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix), react-router, TanStack Query, axios.

## Run locally

```sh
npm install
npm run dev        # http://localhost:8080
```

Start the backend too (`python manage.py runserver` on port 8000).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Pages

- `/` proposal form (with optional medical-records upload that pre-fills the form)
- `/reflex-questions` AI follow-up questions
- `/uw-reflex-questions` questions suggested for a referred case
- `/summary` underwriting decision
