import { NavLink, Outlet } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Layout() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getUser);

  console.log("Layout user:", user);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-info p-4 flex">
        <div>
          <div className="flex gap-4">
            {user && (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? "text-white font-bold" : "text-primary hover:text-white")}
                >
                  My Fridge
                </NavLink>
                <NavLink
                  to="/create-post"
                  className={({ isActive }) => (isActive ? "text-white font-bold" : "text-primary hover:text-white")}
                >
                  My Groceries
                </NavLink>
                <NavLink
                  to="/chat"
                  className={({ isActive }) => (isActive ? "text-white font-bold" : "text-primary hover:text-white")}
                >
                  Chat
                </NavLink>


              </>
            )}
          </div>
        </div>

        <div className="ml-auto">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-primary">
                🌱 {user?.email?.split("@")[0] ?? "user"}
              </span>
              <button
                className="btn btn-sm btn-error"
                onClick={() => signOut()}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <NavLink to="/login">
              <button className="btn btn-sm btn-primary">Login</button>
            </NavLink>
          )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
