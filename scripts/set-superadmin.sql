-- Kendi hesabınızı SuperAdmin yapın
UPDATE identity.users SET role = 3 WHERE email = 'ayberk123@gmail.com';

-- Doğrulama
SELECT id, email, role FROM identity.users WHERE email = 'ayberk123@gmail.com';
