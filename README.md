# Ashish Kumar: portfolio website + admin

- `website/`  your public portfolio (animated, light and dark mode, project pop-ups, contact form)
- `admin/`    a separate admin website where you edit everything and upload photos; the portfolio updates within a minute
- `backend/setup.sql`  creates the database tables and photo storage in Supabase

Plain HTML, CSS and JavaScript, no build step. Host `website/` and `admin/` as two separate free sites (Netlify, Cloudflare Pages or GitHub Pages). To preview on your computer, open `website/index.html` with the Live Server extension in Visual Studio Code.

## One-time setup (about 5 minutes)
Your Supabase project is already connected in `website/data/config.js` and `admin/config.js` (project URL without `/rest/v1`, plus the public anon key).
1. Supabase > **SQL Editor > New query**, paste all of `backend/setup.sql`, press **Run**.
   - It uses its own tables (`portfolio_*`) and storage bucket (`portfolio-media`), so it will not touch your other sites in the same project.
   - The script allows `thenameisashish11@gmail.com` to edit. To allow another email, add a line like `insert into public.portfolio_admins (email) values ('you@example.com');` and run it.
2. **Authentication > Users**: make sure that email exists (Add user, tick **Auto Confirm User**) and that "Allow new users to sign up" is off.
3. Deploy both folders. Put your portfolio's address into `admin/config.js` as `siteUrl` for a "View website" button.

## Using the admin website
Sign in, change things, press **Save changes**.
- **Profile**: name, photo, rotating roles, tagline, about text, contact details, social links, résumé link, availability, numbers.
- **Skills**: name, category and level (0 to 100).
- **Projects**: title, description, tags (they become the filter buttons), links, cover image and **many screenshots at once**.
- **Journey**: experience and education.
- **Messages**: messages sent from the contact form (only you can read them).

Until you press Save the site shows clearly labelled sample content with a small "Sample content" badge.

## Notes
- Photos are shrunk in the browser (max 1800 px) before upload.
- The anon key is meant to be public; only the emails in `portfolio_admins` can change content, and anyone can send a contact message but only you can read it.
- Your portrait is `website/images/ashish.jpg`; change it from Admin > Profile > Your photo.
