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

`pip install fastapi uvicorn python-socketio pydantic`

## Step 5: Start the server

Start the server using the following command:
`uvicorn main:app`

Now, your server should be running at `http://localhost:8000`.

Note
Remember to replace `"your_password_here"` in the `authenticate_connect` function with your actual password.
