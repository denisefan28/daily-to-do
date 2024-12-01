# Getting Started with Daily-to-do

https://googlechromeai.devpost.com/

This project is a hackthon demo project of Google Chrome Built-in AI Challenge.


## Inspiration
The idea for Daily-To-Do was born out of my personal frustration with mornings that felt aimless. Often, I would sit at my desk, unsure of what to tackle first. I realized that many of us experience these "cold starts" in the morning, where we struggle to prioritize our day. The constant juggling of tasks and responsibilities made me think: What if there was a way to use the power of AI to suggest tasks based on what we’ve been focusing on recently? This spark of inspiration led to the creation of Daily-To-Do, a Chrome plugin that transforms scattered mornings into structured beginnings.

## What it does
The plugin generate a tailored to-do list based on your browsing history. The plugin analyzes the pages you've visited and suggests actionable tasks to help you start your day with something you may still working on and didn't finish yet.

## How I built it?

* [Chorome Extensions Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
* [Build-in AI](https://developer.chrome.com/docs/ai/built-in)

This is my first time to create a chrome plugin, so I took reference of two examples of chrome extensions
* https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/history
* https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/ai.gemini-on-device


The idea is to fetch user browse history once the plugin is launched. Then initialize the build-in Lanaguage model, using `chrome.aiOriginTrial.languageModel`. 
At the moment, I only use a very simple prompt to analyze the retrieved data and generate meaningful tasks.
The generated tasks persist in local storage. We can add or remove tasks in the to-do list.
After we finished all the tasks in the to-do list, there is a congratulation message pop-up.


## Accomplishments 
- support Browsing History Analysis
- support task generation using LLM responses, tailoring tasks to the user's recent online activity.
- User interface features
  - task list display
  - allow user add new tasks / delete existing tasks
  - Show a success message when all tasks are marked as complete.


## What's next for Daily-To-Do
- Enhanced AI Features: Incorporating more data sources, like calendar events or email summaries, to generate even more comprehensive to-do lists. (need permssion to access the data)
- Smart Task Prioritization: Introducing AI-powered task prioritization based on user preferences.
- Enhance prompts.
- Refact code move model interaction to background service worker.
