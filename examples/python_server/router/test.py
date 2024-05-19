from fastembed_encoder import FastEmbedEncoder
from semantic_router import Route

# we could use this as a guide for our chatbot to avoid political conversations
politics = Route(
    name="politics",
    utterances=[
        "isn't politics the best thing ever",
        "why don't you tell me about your political opinions",
        "don't you just love the president", "don't you just hate the president",
        "they're going to destroy this country!",
        "they will save the country!",
        "he is the worst president ever",
    ],
)

# this could be used as an indicator to our chatbot to switch to a more
# conversational prompt
chitchat = Route(
    name="chitchat",
    utterances=[
        "how's the weather today?",
        "how are things going?",
        "lovely weather today",
        "the weather is horrendous",
        "let's go to the chippy",
    ],
)

# we place both of our decisions together into single list
routes = [politics, chitchat]

import os

encoder = FastEmbedEncoder()

from semantic_router.layer import RouteLayer

dl = RouteLayer(encoder=encoder, routes=routes)
route = dl("that goddamn president is the worst").name

print(route)
