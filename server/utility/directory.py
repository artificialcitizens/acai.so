import os

def rename_files_in_directory(directory):
    for filename in os.listdir(directory):
        if ' ' in filename:
            new_filename = filename.replace(' ', '-')
            os.rename(os.path.join(directory, filename), os.path.join(directory, new_filename))

rename_files_in_directory('/home/josh/Downloads/training')