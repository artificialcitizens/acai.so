import yaml
import os

def read_data_from_yaml(file_path):
    if not os.path.exists(file_path):
        return None
    with open(file_path, 'r') as file:
        return yaml.safe_load(file)

def write_data_to_yaml(file_path, data):
    with open(file_path, 'w') as file:
        yaml.safe_dump(data, file)
