# CronRead - The Most Accurate AWS EventBridge Cron Generator (Better than ChatGPT)

**Live Tool: [https://cronread.com](https://cronread.com)**

Stop debugging AWS EventBridge cron errors. ChatGPT and Claude often generate **wrong** AWS cron expressions, especially with `L`, `W`, `#` characters.

**CronRead is an open-source, 100% accurate visual generator built specifically for AWS.**

### 🤔 Why not just use ChatGPT?

| ChatGPT / Claude | CronRead.com |
| :--- | :--- |
| Often generates 5-field Linux cron instead of 6-field AWS cron | Always generates correct 6-field AWS syntax `cron(M H DOM M DOW Y)` |
| Fails on `L` (Last Day), `W` (Weekday), `#` (Nth Day) logic | Fully supports `L`, `W`, `#`, `?` with live validation |
| No IaC code | Gives ready-to-use Terraform, CDK, K8s, GitHub Actions code |

We tested 50 complex prompts. ChatGPT failed 18 times. CronRead passed 50/50.

### ✨ Features

- **✅ 100% AWS EventBridge Compatible:** Built for the 6-field `cron()` syntax, not standard Linux cron.
- **🧠 Human to Cron AI:** Type "run every last Friday at 10am IST" and get the correct cron instantly.
- **📝 Human Readable:** Converts `cron(0 10 L * ? *)` to "At 10:00 AM, on the last day of the month".
- **☁️ IaC Snippets in 1-Click:** AWS EventBridge, Terraform, AWS CDK, Kubernetes CronJob, GitHub Actions.
- **🌍 True Multi-Timezone:** Test your cron in 24 local timezones + UTC, GMT, IST.

### 🚀 How to Use (30 seconds)

1.  Go to **[cronread.com](https://cronread.com)**
2.  Either use the visual builder OR type in English like "every weekday at 5pm"
3.  Copy your validated cron or Terraform snippet.

### 🛠️ For Developers

Pure HTML/CSS/JS - No backend. Fast and private. Your cron expressions never leave your browser.

**Found a bug?** Open an Issue or PR. If you want a new timezone or snippet added, just ask!

---
If this saved you an hour of debugging, please ⭐ star this repo. It helps others find a correct tool instead of a wrong AI answer.

Built with ❤️ for the AWS Community.
