# cli_tools.py
import click
import json
from services.author_service import AuthorService
from services.chatbot_service import ChatbotService

author_service = AuthorService()
chatbot_service = ChatbotService()

@click.group()
def cli():
    pass

@cli.command()
@click.option('--username', prompt=True)
@click.option('--email', prompt=True)
@click.option('--password', prompt=True, hide_input=True, confirmation_prompt=True)
def create_author(username, email, password):
    author = author_service.create_author(username, email, password)
    click.echo(f"Author created with ID: {author.id}")

@cli.command()
@click.option('--name', prompt=True)
@click.option('--description', prompt=True)
@click.option('--telegram-token', prompt=True)
@click.option('--author-id', type=int, prompt=True)
@click.option('--prompts-file', type=click.Path(exists=True), prompt=True)
@click.option('--localizations-file', type=click.Path(exists=True), default=None)
def create_chatbot(name, description, telegram_token, author_id, prompts_file, localizations_file):
    chatbot = chatbot_service.create_chatbot(author_id, name, description, telegram_token)
    click.echo(f"Chatbot created with ID: {chatbot.id}")

    # Load prompts from JSON file
    with open(prompts_file, 'r', encoding='utf-8') as f:
        prompts_data = json.load(f)
    chatbot_service.add_prompts(chatbot.id, prompts_data)
    click.echo("Prompts loaded.")

    # Load localizations if provided
    if localizations_file:
        with open(localizations_file, 'r', encoding='utf-8') as f:
            localizations_data = json.load(f)
        chatbot_service.add_localizations(chatbot.id, localizations_data)
        click.echo("Localizations loaded.")

if __name__ == '__main__':
    cli()