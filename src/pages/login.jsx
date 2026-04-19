import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-5xl font-bold mb-4">Welcome to the App</h1>
            <p className="text-lg text-gray-600 mb-8">Please log in to continue.</p>

            <div className="tabs tabs-lift">
                <input
                    type="radio"
                    name="login_signup_tabs"
                    className="tab"
                    aria-label="Login"
                />
                <div className="tab-content bg-base-100 border-base-300 p-6">
                    <LoginForm />
                </div>

                <input
                    type="radio"
                    name="login_signup_tabs"
                    className="tab"
                    aria-label="Sign Up"
                    defaultChecked
                />
                <div className="tab-content bg-base-100 border-base-300 p-6">
                    <SignupForm />
                </div>
            </div>
        </div>
    );
}


function LoginForm() {
    const { signIn } = useAuthActions();
    const navigate = useNavigate();

    return (
        <form
            className="flex flex-col space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();
                try {
                    await signIn("password", {
                        email: e.currentTarget.email.value,
                        password: e.currentTarget.password.value,
                        flow: "signIn",
                    });
                    navigate(-1);
                } catch (err) {
                    alert("Login failed: " + err.message);
                }
            }}
        >
            <fieldset className="fieldset">
                <legend className="fieldset-legend">email</legend>
                <input
                    type="text"
                    className="input"
                    placeholder="Enter your email"
                    name="email"
                />
            </fieldset>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">password</legend>
                <input
                    type="password"
                    className="input"
                    placeholder="Enter your password"
                    name="password"
                />
            </fieldset>
            <button type="submit" className="btn btn-primary">
                Log In
            </button>
        </form>
    );
}


function SignupForm() {
    const { signIn } = useAuthActions();
    const navigate = useNavigate();

    return (
        <form
            className="flex flex-col space-y-4"
            onSubmit={async (e) => {
                e.preventDefault();

                if (e.currentTarget.password.value !== e.currentTarget.passwordconfirm.value) {
                    alert("dijgoifjowe");
                    return;
                }

                try {
                    await signIn("password", {
                        email: e.currentTarget.email.value,
                        password: e.currentTarget.password.value,
                        //check to make sure that password matches password
                        flow: "signUp",
                    });
                    navigate(-1);
                } catch (err) {
                    //show alert if passwords do not match
                    alert("SignUp failed: " + err.message);
                }
            }}
        >
            <fieldset className="fieldset">
                <legend className="fieldset-legend">email</legend>
                <input
                    type="text"
                    className="input"
                    placeholder="Enter your email"
                    name="email"
                />
            </fieldset>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">password</legend>
                <input
                    type="password"
                    className="input"
                    placeholder="Enter your password"
                    name="password"
                />
            </fieldset>
            <fieldset className="fieldset">
                <legend className="fieldset-legend"> confirm password</legend>
                <input
                    type="password"
                    className="input"
                    placeholder="Please confirm your password"
                    name="passwordconfirm"
                />
            </fieldset>
            <button type="submit" className="btn btn-primary">
                Sign Up
            </button>
        </form>
    );
}

