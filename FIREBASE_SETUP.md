# SMARTIE Quote Desk V7 — setup and deployment

Your Firebase project already works. This covers what changed in V7 and what
you must do to bring it live.

**Project:** `smartie-quote-desk`
**Service-worker cache:** `smartie-quote-desk-v8a`

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

**Finalising.** A number is spent only when you press **Finalise quotation**, or
download a PDF and confirm. Drafts, edits and previews cost nothing.
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
| `stock/{group\|model}` | any active member | q, min, t, by, byUid |
| `purchase/{id}` | any active member | qty, urgency, status, received, rcvQty, stocked |
| `customers/{id}` | staff create and update; admin deletes | name, contact, phone, email, gstin, city, address, notes |
| `quotations/{id}` | staff create; admin may only mark cancelled | no, party, lines, tier, totals, byUid, at |
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
