from dotenv import load_dotenv
import os
from langchain_community.document_loaders import TwitterTweetLoader

load_dotenv()

TWITTER_BEARER_TOKEN = os.getenv("TWITTER_OAUTH_BEARER_TOKEN")

# requires a paid account to use the Twitter API
loader = TwitterTweetLoader.from_bearer_token(
    oauth2_bearer_token=TWITTER_BEARER_TOKEN,
    twitter_users=["ai_citizen"],
    number_tweets=50,  # Default value is 100
)

documents = loader.load()
print(documents[:5])