CREATE INDEX "donor_search_index" ON "donors" USING gin ((
          setweight(to_tsvector('english', "name"), 'A') ||
          setweight(to_tsvector('english', "email"), 'A') ||
          setweight(to_tsvector('english', coalesce("amount_donated"::text, '')), 'B') ||
          setweight(to_tsvector('english', coalesce("comment", '')), 'C') 
        ));