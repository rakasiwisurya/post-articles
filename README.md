# Post Articles Dashboard

Frontend for articles, built with [Next.js](https://nextjs.org) (App Router), [Ant Design](https://ant.design), Tailwind CSS and react-icons.

It consumes the Go article microservice in [`../server`](../server) — start that API first.

## Pages

| Route                 | Page      | Description                                                                                                                                                                                                         |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                   | All Posts | Tabs for **Published**, **Drafts** and **Trashed**; each tab is a table with title, category and action (edit / trash icons). Trash moves an article to the Trashed tab; on the Trashed tab it deletes permanently. |
| `/add-new`            | Add New   | Form with Title, Content and Category plus **Publish** and **Draft** buttons.                                                                                                                                       |
| `/articles/[id]/edit` | Edit      | Same form prefilled from the API, with **Publish** and **Draft** buttons.                                                                                                                                           |
| `/preview`            | Preview   | Blog view of published articles with pagination.                                                                                                                                                                    |

Form fields mirror the API validation: title ≥ 20 chars, content ≥ 200 chars, category ≥ 3 chars. Server-side validation errors are mapped back onto the form fields.

## Project Structure

```
src/
├── app/                  # routes (App Router)
│   ├── page.tsx          # All Posts
│   ├── add-new/
│   ├── articles/[id]/edit/
│   └── preview/
├── components/
│   ├── app-shell.tsx     # antd layout + navigation
│   └── article-form.tsx  # shared Add New / Edit form
└── lib/
    ├── api.ts            # typed fetch client for the article API
    └── types.ts          # Article types
```

## Getting Started

1. Run the backend API (see [`../server/README.md`](../server/README.md)); it listens on `http://localhost:8080` by default.
2. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

To point at a different API host, set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — eslint
