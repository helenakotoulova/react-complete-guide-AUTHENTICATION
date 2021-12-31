import { useState, useRef, useContext } from "react";
import { AuthContext } from "../../store/auth-context";
import { useNavigate } from "react-router-dom";

import classes from "./AuthForm.module.css";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const authCtx = useContext(AuthContext);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;
    // optimal: validation - napr. ze to neni prazdne a ze ma heslo vice nez 7 znaku.

    setIsLoading(true);
    let url;

    // https://firebase.google.com/docs/reference/rest/auth - odsud vezmeme to url.
    if (isLogin) {
      // tohle je general code (pro: Sign IN with email / password): https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCfsJzs1I0jGRRPaeZaqOZPaoVGsHngqxc";
    } else {
      // tohle je general code (pro: Sign UP with email / password). musime tam pridat vlastni API key: https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]
      // ten ziskame v project overview => projest settings => web api key
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCfsJzs1I0jGRRPaeZaqOZPaoVGsHngqxc";
    }
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        // request body payload je tam taky popsany. a je pro sing in i sign up stejny.
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        setIsLoading(false);
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then((data) => {
            //console.log(data)
            // napr. kdyz pri sign upovani (tedy vytvareni noveho uctu) zadame jen ctyrmistne heslo,
            // tak se v konzoli zobrazi error => weak password. password should be at least 6 characters long.
            let errorMessage = "Authentication failed!";
            if (data && data.error && data.error.message) {
              errorMessage = data.error.message;
            }
            throw new Error(errorMessage);
          });
        }
      })
      .then((data) => {
        // here we will end-up when it is successful.
        //console.log(data) // vypise se nam objekt, kde bude mimo jine idToken.
        // ten idToken ted potrebujeme ulozit nekde, kde k nemu budeme mit pristup z ruznych mist aplikace => context nebo Redux => volime context,
        // tzn nemusime instalovat dalsi package a login state se nemeni tak casto, tzn nebudeme mit performance issues.
        // po sign-in vy v response neziskavame jen idToken, ale i expiresIn string = the number of second in which the ID token expires (1 h), je to v sekundach, ale my potrebujeme milisekundy:
        // nejdriv ziskame new Date.getTime() (v ms) aktualni a k tomu pricteme (+data.ExpiresIn*1000). pred to +data.ExpiresIn musime dat plus, aby se to konvertovalo ze stringu na cislo. a z toho celeho udelame new Date.
        const expirationTime = new Date(
          new Date().getTime() + +data.expiresIn * 1000
        );
        authCtx.login(data.idToken, expirationTime.toISOString()); // a ten expiration time budeme konvertovat na ISO string, protoze pak v auth-contextu beztak ocekavame string, ktery predelame na date pomoci new Date.
        // !!!!! dulezite: musime to spustit tu metodu => toISOString();
        // v tomto pripade chceme redirectovat
        navigate("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input
            type="password"
            id="password"
            required
            ref={passwordInputRef}
          />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? "Login" : "Create Account"}</button>
          )}
          {isLoading && <p>Sending request...</p>}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
