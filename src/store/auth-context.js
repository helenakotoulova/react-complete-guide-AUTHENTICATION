import React, { useState, useEffect, useCallback } from "react";

export const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const calculateRemainingTime = (expirationTime) => {
  // soucasny cas:
  const currentTime = new Date().getTime(); // takhle dostaneme cas v milisekundach

  // cas v budoucnu, kdy to ma vyprset:
  const adjExpirationTime = new Date(expirationTime).getTime(); // prevedeme ten expiration na date (dostaneme ho totiz jako nejaky string) a pak z nej zas vytahneme ten Time v ms.

  // zbyvajici cas:
  const remainingTime = adjExpirationTime - currentTime;
  return remainingTime;
};

let logoutTimer; // nadefinujeme si ho jako global variable.

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("token"); // pri spusteni stranky chceme, aby se prohlizel podival do Local Storage, jestli to tam nema ulozene.
  const storedExpirationTime = localStorage.getItem("expirationTime");
  const remainingTime = calculateRemainingTime(storedExpirationTime);
  if (remainingTime <= 60000) {
    // 1 min=60000 ms.
    // kdyz je zbyvajici cas mensi nez 1 minuta. nebo je dokonce zaporny (tzn token vyprsel),
    // chceme vymazat data z localStorage a nebudeme retrievovat token.
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  } else {
    // pokud mame dostatek casu pred expiraci:
    return {
      token: storedToken,
      duration: remainingTime,
    };
  }
};

const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();
  let initialToken; // variable initialToken - pokud ji nic nepriradime, zustane undefined.
  if (tokenData) {
    // pokud mame data, tak se initialToken ulozi na tokenData.token
    initialToken = tokenData.token;
  }
  // pokud jsme nedali logout a jen jsme reloadovali stranku, melo by to tam zustat ten token, a my bychom meli zustat prihlaseni. (dokud nedame logout)
  // kazdopadne i ten initialToken muze byt ze zacatku undefined (pokud se prihlasujeme a nebyli jsme tedy prihlaseni)
  // A ANI NEPOTREBUJEME USEEFFECT, PROTOZE LOCAL STORAGE IS SYNCHRONOUS API.
  const [token, setToken] = useState(initialToken);

  // if user has token => he is logged in. and vice versa.
  //const userIsLoggedIn = token? true : false;
  const userIsLoggedIn = !!token; // js operator. it returns boolean value true/false. tzn jestli token existuje (a zde je to nejaky string), tak nam to hodi true.

  const logoutHandler = useCallback(() => {
    setToken(null); // clear token
    localStorage.removeItem("token"); // po logoutovani chceme ten token z Local Storage vymazat
    localStorage.removeItem("expirationTime");
    if (logoutTimer) {
      // if logout Timer was set => now we want to clear it (when we logout)
      clearTimeout(logoutTimer);
    }
  }, []); // no dependencies for useCallback. protoze clearTimeOut a localStorage are browser built in functions (not specifically react),
  // we dont need to add setToken, protoze je to state updating function a React garantuje, ze tyto fce se nikdy nemeni (ale teoreticky to tam klidne muzeme pridat, kdyz se to nemeni),
  // a logoutTimer je global variable nadefinovana mimo tuto komponentu (tedy je nadefin. mimo react rendering flow), tzn taky ji sem nemusime pridavat.

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    // navic pridame i ukladani tokenu do Local Storage prohlizece,
    // aby kdyz reloadujeme stranku, nebyla nase data ztracena.
    // local Storage umi storovat jen primitive data - strings, booleans, numbers.. pokud bychom chteli storovat object, museli bychom pouzit json(), abychom ho nejdriv stringifikovali.
    // zde je ale primo o cislo, tzn lze zapsat takhle:
    // chceme pridat i auto-logout, aby se automaticky odhlasil po 1 hodine.
    localStorage.setItem("token", token);
    const remainingTime = calculateRemainingTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime); // po remaining time se spusti logoutHandler
    // test: setTimeout(logoutHandler,5000) => odhlasi nas to po 5 s.
    // ulozime si i ten expirationTime do local Storage(pozn. musi to byt string, coz nyni je):
    localStorage.setItem("expirationTime", expirationTime);
  };

  useEffect(() => {
    if (tokenData) {
      //console.log(tokenData.duration) // takhle se nam bude vypisovat zbyvajici cas po kazdem reloadovani. zacneme od 3 600 000 ms, coz je 1 h.
      // if we automatically logged in the user, it should set the timer according the remaining stored time.
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]); // kdyz tady pridame logoutHandler, tak ten logoutHandler bychom meli dat do useCallback, aby se necreatovala zbytecne pokazde znova

  const authContextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
