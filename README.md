# Workflow Hub

An attractive React + Vite app that showcases a grid of workflow cards. Each card opens a form page that submits to an n8n webhook. Built with React Router and Tailwind CSS.

### Features
- Responsive home page with customizable workflow cards
- Per-workflow form pages driven by a config file
- Submits JSON to n8n webhooks with success/error handling
- Tailwind CSS for modern styling

### Getting Started
1. Install dependencies:
   - `npm install`

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your n8n webhook URLs, for example:
     ```env
     VITE_N8N_WEBHOOK_LEAD_CAPTURE=https://your-n8n-host/webhook/lead-capture
     VITE_N8N_WEBHOOK_SUPPORT_TICKET=https://your-n8n-host/webhook/support-ticket
     VITE_N8N_WEBHOOK_FEEDBACK=https://your-n8n-host/webhook/feedback
     ```

3. Start the dev server:
   - `npm run dev`
   - Open the shown localhost URL (usually http://localhost:5173)

### Customizing Workflows
Edit `src/data/workflows.js` to add, remove, or modify workflows. Each workflow supports:
- `id`: unique slug used in the URL
- `name`: display name
- `description`: short description
- `color`: tailwind gradient classes for the card header (e.g. `from-primary-500 to-indigo-600`)
- `webhookUrl`: final n8n webhook URL (can be provided via `.env`)
- `fields`: array of field configs
  - Supported types: `text`, `email`, `textarea`, `select`
  - Select fields accept `options: ['A', 'B']`

Example field:
```js
{ key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' }
```

### Build & Deploy
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy the `dist/` folder to any static host (Netlify, Vercel, S3, etc.)

### Notes
- Tailwind CSS v4 is used. The `src/index.css` uses `@import "tailwindcss";` which is handled by PostCSS during dev/build.
- ESLint warnings in the editor about `@apply` or Tailwind at-rules can be ignored; they are resolved at build time.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
