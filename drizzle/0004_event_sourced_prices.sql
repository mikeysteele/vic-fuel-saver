-- Delete rows where the price is exactly the same as the chronologically preceding price for that station+fuel.
-- This keeps the *first* date a price was seen, and drops the subsequent daily duplicates until the price changes again.
DELETE FROM prices WHERE rowid IN (
  SELECT rowid FROM (
    SELECT rowid, price, LAG(price) OVER (PARTITION BY station_id, fuel_type ORDER BY price_date ASC) as prev_price
    FROM prices
  ) WHERE price = prev_price
);
