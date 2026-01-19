# Online PR Review

**Domain:** [https://onlineprreview.com](https://onlineprreview.com)

Online PR Review is a lightweight, browser‑based tool that generates **AI‑assisted pull request reviews** for:

* GitHub
* GitLab
* Azure DevOps

The application uses the **Google Gemini API** to analyze pull requests and generate review comments, which you can **review, edit, select, and approve manually before posting**.

> **No data is stored.** All processing happens only during the active browser session.

---

## 🚀 Key Features

* ✅ Supports **GitHub, GitLab, and Azure DevOps PRs**
* ✅ AI‑generated PR review comments using **Gemini API**
* ✅ **Manual approval required before submission**
* ✅ Ability to **edit AI suggestions** before posting
* ✅ Select which comments to publish
* ✅ Works entirely in the **browser session**
* ✅ **No backend database**
* ✅ **No PR data is stored or logged**
* ✅ **No keys saved**

---

## 🔒 Privacy & Security

Online PR Review is designed with privacy as a core principle.

* ❌ No databases
* ❌ No persistent storage
* ❌ No cookies for PR data
* ❌ No server‑side retention

All information exists **only in memory during your browser session** and is destroyed when the tab is closed or refreshed.

---

## 🧠 How It Works

1. You authenticate with your Git provider (GitHub, GitLab, or Azure DevOps)
2. Select a pull request
3. The tool fetches the PR diff and metadata
4. Gemini API generates review suggestions
5. You:

   * Review the comments
   * Edit any suggestion
   * Remove comments you do not want
6. Only the comments you approve are submitted back to the PR

The tool never auto‑posts comments without your confirmation.

---

## 🧩 Supported Platforms

| Platform     | Status      |
| ------------ | ----------- |
| GitHub       | ✅ Supported |
| GitLab       | ✅ Supported |
| Azure DevOps | ✅ Supported |

---

## ⚙️ Configuration

### Gemini API Key

You must provide your own **Google Gemini API key**.

The API key is:

* Stored only in browser memory
* Never persisted
* Never sent anywhere except directly to Gemini

Example:

```
GEMINI_API_KEY=your_api_key_here
```

---

## 🖥️ Local Development

### Prerequisites

* Node.js 18+
* npm or yarn

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📦 Build

```bash
npm run build
```

---

## 🧪 Limitations

* AI suggestions may not always be correct
* Final responsibility remains with the reviewer
* Requires active internet connection
* Depends on Gemini API availability

---

## ⚠️ Disclaimer

This tool is intended to **assist** developers — not replace human code review.

All generated content should be reviewed carefully before submission.

---

## 🌐 Live Version

👉 [https://onlineprreview.com](https://onlineprreview.com)

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

MIT License

---

## ⭐ Support

If you find this project useful, consider giving it a star on GitHub.

---

## 📬 Feedback

Issues, feature requests, and improvements are welcome via GitHub Issues.

---

**Online PR Review — Faster reviews. Full control. Zero data retention.**
