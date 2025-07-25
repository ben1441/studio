<a href="https://studio.firebase.google.com/import?url=https%3A%2F%2Fgithub.com%2Fben1441%2Fstudio">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://cdn.firebasestudio.dev/btn/open_dark_32.svg">
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://cdn.firebasestudio.dev/btn/open_light_32.svg">
    <img
      height="32"
      alt="Open in Firebase Studio"
      src="https://cdn.firebasestudio.dev/btn/open_blue_32.svg">
  </picture>
</a>

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
4.  **Important:** After saving your changes to `.env.local`, you must **restart the development server** for the new environment variables to be loaded.

### 2. Create a Firestore Database

This application uses Firestore to store poll data. If you haven't already, you need to create a database in your Firebase project.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. In the left-hand navigation under the "Build" section, click on "Firestore Database".
4. Click "Create database".
5. Choose to start in **production mode** and click "Next".
6. Select a Firestore location. **This cannot be changed later.** Choose a location close to your users.
7. Click "Enable".

### 3. Deploy Firestore Security Rules

To allow your app to read poll data, you need to deploy security rules.

1.  **Install the Firebase CLI:** If you don't have it, install it globally:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login to Firebase:**
    ```bash
    firebase login
    ```
3.  **Select your project:** Tell the CLI which Firebase project to use. Replace `[YOUR_PROJECT_ID]` with your actual Firebase Project ID.
    ```bash
    firebase use [YOUR_PROJECT_ID]
    ```
4.  **Deploy the rules:**
    ```bash
    firebase deploy --only firestore:rules
    ```

### 4. Run the Development Server

Once your credentials and security rules are in place, you can start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`.
