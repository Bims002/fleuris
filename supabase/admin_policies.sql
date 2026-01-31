-- 1. Policies for PRODUCTS table (Allow Admins to Edit)
create policy "Admins can insert products"
  on products for insert
  with check ( auth.uid() in (select id from profiles where role = 'admin') );

create policy "Admins can update products"
  on products for update
  using ( auth.uid() in (select id from profiles where role = 'admin') );

create policy "Admins can delete products"
  on products for delete
  using ( auth.uid() in (select id from profiles where role = 'admin') );

-- Also allow admins to see ALL products (even is_available = false)
create policy "Admins can view all products"
  on products for select
  using ( auth.uid() in (select id from profiles where role = 'admin') );


-- 2. Policies for STORAGE (Allow Admins to Upload)
-- Only allow uploads to 'products' bucket
create policy "Admins can upload product images"
  on storage.objects for insert
  with check ( 
    bucket_id = 'products' 
    AND auth.uid() in (select id from profiles where role = 'admin') 
  );

create policy "Admins can update product images"
  on storage.objects for update
  using ( 
    bucket_id = 'products' 
    AND auth.uid() in (select id from profiles where role = 'admin') 
  );

create policy "Admins can delete product images"
  on storage.objects for delete
  using ( 
    bucket_id = 'products' 
    AND auth.uid() in (select id from profiles where role = 'admin') 
  );
