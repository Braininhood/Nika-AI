# OET Coach — sign-in email (Supabase)

Magic-link emails are sent by **Supabase Auth**. Branded templates require **Custom SMTP** on the free tier.

**Full checklist (deferred):** [docs/07-IMPLEMENTATION/12-auth-email-resend-setup.md](../../docs/07-IMPLEMENTATION/12-auth-email-resend-setup.md)

Quick reference below for when you enable Resend.

## Hosted project

1. [Supabase → SMTP](https://supabase.com/dashboard/project/fdbxisjilainlbsgdbry/auth/smtp) — enable + Resend credentials
2. [Email Templates → Magic Link](https://supabase.com/dashboard/project/fdbxisjilainlbsgdbry/auth/templates) — paste `magic_link.html`
3. Set `NEXT_PUBLIC_AUTH_EMAIL_DELIVERY=branded` in `apps/web/.env.local` and redeploy

## Apply template (PowerShell, after SMTP enabled)

```powershell
cd "D:\Nika-AI"
$env:SUPABASE_ACCESS_TOKEN = "sbp_your_token"
node scripts/apply-supabase-magic-link-template.mjs
```

If you see **400 free tier / default email provider**, enable Custom SMTP first (step 1 above).

## Local Supabase CLI

`supabase/config.toml` references `magic_link.html`. Restart: `supabase stop && supabase start`

## Free tier note

Generic **“Supabase Auth”** sender is normal until Custom SMTP is configured. Google sign-in on `/login` works without email branding.
