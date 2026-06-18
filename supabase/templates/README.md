# OET Coach — sign-in email (Supabase + Resend)

Magic-link emails are sent by **Supabase Auth** via **Resend SMTP** (`noreply@nika-oet.fun`, sender name **Nika**).

**Full setup:** [docs/07-IMPLEMENTATION/15-domain-email-ionos-aws-resend.md](../../docs/07-IMPLEMENTATION/15-domain-email-ionos-aws-resend.md)  
**Auth email checklist:** [docs/07-IMPLEMENTATION/12-auth-email-resend-setup.md](../../docs/07-IMPLEMENTATION/12-auth-email-resend-setup.md)

## Hosted project

1. Verify `nika-oet.fun` in [Resend](https://resend.com/domains) + IONOS DNS
2. [Supabase → SMTP](https://supabase.com/dashboard/project/fdbxisjilainlbsgdbry/auth/smtp) — enable + Resend credentials (`noreply@nika-oet.fun`, name `Nika`)
3. [Email Templates → Magic Link](https://supabase.com/dashboard/project/fdbxisjilainlbsgdbry/auth/templates) — paste `magic_link.html`
4. Set `NEXT_PUBLIC_AUTH_EMAIL_DELIVERY=branded` in `apps/web/.env.local` and redeploy

## Apply template (PowerShell, after SMTP enabled)

```powershell
cd "D:\Nika-AI"
$env:SUPABASE_PROJECT_REF = "fdbxisjilainlbsgdbry"
$env:SUPABASE_ACCESS_TOKEN = "sbp_your_token"
node scripts/apply-supabase-magic-link-template.mjs
```

If you see **400 free tier / default email provider**, enable Custom SMTP first.

## Local Supabase CLI

`supabase/config.toml` references `magic_link.html`. Restart: `supabase stop && supabase start`

## Support footer

All `noreply@` templates must direct users to **support@nika-oet.fun** — included in `magic_link.html`.

## Study reminder templates

See [docs/07-IMPLEMENTATION/16-study-reminder-emails.md](../../docs/07-IMPLEMENTATION/16-study-reminder-emails.md):

- `study_reminder.html` — daily plan nudge
- `study_streak.html` — streak at risk
- `weekly_progress.html` — weekly summary
