import os
import hashlib
from datetime import datetime

def check_duplication(input_folder, transcript_folder):
    """
    Checks for duplicate files in the input and transcript folders.
    """
    # Dictionary to store file hashes and their corresponding paths
    file_hashes = {}

    # Check input folder for duplicates
    for filename in os.listdir(input_folder):
        file_path = os.path.join(input_folder, filename)
        # Skip directories
        if os.path.isfile(file_path):
            file_hash = get_file_hash(file_path)

            if file_hash in file_hashes:
                print(f"Duplicate file found: {filename} (Duplicate of {file_hashes[file_hash]})")
            else:
                file_hashes[file_hash] = filename

    # Check transcript folder for duplicates
    for filename in os.listdir(transcript_folder):
        file_path = os.path.join(transcript_folder, filename)
        # Skip directories
        if os.path.isfile(file_path):
            file_hash = get_file_hash(file_path)

            if file_hash in file_hashes:
                print(f"Duplicate file found: {filename} (Duplicate of {file_hashes[file_hash]})")
            else:
                file_hashes[file_hash] = filename

def get_file_hash(file_path):
    """
    Calculates the SHA-256 hash of a file.
    """
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read the file in 4096-byte chunks and update the hash
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()