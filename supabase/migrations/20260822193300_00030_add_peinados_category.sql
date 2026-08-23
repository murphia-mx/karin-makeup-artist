-- Add 'Peinados' to the category CHECK constraint in gallery_projects

ALTER TABLE public.gallery_projects DROP CONSTRAINT IF EXISTS gallery_projects_category_check;

ALTER TABLE public.gallery_projects 
ADD CONSTRAINT gallery_projects_category_check 
CHECK (category IN ('Novias', 'Social', 'XV Años', 'Editorial', 'Graduación', 'Artístico', 'Peinados'));
