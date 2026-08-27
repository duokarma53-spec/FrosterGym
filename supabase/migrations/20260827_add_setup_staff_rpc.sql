CREATE OR REPLACE FUNCTION public.setup_staff_member(
  staff_user_id uuid,
  staff_email text,
  staff_name text,
  staff_role text,
  staff_phone text,
  staff_permissions text[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  caller_gym_id uuid;
  dummy_gym_id uuid;
  new_staff_id uuid;
  perm text;
BEGIN
  -- 1. Get caller's gym_id (must be owner)
  SELECT gym_id INTO caller_gym_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'owner';
  IF caller_gym_id IS NULL THEN
    RAISE EXCEPTION 'Only owners can setup staff profiles';
  END IF;

  -- 2. Validate the target profile
  SELECT gym_id INTO dummy_gym_id FROM public.profiles WHERE user_id = staff_user_id;
  IF dummy_gym_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- 3. Update the profile to link to owner's gym
  UPDATE public.profiles 
  SET 
    gym_id = caller_gym_id,
    role = 'staff',
    full_name = staff_name,
    phone = staff_phone
  WHERE user_id = staff_user_id;

  -- 4. Delete the dummy gym created by the trigger
  DELETE FROM public.gyms WHERE id = dummy_gym_id AND owner_id = staff_user_id;

  -- 5. Insert staff record
  INSERT INTO public.staff (
    gym_id,
    name,
    role,
    phone,
    email,
    permissions
  ) VALUES (
    caller_gym_id,
    staff_name,
    staff_role,
    staff_phone,
    staff_email,
    staff_permissions
  ) RETURNING id INTO new_staff_id;

  -- 6. Insert staff_permissions
  IF array_length(staff_permissions, 1) > 0 THEN
    FOREACH perm IN ARRAY staff_permissions
    LOOP
      INSERT INTO public.staff_permissions (
        gym_id,
        user_id,
        module_name,
        can_view,
        can_create,
        can_edit,
        can_delete
      ) VALUES (
        caller_gym_id,
        staff_user_id,
        perm,
        true,
        true,
        true,
        true
      );
    END LOOP;
  END IF;

  RETURN json_build_object('success', true, 'staff_id', new_staff_id);
END;
$$;
