# SubjectLab

**Stop dumping crap into people's inboxes.**

**メールボックスにクソを放り込むな。**

[English](#english) | [日本語](#japanese)

**[Try it live → ysnotksk.github.io/subject-lab](https://ysnotksk.github.io/subject-lab/)**

<p align="center">
  <img src="docs/images/screenshot.png" alt="SubjectLab screenshot" width="800" />
</p>

---

<!-- ═══════════════════════════════════════════════════════ -->
<!-- ENGLISH                                                -->
<!-- ═══════════════════════════════════════════════════════ -->

<h2 id="english">English</h2>

## What is SubjectLab?

SubjectLab is a visual testing tool for email subject lines. Instead of scoring your subject line with a number, it puts it back into the context where it actually lives — the inbox. See how your email competes against realistic industry-specific competitors across devices, dark/light modes, and lock screen notifications.

> **Design philosophy** — For the thinking behind SubjectLab — why simulation over scoring, the cognitive triage model, Saussurean linguistics applied to the inbox, and more — read the full article on Substack:
> [Stop Dumping Crap Into People's Inboxes](https://takisaka.substack.com/p/stop-dumping-crap-into-peoples-inboxes)

---

## Features

| Feature | Description |
|---------|-------------|
| **Inbox Simulator** | Your email mixed into 9 industry-specific competitors with position control |
| **Device Frames** | Inbox simulator wraps emails in realistic iPhone / Android / browser frames |
| **3-Second Challenge** | Timed paradigmatic test: find your email before time runs out |
| **Lock Screen Preview** | Pixel-accurate iPhone and Android notification rendering |
| **Device Previews** | Word-level truncation across 7 clients: iPhone Mail, iPhone Gmail, Android Gmail, Mac Mail, Gmail Desktop, Outlook Desktop (responsive layout switching) |
| **Linguistic Analysis** | Auto-detection of syntagmatic redundancy and paradigmatic similarity |
| **Candidate Comparison** | Test up to 5 subject line variants side by side |
| **Sender Icon Upload** | Upload an avatar image for your sender |
| **Dark Mode** | Inbox simulator dark / light toggle |
| **Image Export** | PNG download or clipboard copy for sharing |
| **AI Analysis** | Optional: OpenAI / Anthropic / Gemini (BYOK) |
| **AI Export** | PNG image or Markdown download of analysis results |
| **Bilingual** | Full Japanese / English, switchable in real time |
| **Pre-send Checklist** | 7 items covering truncation, syntagmatic integrity, and paradigmatic contrast |

---

<!-- ═══════════════════════════════════════════════════════ -->
<!-- 日本語                                                  -->
<!-- ═══════════════════════════════════════════════════════ -->

<h2 id="japanese">日本語</h2>

## SubjectLabとは？

SubjectLabはメール件名の視覚テストツールです。件名にスコアを付けるのではなく、件名が実際に存在する文脈——受信トレイそのもの——に戻します。業界別のリアルな競合メールの中で、デバイス・ダークモード/ライトモード・ロック画面通知を横断して、自分のメールがどう競合するかを確認できます。

> **設計思想** — SubjectLabの背景にある思想——スコアリングではなく視覚シミュレーションを選んだ理由、認知トリアージモデル、ソシュール言語学の受信トレイへの適用など——はSubstackの記事をご覧ください：
> （日本語版は準備中です）

---

## 機能一覧

| 機能 | 説明 |
|------|------|
| **受信トレイシミュレーター** | 業界別の競合メール9通に混ぜて表示。位置制御スライダー付き |
| **デバイスフレーム** | 受信トレイシミュレーターがメールをリアルなiPhone / Android / ブラウザフレームで表示 |
| **3秒チャレンジ** | 範列的テスト：制限時間内に自分のメールを発見 |
| **ロック画面プレビュー** | iPhone/Androidのロック画面通知をピクセル精度で再現 |
| **デバイス別プレビュー** | 7クライアントでの語レベル切り詰め：iPhone Mail、iPhone Gmail、Android Gmail、Mac Mail、Gmail Desktop、Outlook Desktop（レスポンシブレイアウト切替） |
| **言語構造分析** | 連辞的冗長と範列的類似の自動検出 |
| **候補比較** | 最大5件の件名バリエーションを並行テスト |
| **送信者アイコンアップロード** | 送信者のアバター画像をアップロード |
| **ダークモード** | 受信トレイシミュレーターのダーク/ライト切替 |
| **画像エクスポート** | PNGダウンロードまたはクリップボードコピーで共有 |
| **AI分析** | オプション：OpenAI / Anthropic / Gemini（BYOK） |
| **AIエクスポート** | 分析結果のPNG画像またはMarkdownダウンロード |
| **バイリンガル** | 日本語/英語の完全対応、リアルタイム切替 |
| **送信前チェックリスト** | 切り詰め・連辞的整合性・範列的対比をカバーする7項目 |

---

<!-- ═══════════════════════════════════════════════════════ -->
<!-- Shared / 共通                                          -->
<!-- ═══════════════════════════════════════════════════════ -->

## Getting Started / はじめに

```bash
git clone https://github.com/ysnotksk/subject-lab.git
cd subject-lab
npm install
npm run dev
```

Open `http://localhost:5173` — no API keys needed for core features.

APIキー不要でコア機能が動作します。`http://localhost:5173` を開いてください。

> **Live demo vs. local**: The [GitHub Pages version](https://ysnotksk.github.io/subject-lab/) includes all core features but does not include AI analysis. To use AI-powered analysis (OpenAI / Anthropic / Gemini), clone the repo and run locally — bring your own API key. If there's enough demand, we'll publish the AI-enabled version on GitHub Pages as well.
>
> **ライブデモ vs. ローカル**: [GitHub Pages版](https://ysnotksk.github.io/subject-lab/)は全コア機能を搭載していますが、AI分析は含まれていません。AI分析（OpenAI / Anthropic / Gemini）を使うには、リポジトリをクローンしてローカルで実行してください——APIキーは各自でご用意ください。リクエストが多ければ、AI対応版もGitHub Pagesで公開予定です。
>
> <details>
> <summary><strong>Q: Is my API key safe? / APIキーの送信は安全？</strong></summary>
>
> **Yes. Your API key never leaves your browser.** SubjectLab is a fully static, client-side application — there is no backend server. API calls to OpenAI / Anthropic / Gemini are made directly from your browser to the provider's API endpoint. Your key is stored only in your browser's local storage and is never transmitted to us or any third party. You can verify this yourself: the [source code is fully open](https://github.com/ysnotksk/subject-lab).
>
> **はい、安全です。APIキーはブラウザの外に出ません。** SubjectLabは完全に静的なクライアントサイドアプリケーションであり、バックエンドサーバーは存在しません。OpenAI / Anthropic / GeminiへのAPI呼び出しは、ブラウザから各プロバイダーのAPIエンドポイントに直接行われます。キーはブラウザのローカルストレージにのみ保存され、私たちや第三者に送信されることはありません。[ソースコードは完全に公開](https://github.com/ysnotksk/subject-lab)されていますので、ご自身で確認できます。
>
> </details>

---

## Architecture / アーキテクチャ

```
React 18 + Vite 6
├── constants/     — Design tokens, device specs (7 clients), industry email pools, checklists
├── utils/         — Linguistic analysis (tokenizer, syntagmatic/paradigmatic), storage
├── components/
│   ├── common/    — SectionHeader, Card, SmallButton, ExportButtons, DeviceFrame
│   ├── sidebar/   — InputPanel (with icon upload), CandidatesPanel, Checklist
│   └── main/      — InboxSimulator (with device frames + width control),
│                    FindTest, NotificationPreview, DevicePreview,
│                    LinguisticAnalysis, AIPanel (drawer)
└── Dependencies: react, react-dom, html-to-image
```

Modular component architecture. No state management library. No CSS framework. Inline styles with design token constants.

モジュラーコンポーネントアーキテクチャ。状態管理ライブラリなし。CSSフレームワークなし。デザイントークン定数によるインラインスタイル。

---

## Design System / デザインシステム

**Editorial Precision** aesthetic: stone-based neutrals, single teal accent. [DM Sans](https://fonts.google.com/specimen/DM+Sans) (body) + [Newsreader](https://fonts.google.com/specimen/Newsreader) (display). No emoji in chrome. No decorative gradients. Professional tool, not AI demo.

**Editorial Precision**スタイル：ストーン系ニュートラル、ティール単色アクセント。DM Sans（本文）＋Newsreader（見出し）。クロームに絵文字なし。装飾グラデーションなし。プロフェッショナルツール、AIデモではない。

---

## Impact & Support

### Has SubjectLab improved your KPIs?

If SubjectLab helped you improve your email open rates, click-through rates, or notification engagement — **I want to hear about it**. Your results validate the approach and help prioritize what to build next.

SubjectLabがメールの開封率、クリック率、通知エンゲージメントの改善に役立ったなら——**ぜひ教えてください**。あなたの成果がこのアプローチを検証し、次に何を作るかの優先順位付けを助けます。

**Share your results / 成果を共有してください:**

- **GitHub Discussions** — Post in the [Success Stories](https://github.com/ysnotksk/subject-lab/discussions/categories/success-stories) category
- **LinkedIn** — [linkedin.com/in/ysnotksk](https://linkedin.com/in/ysnotksk)

### Support this project / プロジェクトを支援する

SubjectLab is free and open source. If it has delivered value to your business, consider supporting its continued development.

SubjectLabは無料でオープンソースです。ビジネスに価値を提供したなら、継続的な開発の支援を検討してください。

- **Sponsor on GitHub** — [github.com/sponsors/ysnotksk](https://github.com/sponsors/ysnotksk)
- **Contribute code** — Issues and PRs are always welcome

Even a short message — "We used SubjectLab and our open rate went from 18% to 24%" — means more than you think.

「SubjectLabを使って開封率が18%から24%に上がりました」——短いメッセージでも、あなたが思う以上に大きな意味を持ちます。

---

## Contributing / コントリビューション

Issues and PRs welcome. If you're an email marketer with opinions about what realistic inbox competition looks like in your industry, I especially want to hear from you — the quality of the simulation depends on the quality of the dummy email data.

IssueとPRを歓迎します。メールマーケターの方で、自分の業界のリアルな受信トレイ競争がどういうものか意見がある方——特に歓迎します。シミュレーションの品質はダミーメールデータの品質に依存するので。

---

## Roadmap

- [ ] Expand dummy email pools: 12 → 18 per industry (repeat probability 75% → 50%)
- [ ] Embed similar-pattern email pairs in each pool
- [ ] Before/after comparison mode
- [ ] Push notification simulation (beyond email)
- [ ] Cross-channel notification comparison
- [ ] GitHub Pages deployment (AI-free public version)

---

## Contact / 連絡先

Built by [Yoshinao Takisaka](https://github.com/ysnotksk) — a product-minded marketing engineer exploring the intersection of linguistics, marketing technology, and user experience.

[Yoshinao Takisaka](https://github.com/ysnotksk) が制作。言語学、マーケティングテクノロジー、ユーザー体験の交差点を探求する、プロダクト志向のマーケティングエンジニア。

- [GitHub](https://github.com/ysnotksk)
- [LinkedIn](https://linkedin.com/in/ysnotksk)
- [GitHub Discussions](https://github.com/ysnotksk/subject-lab/discussions) — Questions, feedback, and feature requests

I'm open to new opportunities. If you're building something where product thinking, linguistic intelligence, and frontend craft matter — let's connect.

新しい機会を探しています。プロダクト思考、言語学的知性、フロントエンドクラフトが重要なものを作っているなら——ご連絡ください。

---

## License

MIT
