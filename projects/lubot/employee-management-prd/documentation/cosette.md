OpenAI’s Python SDK will automatically be installed with Cosette, if you don’t already have it.

from cosette import *
Cosette only exports the symbols that are needed to use the library, so you can use import * to import them. Alternatively, just use:

import cosette
…and then add the prefix cosette. to any usages of the module.

Cosette provides models, which is a list of models currently available from the SDK.

models
('gpt-4o',
 'gpt-4-turbo',
 'gpt-4',
 'gpt-4-32k',
 'gpt-3.5-turbo',
 'gpt-3.5-turbo-instruct')
For these examples, we’ll use GPT-4o.

model = models[0]
Chat

The main interface to Cosette is the Chat class, which provides a stateful interface to the models:

chat = Chat(model, sp="""You are a helpful and concise assistant.""")
chat("I'm Jeremy")
Hi Jeremy! How can I assist you today?

r = chat("What's my name?")
r
Your name is Jeremy. How can I assist you further?

As you see above, displaying the results of a call in a notebook shows just the message contents, with the other details hidden behind a collapsible section. Alternatively you can print the details:

print(r)
ChatCompletion(id='chatcmpl-9R8Z1c76TFqYFYjyON08CbkAmjerN', choices=[Choice(finish_reason='stop', index=0, logprobs=None, message=ChatCompletionMessage(content='Your name is Jeremy. How can I assist you further?', role='assistant', function_call=None, tool_calls=None))], created=1716254803, model='gpt-4o-2024-05-13', object='chat.completion', system_fingerprint='fp_729ea513f7', usage=In: 43; Out: 12; Total: 55)
You can use stream=True to stream the results as soon as they arrive (although you will only see the gradual generation if you execute the notebook yourself, of course!)

for o in chat("What's your name?", stream=True): print(o, end='')
I don't have a personal name, but you can call me Assistant. How can I help you today, Jeremy?