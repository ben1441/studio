# **App Name**: VoteLock

## Core Features:

- Poll Creation: Form for entering a poll question and a list of options to store in the database.
- Poll Display: Display the poll question, a list of buttons for each option with a vote count. Provide real-time updates.
- Vote Handling: Button click will call the castVote function in Firebase Cloud Functions with fingerprint ID, which increases the counter for that option in Firebase.
- Vote Confirmation: Feedback message based on if the vote was successful, or not. Only 1 vote is allowed per device ID.

## Style Guidelines:

- Primary color: Deep indigo (#4F46E5) to evoke trust and reliability.
- Background color: Light gray (#F9FAFB) for a clean and modern feel.
- Accent color: Violet (#8B5CF6) for interactive elements and highlights, providing a clear visual distinction.
- Headline font: 'Poppins' (sans-serif) for a modern and approachable design.
- Body font: 'Inter' (sans-serif) for clear and readable text.
- Use simple and clear icons from a library like FontAwesome or Remix Icon.
- Employ a clean, minimalist layout using Tailwind CSS grid and flexbox.