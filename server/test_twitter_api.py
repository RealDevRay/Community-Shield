"""
Quick test to verify Twitter API credentials
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Check if credentials exist
api_key = os.getenv("TWITTER_API_KEY")
api_secret = os.getenv("TWITTER_API_SECRET")

print("=" * 50)
print("TWITTER API CREDENTIALS CHECK")
print("=" * 50)

if api_key:
    print(f"✅ API Key found: {api_key[:10]}...")
else:
    print("❌ API Key NOT found in .env")

if api_secret:
    print(f"✅ API Secret found: {api_secret[:10]}...")
else:
    print("❌ API Secret NOT found in .env")

print("\n" + "=" * 50)
print("TESTING TWITTER API CONNECTION")
print("=" * 50)

try:
    import tweepy
    
    # Try to create client
    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret
    )
    
    print("✅ Tweepy client created successfully")
    
    # Try a simple search
    print("\n🔍 Searching for recent tweets about Nairobi...")
    
    tweets = client.search_recent_tweets(
        query="Nairobi -is:retweet",
        max_results=10
    )
    
    if tweets.data:
        print(f"✅ SUCCESS! Found {len(tweets.data)} tweets")
        print("\nSample tweets:")
        for i, tweet in enumerate(tweets.data[:3], 1):
            print(f"{i}. {tweet.text[:100]}...")
    else:
        print("⚠️ No tweets found (might be rate limited or query issue)")
        
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("\nPossible issues:")
    print("1. API credentials are invalid")
    print("2. App doesn't have proper permissions")
    print("3. Rate limit exceeded")
    print("4. Need Bearer Token instead of API Key/Secret")

print("\n" + "=" * 50)
