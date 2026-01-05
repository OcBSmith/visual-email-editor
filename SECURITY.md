# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes              |

## Reporting a Vulnerability

If you discover a security vulnerability in Visual Email Editor, please:

1. **DO NOT** open a public issue.
2. Send an email to [your-email@example.com] with:
   - Detailed description of the vulnerability.
   - Steps to reproduce it.
   - Potential impact.
   - Any suggestions for a fix.

### What to Expect

- **Confirmation**: You will receive a response within 48 hours.
- **Evaluation**: We will evaluate the vulnerability within 7 days.
- **Solution**: We will work on a solution as soon as possible.
- **Recognition**: If you wish, we will mention you in the credits.

## Security Best Practices

### For Users

1. **Groq API Key**: 
   - Never share your API key.
   - It is stored locally in Thunderbird.
   - It is not sent to any server except Groq.

2. **Templates**:
   - Templates are saved locally.
   - They are not synchronized with any external service.

### For Developers

1. **Dependencies**:
   - Third-party libraries (GrapesJS, MJML) are included in stable versions.
   - Check for security updates periodically.

2. **Code**:
   - We do not execute arbitrary code.
   - Generated HTML is sanitized before insertion.

## Scope

This policy covers:
- The add-on source code.
- Included dependencies.
- Integration with the Groq API.

It does not cover:
- Vulnerabilities in Thunderbird.
- Vulnerabilities in the Groq API.
- Misuse of API keys by the user.
