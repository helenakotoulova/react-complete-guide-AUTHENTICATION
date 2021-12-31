import classes from "./ProfileForm.module.css";
import { useRef, useContext } from "react";
import { AuthContext } from "../../store/auth-context";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
  const newPasswordInputRef = useRef();
  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

  const navigate = useNavigate();

  const submitHandler = (event) => {
    event.preventDefault();
    const newPassword = newPasswordInputRef.current.value;
    // optimal: add validation - e.g. has more than 7 symbols.
    // tohle je general code for change password: https://identitytoolkit.googleapis.com/v1/accounts:update?key=[API_KEY]
    fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyCfsJzs1I0jGRRPaeZaqOZPaoVGsHngqxc",
      {
        method: "POST",
        body: JSON.stringify({
          idToken: token,
          password: newPassword,
          returnSecureToken: false,
        }),
        // returnSecureToken => jestli ma nebo nema refreshovat token.
        headers: { "Content-type": "application/json" },
      }
    ).then((res) => {
      // assumption: always succeeds
      // pridame zde redirectovani:
      navigate("/");
    });
  };

  return (
    <form onSubmit={submitHandler} className={classes.form}>
      <div className={classes.control}>
        <label htmlFor="new-password">New Password</label>
        <input
          type="password"
          id="new-password"
          ref={newPasswordInputRef}
          minLength="7"
        />{" "}
        {/*bud pridame error handling pro nedostatecnou delku hesla, nebo tady prihodime primo metodu pro minLength hesla,
        ale nemela by to byt jedina forma validace => muze to byt dsiabled by DevTools*/}
      </div>
      <div className={classes.action}>
        <button>Change Password</button>
      </div>
    </form>
  );
};

export default ProfileForm;

/*
Tenhle odkaz ve Firebase pise info ohledne changing password.
https://firebase.google.com/docs/reference/rest/auth#section-change-password
Body musi zahrnovat idToken (bez nej to nepujde! identifikuje uzivatele)
*/
