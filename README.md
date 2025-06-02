# React Test

## Prompt for questions extraction from a CKE test:
```
extract questions from this file in a provided JSON format:
{
    "id": "test11-1", 
    "question": "Do chemicznej ochrony roślin przed mszycami stosuje się", 
    "options": [
      "insektocydy.", 
      "herbicydy.", 
      "fungicydy.", 
      "nematocydy." 
    ],
    "answer": [0] 
  },
this is an example of extracted first question, where:
- id: first part is shortened filename prefix and second one is number of question,
- question: extracted question
- options: all four options for this question which appear after the question
- answer: list of indexes of correct answers, correct answers are located on the last page after KLUCZ ODPOWIEDZI, the are coded as for this example 1 A which map to first item with index 0

In some questions you can find images after question text, then you should add also img key with empty string as value so i can further on extract the image.

Please extract first 5 questions for now so I can check if the format is good.
```