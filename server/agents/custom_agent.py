from datetime import datetime
from crewai import Agent
import json
from typing import Any, List

class ExtendedAgent(Agent):
    socketio: Any = None
    crew_id: str = None
    def __init__(self, *args, socketio=None, crew_id=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.socketio = socketio
        self.crew_id = crew_id

    def execute_task(
        self, task: str, context: str = None, tools: List[Any] = None
    ) -> str:
        """Execute a task with the agent and emit the output using socketio.

        Args:
            task: Task to execute.
            context: Context to execute the task in.
            tools: Tools to use for the task.

        Returns:
            Output of the agent
        """
        output = super().execute_task(task, context, tools)
        tools_string = ", ".join([tool.name for tool in tools]) if tools else ""
        task_log = {
            "id": self.crew_id,
            "timestamp": datetime.now().isoformat(),
            "agent": self.role,
            "task": task,
            "output": output,
            "context": context,
            "tools": tools_string
        }
      # convert to string
        task_log = json.dumps(task_log)
        if self.socketio:
            self.socketio.emit(
            "crew-log", {"log": task_log }
        )
        
        return output
