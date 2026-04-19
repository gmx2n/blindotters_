# Blind Otters: Smart Pantry & AI Chef

A smart web application designed to track your fridge inventory, reduce food waste, and connect with a community. By tracking expiration dates, the app uses AI to automatically generate recipes prioritizing ingredients that are about to go bad!

## Features

* **Fridge/Pantry Tracker:** Add ingredients, quantities, images, and expiration dates.
* **Smart Expiration Alerts:** Visually flags ingredients that are expiring in 2 days or less.
* **AI Chef Recipe Generator:** Uses AI to read your current inventory and suggest recipes that specifically utilize your soon-to-expire food.
* **Real-Time Community Chat:** A live, global chatroom where users can discuss recipes, share cooking tips, and hang out. 
* **Authentication:** Secure user login, ensuring your fridge data remains private while letting you safely chat in the community.

---

## Tech Stack

This project is built with modern, real-time web technologies:

* **Frontend:** React, React Router (for navigation)
* **Styling:** Tailwind CSS + daisyUI (for components like chat bubbles and buttons)
* **Backend & Database:** [Convex](https://www.convex.dev/) (Serverless backend, real-time database, and authentication)
* **AI Integration:** Together API / OpenAI via Convex Actions

---

## How It Works (Under the Hood)

### 1. Database Schema (`convex/schema.ts`)
The app's data lives in a real-time Convex database. It relies on a few main tables:
* `post`: Stores ingredient data (`name`, `quantity`, `expiration`, `imageUrl`, `authorId`).
* `chatMessages`: Stores community chat logs (`content`, `userId`, `userEmail`).
* `users`: Built-in Convex Auth tables to securely manage who is logged in.

### 2. Real-Time Chat (`components/Chat.tsx`)
The chat uses Convex's `useQuery` and `useMutation` hooks. Every time a new message is added to the database using the `addMessage` mutation, Convex automatically pushes the new data to the frontend, instantly updating the UI for everyone currently in the chatroom—no page refresh required!

### 3. AI Recipe Generation (`api.openai.getRecipes`)
When a user clicks "Get AI Recipes", the app:
1. Gathers all of the user's currently logged ingredients.
2. Calculates exactly how many days are left until each item expires.
3. Sends this data to a Convex **Action** (which is allowed to fetch data from external APIs like OpenAI/Together).
4. The AI returns structured recipe suggestions, explicitly highlighting the expiring ingredients it used to save them from the trash.

---

## Getting Started (Local Development)

If you want to run this project on your local machine, follow these steps:

### Prerequisites
* Node.js installed
* A [Convex](https://www.convex.dev/) account
* An API key for the AI generation (Together API or OpenAI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gmx2n/blindotters_.git
   cd blindotters_
