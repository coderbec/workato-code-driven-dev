# 🚀 Push to GitHub

This guide explains how to create a private GitHub repository and push this project.

## Option A: Using GitHub CLI (Recommended)

### Prerequisites
- [GitHub CLI](https://cli.github.com/) installed (`gh --version`)
- GitHub account with permission to create repositories

### Steps

```bash
# 1. Authenticate with GitHub (one-time)
gh auth login
# Follow prompts:
# - Which account? (GitHub.com)
# - What is your preferred protocol? (HTTPS)
# - Authenticate Git with your GitHub credentials? (Y)

# 2. Create private repository
gh repo create workato-code-driven-dev \
  --private \
  --source=. \
  --remote=origin \
  --push
```

Output:
```
✅ Created repository your-username/workato-code-driven-dev
✅ Pushed commits to https://github.com/your-username/workato-code-driven-dev.git
```

Done! 🎉

---

## Option B: Manual Push (Using Git)

### Steps

1. **Create empty private repository on GitHub**
   - Go to https://github.com/new
   - Name: `workato-code-driven-dev`
   - Description: "Code-driven Workato development with MCP, Terraform, and Azure"
   - **Privacy**: Select **Private**
   - Do NOT initialize with README (we already have one)
   - Click **Create repository**

2. **Add remote and push**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/workato-code-driven-dev.git
   git branch -M main
   git push -u origin main
   ```

3. **Verify**
   - Go to your repo on GitHub
   - Should show all files and commits

---

## Post-Push Configuration

### 1. Add GitHub Secrets (For CI/CD)

Go to your GitHub repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret Name | Value | Where to Get |
|---|---|---|
| `WORKATO_API_TOKEN` | Your API token | Workspace Admin > API clients |
| `WORKATO_WORKSPACE_ID` | Your workspace ID | From app.workato.com URL |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription | `az account show` |
| `AZURE_TENANT_ID` | Azure tenant ID | From service principal |
| `AZURE_CLIENT_ID` | Service principal ID | From service principal |
| `AZURE_CLIENT_SECRET` | Service principal secret | From service principal |

### 2. Setup Branch Protection (Optional but Recommended)

To prevent accidental pushes:

1. Go to **Settings** → **Branches**
2. Add rule for `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Include administrators
3. Save

### 3. Enable GitHub Actions

1. Go to **Actions**
2. Review workflows:
   - `lint.yml` — Validates recipes on PR
   - `sync.yml` — Manual sync trigger
   - `terraform.yml` — Plans Terraform changes
3. Workflows are ready to use

### 4. Add Collaborators (Team)

If working as a team:

1. Go to **Settings** → **Collaborators and teams**
2. Click **Add people**
3. Search for team members
4. Select role: **Write** (for contributors) or **Admin** (for leads)

---

## Verify Setup

```bash
# Check remote
git remote -v
# Should show: origin https://github.com/YOUR-USERNAME/workato-code-driven-dev.git

# Check branch
git branch
# Should show: * main

# Check commits synced
git log --oneline -5
```

---

## Next Steps

1. **Clone on another machine**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/workato-code-driven-dev.git
   cd workato-code-driven-dev
   npm install
   node scripts/setup.js
   ```

2. **Start developing**:
   ```bash
   cp .env.example .env
   # Add your API token
   npm run wk:pull
   ```

3. **Share with team**:
   - Send repo URL to team members
   - Ensure they have GitHub access
   - They follow the setup instructions above

---

## Troubleshooting

### "gh repo create" fails
```bash
# Ensure authenticated
gh auth status

# Try again
gh auth login
```

### "Git push fails"
```bash
# Verify remote
git remote -v

# Try with explicit credentials
git push -u origin main
```

### "Secrets not showing in Actions"
- Ensure you're in the private repository
- Check that GitHub Actions is enabled
- Wait 5 minutes for changes to propagate

---

## Security Checklist

Before sharing the repo:

- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded secrets in repository
- [ ] GitHub Secrets are configured
- [ ] Repository is set to **Private**
- [ ] Only needed team members have access
- [ ] Branch protection is enabled on `main`

---

Done! Your project is now ready for team collaboration. 🎉
