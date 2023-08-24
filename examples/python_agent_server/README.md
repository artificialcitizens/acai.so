# acai.so Python Custom Agent Server Example

## Step 1: Install Anaconda or Miniconda

If you haven't installed Anaconda or Miniconda yet, you can download it from the official website:

- [Anaconda](https://www.anaconda.com/download)
- [Miniconda](https://docs.conda.io/en/latest/miniconda.html)

## Step 2: Create a new Conda environment

Open your terminal and create a new Conda environment using the following command:
`conda create --name acai python=3.9`

## Step 3: Activate the Conda environment

`conda activate acai`

## Step 4: Install the required packages

`pip install -r requirements.txt`

## Step 5: Start the server

Start the server using the following command:
`python main.py`

Now, your server should be running at `http://localhost:5050`.

## Routes

### GET /test

A simple test route that returns "Hello world".

### POST /v1/agent

Note: this is a work in progress and subject to change, this will be updated as the data model progresses

This route is used to receive and log payload from the client. The payload should contain the following properties:

- userMessage: string
- userName: string
- userLocation: string
- customPrompt: string
- chatHistory: any
- currentDocument: string

```
curl -X POST -H "Content-Type: application/json" \
  -d '{
  "userMessage": "Hello",
  "userName": "John Doe",
  "userLocation": "San Francisco",
  "customPrompt": "Custom Prompt",
  "chatHistory": [
    {
      "message": "Hello",
      "sender": "user"
    },
    {
      "message": "Hi",
      "sender": "ava"
    }
  ],
  "currentDocument": "Current Document"
}' \
  http://localhost:5000/v1/agent

### GET /proxy

This route is used to proxy a GET request to another URL. The URL should be passed as a query parameter.

example request:

```

http://localhost:5000/proxy?url=https://google.com

```

```
