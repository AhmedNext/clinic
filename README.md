# Patient Cases Tracker

A clean, minimal, self-contained Next.js dashboard built for personal patient case tracking. Ready to push to GitHub and deploy to Vercel with zero external database configuration.

## Features

- **Home Dashboard & Navigation Tabs**: Seamlessly switch between **Patients** cases and the **Appointments** full-month calendar.
- **Appointments Full Month Calendar**: A full interactive monthly calendar where doctors can see scheduled patient visits for any month (with month navigation and quick "Today" jump). Clicking on any day opens a booking dialog where doctors can record **Patient Name**, **Phone Number**, **Time Slot**, **Reason/Procedure**, and notes. Appointments persist directly in local storage.
- **Interactive 3D Dental Chart (Human Dentition) with Multi-Teeth Selection**: Realistic 3D anatomical odontogram displaying all 32 permanent teeth matching the standard FDI notation (Upper Jaw 18–11 & 21–28, Lower Jaw 48–41 & 31–38). Doctors can select multiple teeth simultaneously (or click presets: *Upper Jaw*, *Lower Jaw*, *All 32*), batch-apply treatments (**Treated**, **Filling**, **Root Canal**, **Crown**, **Extraction**, **Decay**), write tooth notes, and track completed clinical dental work.
- **Patient History & Visit Timeline**: View a comprehensive chronological history timeline for each patient, including visit dates, clinical observations, treatments, and visit financial records. Quickly log new follow-up visits directly into their history.
- **Pre-existing Medical History**: Record chronic conditions, allergies, and surgical background per patient with alert banners.
- **Payment & Debt Tracking (Iraqi Dinar / IQD)**: Track **Total Fee**, **Paid Amount**, and **Unpaid Debt / Balance** exclusively in **Iraqi Dinar (IQD)** with dynamic calculation, quick settlement presets ("Full Paid", "Unpaid Debt"), and financial summary metrics.
- **Distinct SVG Avatars**: Clear, custom SVG icons and badges indicating **Male (♂)** and **Female (♀)** patients with tailored color themes.
- **Quick Add & Edit Modals**: Fast dialogs to add or update patients (Name, Gender, Date, Fees, Paid, Debts, and Clinical Notes) with instant feedback.
- **Financial Filter & Overview**: Filter cases instantly by **Paid** or **Debts**; view total collected and outstanding debts in the stats overview.
- **Local Persistence**: Stores cases directly in `localStorage` so changes persist across sessions without requiring external databases or API keys.
- **Theme Modes**: Full **Dark / Light mode** toggle with system preference detection and smooth transitions.
- **Search & Filters**: Search in real-time by patient name or clinical notes; filter by gender (All, Male, Female).
- **Dual View Modes**: Switch between **Table View** and **Card / Grid View**.
- **Self-Contained & Vercel-Ready**: Built with Next.js App Router and Tailwind CSS. No SEO crawlers, external databases, or auth required.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

## Build & Deployment

To verify the production build:

```bash
npm run build
```

### Deploying to Vercel

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "Initial patient cases dashboard"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository and click **Deploy**. No additional environment variables are required!
