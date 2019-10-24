DROP TABLE locations;
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255),
  weather VARCHAR(255),
  trails VARCHAR(255)
);
-- INSERT INTO city-explorer (city, weather, trails) VALUES ('test');