# ACAI Server

## Crew Manager

An api for creating and managing [CrewAI](https://github.com/joaomdmoura/crewAI) agents.

## Usage

Setup local environment:

```
conda create -n ava python=3.10
conda activate ava
pip install -r requirements.txt
```

Run:

```
python main.py
```

### Docker

Use Docker:

```
docker build -t ava .
```

```
docker run -p 5050:5050 ava
```
