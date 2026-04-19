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
    <div className="min-h-screen flex flex-col" data-theme="icepirate">
      <nav className="bg-infos bg-info p-4 flex">
        {/* menus */}
        <div className="">
          <div className="flex gap-4">
            <Authenticated>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "text-white" : "text-primary")}
              >
                My Fridge
              </NavLink>
            </Authenticated>
            <NavLink
              to="/chat"
              className={({ isActive }) => (isActive ? "text-white font-bold" : "text-primary")}
            >
              Chat
            </NavLink>
          </div>
        </div>
        <div className="">
          <Authenticated>
            <div className="gap-2 mx-4">
              <NavLink
                to="/create-post"
                className={({ isActive }) =>
                  isActive ? "text-white font-bold" : "text-primary"
                }
              >
                My Groceries
              </NavLink>
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
                    🌱 {user?.email.split("@")[0]}
                  </summary>

                  <div className={`rounded-t-none p-1 absolute`}>
                    <div>
                      <li className="text-sm bg-info text-primary p-2 "
                        onClick={() => signOut()}><a>Sign Out</a></li>
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
      </nav >
      <div className="flex-1 flex flex-col">
        <div></div>
        <Outlet />
      </div>
    </div >
  );
}
