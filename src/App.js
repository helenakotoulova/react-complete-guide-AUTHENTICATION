import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import UserProfile from "./components/Profile/UserProfile";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";

import {useContext} from 'react';
import {AuthContext} from './store/auth-context';

function App() {
  const authCtx=useContext(AuthContext);
  const loggedIn = authCtx.isLoggedIn;

  // ted mame problem, ze na stranky profilu se jde dostat i pres to, ze nejsme logged In.
  // staci napsat tu adresu do prohlizece. to nechceme. proto pridame conditional rendering.
  // jako sice nemuze menit heslo, protoze neni loggedIn a tim padem nema idToken, ale i tak by se tam nemel dostat.
  // plus kdyz zada nejakou uplne jinou url bude ho to navigovat na '/'

  return (
    <Layout>
      <Routes>
        <Route path="/" exact element={<HomePage />} />
        {!loggedIn && <Route path="/auth" element={<AuthPage />} />}
        {loggedIn && <Route path="/profile" element={<UserProfile />} />}
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Layout>
  );
}

export default App;
