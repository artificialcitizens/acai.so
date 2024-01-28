import yaml
import os

def read_data_from_yaml(file_name):
    if not os.path.isfile(file_name):
        # Handle the case where the file does not exist.
        # For example, log an error message and return None or an empty dict.
        print(f"File does not exist: {file_name}")
        return None  # or return {}
    try:
        with open(file_name, 'r') as file:
            return yaml.safe_load(file)
    except Exception as e:
        raise IOError(f"Failed to read YAML file {file_name}: {e}")
def write_data_to_yaml(file_name, data):
    os.makedirs(os.path.dirname(file_name), exist_ok=True)
    with open(file_name, 'w') as file:
        yaml.safe_dump(data, file, default_flow_style=False, sort_keys=False)