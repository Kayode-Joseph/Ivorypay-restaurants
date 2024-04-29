
--create index on ivorypay_restaurants improve fetch performace
CREATE INDEX idx_restaurant_location ON ivorypay_restaurants(longitude, latitude);
