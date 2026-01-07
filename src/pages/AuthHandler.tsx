import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromURL = params.get("token");

        if (tokenFromURL) {
            localStorage.setItem("token", tokenFromURL);
            localStorage.setItem("name", params.get("name") || "");
            localStorage.setItem("email", params.get("email") || "");

            const redirectAfterLogin = localStorage.getItem("redirectAfterLogin") || "/";
            navigate(redirectAfterLogin);
        } else if (localStorage.getItem("token")) {
            // Already logged in
            navigate("/");
        } else {
            // Not logged in
            navigate("/login");
        }
    }, []);


    return <div>Logging in...</div>;
};

export default AuthHandler;
