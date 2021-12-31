import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../store/auth-context';

import classes from './MainNavigation.module.css';

const MainNavigation = () => {
  const authCtx = useContext(AuthContext);
  //const {isLoggedIn} = authCtx; // slo by zapsat i takhle, viz pozn. nize
  const isLoggedIn = authCtx.isLoggedIn;

  // logoutovani - firebasu je jedno jestli jsme logged in nebo ne, tzn neodesilame nic na backend.
  // musime jen vymazat token u nas v aplikaci, aby se mohl prihlasit jiny uzivatel

  const logoutHandler = () => {
    authCtx.logout();
    // optional: redirect user
  }

  return (
    <header className={classes.header}>
      <Link to='/'>
        <div className={classes.logo}>React Auth</div>
      </Link>
      <nav>
        <ul>
          {!isLoggedIn && <li>
            <Link to='/auth'>Login</Link>
          </li>}
          {isLoggedIn &&<li>
             <Link to='/profile'>Profile</Link>
          </li>}
          {isLoggedIn && <li>
            <button onClick={logoutHandler}>Logout</button>
          </li>}
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;

/*
DULEZITA POZNAMKA K DESTRUKTURIZACI:
const objekt = {
    id:1,
    telo:2
  }
const {telo} = objekt;
console.log(telo) // 2
const mojeTelo = objekt.telo;
console.log(mojeTelo) // 2

=>TZN. VYSLEDEK STEJNY
*/
