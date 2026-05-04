# KanKanGames Website

Portfolio and studio website for **KanKanGames** — a performance-first game development studio. Live at [kankangames.com](https://kankangames.com).

## Stack

- Static HTML + Tailwind CSS (CDN)
- Vanilla JavaScript
- Hosted on GitHub Pages with a custom domain (`CNAME`)
- Contact form powered by [EmailJS](https://emailjs.com) (no server required)

## Setup

### 1. Clone & open locally

```bash
git clone https://github.com/Tikky1/KanKanGames-Website.git
cd KanKanGames-Website
# Open index.html in your browser — no build step needed
```

### 2. Email contact form (EmailJS)

The contact form uses EmailJS so no backend or credentials are stored in the repo. You only need three public identifiers.

**Steps:**

1. Sign up at [emailjs.com](https://emailjs.com)
2. **Add an Email Service** — connect your Gmail / Outlook account → copy the **Service ID**
3. **Create an Email Template** — use these variables in the template body:
   - `{{from_name}}` — sender's name
   - `{{from_email}}` — sender's email (set as Reply-To)
   - `{{subject}}` — subject line
   - `{{message}}` — message body
   - Copy the **Template ID**
4. Go to **Account → API Keys** → copy your **Public Key**
5. In `index.html`, replace the three placeholder values:

```html
<!-- In <head> -->
<script>emailjs.init("YOUR_PUBLIC_KEY");</script>
```

```javascript
// In the <script> block at the bottom
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
```

> **Security note:** The Public Key, Service ID, and Template ID are all public identifiers — they are safe to commit. No passwords are ever needed client-side. You can additionally restrict which domains can call your EmailJS account under *Account → Security*.

### 3. Social media & project links

All external links are stored in one file: `data/links.json`. Edit it and push — no need to touch `index.html`.

```json
{
  "social": {
    "github":    "https://github.com/KanKanGames",
    "linkedin":  "https://linkedin.com/in/yourname",
    "twitter":   "https://twitter.com/KanKanGames",
    "instagram": "https://instagram.com/kankangames",
    "youtube":   "https://youtube.com/@KanKanGames",
    "tiktok":    "https://tiktok.com/@kankangames"
  },
  "projects": {
    "deepbound": {
      "steam": ""
    },
    "shadowOfRoles": {
      "playStore": "https://play.google.com/store/apps/details?id=..."
    }
  }
}
```

The site fetches this on page load. Empty strings (`""`) leave the link as `#`. When `projects.deepbound.steam` is filled, the "Coming Soon" badge on the DeepBound card is automatically removed.

### 4. Images

The following images are referenced in `index.html` but not included in the repo (add them to the `images/` folder):

| File | Used in |
|------|---------|
| `images/hero-bg.jpg` | Hero section background |
| `images/deepbound.jpg` | DeepBound project card |
| `images/shadow-of-roles.jpg` | Shadow of Roles project card |
| `images/founder.jpg` | About / founder section |

## Deployment

Pushes to `main` are automatically deployed via GitHub Pages. The custom domain is configured in `CNAME`.

## Projects featured

- **DeepBound** — 2D modular sandbox engine built in C# (In Development · [Steam Wishlist](#))
- **Shadow of Roles** — Turn-based social deduction RPG ([Google Play](#))
