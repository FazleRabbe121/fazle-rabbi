ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS drink_color text;
ALTER TABLE public.recipes ALTER COLUMN user_id SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "Admins delete recipes" ON public.recipes;
DROP POLICY IF EXISTS "Admins insert recipes" ON public.recipes;
DROP POLICY IF EXISTS "Admins read recipes" ON public.recipes;
DROP POLICY IF EXISTS "Admins update recipes" ON public.recipes;
CREATE POLICY "Users read own recipes" ON public.recipes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own recipes" ON public.recipes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own recipes" ON public.recipes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own recipes" ON public.recipes FOR DELETE TO authenticated USING (user_id = auth.uid());

GRANT SELECT ON public.categories TO authenticated;
CREATE POLICY "Signed-in users read categories" ON public.categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins read recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete recipe images" ON storage.objects;
CREATE POLICY "Users read own recipe images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'recipe-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users upload own recipe images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'recipe-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own recipe images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'recipe-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own recipe images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'recipe-images' AND (storage.foldername(name))[1] = auth.uid()::text);