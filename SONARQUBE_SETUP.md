# SonarQube Setup

This repository is configured to run SonarQube analysis in GitHub Actions and locally.

## Files Added

- `sonar-project.properties`
- `.github/workflows/sonarqube.yml`
- `package.json` script: `npm run sonar`

## 1) SonarQube Project

Create a project in your SonarQube instance with this project key:

- `awsAmplify_doc_vault`

If you use a different key, update `sonar.projectKey` in `sonar-project.properties`.

## 2) GitHub Repository Settings

In your GitHub repo settings, add:

- **Secret**: `SONAR_TOKEN`
  - Value: a SonarQube user token with permission to analyze this project.
- **Variable**: `SONAR_HOST_URL`
  - Value: your SonarQube URL (example: `https://sonarqube.example.com`).

Optional (for private/internal certificates):

- **Secret**: `SONAR_ROOT_CERT`
  - Value: PEM certificate content.

## 3) Workflow Behavior

Workflow file: `.github/workflows/sonarqube.yml`

- Runs on pull requests (`opened`, `synchronize`, `reopened`)
- Runs on pushes to `main` and `master`
- Performs scan and waits for Quality Gate result
- Fails the workflow when Quality Gate fails

## 4) Local Scan

Run from repository root:

```bash
SONAR_HOST_URL="https://sonarqube.example.com" SONAR_TOKEN="your_token" npm run sonar
```

## 5) Scope and Exclusions

Configured in `sonar-project.properties`:

- Sources: `server.js`, `server-with-presigned-urls.js`, `public/`
- Excluded: `node_modules/**`, `.agent/**`, `.scannerwork/**`, `coverage/**`, `**/*.min.js`
