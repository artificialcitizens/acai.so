from langchain.tools import tool, BaseTool
from typing import Optional, Type
from pydantic import BaseModel, Field, ValidationError
from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)

class SocketInput(BaseModel):
    document: str = Field(description="document to be sent")

class SocketTool():
    name = "SocketTool"
    description = "useful for when you need to send documents"
    args_schema: Type[BaseModel] = SocketInput

    def __init__(self, socketio):
        self.socket = socketio

    def _run(
        self, document: str, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool."""
        try:
            SocketInput(document=document)  # Validate the document argument
        except ValidationError as e:
            return str(e)
        self.socket.emit(
            "create-tab", {"title": document.title, "content": document.content}
        )
        return 'Document sent to user'

    async def _arun(
        self, document: str, run_manager: Optional[AsyncCallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool asynchronously."""
        raise NotImplementedError("SocketTool does not support async")