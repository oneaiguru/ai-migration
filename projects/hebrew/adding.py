import json
import os
import random
import sys
from typing import Optional

import openai

from .credentials import get_openai_key


def load_lists(file_path: str) -> dict:
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return {
        "verbs": [],
        "body_parts": [],
        "geography_terms": [],
        "numerals": [],
        "family_relationships": [],
    }


def save_lists(file_path: str, lists: dict) -> None:
    with open(file_path, "w") as f:
        json.dump(lists, f)


def add_item_to_list(file_path: str, lists: dict, category: str, item: str) -> None:
    if category in lists:
        lists[category].append(item)
        save_lists(file_path, lists)
    else:
        print(f"Invalid category '{category}'")


def practice_item(lists: dict, category: str) -> str:
    if category not in lists:
        return f"Invalid category '{category}'."
    if not lists[category]:
        return f"No items available for category '{category}'."
    return random.choice(lists[category])


def load_history(file_path: str) -> list:
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return []


def save_history(file_path: str, history: list) -> None:
    with open(file_path, "w") as f:
        json.dump(history, f)


def ensure_openai_key() -> str:
    api_key = get_openai_key(required=False)
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required")
    openai.api_key = api_key
    return api_key


conversation: Optional[object] = None


def get_conversation():
    from langchain.chains import ConversationChain
    from langchain.chat_models import ChatOpenAI
    from langchain.memory import ConversationBufferMemory
    from langchain.prompts import (
        ChatPromptTemplate,
        HumanMessagePromptTemplate,
        MessagesPlaceholder,
        SystemMessagePromptTemplate,
    )

    global conversation
    if conversation is None:
        ensure_openai_key()
        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                    "The following is a friendly conversation between a human and an AI. "
                    "The AI is talkative and provides lots of specific details from its context. "
                    "If the AI does not know the answer to a question, it truthfully says it does not know."
                ),
                MessagesPlaceholder(variable_name="history"),
                HumanMessagePromptTemplate.from_template("{input}"),
            ]
        )
        llm = ChatOpenAI(temperature=0.5)
        memory = ConversationBufferMemory(return_messages=True)
        conversation = ConversationChain(memory=memory, prompt=prompt, llm=llm)
    return conversation


def chat_gpt_langchain_v2(history: list, text: str) -> str:
    convo = get_conversation()
    reply = convo.predict(input=text)
    history.append({"role": "assistant", "content": reply})
    save_history("history.txt", history[-20:])
    return reply


def load_glossary(file_path: str) -> list:
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return []


def add_word_to_glossary(file_path: str, glossary: list, word: str) -> None:
    glossary.append(word)
    with open(file_path, "w") as f:
        json.dump(glossary, f)


def track_difficult_word(file_path: str, glossary: list, word: str) -> None:
    glossary.remove(word)
    glossary.insert(0, word)
    with open(file_path, "w") as f:
        json.dump(glossary, f)


def modify_response_with_word(response: str, glossary: list) -> str:
    if glossary:
        response = f"{response} {glossary[0]}"
    return response


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python adding.py [add_word|mark_word_as_difficult|chat] [text/word]")
        sys.exit(1)

    command = sys.argv[1]
    text_or_word = sys.argv[2]

    glossary_file_path = "glossary.json"
    glossary = load_glossary(glossary_file_path)

    if command == "add_word":
        add_word_to_glossary(glossary_file_path, glossary, text_or_word)
    elif command == "mark_word_as_difficult":
        track_difficult_word(glossary_file_path, glossary, text_or_word)
    elif command == "chat":
        history = load_history("history.txt")
        response = chat_gpt_langchain_v2(history, text_or_word)
        response = modify_response_with_word(response, glossary)
        print("Response:", response)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
