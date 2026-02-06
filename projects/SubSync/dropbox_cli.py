import sys
from dropboxapp import list_dropbox_folders


def main(argv):
    if len(argv) == 0:
        print("Usage: script.py <command> [<args>]")
        print("Commands:")
        print("  list_dropbox_folders [path]")
        print("  sync_folder <folder_path>")
        sys.exit(1)

    command = argv[0]
    if command == "list_dropbox_folders":
        path = argv[1] if len(argv) > 1 else ""
        list_dropbox_folders_cli(path)
    elif command == "sync_folder":
        if len(argv) < 2:
            print("Error: Missing folder path")
            sys.exit(1)
        sync_folder_cli(argv[1])
    else:
        print(f"Error: Unknown command '{command}'")
        sys.exit(1)


if __name__ == '__main__':
    main(sys.argv[1:])
