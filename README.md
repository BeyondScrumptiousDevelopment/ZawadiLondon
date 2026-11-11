# Zawadi London — website

*Made from moments… Made to cherish…*

The Zawadi London website, built from the Zawadi London brand kit (Zawadi Green `#023624` and white, Cormorant Garamond, square edges) using the product photos and videos from Google Drive.

- **Pages:** Home · Shop · Product (one page for every product) · How It Works · Our Story · Contact
- **Interactive bits:** looping product videos, scroll reveals, a scroll-lit "Your Moment. Your Story. Your ZAWADI." statement, the live **Picture yours** frame preview (choose a photo and frame colour, type a name and date), a lightbox gallery, an FAQ, and a contact form.
- **Products come from Sanity:** edited in Sanity Studio, with photos on Sanity's image CDN (see below).
- **Live Instagram feed:** "See our recent work" shows the latest @zawadildn posts through a Cloudflare Pages Function. Until it's connected, it shows the four brand posts.
- **Link page** for the Instagram bio: `/links` (e.g. https://zawadildn.pages.dev/links), with Etsy, Instagram and email.
- **Orders** go to Etsy: https://zawadilondon.etsy.com

```
public/                 ← the website (this folder is what gets deployed)
  index.html, shop.html, product.html, how-it-works.html, our-story.html, contact.html
  content/sanity.json   ← your Sanity project ID
  content/products.json ← starter products (used until Sanity is set up)
  assets/css, assets/js, assets/img, assets/video
  _headers, _redirects  ← Cloudflare caching + redirects
functions/api/instagram.js ← Cloudflare Pages Function for the Instagram feed
studio/                 ← Sanity Studio (product and collection editor)
```

---

## 1. Deploy to Cloudflare Pages

The site is live as the Pages project **zawadildn** (https://zawadildn.pages.dev).

1. **Workers & Pages → Create → Pages → Connect to Git** and pick this repo.
2. Settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | *leave empty* |
| Build output directory | `public` (also set in `wrangler.toml`, which takes priority) |
| Root directory | *leave empty* |

3. **Save and Deploy**, then add your domain under **Custom domains**.

`wrangler.toml` tells Cloudflare to serve the `public/` folder, whatever the dashboard says. Its `name` must match the Pages project name (`zawadildn`). There's no build step: Cloudflare finds `functions/` on its own and runs `/api/instagram`. Every push to `main` redeploys, and other branches get preview links.

## 2. Edit products (Sanity)

Products, prices, photos and collections are edited in **Sanity Studio**, a free editing app hosted by Sanity. Photos you upload are served from Sanity's image CDN and resized automatically for each screen. Until Sanity is set up, the site shows the starter products in `public/content/products.json`.

### One-time setup (about 10 minutes)

1. **Create a free Sanity project.** Go to https://www.sanity.io/manage, sign in (Google is fine), click **Create new project**, name it *Zawadi London*, and keep the **production** dataset (public). Copy the **Project ID** (8 characters, e.g. `abc123xy`).
2. **Add the Project ID to the site.** On GitHub, open `public/content/sanity.json`, click the pencil, put the ID in `"projectId"`, and commit to `main`.
3. **Run the setup once** on a computer with Node.js 22 or newer:

```bash
git clone https://github.com/BeyondScrumptiousDevelopment/ZawadiLondon.git
```

```bash
cd ZawadiLondon/studio && npm install && npm run setup
```

   `npm run setup` logs you in to Sanity in your browser, allows the website to read your products, imports the nine starter products with their photos and video, and publishes the Studio to **https://zawadilondon.sanity.studio**. If you add a custom domain later, allow it too: `npx sanity cors add https://yourdomain.com --no-credentials`.

### Everyday editing

1. Open **https://zawadilondon.sanity.studio** and sign in.
2. **Add a product:** *All products* → **+** → fill in the name, click **Generate** for the web address, then set the price, collection, photos and details.
3. **Hide a product:** open it → *Settings* → untick **Show on the website**. **Remove it:** ⋯ menu → Delete.
4. **Collections** (e.g. *The Christmas Collection*): set the intro, the **Order-by date** (shows a banner when filled in) and the **Making time**. Untick **Feature on the home page** after Christmas.
5. Click **Publish**. The live site shows the change within about a minute. There's no redeploy.

Products without a photo show a green Z Ldn tile until you add one. Every product links to Etsy for buying, using its **Etsy link** field.

## 3. Connect the live Instagram feed

The feed needs an access token from Instagram's official API (the old "Basic Display" API was switched off in December 2024).

1. In the Instagram app, switch **@zawadildn** to a **Professional account** (Creator or Business). It's free.
2. Go to **developers.facebook.com → My Apps → Create app**, choose the *Business* type, and add the **Instagram** product.
3. Under **Instagram → API setup with Instagram login**, add @zawadildn and click **Generate token**. This gives you a long-lived token (valid for 60 days).
4. In Cloudflare: **your Pages project → Settings → Variables and Secrets → Add** (on a Worker: **Settings → Variables and Secrets**)
   - Name: `INSTAGRAM_TOKEN` · Type: **Secret** · Value: the token
5. *(Recommended, so the token never expires)* **Workers & Pages → KV → Create namespace** (e.g. `zawadi-instagram`). Then go to **Pages project → Settings → Bindings → Add → KV namespace**, with variable name `IG_KV`. The function then refreshes the token every 7 days on its own.
6. Redeploy (**Deployments → … → Retry deployment**). Open `https://<your-site>/api/instagram` and you should see your posts as JSON.

Posts are cached for an hour. If the token is missing or Instagram is down, the site quietly shows the four brand posts instead.

## 4. Contact form

The enquiry form opens the visitor's email app with the message filled in, addressed to zawadildn@gmail.com. Nothing needs setting up. If you'd rather receive enquiries without the email app opening, the form can be pointed at a service like Formspree or a Cloudflare Function later.

## Preview locally

```bash
cd public && python3 -m http.server 8000
```

Then open http://localhost:8000. The Instagram feed only works on Cloudflare; locally it shows the brand posts.

## Brand notes

- Two colours only: green `#023624` and white. `#1C3428` is for the small sign-off only. The gold on the frame preview is only there to show the real foil lettering.
- One typeface: Cormorant Garamond (Light, Regular, Light Italic).
- Logos are in `public/assets/img/brand/`. They're taken from the brand kit, so never retype them.
- Voice: warm, quiet, personal. British spelling, no exclamation marks.
