# How to Get Your Free Google Gemini API Key

Getting a Gemini API key is completely free and takes about 60 seconds. You do not need to enter any credit card information.

## Steps:

1. Go to Google AI Studio: [https://aistudio.google.com/](https://aistudio.google.com/)
2. Sign in with your Google account.
3. Once logged in, click on the **"Get API key"** link (usually on the left sidebar).
4. Click the blue **"Create API key"** button.
5. In the generic dialog that pops up, select either your first existing Google Cloud project from the dropdown, OR click **"Create API key in a new project"**.
6. A new key will be generated starting with `AIzaSy...`.
7. **Copy that entire key.**

## Adding it to this Project

Once you have copied the key, we need to add it securely to your project.

1. Open the file named `.env` in the root of your `fin-main` folder. If it doesn't exist, create it.
2. Add the following line to the bottom of the `.env` file, replacing `YOUR_COPIED_KEY_HERE` with your actual key:

```env
VITE_GEMINI_API_KEY=YOUR_COPIED_KEY_HERE
```

3. Save the `.env` file.

Once you have done this, tell me, and I will write the code to integrate Gemini for your **Receipt Scanner** and **AI Chatbot**!
