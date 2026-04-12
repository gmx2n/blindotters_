import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function Layout() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getUser);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" data-theme="light">
      <nav className="bg-base-300 p-4 flex">
        {/* menus */}
        <div className="">
          <div className="flex gap-4">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "text-primary" : "")}
            >
              Home
            </NavLink>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "" : "")}
            >
              Connect to explore page
            </NavLink>
          </div>
        </div>

        {/* post */}
        <div className="">
          <Authenticated>
            <div className="gap-2 mx-2">
              <button
                className=""
                onClick={() => navigate("/create-post")}
              >
                Post
              </button>
            </div>
          </Authenticated>
        </div>


        {/* profile */}
        <div className="ml-auto">
          <Authenticated>
            <div className="flex items-center gap-2">

              <ul className="relative">
                <details className="">
                  <summary className="text-sm font-bold text-primary" onClick={(v) => setShowUserMenu(!v)}>
                    🧑‍🦱 {user?.email.split("@")[0]}!!!
                  </summary>

                  <div className={`rounded-t-none bg-base-300 p-3 absolute`}>
                    <div>
                      <li className="text-sm m-1 top-10"
                        onClick={() => signOut()}><a>Sign Out</a></li>
                      <li className="text-sm m-1 top-10"
                        onClick={() => (true)}><a>Profile (need to connect) </a></li>
                    </div>
                  </div>
                </details>
              </ul>
            </div>
          </Authenticated>



          <Unauthenticated>
            <NavLink to="/login">
              <button className="btn btn-sm">Login</button>
            </NavLink>
          </Unauthenticated>
        </div>
      </nav>
      <div className="flex-1 flex flex-col">
        <div></div>
        <Outlet />
      </div>
    </div>
  );
}
