# ENCG Academic Management & Student Assistant (PFE)

## Overview
A centralized academic information platform designed to eliminate schedule fragmentation, delayed announcements, and room allocation confusion for Moroccan business and management faculties.

* **Target Institution:** École Nationale de Commerce et de Gestion (ENCG)
* **Cohort:** 2ème Année (Sections S1, S2, S3)
* **Core Value:** Automates timetable extraction from administrative matrices into an inverted, student-centric agenda with real-time push alerts for room changes and session cancellations.

## Architecture
* **Mobile Client:** Flutter (Android-first)
* **Cloud Database & Auth:** Supabase (PostgreSQL 15 with Row-Level Security)
* **Push Notifications:** Firebase Cloud Messaging (FCM)
* **Automated CI/CD:** GitHub Actions (cloud compilation of Android APKs)
