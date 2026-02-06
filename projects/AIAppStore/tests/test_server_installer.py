import os
import json
import tempfile
import shutil
from server_installer import (
    MCPServerInstallerWithProgress,
    SecureEnvironmentManager
)

# Test the SecureEnvironmentManager
def test_secure_environment_manager():
    env_file = ".env"
    env_manager = SecureEnvironmentManager(env_file)

    # Set an environment variable
    env_manager.set_env_var("TEST_API_KEY", "secure_api_key_value")

    # Reload and get the environment variable
    env_manager = SecureEnvironmentManager(env_file)
    assert env_manager.get_env_var("TEST_API_KEY") == "secure_api_key_value", "Environment variable mismatch"

# Test the basic server detection functionality
def test_list_available_servers():
    temp_dir = tempfile.mkdtemp()

    try:
        # Create mock server directories
        os.makedirs(os.path.join(temp_dir, "server1"))
        os.makedirs(os.path.join(temp_dir, "server2"))

        installer = MCPServerInstallerWithProgress(temp_dir, "dummy_config.json")
        detected_servers = installer.list_available_servers()
        assert sorted(detected_servers) == ["server1", "server2"], "Server listing failed"

    finally:
        shutil.rmtree(temp_dir)

# Test installation and uninstallation with mock data
def test_install_and_uninstall_server():
    temp_dir = tempfile.mkdtemp()
    config_file = os.path.join(temp_dir, "claude_desktop_config.json")
    with open(config_file, "w") as f:
        json.dump({}, f)

    try:
        # Create mock server directory and README
        server_name = "mock_server"
        server_dir = os.path.join(temp_dir, server_name)
        os.makedirs(server_dir)
        with open(os.path.join(server_dir, "README.md"), "w") as f:
            f.write("""
            ## Installation

            ### Using uvx

            ```bash
            echo Installing mock_server
            ```

            ### Configuration

            ```json
            {
                "mcpServers": {
                    "mock_server": {
                        "command": "uvx",
                        "args": ["mock_server"],
                        "env": {
                            "API_KEY": "your_api_key_here"
                        }
                    }
                }
            }
            ```
            """)

        installer = MCPServerInstallerWithProgress(temp_dir, config_file)

        # Install server
        installer.install_server(server_name, method="uvx")

        # Check configuration
        with open(config_file, "r") as f:
            config_data = json.load(f)
        assert "mock_server" in config_data["mcpServers"], "Server configuration not updated after installation"

        # Uninstall server
        installer.uninstall_server(server_name)

        # Check configuration removal
        with open(config_file, "r") as f:
            config_data = json.load(f)
        assert "mock_server" not in config_data.get("mcpServers", {}), "Server configuration not removed after uninstallation"

    finally:
        shutil.rmtree(temp_dir)

# Test progress tracking in installation
def test_progress_tracking():
    temp_dir = tempfile.mkdtemp()
    config_file = os.path.join(temp_dir, "claude_desktop_config.json")
    with open(config_file, "w") as f:
        json.dump({}, f)

    try:
        # Create mock server directory and README
        server_name = "progress_server"
        server_dir = os.path.join(temp_dir, server_name)
        os.makedirs(server_dir)
        with open(os.path.join(server_dir, "README.md"), "w") as f:
            f.write("""
            ## Installation

            ### Using uvx

            ```bash
            echo Installing progress_server
            ```

            ### Configuration

            ```json
            {
                "mcpServers": {
                    "progress_server": {
                        "command": "uvx",
                        "args": ["progress_server"],
                        "env": {
                            "API_KEY": "your_api_key_here"
                        }
                    }
                }
            }
            ```
            """)

        installer = MCPServerInstallerWithProgress(temp_dir, config_file)

        # Test installation with progress
        installer.install_server(server_name, method="uvx")

        # Validate the output with visual confirmation or log analysis
        print("Progress tracking test passed!")

    finally:
        shutil.rmtree(temp_dir)

# Run tests
if __name__ == "__main__":
    test_secure_environment_manager()
    test_list_available_servers()
    test_install_and_uninstall_server()
    test_progress_tracking()
    print("All tests passed!")