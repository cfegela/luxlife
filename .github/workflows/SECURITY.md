# Security Scanning

This project includes automated security scanning using Trivy and Semgrep.

## Security Tools

### 1. Trivy (Vulnerability Scanner)
**What it scans:**
- Filesystem vulnerabilities (dependencies, libraries)
- Docker image vulnerabilities (OS packages, app dependencies)
- Detects: CVEs, misconfigurations, exposed secrets

**When it runs:**
- On every push/PR to backend or frontend code
- Filesystem scan: Runs in parallel with tests
- Image scan: Runs after Docker build (main branch only)

**Severity levels:**
- Reports: CRITICAL and HIGH severity issues
- Results: Uploaded to GitHub Security tab

**Configuration:**
- Location: `.github/workflows/backend.yml` and `frontend.yml`
- Format: SARIF (for GitHub Security integration)
- Scan types: `fs` (filesystem) and `image` (container)

### 2. Semgrep (SAST - Static Application Security Testing)
**What it scans:**
- JavaScript/TypeScript code
- HTML/CSS files
- Common security patterns and vulnerabilities

**When it runs:**
- On every push/PR to backend or frontend code
- Runs in parallel with tests for fast feedback

**What it finds:**
- SQL injection
- XSS vulnerabilities
- Hard-coded secrets
- Insecure dependencies
- Code quality issues
- Best practice violations

**Configuration:**
- Location: `.github/workflows/backend.yml` and `frontend.yml`
- Ruleset: `auto` (Semgrep's recommended rules)
- Format: SARIF (for GitHub Security integration)

## Viewing Security Results

### GitHub Security Tab
1. Navigate to your repository
2. Click **Security** tab
3. Click **Code scanning** (left sidebar)
4. View findings from:
   - Semgrep (static code analysis)
   - Trivy filesystem scans
   - Trivy image scans

### Pull Request Annotations
Security findings appear as:
- Comments on the PR
- Annotations in the "Files changed" view
- Status checks that must pass

### Workflow Logs
Detailed scan results available in:
- Actions → Select workflow run
- Click on Semgrep or Trivy job
- View detailed logs and findings

## Security Scan Results

Each scan produces SARIF files uploaded to GitHub:

| Scanner | Category | Scan Target | Frequency |
|---------|----------|-------------|-----------|
| Semgrep | `semgrep` | Source code | Every push/PR |
| Trivy | `trivy-fs-backend` | Backend filesystem | Every push/PR |
| Trivy | `trivy-fs-frontend` | Frontend filesystem | Every push/PR |
| Trivy | `trivy-image-backend` | Backend Docker image | Push to main |
| Trivy | `trivy-image-frontend` | Frontend Docker image | Push to main |

## Handling Security Findings

### Critical/High Severity
1. Review the finding in GitHub Security tab
2. Click on the alert for details
3. Review recommended fixes
4. Create an issue or fix immediately
5. Re-run security scans to verify fix

### False Positives
If a finding is a false positive:

**Semgrep:**
```yaml
# Add to .semgrep.yml in repository root
rules:
  - id: rule-to-ignore
    paths:
      exclude:
        - "path/to/file.js"
```

**Trivy:**
```yaml
# Add to .trivyignore in repository root
CVE-2021-12345
```

### Dismissing Alerts
In GitHub Security tab:
1. Click on the alert
2. Click "Dismiss alert"
3. Select reason (false positive, won't fix, used in tests)
4. Add comment explaining decision

## Customizing Security Scans

### Add More Semgrep Rules
Create `.semgrep.yml`:
```yaml
rules:
  - id: custom-rule
    pattern: |
      dangerous_function(...)
    message: Avoid using dangerous_function
    severity: WARNING
    languages: [javascript]
```

### Adjust Trivy Severity
Edit workflow files to change severity levels:
```yaml
- name: Run Trivy
  uses: aquasecurity/trivy-action@master
  with:
    severity: 'CRITICAL,HIGH,MEDIUM'  # Add MEDIUM
```

### Add Secret Scanning
Trivy can scan for secrets:
```yaml
- name: Run Trivy secret scan
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scanners: 'secret'
```

## Security Best Practices

### Dependency Management
- ✅ Dependabot enabled (automatic updates)
- ✅ Trivy scans dependencies for CVEs
- ✅ Regular updates via automated PRs

### Container Security
- ✅ Minimal base images (Alpine Linux)
- ✅ Multi-stage builds
- ✅ Image scanning with Trivy
- ✅ Regular base image updates

### Code Security
- ✅ Semgrep SAST scanning
- ✅ No hard-coded secrets
- ✅ Input validation
- ✅ Parameterized SQL queries

### CI/CD Security
- ✅ Security scans before deployment
- ✅ Docker builds only on main branch
- ✅ Branch protection enabled
- ✅ Required security checks

## Monitoring and Alerts

### Email Notifications
GitHub sends emails for:
- New security vulnerabilities found
- Dependabot alerts
- Security scanning failures

### Slack/Discord Integration
Add webhook to get alerts in Slack/Discord:
1. Settings → Webhooks → Add webhook
2. Configure for security events
3. Select: Code scanning alerts, Dependabot alerts

## Compliance

### SARIF Format
All scans use SARIF (Static Analysis Results Interchange Format):
- Industry standard
- Compatible with many tools
- Integrated with GitHub Security

### Audit Trail
- All scans logged in Actions
- Results archived in Security tab
- Historical trend tracking available
- Compliance reports available

## Resources

- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Semgrep Documentation](https://semgrep.dev/docs/)
- [GitHub Code Scanning](https://docs.github.com/en/code-security/code-scanning)
- [SARIF Format](https://sarifweb.azurewebsites.net/)

## Support

For security issues:
1. Create a private security advisory
2. Navigate to: Security → Advisories → New draft
3. Provide details and we'll respond ASAP
