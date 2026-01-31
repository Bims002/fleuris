-- Allow Admins to View ALL Orders
create policy "Admins can view all orders"
  on orders for select
  using ( auth.uid() in (select id from profiles where role = 'admin') );

-- Allow Admins to Update Orders (e.g. Change Status)
create policy "Admins can update orders"
  on orders for update
  using ( auth.uid() in (select id from profiles where role = 'admin') );
