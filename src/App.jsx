import { Route, Routes } from "react-router";
import Layout from "./components/layout";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";
import ChatPage from "./pages/chat";
import PostForm from "./pages/post-form";
import PostViewPage from "./pages/post-view";
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/create-post" element={<PostForm />} />
        <Route path="/posts/:postId" element={<PostViewPage />} />
      </Route>
    </Routes>
  );
}
