# Zawadi London — website

*Made from moments… Made to cherish…*

The Zawadi London website, built from the Zawadi London brand kit (Zawadi Green `#023624` and white, Cormorant Garamond, square edges) using the product photos and videos from Google Drive.

- **Pages:** Home · Shop · Product (one page for every product) · How It Works · Our Story · Contact
- **Interactive bits:** looping product videos, scroll reveals, a scroll-lit "Your Moment. Your Story. Your ZAWADI." statement, the live **Picture yours** frame preview (choose a photo and frame colour, type a name and date), a lightbox gallery, an FAQ, and a contact form.
- **Products come from Etsy:** the site shows the live Etsy listings, photos and prices (see below).
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
functions/api/etsy.js   ← Cloudflare Pages Function that reads the Etsy listings
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

## 2. Products come straight from Etsy

The site reads the shop's **live Etsy listings** through Etsy's official API: titles, prices, photos, descriptions, personalisation limits and shop sections. Add, edit or remove a listing on Etsy and the website follows within an hour. Every product links to its own Etsy listing to buy.

### One-time setup (about 5 minutes)

1. Signed in to Etsy as the shop owner, go to **https://www.etsy.com/developers/your-apps** → **Create a New App**.
   - Name: *Zawadi London website*. Description: *Shows my own listings on my website*.
   - Users: *Just myself or colleagues*. Commercial: *No*.
2. Copy the app's **Keystring** and **Shared secret**. New apps can take a little while to be approved.
3. In Cloudflare: **Workers & Pages → zawadildn → Settings → Variables and Secrets → Add**, as type **Secret**:
   - `ETSY_API_KEY` = the Keystring
   - `ETSY_SHARED_SECRET` = the Shared secret
4. **Deployments → Retry deployment.** Then open https://zawadildn.pages.dev/api/etsy. You should see your listings.

### How Etsy maps to the website

| On Etsy | On the website |
| --- | --- |
| Listing title (the part before the first comma) | Product name |
| Price, photos (in your order) | Price, photos |
| First paragraph of the description | Description; its first sentence is the one-line summary |
| Bullet points in the description (•, -, ★) | Details list |
| Personalisation: character limit and instructions | Name limit and personalisation note |
| **Shop section** (e.g. *Christmas Collection*) | Collection on the Shop page |
| **Featured** (starred) listings | "Our pieces" on the home page |
| Titles containing "frame" | Get the live "Picture yours" preview |

The Christmas intro and **order-by date** aren't on Etsy, so they stay in `public/content/products.json` (the `collections` section). They're matched to any Etsy section whose name contains "christmas". The site has no products of its own: until the Etsy key is added, or if Etsy can't be reached, the Shop shows a link to the Etsy shop and the home page hides its product sections.

Etsy's API terms ask sites that use it to show a short notice, so the footer adds one automatically while products come from Etsy.

## 2b. Optional: Sanity


*Not needed if products come from Etsy.* As an alternative, products, prices, photos and collections can be edited in **Sanity Studio**, a free editing app hosted by Sanity. Photos you upload are served from Sanity's image CDN and resized automatically for each screen. Until Sanity is set up, the site shows the starter products in `public/content/products.json`.

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
