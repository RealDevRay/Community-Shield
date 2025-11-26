# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (sign up if needed)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `community-shield`
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to Kenya (e.g., `ap-southeast-1` Singapore)
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning

## Step 2: Run Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `server/database/schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press `Ctrl+Enter`)
6. You should see: **"Success. No rows returned"**

## Step 3: Verify Tables Created

1. Click **"Table Editor"** (left sidebar)
2. You should see 5 tables:
   - `incidents`
   - `units`
   - `logs`
   - `hotspots`
   - `bias_checks`
3. Click on `units` - you should see 3 pre-loaded units (Alpha, Bravo, Charlie)

## Step 4: Get Connection Credentials

1. Click **"Settings"** (gear icon, left sidebar)
2. Click **"API"**
3. Copy the following values:

### Project URL

```
https://xxxxxxxxxxxxx.supabase.co
```

### API Keys

- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
- **service_role key**: (keep this secret, only for backend)

## Step 5: Add to .env File

Create/update `server/.env`:

```env
GROQ_API_KEY=your_existing_groq_key_here
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 6: Test Connection

Once I update the backend code, we'll test the connection by:

1. Starting the FastAPI server
2. Creating a test incident via the API
3. Checking if it appears in Supabase Table Editor

## Troubleshooting

**"Error: relation does not exist"**

- You didn't run the schema SQL. Go back to Step 2.

**"Error: permission denied"**

- RLS policies not set correctly. Re-run the schema SQL.

**"Can't connect to Supabase"**

- Check your `.env` file has the correct URL and key
- Make sure there are no extra spaces or quotes

---

**Ready?** Once you've completed Steps 1-5, share the credentials with me and I'll integrate them into the backend!
