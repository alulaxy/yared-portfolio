# Yared Gebretsadkan — portfolio site (with self-editable content)

This is a plain static site (no build step) whose text and images live in
`content/profile.json` and `content/projects.json`, so it can be edited
through a private admin page instead of by editing code.

## What's in here
- `index.html` — the whole site (home, project pages, about, contact). It
  reads its content from the two JSON files at runtime.
- `content/profile.json` — Yared's bio, portrait, contact links.
- `content/projects.json` — all projects (stills, video, gallery, credits).
- `images/` — the current placeholder stills + portrait. Replace freely.
- `admin/` — the Decap CMS admin panel (the editing UI itself).

## One-time setup (you do this once)

### 1. Put this on GitHub
- Create a free GitHub account if you don't have one.
- Create a new repository (public or private both work).
- Upload every file/folder in this project to it, keeping the same
  structure (easiest: use GitHub's "Add file → Upload files" in the
  browser, or `git push` if you're comfortable with Git).

### 2. Connect it to Netlify
- Create a free Netlify account.
- "Add new site" → "Import an existing project" → connect your GitHub
  account → pick this repository.
- Build command: leave blank. Publish directory: leave as `/` (root).
- Deploy. You'll get a live `*.netlify.app` URL — that's the real site now.

### 3. Turn on the admin login (Netlify Identity + Git Gateway)
- In the Netlify dashboard for this site: **Site configuration → Identity
  → Enable Identity**.
- Still under Identity: **Registration → set to "Invite only"** (so
  random people can't sign up).
- **Services → Git Gateway → Enable Git Gateway.** This is what lets the
  admin panel save changes back to GitHub without Yared needing his own
  GitHub account or token.
- Back on **Identity**, click **Invite users**, enter Yared's email. He'll
  get an email to set a password.

### 4. (Optional but recommended) Point config.yml at the real URL
- Open `admin/config.yml` in the repo, uncomment the `site_url:` line, and
  set it to your real `https://your-site.netlify.app` (or custom domain
  once you have one). This avoids occasional login redirect issues.

### 5. Add a real domain (optional)
- Buy a domain, then in Netlify: **Domain settings → Add a custom
  domain**, and follow the DNS instructions it gives you.

## How Yared uses it afterward
- He goes to `yoursite.com/admin`, logs in with the email/password from
  his invite.
- He can edit his bio/photo under **Profile**, and add, edit, reorder or
  delete projects (including uploading new images/replacing old ones)
  under **Projects**.
- Every save publishes automatically — the live site updates within
  roughly a minute.

## Updating things yourself instead (no CMS)
You can always skip the CMS and just edit `content/profile.json` /
`content/projects.json` directly (any text editor), or replace files in
`images/`, then re-upload the changed files to GitHub — Netlify rebuilds
automatically on every push.
