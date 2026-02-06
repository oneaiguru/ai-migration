import os
import re
import subprocess
import json
from typing import Dict, List, Optional
from dotenv import load_dotenv, set_key

class SecureEnvironmentManager:
    """
    Manages environment variables securely using a .env file.
    """

    def __init__(self, env_file: str = ".env"):
        self.env_file = env_file
        if os.path.exists(self.env_file):
            load_dotenv(self.env_file)

    def set_env_var(self, key: str, value: str):
        """
        Sets an environment variable in the .env file.

        Parameters:
            key (str): The environment variable name.
            value (str): The environment variable value.
        """
        set_key(self.env_file, key, value)

    def get_env_var(self, key: str) -> Optional[str]:
        """
        Retrieves the value of an environment variable.

        Parameters:
            key (str): The environment variable name.

        Returns:
            Optional[str]: The environment variable value, or None if not set.
        """
        return os.getenv(key)

class MCPServerInstaller:
    """
    Class to manage MCP server installations.
    """

    def __init__(self, servers_dir: str, config_file: str):
        self.servers_dir = servers_dir
        self.config_file = config_file

    def list_available_servers(self) -> List[str]:
        """
        List all available servers in the specified directory.
        """
        return [name for name in os.listdir(self.servers_dir) if os.path.isdir(os.path.join(self.servers_dir, name))]

    def get_readme_content(self, server_name: str) -> Optional[str]:
        """
        Retrieve the content of the README.md file for a given server.
        """
        readme_path = os.path.join(self.servers_dir, server_name, "README.md")
        if os.path.exists(readme_path):
            with open(readme_path, "r") as file:
                return file.read()
        return None

    def parse_readme(self, server_name: str) -> Optional[Dict]:
        """
        Parse the README.md file for installation commands and configuration.
        """
        readme_content = self.get_readme_content(server_name)
        if not readme_content:
            return None
        return {
            "commands": self.parse_installation_commands(readme_content),
            "configuration": self.parse_configuration(readme_content),
        }

    def parse_installation_commands(self, readme_content: str) -> Dict[str, List[str]]:
        """
        Parses installation commands from the content of a README.md file.
        """
        methods = ["uvx", "pip", "npx"]
        commands = {}
        for method in methods:
            pattern = rf"### Using [`]?{method}[`]?[\s\S]*?```bash\s+(.*?)```"
            matches = re.findall(pattern, readme_content, re.IGNORECASE | re.DOTALL)
            if matches:
                commands[method] = []
                for match in matches:
                    cmds = [line.strip() for line in match.strip().split("\n") if line.strip()]
                    commands[method].extend(cmds)
        return commands

    def parse_configuration(self, readme_content: str) -> Optional[Dict]:
        """
        Parses the configuration JSON snippet from the content of a README.md file.
        """
        pattern = r"### Configuration[\s\S]*?```json\s+({[\s\S]+?})\s+```"
        match = re.search(pattern, readme_content, re.IGNORECASE)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        return None

    def update_config_file(self, server_name: str, new_config: Dict):
        """
        Update the configuration file with new server details.
        """
        if not os.path.exists(self.config_file):
            with open(self.config_file, "w") as file:
                json.dump({}, file)

        with open(self.config_file, "r") as file:
            config_data = json.load(file)

        config_data.setdefault("mcpServers", {})
        config_data["mcpServers"][server_name] = new_config

        with open(self.config_file, "w") as file:
            json.dump(config_data, file, indent=4)

class MCPServerInstallerWithExecution(MCPServerInstaller):
    def install_server(self, server_name: str, method: str = "uvx"):
        """
        Install a specific server using the specified method.
        """
        parsed_data = self.parse_readme(server_name)
        if not parsed_data:
            return

        commands = parsed_data["commands"].get(method)
        if not commands:
            return

        for command in commands:
            try:
                subprocess.run(command, shell=True, check=True)
            except subprocess.CalledProcessError:
                return

        if parsed_data["configuration"]:
            self.update_config_file(server_name, parsed_data["configuration"]["mcpServers"][server_name])

class MCPServerInstallerWithUninstallation(MCPServerInstallerWithExecution):
    def uninstall_server(self, server_name: str):
        """
        Uninstall a specific server by removing its configuration and reversing installation steps.
        """
        readme_content = self.get_readme_content(server_name)
        if not readme_content:
            return

        parsed_commands = self.parse_installation_commands(readme_content)
        uninstall_commands = []
        for method, commands in parsed_commands.items():
            for cmd in commands:
                if "uvx" in cmd:
                    uninstall_commands.append(cmd.replace("uvx", "uvx uninstall"))
                elif "pip install" in cmd:
                    uninstall_commands.append(cmd.replace("pip install", "pip uninstall -y"))

        for command in uninstall_commands:
            try:
                subprocess.run(command, shell=True, check=True)
            except subprocess.CalledProcessError:
                pass

        if not os.path.exists(self.config_file):
            return

        try:
            with open(self.config_file, "r") as file:
                config_data = json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            return

        if "mcpServers" in config_data and server_name in config_data["mcpServers"]:
            del config_data["mcpServers"][server_name]
            with open(self.config_file, "w") as file:
                json.dump(config_data, file, indent=4)

class MCPServerInstallerWithProgress(MCPServerInstallerWithUninstallation):
    def install_server(self, server_name: str, method: str = "uvx"):
        """
        Install a specific server with progress indicators.
        """
        parsed_data = self.parse_readme(server_name)
        if not parsed_data:
            return

        commands = parsed_data["commands"].get(method)
        if not commands:
            return

        total_commands = len(commands)
        for i, command in enumerate(commands, start=1):
            print(f"Executing command {i}/{total_commands}: {command}")
            try:
                subprocess.run(command, shell=True, check=True)
            except subprocess.CalledProcessError:
                return

        if parsed_data["configuration"]:
            self.update_config_file(server_name, parsed_data["configuration"]["mcpServers"][server_name])
