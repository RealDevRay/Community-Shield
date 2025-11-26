"""
Twitter Monitor for Community Shield
Monitors Twitter for security-related tweets in Nairobi
"""
import tweepy
import os
import asyncio
from datetime import datetime
from groq import Groq
from supabase import create_client
import json

# Initialize clients
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Twitter API credentials
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")

# Keywords to monitor
SEARCH_QUERY = "(robbery OR theft OR mugging OR carjacking OR assault) (Nairobi OR CBD OR Westlands OR Kibera OR Eastleigh) -is:retweet lang:en"

# Track processed tweets to avoid duplicates
processed_tweets = set()

def analyze_tweet_with_ai(tweet_text: str) -> dict:
    """Analyze tweet with Groq AI to extract incident details"""
    try:
        prompt = f"""Analyze this tweet for a security incident in Nairobi, Kenya:

Tweet: "{tweet_text}"

Extract the following information:
1. Type (Theft, Robbery, Assault, Carjacking, or Other)
2. Location (specific area in Nairobi - CBD, Westlands, Kibera, etc.)
3. Severity (Low, Medium, High, Critical)
4. Summary (brief 1-sentence description)
5. Is this a real incident? (yes/no)

Respond in JSON format:
{{
    "is_incident": true/false,
    "type": "...",
    "location": "...",
    "severity": "...",
    "summary": "..."
}}

If not a real incident, set is_incident to false."""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        result = response.choices[0].message.content
        
        # Try to parse JSON from response
        try:
            # Extract JSON from markdown code blocks if present
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()
            
            data = json.loads(result)
            return data if data.get("is_incident") else None
        except:
            print(f"Failed to parse AI response: {result}")
            return None
            
    except Exception as e:
        print(f"Error analyzing tweet: {e}")
        return None

def get_coordinates_for_location(location: str) -> tuple:
    """Get approximate coordinates for Nairobi locations"""
    locations = {
        "cbd": (-1.286389, 36.817223),
        "westlands": (-1.2674, 36.8075),
        "kibera": (-1.3133, 36.7828),
        "eastleigh": (-1.2833, 36.8500),
        "karen": (-1.3197, 36.7078),
        "parklands": (-1.2667, 36.8333),
        "south c": (-1.3167, 36.8333),
        "industrial area": (-1.3167, 36.8500),
    }
    
    location_lower = location.lower()
    for key, coords in locations.items():
        if key in location_lower:
            return coords
    
    # Default to CBD if location not found
    return (-1.286389, 36.817223)

def create_incident_from_tweet(tweet_data: dict, tweet_text: str):
    """Create incident in Supabase from analyzed tweet"""
    try:
        lat, lng = get_coordinates_for_location(tweet_data['location'])
        
        incident = {
            "type": tweet_data['type'],
            "summary": tweet_data['summary'],
            "location": tweet_data['location'],
            "lat": str(lat),
            "lng": str(lng),
            "severity": tweet_data['severity'],
            "source": "Twitter",
            "status": "Active",
            "bias_score": 0.0,
            "raw_data": tweet_text[:500]  # Store original tweet (truncated)
        }
        
        result = supabase.table("incidents").insert(incident).execute()
        
        # Log the creation
        log_message = f"🐦 New incident from Twitter: {tweet_data['type']} in {tweet_data['location']}"
        supabase.table("logs").insert({"message": log_message}).execute()
        
        print(f"✅ Created incident from tweet: {tweet_data['summary']}")
        return result.data[0] if result.data else None
        
    except Exception as e:
        print(f"Error creating incident: {e}")
        return None

async def monitor_twitter():
    """Monitor Twitter for security incidents"""
    try:
        # Initialize Twitter client
        client = tweepy.Client(
            consumer_key=TWITTER_API_KEY,
            consumer_secret=TWITTER_API_SECRET
        )
        
        print("🐦 Starting Twitter monitoring...")
        print(f"📝 Search query: {SEARCH_QUERY}")
        
        # Search for recent tweets
        tweets = client.search_recent_tweets(
            query=SEARCH_QUERY,
            max_results=10,
            tweet_fields=['created_at', 'author_id']
        )
        
        if not tweets.data:
            print("No tweets found")
            return
        
        print(f"Found {len(tweets.data)} tweets")
        
        for tweet in tweets.data:
            # Skip if already processed
            if tweet.id in processed_tweets:
                continue
            
            processed_tweets.add(tweet.id)
            
            print(f"\n📱 Analyzing tweet: {tweet.text[:100]}...")
            
            # Analyze with AI
            incident_data = analyze_tweet_with_ai(tweet.text)
            
            if incident_data:
                print(f"✅ Incident detected: {incident_data['type']} in {incident_data['location']}")
                create_incident_from_tweet(incident_data, tweet.text)
            else:
                print("❌ Not a valid incident")
        
        # Keep only last 1000 tweet IDs to prevent memory issues
        if len(processed_tweets) > 1000:
            processed_tweets.clear()
            
    except Exception as e:
        print(f"Error monitoring Twitter: {e}")

async def start_twitter_monitoring():
    """Start Twitter monitoring loop (runs every 30 minutes)"""
    print("🚀 Twitter monitoring service started")
    print("⏰ Polling every 30 minutes to respect rate limits")
    
    while True:
        try:
            await monitor_twitter()
        except Exception as e:
            print(f"Error in monitoring loop: {e}")
        
        # Wait 30 minutes before next check
        await asyncio.sleep(1800)  # 1800 seconds = 30 minutes

if __name__ == "__main__":
    # Test the monitor
    asyncio.run(monitor_twitter())
