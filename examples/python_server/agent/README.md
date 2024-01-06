# AVA Agent

The crewai pkg doesn't play well with the semantic_router pkg atm, so we are using a microservice architecture for now.

```
sudo docker build -t ava .
```

```
sudo docker run -p 7589:7589 ava
```
