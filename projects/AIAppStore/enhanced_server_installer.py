import os
import subprocess
import json
import getpass
import logging

class EnhancedServerInstaller:
    def __init__(self, config_file: str, servers_data_file: str):
        self.config_file = config_file
        self.servers_data_file = servers_data_file
        self.servers_data = {}  # Initialize empty dict
        
        # Load servers data
        if os.path.exists(servers_data_file):
            with open(servers_data_file, 'r') as f:
                self.servers_data = json.load(f)

        # Setup logging
        self.logger = logging.getLogger('EnhancedServerInstaller')
        self.logger.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        
        # Stream handler
        ch = logging.StreamHandler()
        ch.setFormatter(formatter)
        self.logger.addHandler(ch)

    def prompt_for_env_vars(self, env_vars: dict) -> dict:
        """
        Prompts the user to input values for required environment variables.
        """
        user_env_vars = {}
        for var, placeholder in env_vars.items():
            if "<YOUR_" in placeholder.upper():
                prompt = f"Enter value for {var} (required): "
                value = getpass.getpass(prompt)  # Secure input without echo
                while not value:
                    print(f"{var} is required. Please enter a valid value.")
                    value = getpass.getpass(prompt)
                user_env_vars[var] = value
                self.logger.info(f"Received environment variable '{var}'.")
            else:
                user_env_vars[var] = placeholder
        return user_env_vars

    def execute_commands(self, commands: list):
        """
        Executes a list of shell commands.
        """
        for cmd in commands:
            self.logger.info(f"Executing command: {cmd}")
            try:
                subprocess.run(cmd, shell=True, check=True)
                self.logger.info(f"Successfully executed: {cmd}")
            except subprocess.CalledProcessError as e:
                self.logger.error(f"Failed to execute command '{cmd}': {e}")
                print(f"⚠️ Failed to execute '{cmd}'. Check logs for more details.")

    def update_config_file(self, server_name: str, new_config: dict):
        """
        Updates the main configuration file with new server details.
        """
        if not os.path.exists(self.config_file):
            with open(self.config_file, "w") as f:
                json.dump({}, f)
            self.logger.info(f"Created new configuration file: {self.config_file}")

        with open(self.config_file, "r") as f:
            config_data = json.load(f)

        config_data.setdefault("mcpServers", {})
        config_data["mcpServers"][server_name] = new_config

        with open(self.config_file, "w") as f:
            json.dump(config_data, f, indent=4)
        self.logger.info(f"Updated configuration for server: {server_name}.")

    def install_server(self, server_name: str, method: str = "pip"):
        if server_name not in self.servers_data:
            raise ValueError(f"Server '{server_name}' not found")
        
        server_config = self.servers_data[server_name]
        
        # Execute installation commands
        if 'commands' in server_config and method in server_config['commands']:
            for command in server_config['commands'][method]:
                self.logger.info(f"Executing command: {command}")
                try:
                    subprocess.run(command, shell=True, check=True)
                    self.logger.info(f"Successfully executed: {command}")
                except subprocess.CalledProcessError as e:
                    self.logger.error(f"Failed to execute command '{command}': {str(e)}")
                    raise

        # Handle environment variables
        if 'env' in server_config:
            env_vars = self.prompt_for_env_vars(server_config['env'])
            
            # Update configuration
            config = {'mcpServers': {server_name: {'command': method, 'env': env_vars}}}
            self.update_config(config)
            self.logger.info(f"Updated configuration for server: {server_name}")

    def uninstall_server(self, server_name: str):
        if server_name not in self.servers_data:
            raise ValueError(f"Server '{server_name}' not found")
        
        server_config = self.servers_data[server_name]
        
        # Execute all uninstall commands
        if 'commands' in server_config:
            for method, commands in server_config['commands'].items():
                for command in commands:
                    try:
                        if 'pip install' in command:
                            uninstall_cmd = command.replace('pip install', 'pip uninstall -y')
                            subprocess.run(uninstall_cmd, shell=True, check=True)
                        elif 'npx' in command:
                            # Execute inspector commands
                            inspector_cmds = [
                                f"npx @modelcontextprotocol/inspector uvx {server_name}",
                                f"npx @modelcontextprotocol/inspector uv run {server_name}"
                            ]
                            for cmd in inspector_cmds:
                                subprocess.run(cmd, shell=True, check=True)
                    except subprocess.CalledProcessError as e:
                        self.logger.error(f"Failed to execute uninstall command: {str(e)}")
                        raise

        # Remove from configuration
        self.remove_server_config(server_name)
        self.logger.info(f"Successfully uninstalled server: {server_name}")

    def update_server_config(self, server_name: str, config: dict) -> None:
        with open(self.config_file, 'r+') as f:
            try:
                current_config = json.load(f)
            except json.JSONDecodeError:
                current_config = {}
                
            if 'mcpServers' not in current_config:
                current_config['mcpServers'] = {}
            current_config['mcpServers'][server_name] = config
            
            f.seek(0)
            json.dump(current_config, f, indent=2)
            f.truncate()

    def remove_server_config(self, server_name: str) -> None:
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r+') as f:
                try:
                    config = json.load(f)
                except json.JSONDecodeError:
                    return
                    
                if 'mcpServers' in config and server_name in config['mcpServers']:
                    del config['mcpServers'][server_name]
                    f.seek(0)
                    json.dump(config, f, indent=2)
                    f.truncate()

    def list_available_servers(self) -> list:
        return list(self.servers_data.keys())

    def install_all_servers(self, method: str = "pip"):
        """
        Installs all available MCP servers using the specified installation method.
        """
        self.logger.info(f"Starting installation of all servers using method '{method}'.")
        servers = self.list_available_servers()
        successful_installs = []
        
        for server in servers:
            print(f"Installing server: {server} using method: {method}")
            try:
                self.install_server(server, method=method)
                successful_installs.append(server)
                print(f"✅ Installed '{server}' successfully.\n")
            except Exception as e:
                self.logger.error(f"Failed to install server '{server}': {e}")
                print(f"❌ Failed to install '{server}'.\n")
                # Remove any partial configuration if installation failed
                self.remove_server_config(server)
                
        self.logger.info(f"Completed installation of all servers. Successful: {successful_installs}")

    def update_config(self, config: dict):
        config_servers = config.get('mcpServers', {})
        if not config_servers:
            return

        current_config = {}
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                try:
                    current_config = json.load(f)
                except json.JSONDecodeError:
                    current_config = {}
        else:
            self.logger.info(f"Created new configuration file: {self.config_file}")

        current_config.setdefault('mcpServers', {})
        current_config['mcpServers'].update(config_servers)

        with open(self.config_file, 'w') as f:
            json.dump(current_config, f, indent=2)
        self.logger.info(f"Updated configuration for server: {', '.join(config_servers.keys())}")
