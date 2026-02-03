import os
import json
import shutil
import logging
from pathlib import Path
from zipfile import ZipFile

# Set up logging
logging.basicConfig(
    level=logging.INFO,  # You can change to DEBUG for more detailed logs
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def load_project_root(config_path: str) -> Path:
    """
    Load the project root directory from a JSON config file.

    :param config_path: Path to the JSON configuration file.
    :return: Path object of the project root.
    """
    try:
        with open(config_path, "r") as config_file:
            config = json.load(config_file)
        project_root = config.get("project_root", "")
        if not project_root:
            raise ValueError("Project root not defined in the configuration.")
        project_root_path = Path(project_root)
        if not project_root_path.is_dir():
            raise NotADirectoryError(f"The project root '{project_root}' is not a valid directory.")
        logger.info(f"Loaded project root from config: {project_root}")
        return project_root_path
    except Exception as e:
        logger.error(f"Failed to load configuration file {config_path}: {e}")
        raise


def find_latest_zip(downloads_dir: Path) -> Path:
    """
    Find the latest ZIP file in the given downloads directory.

    :param downloads_dir: Path object of the downloads directory.
    :return: Path object of the latest ZIP file.
    """
    try:
        zip_files = sorted(downloads_dir.glob("*.zip"), key=lambda x: x.stat().st_mtime, reverse=True)
        if not zip_files:
            logger.error(f"No ZIP files found in the downloads directory: {downloads_dir}")
            return None
        latest_zip = zip_files[0]
        logger.info(f"Found latest ZIP: {latest_zip}")
        return latest_zip
    except Exception as e:
        logger.error(f"Error finding latest ZIP in folder '{downloads_dir}': {e}")
        raise


def extract_zip_with_cleanup(zip_path: Path, target_dir: Path) -> None:
    """
    Extract ZIP file contents to the target directory.
    Remove files and folders in the target directory that are present in the ZIP's root.

    :param zip_path: Path object of the ZIP file.
    :param target_dir: Path object of the target project directory.
    """
    try:
        with ZipFile(zip_path, "r") as zip_ref:
            zip_contents = zip_ref.namelist()

            # Get top-level items in the ZIP
            zip_root_items = {Path(name).parts[0] for name in zip_contents if name}

            logger.debug(f"Top-level items in ZIP: {zip_root_items}")

            # Remove only files and folders in the target that are in the ZIP's root
            for item in target_dir.iterdir():
                if item.name in zip_root_items:
                    try:
                        if item.is_file():
                            logger.info(f"Deleting file: {item}")
                            item.unlink()
                        elif item.is_dir():
                            logger.info(f"Deleting directory: {item}")
                            shutil.rmtree(item)
                    except Exception as e:
                        logger.error(f"Failed to delete '{item}': {e}")
                        raise

            target_root = target_dir.resolve()
            for info in zip_ref.infolist():
                member_path = (target_dir / info.filename).resolve()
                if not str(member_path).startswith(str(target_root)):
                    logger.warning(f"Skipping unsafe member outside target: {info.filename}")
                    continue

                if info.is_dir():
                    os.makedirs(member_path, exist_ok=True)
                    continue

                os.makedirs(member_path.parent, exist_ok=True)
                with open(member_path, "wb") as f:
                    f.write(zip_ref.read(info))
            logger.info(f"Extracted ZIP contents to {target_dir}")
    except Exception as e:
        logger.error(f"Failed to extract ZIP '{zip_path}': {e}")
        raise


def update_project(config_path: str):
    """
    Main function to update the project using the latest ZIP file.

    :param config_path: Path to the JSON configuration file.
    """
    try:
        # Load both paths from config
        with open(config_path, "r") as config_file:
            config = json.load(config_file)
        
        project_root_raw = config.get("project_root")
        if not project_root_raw:
            raise ValueError("Project root not defined in the configuration.")
        project_root = Path(project_root_raw)
        downloads_dir = Path(config.get("downloads_dir", Path.home() / "Downloads"))
        
        if not project_root.is_dir():
            raise NotADirectoryError(f"The project root '{project_root}' is not a valid directory.")
        
        logger.info(f"Using project root: {project_root}")
        logger.info(f"Using downloads directory: {downloads_dir}")
        
        latest_zip = find_latest_zip(downloads_dir)  # Pass the downloads_dir from config
        if not latest_zip:
            logger.info("No ZIP file to process. Exiting update process.")
            return
        extract_zip_with_cleanup(latest_zip, project_root)
        logger.info("Project updated successfully.")
    except Exception as e:
        logger.error(f"An error occurred during the update process: {e}")
        raise


# Example usage
if __name__ == "__main__":
    CONFIG_PATH = "config.json"
    logger.info("Starting project update...")
    update_project(CONFIG_PATH)
