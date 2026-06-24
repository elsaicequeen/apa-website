# The Breathing Room — roadmap / to-do

Open items. The two big ones are **growth levers waiting on Apabrita's content**.

## 1. Local SEO (in-person, Delhi) — biggest near-term growth lever
- [ ] Create a **Google Business Profile** for the Delhi practice (free; huge for local discovery)
- [ ] Add **LocalBusiness / MedicalBusiness schema** to the site (name, area served: Delhi + online, languages, founder)
- [ ] Work "therapist in Delhi" / "online therapist India" naturally into copy + meta descriptions
- _Status: ready to build the schema anytime; profile needs Apabrita to claim it._

## 2. Resources / blog section — organic discovery for an underserved niche
- [ ] Add a `resources.html` (or `/resources`) section + first few articles
- [ ] Topics that fit her niche and get searched: anxiety, trauma, queer-affirmative
      therapy, caste & mental health, therapy in regional languages
- _Status: **waiting on Apabrita to write the content.** Scaffolding can be built first._

## Smaller follow-ups
- [ ] Confirm the WhatsApp number (91 7002318224) is correct
- [ ] Add the **consent** + **crisis** questions inside the Google intake form
- [ ] If she has **RCI registration** or pro-body memberships, add them (trust signal in India)
- [ ] Optional: custom domain (e.g. thebreathingroom.in) — Pages serves it with free HTTPS

---

### How this site works (for collaborators)
- Static site on **GitHub Pages**. Push to `main` → auto-deploys in ~1–2 min.
- Edit small text directly on github.com (Commit changes = deploy), or use Claude Code in a clone.
- Bookings run via **Calendly** + **Google Form** — keep client data **off** the repo.
- Analytics: **Cloudflare Web Analytics** (cookieless), token set in `assets/js/main.js`.
