-- 00022_public_review_rpc.sql
-- Public review invitation RPCs
-- Does not modify existing RLS policies or table structure.


-- ============================================================
-- 1. VALIDATE REVIEW INVITATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_review_invitation(
  token_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  SELECT
    i.used,
    i.expires_at,
    i.client_name,
    i.service_date,
    s.name AS service_name
  INTO v_invitation
  FROM public.review_invitations AS i
  LEFT JOIN public.services AS s
    ON i.service_id = s.id
  WHERE i.id = token_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'invalid'
    );
  END IF;

  IF v_invitation.used = true THEN
    RETURN jsonb_build_object(
      'status', 'used'
    );
  END IF;

  IF v_invitation.expires_at < now() THEN
    RETURN jsonb_build_object(
      'status', 'expired'
    );
  END IF;

  RETURN jsonb_build_object(
    'status', 'valid',
    'client_name', v_invitation.client_name,
    'service_name', v_invitation.service_name,
    'service_date', v_invitation.service_date
  );
END;
$$;


-- Restrict function execution explicitly.
REVOKE EXECUTE
ON FUNCTION public.validate_review_invitation(UUID)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.validate_review_invitation(UUID)
TO anon;

GRANT EXECUTE
ON FUNCTION public.validate_review_invitation(UUID)
TO authenticated;


-- ============================================================
-- 2. SUBMIT REVIEW FOR INVITATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.submit_review_for_invitation(
  token_id UUID,
  p_rating INTEGER,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_review_id UUID;
BEGIN

  -- Lock the invitation to prevent concurrent submissions.
  SELECT *
  INTO v_invitation
  FROM public.review_invitations
  WHERE id = token_id
  FOR UPDATE;


  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;


  IF v_invitation.used = true THEN
    RAISE EXCEPTION 'Invitation already used';
  END IF;


  IF v_invitation.expires_at < now() THEN
    RAISE EXCEPTION 'Invitation expired';
  END IF;


  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Invalid rating';
  END IF;


  -- Create the review using the existing reviews schema.
  INSERT INTO public.reviews (
    service_id,
    invitation_id,
    client_name,
    rating,
    review_text,
    status,
    verified,
    featured
  )
  VALUES (
    v_invitation.service_id,
    token_id,
    v_invitation.client_name,
    p_rating,
    p_content,
    'pending',
    true,
    false
  )
  RETURNING id INTO v_review_id;


  -- Mark the invitation as used in the same transaction.
  UPDATE public.review_invitations
  SET used = true
  WHERE id = token_id;


  RETURN v_review_id;

END;
$$;


-- Restrict function execution explicitly.
REVOKE EXECUTE
ON FUNCTION public.submit_review_for_invitation(UUID, INTEGER, TEXT)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.submit_review_for_invitation(UUID, INTEGER, TEXT)
TO anon;

GRANT EXECUTE
ON FUNCTION public.submit_review_for_invitation(UUID, INTEGER, TEXT)
TO authenticated;