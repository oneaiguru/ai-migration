# /Users/m/git/tools/rename_my_py2SnakeCase/readme.py

import os
import glob
import re
import textwrap

def find_newest_md(folder_path):
    md_files = glob.glob(os.path.join(folder_path, "*.md"))
    if not md_files:
        raise ValueError("No .md files found in the folder.")
    return max(md_files, key=os.path.getctime)

def extract_last_chatgpt_message(file_path):
    with open(file_path, "r") as f:
        lines = f.readlines()

    last_chatgpt_index = None
    for i, line in enumerate(lines):
        if line.startswith("**ChatGPT:**"):
            last_chatgpt_index = i

    if last_chatgpt_index is not None and last_chatgpt_index + 1 < len(lines):
        return "".join(lines[last_chatgpt_index + 1:]).strip()
    else:
        return None

def save_to_readme(folder_path, message):
    with open(os.path.join(folder_path, "README.md"), "w") as f:
        f.write(message)

def display_current_readme(folder_path):
    readme_path = os.path.join(folder_path, "README.md")
    if os.path.exists(readme_path):
        with open(readme_path, "r") as f:
            content = f.read()
            wrapped_content = "\n".join(textwrap.wrap(content, width=78))
            print("\nCurrent content of README.md:\n")
            print(wrapped_content)
            print("\n")
        return True
    else:
        print("\nREADME.md does not exist in the folder.\n")
        return False

def main():
    folder_path = "/Users/m/Downloads"
    try:
        newest_md = find_newest_md(folder_path)
        print(f"Newest .md file: {newest_md}")
        last_chatgpt_message = extract_last_chatgpt_message(newest_md)

        if last_chatgpt_message:
            readme_exists = display_current_readme(folder_path)

            if readme_exists:
                response = input("Do you want to overwrite README.md with the last ChatGPT message? (y/n): ")
            else:
                response = "y"

            if response.lower() == "y":
                save_to_readme(folder_path, last_chatgpt_message)
                print(f"Saved last ChatGPT message to README.md in {folder_path}")
            else:
                print("Operation cancelled.")
        else:
            print("No ChatGPT messages found.")
    except ValueError as ve:
        print(f"Error: {ve}")

if __name__ == "__main__":
    main()
