# Abacus Customer Portal

Next.js 14 (App Router) + TypeScript + Tailwind starter for the Abacus customer portal.

## Prerequisites

- Node.js 18+ and npm installed locally
- A Firebase project (Auth, Firestore, Storage) configured

## Install dependencies

```bash
cd "/Users/ellisharper/Desktop/Websites/Customer Portal Test"
npm install
```

## Run the dev server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Build for production

```bash
npm run build
npm start
```

Configure Firebase keys using environment variables in `.env.local` (to be added when wiring Firebase).

## Firebase configuration

Create a `.env.local` file in the project root with your Firebase project details:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

The portal uses Firebase Authentication (email/password), Firestore, and Storage. User profiles are stored in the `users` collection with a `companyId` and `role` field; all portal data is scoped by `companyId`.

## Zapier integration design

All integration with Payacca happens via Zapier — the portal only talks to Firebase.

- **Zap 1 – Support tickets → Payacca**  
	Trigger: New `supportTickets` document where `zapSynced = false`.  
	Actions: Create job/ticket in Payacca, then update the Firestore document to set `zapSynced = true` (using a Zapier connection with `zapier: true` custom claim or service account).

- **Zap 2 – Referrals → Payacca**  
	Trigger: New `referrals` document where `zapSynced = false`.  
	Actions: Create a lead in Payacca, then update the Firestore document to set `zapSynced = true`.

- **Zap 3 – Bookings sync from Payacca**  
	Trigger: New or updated booking in Payacca.  
	Action: Upsert the corresponding document in the Firestore `bookings` collection for the correct `companyId`.

- **Zap 4 – Correspondence log**  
	Trigger: Email sent to a client from Payacca or your email system.  
	Action: Insert a document into the `correspondence` collection for the relevant `companyId`.

Zapier (or backend processes) should authenticate with Firestore using a service account or custom token with `zapier: true` in its claims, so that it can update `zapSynced` and system-owned fields while end users cannot.
