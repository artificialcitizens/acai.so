from fastapi import FastAPI, APIRouter, HTTPException
from socketio import ASGIApp, Server
from pydantic import BaseModel
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware


class AgentResponse(BaseModel):
    message: str


sio = Server(
    cors_allowed_origins=[
        "http://192.168.4.74:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://acai.so",
    ],
    cors_credentials=True,
)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
app.mount("/", ASGIApp(socketio_server=sio))

v1_router = APIRouter(prefix="/v1")


@v1_router.get("/test")
async def test_connection():
    return {"message": "Connection successful"}


@v1_router.post("/agent-response")
async def generate_agent_response(response: AgentResponse):
    # Emit the agent response to all connected clients
    sio.emit(
        "agent-log",
        {
            "message": "Agent starting..",
            "current_time": datetime.now().strftime("%H:%M:%S"),
        },
    )
    return {"message": "Agent response sent"}


app.include_router(v1_router)


@sio.event
def connect(sid, environ):
    auth = environ.get("asgi.scope").get("headers")
    auth_dict = dict(auth)
    password = auth_dict.get(b"authorization").decode("utf-8")
    if password != "your_password_here":
        sio.disconnect(sid)
    else:
        print("Client connected")


@sio.event
def disconnect(sid):
    print("Client disconnected")
