# SMARTIE Quote Desk — setup and deployment

Your Firebase project already works. This covers what you must do to bring the
current build live, followed by the history of every earlier release.

**Project:** `smartie-quote-desk`
**Current version:** V8C3
**Service-worker cache:** `smartie-quote-desk-v8c3`

## V8C3 — one-time Google sign-in setup

Before opening V8C3 for the team:

1. Firebase Console → **Authentication** → **Sign-in method**.
2. Enable **Google**, choose the support email, and save.
3. Authentication → **Settings** → **Authorized domains**: confirm the GitHub Pages domain (and any custom domain) is listed.
4. Upload every V8C3 file to GitHub, not only `index.html`.
5. Publish the included rules:

   `firebase.cmd deploy --only firestore:rules --project smartie-quote-desk`

The first Google login for `khan4mudassir1980@gmail.com` becomes the protected original **Owner / Administrator**. Every other new or previously removed Google account starts as an active **Worker**. Disabled profiles remain disabled. Owners and Administrators can then assign permitted roles from Team → People.

V8C3 also adds a shared 15-product pinned shelf, protected two-owner model, active/disabled People grouping, compact activity history, and card-level stock drafts (`+ / −`, then `Done`).

---

## V8C2 — what you must do

V8C2 keeps all existing products, prices, users, stock, purchases, parties and
quotations. It adds the Worker role, server-enforced role permissions, compact
team management, stock notes/quick controls and the redesigned quotation PDF.

### 1. Publish the V8C2 rules

From PowerShell opened inside this extracted folder:

```powershell
firebase.cmd deploy --only firestore:rules --project smartie-quote-desk
```

The rules add `worker` access and protect Products, prices, quotations, parties,
stock changes and administration on the server. They also add an immutable
`teamAudit` log. No existing collection is deleted or renamed.

`firestore.indexes.json` now contains only the three composite indexes Firebase
actually needs. The two unnecessary single-field entries that previously caused
HTTP 400 have been removed. If your three composite indexes are already live,
you do not need to deploy indexes again.

### 2. Upload the V8C2 files

Replace the repository files with the contents of this ZIP and commit them.
The cache name changed to `smartie-quote-desk-v8c2`, so phones will receive the
new build through the normal **Update available** flow.

---

## V8B2 — earlier release instructions

Two things, and only two. Everything else is already in the ZIP.

### 1. Publish the updated rules and indexes

**Neither V8B1 nor V8B2 changes `firestore.rules` or
`firestore.indexes.json`. If you have already published the V8B versions,
there is nothing to deploy again — skip to step 2.**

Coming straight from V8A, publish them now. V8B added one new collection,
`stockMoves`, which holds the stock movement ledger; until the rules are
published every stock movement is refused. Nothing existing is renamed or
removed, so all your current data keeps working exactly as it does today.

From a terminal in the folder that holds `firebase.json`:

```
firebase login
firebase use smartie-quote-desk
firebase deploy --only firestore:rules,firestore:indexes
```

Or, without the CLI: Firebase console -> **Firestore Database** -> **Rules**,
paste the whole of `firestore.rules`, **Publish**. Then **Indexes** ->
**Composite** and add the four listed in `firestore.indexes.json`.

**Both must be deployed once, on the way from V8A.** Rules, because
`stockMoves` is refused without them and because stock corrections are
admin-only server-side. Indexes, because the movement ledger and the
party-filtered history are ordered queries. Going from V8B or V8B1 to V8B2
needs neither — the files are unchanged.

### 2. Upload the files and let each phone update

Replace every file in the repository with the contents of this ZIP and commit.
`sw.js` is bumped to `smartie-quote-desk-v8b2`, so each phone shows
**Update available — Refresh** the next time it is opened. A phone with an
unfinished quotation on screen is asked to confirm before it reloads; the draft
is kept either way.

Nothing else is required. No migration, no re-initialisation, no data reset.
Your products, prices, categories, users, stock figures, purchase requirements,
parties, quotations and the quotation counter are all left exactly as they are.

---

## Deployment checklist

In order. Steps 1 and 2 must happen before anyone signs in, or you will see
permission errors.

### 1. Publish the updated Firestore rules

V7 adds four collections — `products`, `customers`, `quotations` and an
extended `teamSettings`. The V6 rules do not mention them, so every write is
refused until you update.

1. Firebase console -> **Firestore Database** -> **Rules**
2. Delete everything in the box
3. Paste the whole of **`firestore.rules`** from this folder
4. Press **Publish**

### 2. Add your GitHub Pages domain to Authorized Domains

Firebase refuses sign-in from a domain it does not know. Without this you get
`auth/unauthorized-domain`.

1. Console -> **Authentication** -> **Settings** -> **Authorized domains**
2. **Add domain**
3. Enter exactly: `khan4mudassir1980-dot.github.io`
4. Save. `localhost` is already allowed for testing.

### 3. Upload the V7 files to GitHub

Replace every file in the repository with the contents of this ZIP. Three are
new: `firebase.json`, `firestore.indexes.json`, and an updated
`firestore.rules`. They are configuration, harmless to host, and useful to keep
beside the code.

**Add file -> Upload files**, drag everything in, wait for all uploads to
finish, then **Commit changes**.

### 4. Update the installed app on each phone

`sw.js` is bumped to `v7`, so phones pick it up on next open and offer a
**Reload**. If one is stubborn, close it fully and reopen, or clear the site
data in Chrome settings.

### 5. Initialise the shared catalogue — once

Sign in as administrator, open **Products**, press **Initialise shared
catalogue**.

It writes only products Firestore does not already hold, so running it twice
does nothing the second time, and it never overwrites a product you have since
edited. After this, Firestore is the source of truth; the copy inside
`index.html` is only a starting point.

### 6. Initialise numbering — administrator, once

Before anyone issues a quotation, the administrator must open **Settings** and
press **Save shared settings** once. That creates `teamSettings/numbering` with
the prefix, financial year, next number and padding.

Staff cannot create it — the rules only let an administrator do that. If a member
of staff tries to finalise first, they are told plainly that an administrator has
to set numbering up. Do this before handing the app to the team.

### 7. Settle the flagged prices

Products shows an amber badge with a count. Press **Review prices**. Each row
shows the figures that disagree and you pick one. Nothing was guessed for you.

---

## What is new in V7

**Products tab.** Search by model, name, description or category. Filter by
category, or list only products missing a price. Add, edit, archive, delete.
Each product carries model, name, description, category, unit, GST rate, active
flag and three prices. Staff can search and view; only admins change anything.

**Prices that are genuinely unknown stay unknown.** A missing price is stored as
`null` and shows as **Price not set** — never zero. Add such a product to a
quotation and the app asks you for a rate rather than quietly using nothing. The
rules enforce it too: a price must be a number of zero or more, or absent.

**Rate switch inside the quotation.** Dealer / Contractor / Client in the panel,
synchronised with the header. Catalogue lines reprice; manual items and any rate
you typed over are left exactly as they are.

**Issuing a quotation.** There is no separate Finalise button. A number is spent
only when you download the PDF, print, or copy the quotation for WhatsApp and
confirm. Drafts and edits cost nothing.
Re-downloading keeps the same number. With Firebase selected the number comes
from a Firestore transaction and there is **deliberately no local fallback** —
if the counter cannot be reached, nothing is issued. That is the only way to
guarantee two people never receive the same number.

**Quotation history.** Every finalised quotation is saved with party details,
lines, rate type, totals and author. Search by number, party, phone or city;
filter by rate type and date. Re-download the PDF with the original number, or
duplicate it into a new draft — the copy takes a new number only when it is
itself finalised.

**Customers.** A shared directory, saved automatically on finalising or added by
hand. Likely duplicates are caught on GSTIN first, then phone, then name.
Selecting one fills the quotation.

**Purchase badge.** A red count on the Purchase tab for open requirements, live
across the team, capped at `99+`. An amber badge on Products counts prices
awaiting your decision.

---

## Collections and fields

| Collection | Who writes | Fields |
| --- | --- | --- |
| `users/{uid}` | admin only | name, email, role, active |
| `products/{group_model}` | admin only | model, name, spec, group, unit, gst, dealer, contractor, client (nullable), active |
| `stock/{group\|model}` | staff may move stock in and out and set a reorder level; only an admin corrects a figure or stops tracking | q, min, t, lastAction, by, byUid, serverAt |
| `stockMoves/{id}` | any active member creates; nobody edits or deletes | id, key, group, model, name, action, prev, delta, next, min, note, by, byUid, at, serverAt |
| `purchase/{id}` | any active member | qty, urgency, status, received, rcvQty, stocked |
| `customers/{id}` | staff create and update; admin edits archived ones and deletes | id, name, type, contact, phone, email, gstin, city, address, notes, archived, byUid, serverAt |
| `quotations/{id}` | staff create; admin may only mark cancelled | no, party, partyId, lines, tier, gst, gstPct, subtotal, total, snap, byUid, at, serverAt |
| `teamSettings/numbering` | staff may only take the next number; admin sets prefix and year | prefix, fy, next, pad, lastIssued |

Document ids are generated. A quotation number contains `/`, which a Firestore
id cannot, so the number is stored as the `no` **field** and the document gets
its own id.

---

## Verifying it works

**Admin and staff.** Sign in as staff on a second device. Products should be
read-only — no Add, no Edit, no Initialise. Stock, purchase and quotations
should all work.

**Real-time sync.** Change a stock figure on one phone and watch the other. Add
a purchase requirement on one and watch the badge rise on the other.

**Two simultaneous finalisations.** Have two people press Finalise at the same
moment. They must get different numbers. This is the single most important thing
to test.

**Offline.** Turn off data. Quoting, editing and PDF still work. Finalising
should refuse with a clear message rather than issuing a number that could
clash.

---

## Limits worth knowing

**Spark plan.** Everything here runs on the free tier — no Cloud Functions, no
build step, no server. Functions would only add server-side enforcement of
things the rules cannot express, none of which you need at this size.

**The catalogue is in the public repository.** You accepted this. Anyone who
finds the address can read `index.html` and see your dealer prices. After
initialisation, edits live in Firestore behind the rules, but the seed stays
visible. If that changes, move the seed out and import from a private file.

**App Check** is the sensible next step if you ever want to stop unknown
programs reaching the project. Not urgent for internal use.


---

## Patch notes — V7b

**Settings tab.** Company name, address, GSTIN, PAN, phone, email, website,
bank, UPI, logo and payment QR, quotation prefix, financial year, next number,
default GST, default rate type, validity, and the terms and notes. Admins edit;
active staff can read. Everything here appears on the PDF, the print sheet and
the WhatsApp copy immediately. Device settings (text size, default category
state, cache) and account controls (change password, sign out, backup, import,
clear local quotations) sit in the same place. The old Rates tab is gone — its
numbering and wording controls moved here.

**Numbering is now closed.** The quotation number field is read-only and there
is no way to type over it. Finalise, Download PDF, Print and Copy for WhatsApp
all pass through one gate, so no route issues a number by a different path. The
history record is written to Firestore *before* success is reported. Admin
changes to prefix, year or next number go to `teamSettings/numbering` in a
transaction and reach every device. The rules refuse a counter that moves
backwards within the same financial year.

**Products are genuinely Firestore-backed.** Delete removes the document.
Renaming keys on the original seed model, so no orphan is left behind, and a
category move deletes the old document and writes the new one. Description and
price-conflict decisions sync, and a decision made on one device stays resolved
everywhere. Initialisation status is read from Firestore, not a local flag. An
explicitly empty price is stored as empty and is never refilled from the seed.

**Customers in the quotation panel.** Company, contact, phone, email, GSTIN,
city and address, with a searchable list of saved parties. Selecting one fills
every field; finalising saves or updates the party without ever blanking a
detail already held. Staff may add and use customers; only an admin may edit,
archive or delete an existing one — enforced in the UI and in the rules.

**Purchase.** A Cancelled status was added. Received and cancelled requirements
drop out of the open list and stop counting on the badge.

Republish `firestore.rules` after this update — the products, customers and
numbering rules all changed.


---

## Patch notes — V7c

**Print no longer crashes.** `buildPrint()` was reading `FIRM` above the line
that created it, which throws before anything renders. It is now set at the top
of the function.

**WhatsApp totals are correct.** The copy was summing a `.amt` property that
normalised lines no longer carry, which produced wrong figures — and it left
transportation out entirely. It now uses the same `subtotal()` as the panel, the
PDF and the print sheet, so all four always agree.

**GST is a real setting.** One pair of helpers, `gstPercent()` and `gstRate()`,
drive the panel, the totals, the PDF, the print sheet, the WhatsApp copy and the
saved record. Set 12% and 12% appears everywhere. A finalised quotation stores
the percentage it was issued under, and re-downloading an old one uses **its**
rate, not today's.

**Finalising is atomic.** The number and the quotation record are now written in
a single Firestore transaction: the document id is decided first, then one
transaction reads the counter, checks the financial year, works out the number,
increments the counter, sets `lastIssued` and writes the quotation. Only after it
commits is the quotation marked finalised. If it fails, nothing is consumed,
nothing says "Finalised", and your work stays an editable draft.

**Numbering rules rewritten.** The old block had a broad `allow update, create,
delete: if admin()` sitting beside the narrow numbering rule. Firestore ORs its
allow statements, so that one line cancelled every safeguard. `teamSettings` is
now three separate, non-overlapping matches. Staff may only take exactly the next
number and must stamp their own uid on `lastIssued`. An admin may change prefix,
year and padding, but within the same year the counter can never move backwards.
The counter cannot be deleted.

**Terms and notes are genuinely shared.** They save into `teamSettings/company`,
apply on every signed-in device through the listener, and drive the PDF, print
and WhatsApp output. Standard wording remains the fallback.

**Financial-year prompt** points at Settings, not the Prices tab that no longer
exists.

**Default rate type** applies when the app loads with an empty draft and when you
press New quotation. It never changes a draft that already has lines, and never
changes an old quotation being viewed or re-downloaded.

**Full party details** — company, contact, phone, email, address, city and GSTIN
— now appear on the PDF, the print sheet and the WhatsApp copy. Empty fields are
left out rather than printed blank.

Republish `firestore.rules` with this update. The `teamSettings` rules changed
substantially and the old ones will not permit the atomic transaction.


---

## Patch notes — V7d

**Old quotations print their own details.** Re-downloading from History used to
restore only the client, site and GSTIN, so the contact, phone, email and address
came from whatever draft happened to be open. All seven party fields are now
restored, and every field on screen is put back afterwards.

**Zero per cent GST works.** `Number(x.gstPct) || 18` turned a legitimate 0% into
18%, because zero is falsy. A finite-number check now accepts zero everywhere —
the history label, the re-download, and any reconstruction. A genuinely missing
value on an older record still falls back to 18%.

**The first quotation no longer fails.** The transaction used to `set()` the
numbering document and then `update()` the same document in one pass, which
Firestore refuses when the document did not exist at read time. It now prepares
the complete final state and makes exactly one write — `update()` if the counter
exists, `set()` if it does not. Staff attempting the very first quotation get a
clear message asking for an administrator to run step 6 above.

**Retrying after a dropped connection is safe.** A draft keeps one stable id
until it is finalised. The transaction reads the quotation document as well as
the counter, so if a commit went through but the reply was lost, a retry finds
the existing record and returns its number instead of taking a second one. A new
id is generated only when a genuinely new quotation is started.

**Historical quotations keep their wording.** Each finalised record now stores
the company block, bank details, terms, notes, validity and GST percentage as
they stood on the day. Re-downloading uses that saved text, so changing Settings
later does not rewrite quotations you have already sent. Logo and QR images are
deliberately not copied into every record — the current images are used, which
keeps each document small.


---

## Patch notes — V7e

**Your data now actually persists.** This is the important one. The app was
saving through `window.storage`, which is not a browser API — it does not exist
on GitHub Pages. Every write silently fell back to an in-memory object that is
thrown away the moment the page reloads. In practice that means prices, stock,
purchase requirements and settings have never survived a refresh on the live
site. Anything synced to Firestore was safe; anything local was not.

Storage is now **IndexedDB**, with **localStorage** as a backup if IndexedDB is
refused (private windows, some embedded browsers), and an in-memory copy as the
last resort so a session still behaves. No library, no CDN. Settings shows which
of the three is in use, under **This device**.

Nothing in Firestore is touched by this change. If you had been relying on local
data surviving, assume it did not, and re-enter it once after updating.

**Unfinished quotations survive.** The draft — lines, rate type, GST switch,
transportation, and all seven party fields — is saved as you work and restored
when you reopen the app, with a message offering to start fresh instead. It is
cleared only when the quotation is finalised or when you choose New quotation.
The draft id is kept too, so a retry after a dropped connection still reuses the
same record rather than taking a second number.

**History cannot show a quotation twice.** Finalising used to push the record on
regardless, while the Firestore listener might already have added it. Both paths
now upsert by quotation id.

**A retry returns the whole record.** When the transaction finds the quotation
already exists, it hands back the complete document, not just the number. The
counter is left alone and `lastIssued` is no longer overwritten with nothing.

**Percentage fallback.** An empty string is treated as missing rather than as
zero, because `Number("")` is `0`. A real zero is still a valid 0%.


---

## Patch notes — V8

**Categories.** Products are now shelved by what they are, not by the internal
price group they happened to be filed under. Fourteen categories: sliding, swing,
rolling shutter and high-speed motors, boom barriers, garage doors, glass doors,
kits, accessories, sensors, controllers, hardware, profiles, and services.

A category is **metadata**, laid over the existing product key. A product is
still `group|model`, so stock figures, old quotations and history stay attached
no matter how you re-file it. Admins can rename, reorder, archive and create
categories in Products, and set any product's category when editing it. All of it
syncs through `teamSettings/categories`.

**Catalogue page.** One place with everything: a sticky search across all 403
products, collapsible categories with counts, a recently-used strip, and the four
size calculators grouped at the bottom. The old Motors / Gate hardware / Find a
rate split is gone.

**Navigation.** A five-slot bottom bar on mobile — Catalogue, Stock, Purchase,
Quotation, More — with everything else behind More. The same structure appears as
a row on desktop, so nothing exists in one and not the other. Icons are drawn as
SVG, not emoji.

**Purchase requirements.** The urgency cards are now the only way to set urgency;
the old dropdown that looked like a second control has gone. Filters sit in their
own labelled block that says plainly it only changes what you see, with a Clear
filters button. The catalogue picker is removed — requirements are typed in your
own words. Added by is taken from your signed-in account and cannot be edited.

**Install.** Only in the More drawer, never the header. It remembers being
installed, checks all three display modes plus iOS, and disappears for good once
the app is installed.

**Back to top** appears after scrolling and sits clear of both the quotation bar
and the navigation. Opening a section always starts at the top; going Back returns
you to where you were.

**Products.** The full-width "prices need changing" banner is replaced by a quiet
"Needs review" button with a count.

Nothing was removed: all 403 products, both Firebase and local modes, stock,
purchase history, customers, quotation history, drafts and offline all behave as
before.


---

## Patch notes — V8A

**Republish `firestore.rules`.** The rules now carry an explicit block for
`teamSettings/categories` — active members read it, only an administrator writes
it, and it can never be deleted. Without this, every category change is refused.
The header reads V8A so you can tell which version is published.

**Category sync failures are visible.** They used to be swallowed. If a change
cannot be shared you are told plainly that it saved on this device only, and
staff are told that only an administrator can share category changes.

**Install fixed.** `showInstall()` was still looking for `#btnInstall`, which V8
removed — so the option never appeared. It now targets `#drawInstall` in the More
menu. `INSTALLED_FLAG` was also referenced without ever being declared, which
would have thrown the moment anyone installed. Both are corrected: the flag is
declared, saved after a successful install, and read on every start. Install is
hidden in standalone, fullscreen, minimal-ui and iOS home-screen modes, and shows
only when a real `beforeinstallprompt` is waiting. It never appears in the header.

**Archived categories now behave.** Archiving hides the category and moves its
products to *Other Products / Needs categorisation*, writing each product's new
`categoryId` to Firestore. Product ids, stock keys and past quotations are
untouched, so nothing loses its history. Restoring a category creates no
duplicates — products stay where they were re-filed until you move them back.
Archived categories remain listed in Products administration with a Restore
button.

**Cancelled requirements are separate from received.** Cancelled has been removed
from the active status filter, where it could never match anything. Purchase
history has its own Outcome filter — received and cancelled, received only, or
cancelled only. Cancelling records `cancelledBy` and `cancelledAt`, clears any
received data, and both lists redraw immediately. A cancelled row shows
"not received" rather than inventing a quantity, and reports who cancelled it and
when instead of "Received by unnamed". Reopening a cancelled item works, and
never refunds stock that was never added.

**Duplicates.** A product is a duplicate only when its model number matches, case
and punctuation ignored. Two products with similar descriptions but different
model numbers are two products and are both kept. The catalogue shows each model
once.

**New icons.** All seven regenerated from the blue Q artwork — the gradient Q,
circuit lines, purple corner and central SIE mark, with no text. The maskable
versions carry 22% padding; I measured every ink pixel against Android's circular,
squircle and rounded-square masks and none of them clip. The mark shown in the app
header and on the About screen is the same artwork, so the home screen and the app
match.

---

## Patch notes — V8B

**Deploy rules and indexes.** `firestore.rules` is republished for the new
`stockMoves` collection and for the tightened stock rules;
`firestore.indexes.json` gains three composite indexes. Nothing else in Firebase
changes, and no existing collection is renamed, reset or migrated.

**The mobile quotation panel.** Opening the quotation used to leave the bottom
navigation unreachable and the panel itself half under the bar. The panel and
its backdrop now both stop exactly above the navigation, which stays on top and
clickable the whole time. Tapping another tab closes the quotation and opens
that section — previously the tap was undone a moment later by the history entry
the close had queued, so it looked as though nothing happened. Tapping Quotation
again closes it. Android Back closes the quotation first and leaves you on the
section you were on. The panel scrolls to the top every time it opens, keeps
"Back to products" pinned at the top, freezes the page behind it, and carries
Android safe-area spacing at the bottom. The running-total bar was also sitting
underneath the navigation bar; it now sits above it. `Rate \u20b9` prints as
**Rate ₹**.

**Purple and white.** One palette, defined once: `#6D28D9`, `#4C1D95`,
`#EDE9FE`, background `#F8F7FC`, text `#1F2937` and `#6B7280`. Every orange
button, border, focus ring and active state is purple. The SIE letterhead and
the tricolour rule under the masthead are untouched. Red, amber and green are
kept for what they mean — out of stock, low stock, available, and the three
urgency levels. Product names, prices, dates and quotation numbers are set in
Inter rather than a typewriter face, with tabular figures so columns still line
up. Faded grey text is darkened to `#374151`. Prices read `₹34,650`, and a
product with no price says **Price not set** rather than pretending to be free.

**Fields that were never styled.** `input[type=text]` matches the attribute, not
the default, so every field written as a bare `<input>` — most of Settings, the
party form, the purchase editor — had no width, padding or border. They are all
styled now.

**Catalogue.** "Recently used" is gone. Products are reached through categories
and search only, on twelve shelves: Sliding Gate Motors, Swing Gate Motors,
Shutter Motors, High-Speed Door Motors, Boom Barriers, Garage Door Motors,
Automatic/Glass Door Systems, Gate Motor Accessories, Sensors & Safety Devices,
Control Boards Receivers & Remotes, Gate Hardware, Other Products. The three
retired shelves resolve to their nearest surviving one, so no product loses the
category an administrator filed it on and no product id changes. Cards are
compact: model, short description, price or Price not set, a quantity stepper
and an Add button. Adding a product that is already in the quotation raises its
quantity; it never creates a second line, in the quotation or in stock.

**Quotation lines.** Each line shows name, description, quantity, rate, line
total, a pencil and a remove icon. The pencil opens a proper editor with the
name, description, quantity and rate, and Save and Cancel. It writes to that
quotation line only — the catalogue product keeps its own name and price.
Quantity and rate changes recalculate the line, subtotal, GST and grand total
immediately. Dealer, Contractor and Client switching stays inside the panel and
reprices at once. A product with no price on the current rate type goes in
flagged **Rate needed** and opens its editor, so a missing price is typed in
rather than silently becoming zero. Removing a line asks first, and offers Undo.

**Our Stock.** Total stocked products, low stock and out of stock across the
top. Search, category filter and status filter. Add stock searches the catalogue
and attaches to the product's own id, so nothing is ever duplicated, with a
shortcut to Product management for something genuinely new. Stock in, Stock out
and Edit on every row, with a reorder level and an optional reason. Stock can
never go below zero. Every movement is written to the ledger — previous
quantity, the change, the new quantity, the action, the note, the person's name
and UID, and the server's own timestamp — in the same Firestore transaction as
the quantity itself, so the two can never disagree. Staff move stock in and out
and set reorder levels; correcting a figure outright or stopping tracking is
admin-only, enforced in the rules and not merely by hiding a button. Green,
amber and red mark available, low and out.

**Parties.** Clients, dealers and contractors, with company name, contact
person, phone, GSTIN, email, city and full address. Searchable on all of them.
Likely duplicates are caught on normalised GSTIN, phone and company name, and
you are told which one matched and offered the chance to update the existing
party instead. Each party lists the quotations connected to it. Party ids are
stable, and a finalised quotation keeps its own copy of the details, so editing
a party later never rewrites history. Archive is the ordinary route; only an
administrator deletes.

**Purchase.** Entry is manual, with no catalogue picker. The three urgency cards
are single-select and belong to the Add form alone. The list filters sit in
their own **Filter requirements** block, default to **All urgency**, and can no
longer change what the Add form has selected. The badge counts open
requirements only — received, cancelled and completed are excluded — and the
More menu carries no badge at all. Received, Cancelled, Reopen and Undo all
work, a cancelled requirement never shows as received, and every creation and
status change records the name, the UID and the time. Received and cancelled
entries live on their own Purchase history screen.

**Numbering and history.** Opening or closing a blank draft still costs nothing;
the number is taken only when Finalise is pressed, in a single Firestore
transaction that writes the counter and the quotation together. `SIE/2026-27/003`
is unchanged. A failed finalisation reports the error and leaves the quotation a
draft. Quotation history searches by number, party or site, filters by date,
party, status and rate type, shows the draft you are working on, and offers
View, PDF, Duplicate and — for an administrator — Cancel. A finalised record
holds the full snapshot: number, date, financial year, creator, rate type, party
id and details, site, items, quantities, rates, totals, transportation, GST and
status.

**More and Settings.** The three-line More menu holds Parties, Products
management, Categories management, Quotation history, Purchase history, Stock
movement history, Team, Settings, About & legal, Install app (only when the
browser genuinely offers one) and Sign out. Categories management is its own
screen. Settings adds payment terms, warranty text, a PDF footer note and a
default reorder level, alongside the company details, GSTIN, prefix, financial
year, default GST, default rate type and validity. Values are validated —
company name, prefix shape, financial year, GSTIN, phone, email, GST range and
reorder level — and shared settings stay admin-only.

**The PDF.** The letterhead, the configured company block, quotation number and
date, rate basis, party and site, GSTIN and contact details, then a clean table
with description, quantity, rate and amount. Transportation is shown beside the
subtotal rather than pretending to be a product. Validity, payment terms and
warranty print in their own block, the footer note prints on every page, and the
signature area is unchanged. The table header repeats at the top of every page
the table runs on to; notes and terms fall back to a flowing layout if they are
too tall for one page, so nothing is cut off. Text is darker, the rupee sign is
correct, amounts are in Indian format, and empty optional fields are simply not
printed. Download PDF and Copy for WhatsApp both still work, and the WhatsApp
copy now carries rates, transportation, validity, payment terms and warranty.

**Reliability.** A status chip in the masthead reads Syncing…, Synced, Offline
or Sign-in unavailable. A loading screen covers the first paint. Finalise,
archive, cancel, delete and any direct stock correction ask first. Quantities,
prices, phone numbers and GSTINs are validated, negatives are refused, buttons
that cannot be used are disabled and empty states explain what to do. Modal
forms scroll internally with their Save button pinned, so the keyboard never
buries it. Sections restore their scroll position, and a back-to-top button
appears once you have scrolled.

**PWA.** Cache renamed `smartie-quote-desk-v8b`, older caches removed on
activation. A new upload shows **Update available — Refresh** instead of taking
over on its own, and refuses to reload over an unfinished quotation without
asking. Install appears only when the browser really offers it and never in
standalone mode. Paths stay relative, so the app runs from `/quote-desk/` on
GitHub Pages as well as from a domain root, and the app shell still loads with
no signal. No signed-in user data is cached by the service worker.

---

## Patch notes — V8B1

A repair pass on V8B. No feature is removed or redesigned, and
`firestore.rules` and `firestore.indexes.json` are byte-identical to V8B — if
those are already published, nothing needs deploying again.

**Cancellations now reach every device.** `watchQuotes()` decided a document
had changed by comparing its `at` value. Cancelling a quotation touches only
`status`, `cancelledBy` and `cancelledAt` — never `at` — so to every other
signed-in device the record looked unchanged and the cancellation was dropped.
The listener now works from Firestore's own change list, so any added or
modified quotation is merged whatever changed in it, and the History screen
repaints the moment it arrives. A record that comes back un-cancelled also has
its old `cancelledBy` and `cancelledAt` cleared, rather than keeping a stale
cancellation from the merge.

**A party is saved only when you say so.** Finalising used to quietly write a
party into the Parties list from whatever was typed on the quotation, so
one-off walk-in customers accumulated there. It no longer does. A party joins
the list only when **Save this customer** is pressed or an already-saved party
is chosen. When the details on screen do match a party that is already saved,
the quotation is linked to that party's stable `partyId` — and the link is set
before the record is built, so the id is inside the atomic finalisation
transaction rather than being patched on afterwards. The quotation still keeps
its own full copy of the party details, so editing or renaming the party later
never alters an old quotation. Re-issuing an old PDF from History also restores
the working draft's party link when it finishes.

**V8A stock uploads cleanly.** `fbPushStock()` — the migration path behind
*Upload this device's records to the team* — wrote no `lastAction`, which the
V8B rules require from a member of staff, so an authorised staff upload was
refused. Every upload now carries a valid staff action (`add` for a V8A figure
that has none recorded, and for an admin-only action a staff member is
re-uploading), along with `key`, `byUid` and a server timestamp. Quantities are
clamped at zero on the way up, on the way down from the team, and when a
movement is written, so no path can leave a negative figure — matching what the
rules already enforce.

**Parties deleted elsewhere disappear here.** `watchCustomers()` never noticed a
removed document, so a party an administrator deleted stayed on every other
device until it was reloaded. Removals are handled now, and an archive or a
restore made on another device lands the same way.

**Service worker.** Cache renamed `smartie-quote-desk-v8b1`, so installed
phones are offered the repaired version.

---

## Patch notes — V8B2

One fix. `firestore.rules` and `firestore.indexes.json` are unchanged again, so
nothing needs deploying if the V8B versions are already published.

**A quotation can no longer be linked to the wrong party.** Choosing a saved
party set `state.partyId`, and that id stayed put even if the company name,
GSTIN, phone, city, contact, email or address were then typed over — so a
quotation for one customer could be filed against another. Three things now
keep the link honest:

* Editing any of those seven fields by hand drops the link there and then, and
  saves the draft in that state. Filling the fields from a saved party sets
  their values directly, which fires no input event, so choosing a party still
  links it correctly and a restored draft keeps the link it was saved with.
* **Save this customer** sets the saved party's own id, as before.
* Finalisation works the link out again from what is on the form at that
  moment. The party that was picked keeps the link only while the details still
  identify it; otherwise the matching saved party is used, and if none matches,
  the quotation is filed with no party id at all. A stale id is never carried
  into the record.

The rule for "these details are that party" — GSTIN first, then phone, then
company name — is now written once and used both by the search for a match and
by the check that an existing link still holds, so the two can never disagree.
Nothing else changes: no party is created during finalisation, and the
quotation still keeps its own copy of the party details, so editing the party
later never rewrites an old quotation.

**Service worker.** Cache renamed `smartie-quote-desk-v8b2`.

---

## Patch notes — V8C

* The mobile quotation summary bar is shown only on **Products**; all other
  bottom-navigation sections remain uncluttered.
* **Catalogue** is now labelled **Products** throughout the interface.
* Product and category administration now share one **Products & Categories**
  screen. A category can also be created and selected while adding a product,
  and an empty new category immediately appears on the Products screen.
* Stock can be attached to an existing product or entered manually. Manual
  records retain their name, model, category and unit, and can later be linked
  to a saved product.
* Stock cards show a prominent dark **available** quantity, reorder level,
  category, last update and direct Stock in / Stock out / Edit controls.
* Up to 15 items can be pinned into **Frequently Tracked**, reordered with the
  arrow controls and synced with the team through Firebase.
* The mobile masthead now keeps the full **SMARTIE Quote Desk** name visible.
* The two invalid single-field index declarations were removed; only the three
  required composite indexes remain.
* Service-worker cache renamed `smartie-quote-desk-v8c`.

---

## Patch notes — V8C2

* The app shows a sign-in screen only until a valid team account is active.
* Added **Worker**: Purchase Requirements plus read-only Our Stock. Workers can
  add requirements and edit only their own open requirements; Firestore rules
  enforce the same limits.
* The Owner account `khan4mudassir1980@gmail.com` is protected from demotion,
  switch-off and deletion. Only the Owner can promote another Administrator.
* Team management is compact, searchable and filterable. It uses a role menu,
  account toggle and typed-name confirmation for permanent team-access removal.
* **Data & Sync Settings** is a small collapsed Owner-only panel.
* Stock cards have quick +/− controls, permanent stock notes, Undo after normal
  movements, and a confirmed **Mark out of stock** action that sets the balance
  to zero without allowing a negative quantity.
* Workers see stock quantities and low/out summaries, but no stock-changing,
  pinning or movement-history controls.
* Pinned stock appears once at the top rather than being duplicated below.
* Pinch/double-tap zoom is disabled and mobile form fields stay at 16 px.
* The downloaded quotation PDF now has separate Model/Product and Description
  columns, clearer customer and quotation panels, a stronger totals block,
  amount in words, repeated table headers and a cleaner filename. No PDF preview
  screen was added.
* Service-worker cache renamed `smartie-quote-desk-v8c2`.
