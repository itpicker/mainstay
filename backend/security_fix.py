
import os
import psycopg
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(dotenv_path="backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.error("DATABASE_URL not found in environment.")
    exit(1)

def apply_security_fixes():
    try:
        logger.info("Connecting to database...")
        with psycopg.connect(DATABASE_URL, autocommit=True) as conn:
            with conn.cursor() as cur:
                # === Comprehensive Security Sweep ===
                
                # A. Enable RLS on ALL tables in public schema
                logger.info("--- Starting RLS Sweep ---")
                cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
                tables = [row[0] for row in cur.fetchall()]
                
                for table in tables:
                    logger.info(f"Securing table '{table}'...")
                    
                    # 1. Enable RLS
                    cur.execute(f"ALTER TABLE \"{table}\" ENABLE ROW LEVEL SECURITY;")
                    
                    # 2. Check for and drop "Public Access" or "Allow All" policies
                    cur.execute("SELECT policyname FROM pg_policies WHERE tablename = %s AND (policyname ILIKE %s OR policyname ILIKE %s);", (table, '%public%', '%allow all%'))
                    risky_policies = [row[0] for row in cur.fetchall()]
                    
                    if risky_policies:
                        for policy in risky_policies:
                            logger.info(f"  Dropping risky policy '{policy}' on '{table}'...")
                            cur.execute(f"DROP POLICY IF EXISTS \"{policy}\" ON \"{table}\";")
                    
                    logger.info(f"  RLS enabled and risky policies cleaned for '{table}'.")

                logger.info("--- RLS Sweep Complete ---")

                # C. Move Extensions to Dedicated Schema (Security Best Practice)
                logger.info("--- Starting Extension Sweep ---")
                cur.execute("CREATE SCHEMA IF NOT EXISTS extensions;")
                
                # Move 'vector' extension if exists
                cur.execute("SELECT 1 FROM pg_extension WHERE extname = 'vector';")
                if cur.fetchone():
                    logger.info("Moving 'vector' extension to 'extensions' schema...")
                    try:
                        cur.execute("ALTER EXTENSION vector SET SCHEMA extensions;")
                    except Exception as e:
                         # Might fail if types are used in public tables and PG cannot auto-move? 
                         # Usually ALTER EXTENSION moves dependent types nicely.
                         logger.warning(f"Could not move extension: {e}")
                
                 # Grant usage on extensions schema to public (so everyone can see types)
                cur.execute("GRANT USAGE ON SCHEMA extensions TO PUBLIC;")
                logger.info("Extensions schema secured.")
                
                # B. Fix search_path on ALL functions in public schema (AND Update to include extensions)
                logger.info("--- Starting Function Sweep ---")
                cur.execute("""
                    SELECT p.proname, p.oid::regprocedure 
                    FROM pg_proc p 
                    JOIN pg_namespace n ON p.pronamespace = n.oid 
                    WHERE n.nspname = 'public' 
                      AND p.prokind = 'f' 
                      AND p.proname NOT LIKE 'pg_%';
                """)
                # Note: Excluding system-like functions if any, generally public schema is user content.
                funcs = cur.fetchall()
                
                for func_name, func_sig in funcs:
                    try:
                        logger.info(f"Securing function '{func_sig}'...")
                        # Must include 'extensions' in search_path so functions can use 'vector' type
                        cur.execute(f"ALTER FUNCTION {func_sig} SET search_path = public, extensions;")
                    except Exception as func_error:
                        # Skip functions we don't own (e.g. extension functions like vector_in)
                        logger.warning(f"Skipping function '{func_sig}': {func_error}")
                        conn.rollback() # Rollback the failed statement transaction if needed, 
                        # actually psycopg3 in autocommit mode? No, we are in autocommit=True mode on connection, 
                        # but if a statement fails, the connection might be fine. 
                        # Wait, psycopg might need a rollback if not in autocommit? 
                        # We set autocommit=True in connect(). So single statement failure shouldn't abort transaction.
                        # However, let's just log and continue.
                        pass
                
                logger.info(f"Function sweep finished.")
                logger.info("--- Function Sweep Complete ---")

                # D. Restore Profiles RLS (Fix broken access)
                logger.info("Restoring RLS policies on 'profiles'...")
                # Allow users to view their own profile
                try:
                    cur.execute("""
                        CREATE POLICY "Users can view own profile" ON profiles
                        FOR SELECT USING (auth.uid() = id);
                    """)
                    logger.info("Created policy 'Users can view own profile'.")
                except psycopg.errors.DuplicateObject:
                    logger.info("Policy 'Users can view own profile' already exists.")
                except Exception as e:
                    logger.warning(f"Error creating view policy: {e}")
                    
                # Allow users to update their own profile
                try:
                    cur.execute("""
                        CREATE POLICY "Users can update own profile" ON profiles
                        FOR UPDATE USING (auth.uid() = id);
                    """)
                    logger.info("Created policy 'Users can update own profile'.")
                except psycopg.errors.DuplicateObject:
                    logger.info("Policy 'Users can update own profile' already exists.")
                except Exception as e:
                    logger.warning(f"Error creating update policy: {e}")
                
                 # Allow users to insert their own profile
                try:
                    cur.execute("""
                        CREATE POLICY "Users can insert own profile" ON profiles
                        FOR INSERT WITH CHECK (auth.uid() = id);
                    """)
                    logger.info("Created policy 'Users can insert own profile'.")
                except psycopg.errors.DuplicateObject:
                    logger.info("Policy 'Users can insert own profile' already exists.")
                except Exception as e:
                     logger.warning(f"Error creating insert policy: {e}")

                logger.info("Profiles RLS policies restored.")

    except Exception as e:
        logger.error(f"Error applying security fixes: {e}")

if __name__ == "__main__":
    apply_security_fixes()
