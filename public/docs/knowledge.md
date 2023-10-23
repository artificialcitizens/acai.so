# **Knowledge** (WIP)

You can use [acai.so](acai.so) to chat with your files and data using a Retrieval Augmented Generation (RAG) pipeline. You can learn more about the technical implementation in this [blogpost](https://www.knapsack.cloud/blog/how-to-chat-with-your-knowledge-base)

This currently uses the OpenAI embedding model to convert the data to a format that is semantically searchable. This uploading process requires api calls to OpenAI and is subject to their [pricing](https://openai.com/pricing). Their embedding model is relatively cheap, but with a lot of text it can add up.

For example, a 300 page pdf cost around \~$0.50 to ingest at the current price of $0.0001 / 1K tokens.

We will have different embedding methods, including self-hosted versions, in the future to bring these costs down as low as possible.

## Quickstart Guide

- Setup your OpenAI key in the settings menu from the right panel if you haven't done so already.
- Open the knowledge dropdown from the right panel
- Use the input to upload a .txt, .md, or .pdf file
- Open the AVA dropdown and select the knowledge option from the input
- Use the Chat interface in the right panel to chat with the uploaded knowledge
