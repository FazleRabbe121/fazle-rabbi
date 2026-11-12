DROP POLICY IF EXISTS "Signed-in users read categories" ON public.categories;
CREATE POLICY "Signed-in users read categories" ON public.categories FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can send a message" ON public.contact_messages;
CREATE POLICY "Anyone can send a message" ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 120
  AND char_length(email) BETWEEN 3 AND 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (phone IS NULL OR char_length(phone) <= 40)
  AND (organisation IS NULL OR char_length(organisation) <= 160)
  AND char_length(enquiry_type) BETWEEN 1 AND 60
  AND char_length(btrim(message)) BETWEEN 1 AND 5000
  AND (event_venue IS NULL OR char_length(event_venue) <= 200)
  AND (guest_count IS NULL OR guest_count BETWEEN 1 AND 100000)
);