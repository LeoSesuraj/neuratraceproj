-- =========================================================================
-- Fill Margaret B.'s profile with demo content:
--   * profile photo, dementia type, behaviors
--   * 12 weeks of weekly staff surveys (so the 6 / 12 week graph toggles work)
--   * 14 days of mood logs
--   * 10 daily staff notes
--   * a few photo posts
--   * a family <-> staff message thread
--
-- Run in Lovable Cloud > Database > SQL editor. Safe to run repeatedly:
-- it clears the previously seeded demo rows for Margaret first.
-- =========================================================================

DO $$
DECLARE
  v_res     UUID;
  v_staff   UUID;
  v_family  UUID;
  v_author  UUID;
  i         INT;
  d         DATE;
  ratings   TEXT[] := ARRAY['improved','stable','declined'];
  moods     TEXT[] := ARRAY['good','mixed','hard'];
  behav     TEXT[] := ARRAY['none','mild','significant'];
  note_json TEXT;
  activities TEXT[] := ARRAY[
    'Morning walk in the garden, sat in the sun for twenty minutes',
    'Music hour, she hummed along to the old standards',
    'Folded towels with the activity aide, seemed proud of the stack',
    'Watercolor painting, chose blues and greens',
    'Sat with the visiting therapy dog for half an hour',
    'Looked through the photo album with a caregiver',
    'Chair exercises, followed most of the movements',
    'Baking group, helped stir and taste the batter',
    'Quiet afternoon by the window watching the birds',
    'Bingo in the lounge, stayed the whole game'
  ];
  foods TEXT[] := ARRAY[
    'Ate most of breakfast, half of lunch, full dinner',
    'Good appetite today, asked for seconds at lunch',
    'Picked at breakfast, ate well once we sat with her',
    'Drank two full glasses of water, ate a light lunch',
    'Enjoyed the soup, left the sandwich',
    'Finished everything at dinner',
    'Slow start, better appetite in the evening',
    'Ate independently at all three meals',
    'Needed reminders at lunch, ate about half',
    'Loved the fruit cup, skipped the toast'
  ];
  feelings TEXT[] := ARRAY[
    'Calm most of the day, a little restless after dinner',
    'Bright and chatty in the morning',
    'Anxious around 4pm, settled with music',
    'Content, smiled during the walk',
    'Confused at wake-up, eased once routine started',
    'Peaceful, held a caregiver''s hand for a while',
    'Some repetition about going home, redirected gently',
    'Cheerful all afternoon',
    'Tired, napped after lunch',
    'Warm and affectionate with staff'
  ];
BEGIN
  SELECT id INTO v_res FROM public.residents
   WHERE name ILIKE 'Margaret%' ORDER BY created_at LIMIT 1;
  IF v_res IS NULL THEN
    RAISE NOTICE 'Margaret B. not found. Run db/restore-sunrise-facility.sql first.';
    RETURN;
  END IF;

  SELECT id INTO v_staff  FROM auth.users WHERE email = 'staff@neuratrace.demo';
  SELECT id INTO v_family FROM auth.users WHERE email = 'family@neuratrace.demo';
  v_author := COALESCE(v_staff, v_family, (SELECT id FROM auth.users LIMIT 1));

  -- ------------------------------------------------------------ 1. profile
  UPDATE public.residents
     SET photo_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
         dementia_type = COALESCE(dementia_type, 'Alzheimer''s disease')
   WHERE id = v_res;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'residents' AND column_name = 'behaviors'
  ) THEN
    EXECUTE format(
      'UPDATE public.residents SET behaviors = %L WHERE id = %L',
      '{repetition,sundowning,agitation,wandering}', v_res
    );
  END IF;

  -- ------------------------------------------------- 2. weekly surveys (12)
  DELETE FROM public.weekly_surveys WHERE resident_id = v_res;
  FOR i IN 0..11 LOOP
    d := (date_trunc('week', CURRENT_DATE) - (i || ' weeks')::interval)::date;
    INSERT INTO public.weekly_surveys
      (resident_id, staff_id, week_of, eating, mood, social, mobility, behaviors, notes)
    VALUES (
      v_res, v_staff, d,
      (ratings[1 + ((i * 2) % 3)])::public.survey_rating,
      (ratings[1 + ((i + 1) % 3)])::public.survey_rating,
      (ratings[1 + (i % 3)])::public.survey_rating,
      (ratings[1 + ((i + 2) % 3)])::public.survey_rating,
      (behav[1 + ((i * 2 + 1) % 3)])::public.behavior_rating,
      CASE WHEN i % 3 = 0
        THEN 'Steady week overall, best in the mornings.'
        ELSE NULL END
    );
  END LOOP;

  -- ---------------------------------------------------- 3. mood logs (14 d)
  DELETE FROM public.mood_logs WHERE resident_id = v_res;
  FOR i IN 0..13 LOOP
    INSERT INTO public.mood_logs (resident_id, logged_by, log_date, mood)
    VALUES (
      v_res, v_staff, (CURRENT_DATE - i),
      (moods[1 + (i % 3)])::public.mood_kind
    );
  END LOOP;

  -- ------------------------------------- 4. daily notes + photos (posts)
  DELETE FROM public.posts WHERE resident_id = v_res;

  FOR i IN 0..9 LOOP
    d := (CURRENT_DATE - i);
    note_json := '__DAILY_NOTE__' || json_build_object(
      'activities', activities[1 + i],
      'food',       foods[1 + i],
      'feelings',   feelings[1 + i],
      'note_date',  to_char(d, 'YYYY-MM-DD')
    )::text;
    INSERT INTO public.posts (resident_id, author_id, photo_url, caption, created_at)
    VALUES (v_res, v_author, NULL, note_json, (d::timestamptz + interval '17 hours'));
  END LOOP;

  INSERT INTO public.posts (resident_id, author_id, photo_url, caption, created_at) VALUES
    (v_res, v_author, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80',
     'Baking group this morning, she stirred the whole bowl herself.', now() - interval '1 day'),
    (v_res, v_author, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80',
     'Twenty minutes in the garden. The roses are her favourite stop.', now() - interval '3 days'),
    (v_res, v_author, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=80',
     'Music hour in the lounge. She hummed along the whole time.', now() - interval '6 days'),
    (v_res, v_author, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&q=80',
     'Therapy dog visit. She did not let go of his ear for half an hour.', now() - interval '9 days');

  -- ------------------------------------------------------- 5. message thread
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'resident_messages'
  ) THEN
    DELETE FROM public.resident_messages WHERE resident_id = v_res;

    INSERT INTO public.resident_messages
      (resident_id, sender_id, sender_label, sender_role, content, created_at) VALUES
      (v_res, v_family, 'Margaret''s Family', 'family',
       'Good morning. How did she sleep last night?', now() - interval '6 days 3 hours'),
      (v_res, v_staff, 'Sunrise Caregiver', 'staff',
       'She slept through until about 5am, then sat with us in the lounge with tea.',
       now() - interval '6 days 2 hours'),
      (v_res, v_family, 'Margaret''s Family', 'family',
       'That is a relief. She loves her tea first thing.', now() - interval '6 days 1 hour'),
      (v_res, v_staff, 'Sunrise Caregiver', 'staff',
       'We started playing the old standards in the afternoon and it settles her right down.',
       now() - interval '4 days 5 hours'),
      (v_res, v_family, 'Margaret''s Family', 'family',
       'Please keep doing that. She used to play those on the piano every Sunday.',
       now() - interval '4 days 4 hours'),
      (v_res, v_staff, 'Sunrise Caregiver', 'staff',
       'Noted, we added it to her afternoon routine. She joined the baking group today too.',
       now() - interval '2 days 6 hours'),
      (v_res, v_family, 'Margaret''s Family', 'family',
       'Wonderful. Is late afternoon still the hardest part of her day?',
       now() - interval '2 days 5 hours'),
      (v_res, v_staff, 'Sunrise Caregiver', 'staff',
       'A little restless around 4pm, but shorter each week. Walking helps most.',
       now() - interval '2 days 4 hours'),
      (v_res, v_family, 'Margaret''s Family', 'family',
       'We are visiting Saturday around 2pm. Anything we should bring?',
       now() - interval '1 day 3 hours'),
      (v_res, v_staff, 'Sunrise Caregiver', 'staff',
       'Saturday at 2pm works well, that is her brightest stretch. A soft blanket would be lovely.',
       now() - interval '1 day 2 hours'),
      (v_res, v_family, 'Margaret''s Family', 'family',
       'Perfect, see you then. Thank you for everything.', now() - interval '5 hours');
  END IF;
END $$;

-- Verify
SELECT
  (SELECT count(*) FROM public.weekly_surveys ws JOIN public.residents r ON r.id = ws.resident_id WHERE r.name ILIKE 'Margaret%') AS surveys,
  (SELECT count(*) FROM public.mood_logs m JOIN public.residents r ON r.id = m.resident_id WHERE r.name ILIKE 'Margaret%') AS moods,
  (SELECT count(*) FROM public.posts p JOIN public.residents r ON r.id = p.resident_id WHERE r.name ILIKE 'Margaret%') AS posts;
