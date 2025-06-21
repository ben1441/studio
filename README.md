# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

### 1. Configure Firebase Credentials

This project requires Firebase credentials to connect to the database.

1.  Copy the example environment file:
    ```bash
    cp .env.local.example .env.local
    ```
2.  Open the newly created `.env.local` file.
3.  Follow the instructions in the file to add your Firebase project's public configuration and private service account key.

### 2. Create a Firestore Database

This application uses Firestore to store poll data.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. In the left-hand navigation under the "Build" section, click on "Firestore Database".
4. Click "Create database".
5. Choose to start in **production mode** and click "Next".
6. Select a Firestore location. **This cannot be changed later.** Choose a location close to your users.
7. Click "Enable".

### 3. Run the Development Server

Once your credentials are in place and you've created a database, you can start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`.
