# Security Issues Found

## 1. Hardcoded Secrets (Critical)

### Session Secret
In `app-no-server.js` line 17:
```javascript
secret: process.env.SESSION_SECRET || 'your-session-secret-here',
```

In `README.md` line 103:
```
SESSION_SECRET=your_session_secret_here_change_this_for_production
```

### JWT Secret
In `README.md` line 101:
```
JWT_SECRET=your_jwt_secret_here_change_this_for_production
```

**Risk**: These hardcoded secrets can be easily discovered and used to forge sessions or JWT tokens, leading to unauthorized access.

**Fix**: 
1. Generate strong random secrets for production
2. Store secrets in environment variables only
3. Never commit secrets to version control
4. Remove the hardcoded fallback values

## 2. XSS Vulnerabilities (Medium)

### innerHTML Usage
Multiple files use `innerHTML` which can be dangerous if user input is involved:

- `views/addjobs.handlebars` - Multiple instances of `row.innerHTML = ...`
- `views/view.handlebars` - `btn.innerHTML = ...`
- `views/viewjobs.handlebars` - Several instances including `tempDiv.innerHTML = html;` and `reportContent.innerHTML = html;`

**Risk**: If any of these innerHTML assignments involve user input (even indirectly), it could lead to XSS attacks.

**Fix**:
1. Audit all `innerHTML` usages to ensure no user input is involved
2. Consider using `textContent` when appropriate
3. If inserting HTML is necessary, sanitize the content with a library like DOMPurify

## 3. Input Validation (Low)

While most routes have good input validation, it's worth noting that the application relies heavily on parameterized queries and input sanitization, which is good practice.

## 4. CSRF Protection (Good)

The application has implemented proper CSRF protection with:
- Token generation and storage in sessions
- Token validation on state-changing requests
- Proper token inclusion in forms

## 5. SQL Injection (None Found)

The application uses parameterized queries consistently, which protects against SQL injection attacks.

## Recommendations

1. **Immediate**: Remove all hardcoded secrets and ensure they're only loaded from environment variables
2. **Review**: Audit all `innerHTML` usages to ensure no user data is being inserted without sanitization
3. **Best Practice**: Add a security linting tool to prevent hardcoded secrets in the future
4. **Documentation**: Update README to emphasize that secrets must be changed for production