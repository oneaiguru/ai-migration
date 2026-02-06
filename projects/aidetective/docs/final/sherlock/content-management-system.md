# Content Management System (CMS)

## 1. Overview
The **Content Management System (CMS)** is responsible for storing, managing, and retrieving detective stories within Sherlock AI. It ensures:
- Efficient **story structure and retrieval**.
- Support for **branching narratives and choice-based progression**.
- **Version control and updates** without disrupting ongoing player sessions.
- **Multimedia integration** for story elements.

---

## 2. Story Structure and Storage

### 2.1 Story Format
Each detective story is structured as a **JSON-based or database-stored branching narrative**, with the following elements:

```json
{
  "story_id": "library_shadows",
  "title": "The Library Shadows Mystery",
  "intro": "You arrive at the old library, where a murder has taken place...",
  "chapters": [
    {
      "chapter_id": "c1",
      "text": "The crime scene is dimly lit, books scattered on the floor...",
      "choices": [
        {
          "text": "Examine the body",
          "next": "c2",
          "conditions": [],
          "results": [
            {"effect": "add_clue", "clue_id": "corpse_analysis"}
          ]
        },
        {
          "text": "Check the bookshelves",
          "next": "c3",
          "conditions": [],
          "results": []
        }
      ]
    }
  ],
  "endings": [
    {
      "ending_id": "good",
      "condition": "solved_case",
      "text": "You correctly deduced the killer’s identity!"
    },
    {
      "ending_id": "bad",
      "condition": "wrong_accusation",
      "text": "You arrested the wrong suspect!"
    }
  ]
}