# Project Requirements & Tech Stack

> **AI ARCHITECT NOTE**: This is the source of truth for the project. Before writing code, fill this document out based on the user's idea and obtain approval.

## 1. Overview

- **Project Name**: SubjectLab
- **Core Concept**: A web application for email marketers to visually test and optimize email subject lines before A/B testing. Simulates how subjects appear across devices, inboxes, and notification screens, with linguistic analysis for redundancy and differentiation.
- **Target Audience**: Email marketers (Japanese and English), email marketing consultants, PR/CRM professionals managing email campaigns.

## 2. Tech Stack

- **Frontend**: React 18 (JSX, Hooks) + Vite 6
- **Styling**: Inline styles with design token constants (no CSS framework)
- **Image Export**: html-to-image (PNG download + clipboard copy)
- **AI Integration**: Optional external LLM API calls (OpenAI / Anthropic) via fetch
- **Data Persistence**: None (session-only, client-side)
- **Build Tool**: Vite with @vitejs/plugin-react

## 3. Key Features

- **Inbox Simulator**: Industry-specific inbox simulation with position slider (EC, SaaS, Media, Finance)
- **3-Second Challenge**: Timed test to find your email among competitors
- **Lock Screen Preview**: iPhone and Android notification previews
- **5-Device Preview**: Subject line truncation analysis across iPhone Mail, iPhone Gmail, Android Gmail, Gmail Desktop, Outlook Desktop
- **Linguistic Analysis**: Syntagmatic redundancy detection (sender-subject overlap), paradigmatic similarity detection (competing email pattern matching), preview text overlap analysis
- **AI Analysis**: Optional GPT/Claude-powered subject line critique and alternatives (requires user's own API key)
- **Image Export**: PNG download and clipboard copy for all preview panels
- **Bilingual UI**: Full Japanese/English toggle

## 4. Development Phases & Roadmap

### Phase 1: MVP (Complete)
- [x] Initialize project with Vite + React
- [x] Decompose monolithic prototype into modular components
- [x] All core features functional: inbox sim, 3s challenge, lock screen, device preview, linguistic analysis, AI panel
- [x] Image export (PNG + clipboard)
- [x] Bilingual UI (JA/EN)

### Phase 2: Enhancements
- [ ] Unit tests for linguistic analysis utilities
- [ ] Accessibility improvements
- [ ] Mobile-responsive layout (if needed)

## 5. Security Requirements
- [x] No secrets committed (API keys entered by user at runtime, never stored)
- [x] Input validation: subject line character counting
- [x] No server-side components or data persistence
