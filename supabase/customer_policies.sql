-- Allow authenticated users to create (insert) their own orders
create policy "Users can insert own orders"
  on orders for insert
  with check ( auth.uid() = user_id );

-- Allow authenticated users to view their own orders
create policy "Users can view own orders"
  on orders for select
  using ( auth.uid() = user_id );

-- Allow authenticated users to insert items for their own orders
-- (Since order_id must exist first, and we insert sequentially, we check if the order belongs to them)
create policy "Users can insert own order items"
  on order_items for insert
  with check ( 
    exists (
      select 1 from orders 
      where id = order_id 
      and user_id = auth.uid()
    )
  );

-- Allow authenticated users to view items of their own orders
create policy "Users can view own order items"
  on order_items for select
  using ( 
    exists (
      select 1 from orders 
      where id = order_id 
      and user_id = auth.uid()
    )
  );
