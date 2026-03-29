-- SpotFinder database initialization
-- Identity gets its own DB (auth separation)
-- All other services share 'spotfinder' DB with separate schemas

CREATE DATABASE spotfinder_identity;
CREATE DATABASE spotfinder;
