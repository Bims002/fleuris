-- Add missing columns to products table for enhanced product details

-- Add long_description column for detailed product descriptions
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS long_description TEXT;

-- Add rating column for product ratings (0-5 stars)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5);

-- Add reviews column for number of reviews
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0 CHECK (reviews >= 0);

-- Add comment for documentation
COMMENT ON COLUMN products.long_description IS 'Detailed product description displayed on product page';
COMMENT ON COLUMN products.rating IS 'Product rating from 0 to 5 stars';
COMMENT ON COLUMN products.reviews IS 'Number of customer reviews';
