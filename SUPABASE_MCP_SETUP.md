# Supabase MCP Connection Guide for TalyaCRM

## Step 1: Install Supabase MCP Server

Add the following to your Cursor settings (`.cursor/mcp.json` or global MCP settings):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "YOUR_SUPABASE_ACCESS_TOKEN"]
    }
  }
}
```

## Step 2: Get Your Supabase Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your profile icon → **Account Settings**
3. Go to **Access Tokens**
4. Generate a new token and copy it

## Step 3: Update .env.local

Create or update `.env.local` with your Supabase credentials:

```env
# Supabase (same as talyaroofing.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI
GEMINI_API_KEY=your-gemini-key

# Twilio
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

## Step 4: Run the Schema

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Paste the contents of `supabase_schema.sql`
3. Click **Run**

## Important Notes

- All TalyaCRM tables are prefixed with `crm_` to avoid conflicts with existing website tables
- RLS (Row Level Security) is enabled on all tables
- Talya Roofing is seeded as the first company with subdomain "talya"
