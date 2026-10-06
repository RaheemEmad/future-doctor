INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'raheem.amer22@gmail.com'
ON CONFLICT DO NOTHING;
DELETE FROM public.payment_claims WHERE first_name = 'Test' AND last_name = 'User' AND phone = '01000000000';