# Apabrita — Therapy Practice Website

A fast, calming, high-conversion website for **Apabrita**, a Narrative Humanistic
Psychologist offering trauma-informed **online therapy** (individual & group)
in India. Built to turn anxious visitors into booked free intake calls.

- **Look & feel:** light, minimalist **lilac / lavender / white** with a restrained
  interactive **3D aurora hero** (Three.js) and tasteful **glassmorphism**.
- **Tech:** plain HTML + CSS + a little vanilla JS. **No build step, no Node required.**
  Three.js & GSAP-style effects load from CDN. Hosts free on Netlify, GitHub Pages or Vercel.
- **Languages:** English UI with a warm badge welcoming sessions in
  English · हिन्दी · বাংলা · অসমীয়া.

---

## Run it locally

No tooling needed — just open `index.html` in a browser. For the 3D hero and
contact form to behave exactly as in production, serve it over HTTP:

```bash
# from this folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## ✅ Before you go live — replace these placeholders (TODOs)

Everything below is clearly marked with `TODO` in the code.

| # | What | Where | How |
|---|------|-------|-----|
| 1 | **WhatsApp number** | `data-whatsapp="..."` on the `<body>` of every `.html` page | Replace `91XXXXXXXXXX` with the real number (country code + number, no `+` or spaces). The pre-filled message is already set. |
| 2 | **Email address** | `data-email="hello@example.com"` on `<body>`; the email text in `contact.html` | Use the real address. |
| 3 | **Contact form** | `contact.html` → `<form action="https://formspree.io/f/YOUR-FORM-ID">` | Create a free form at [formspree.io](https://formspree.io), paste your endpoint. Until then the form falls back to opening the visitor's email app. |
| 4 | **Calendly booking** | `contact.html` → `data-calendly="https://calendly.com/YOUR-CALENDLY/intake-15min"` | Paste your real Calendly (or similar) link; the live calendar then loads automatically. Until then, WhatsApp/email/form still work. |
| 5 | **Photo** | `assets/img/` + the `portrait-ph` blocks in `index.html` and `about.html` | Add a warm headshot (e.g. `apabrita.jpg`) and swap the placeholder `<div class="portrait-ph">…</div>` for `<img src="assets/img/apabrita.jpg" alt="Apabrita" />`. |
| 6 | **Testimonials** | not yet added — search the code for `testimonial` | Add 2–3 short, **anonymised** client quotes for social proof once you have consent. |
| 7 | **Domain** | `CNAME`, and the `https://example.com` URLs in `index.html` (canonical/OG/JSON-LD), `sitemap.xml`, `robots.txt` | Replace `example.com` with your real domain. |

---

## Editing content

- **Text** lives directly in the `.html` files — edit in place, no compiling.
- **Colours / fonts / spacing** are CSS variables at the top of
  [`assets/css/styles.css`](assets/css/styles.css) (`:root { … }`). Change the lilac
  palette in one place and the whole site updates.
- **3D hero** colours/speed are in [`assets/js/hero3d.js`](assets/js/hero3d.js)
  (`u_c1`–`u_c4` and the `t = u_time * 0.04` drift speed). It automatically falls back
  to a static gradient for `prefers-reduced-motion` users and devices without WebGL.

## Deploy (pick one, all free)

- **Netlify** — drag this folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Form (Formspree) and everything else work as-is.
- **GitHub Pages** — push to a repo, enable Pages on the `main` branch (root). Keep `CNAME` for a custom domain.
- **Vercel** — `vercel` in this folder, or import the repo. No framework preset needed.

## File map

```
index.html          Home (3D hero, services, approach, fees, FAQ, CTA)
about.html          Story, credentials, values
services.html       Areas of support + individual/group
contact.html        Booking hub: WhatsApp + form + Calendly
404.html            Friendly not-found page
assets/css/styles.css   Design system (lilac tokens, glassmorphism)
assets/js/main.js       Nav, reveal, sticky CTA, form handling
assets/js/hero3d.js     Three.js aurora hero + fallbacks
assets/img/             Favicon + (TODO) photos & OG image
robots.txt, sitemap.xml, CNAME, site.webmanifest
```
