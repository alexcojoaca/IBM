-- Make your account admin (run in Supabase → SQL Editor)
-- Replace the email with the one you use on the site

update public.profiles
set role = 'admin'
where lower(email) = lower('PUT_YOUR_EMAIL_HERE');

-- Confirm it worked:
select id, email, role from public.profiles order by created_at;
