#  example of embedding service endpoint compatible with the open ai wrapper for langchain
import os

from flask import Flask, request, jsonify

import asyncio
from infinity_emb import AsyncEmbeddingEngine

from pydantic import BaseModel, Field
from typing import List, Optional, Union

app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"

class Embedding(BaseModel):
    object: str
    embedding: List[float]
    index: int

class Usage(BaseModel):
    prompt_tokens: int
    total_tokens: int


class CreateEmbeddingResponse(BaseModel):
    object: str
    data: List[Embedding]
    model: str
    usage: Usage

# prevents error
    # ERROR: Task was destroyed but it is pending!                      base_events.py:1771
        #  task: <Task pending name='Task-31' coro=<BatchHandler._delayed_warmup() done, defined at                             
        #  /home/josh/miniconda3/envs/thecrew/lib/python3.11/site-packages/infinity_emb/inference/batch_hand                    
        #  ler.py:364> wait_for=<Future pending cb=[Task.task_wakeup()]>>  
    # but makes the function 4x as slow. Error doesn't seem to affect anything.
# def embed_sync(sentences):
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
    
#     async def embed():
#         async with engine:
#             return await engine.embed(sentences=sentences)

#     result = loop.run_until_complete(embed())
#     loop.run_until_complete(asyncio.gather(*asyncio.all_tasks(loop)))
#     loop.close()
#     return result

# @TODO: Look into removing from memory when not in use, there is a stop and start method
MODEL_NAME = "BAAI/bge-m3"
engine = AsyncEmbeddingEngine(model_name_or_path = MODEL_NAME, engine="torch")

def embed_sync(sentences):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    async def embed():
        async with engine:
            return await engine.embed(sentences=sentences)

    return loop.run_until_complete(embed())


@app.route("/v1/embeddings", methods=['POST'])
def embeddings():
    data = request.json
    try:
        sentences = data["input"]
    except KeyError:
        return jsonify(error="Missing 'input' key in JSON payload"), 400
        
    try:
        print(sentences)
        embeddings, usage = embed_sync(sentences)
        from uuid import uuid4
        import time
        
        embedding_objects = []
        for i, embedding in enumerate(embeddings):
            embedding_objects.append(
                Embedding(object="embedding", embedding=embedding.tolist(), index=i)
            )
            
        usage_object = Usage(prompt_tokens=0, total_tokens=usage)

        response = CreateEmbeddingResponse(
            object="embedding",
            data=embedding_objects,
            model=MODEL_NAME,
            usage=usage_object,
            id=f"infinity-{uuid4()}",
            created=int(time.time())
        )
        
        return response.dict(), 200
    except Exception as ex:
        print(ex)
        return jsonify(error=f"InternalServerError: {str(ex)}"), 500