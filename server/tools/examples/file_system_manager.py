# https://python.langchain.com/docs/integrations/tools/filesystem
from tempfile import TemporaryDirectory

from langchain_community.agent_toolkits import FileManagementToolkit

# We'll make a temporary directory to avoid clutter
working_directory = TemporaryDirectory()

file_manager = FileManagementToolkit(
    root_dir=str(working_directory.name)
)  # If you don't provide a root_dir, operations will default to the current working directory

file_manager_toolkit = file_manager.get_tools()

def get_file_tool(toolkit, name):
    for tool in toolkit:
        if tool.name == name:
            return tool
    raise ValueError(f"No tool found with name {name}")