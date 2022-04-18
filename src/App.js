import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import './App.css'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import { abi, address } from './web3/LandRegistry'
import Home from "./pages/Home";
import User from './pages/User'
import Registrar from "./pages/Registrar";
import Admin from "./pages/Admin";

function App() {  

  const [web3, setWeb3] = useState(null);
  const [registry, setRegistry] = useState(null);
  const [account, setAccount] = useState(null)

  useEffect(() => {

    if(web3 !== null) {
      setRegistry(new web3.eth.Contract(abi, address));
      web3.eth.getAccounts().then(accounts => {
        setAccount(accounts[0])
      });
    }
  }, [web3]);
  

  return (
    <BrowserRouter basename="%PUBLIC_URL%">
      <NavBar account={account} setAccount={setAccount} setWeb3={setWeb3}/>
      <Routes>
        <Route path="/" element={<Home web3={web3} registry={registry}/>}/>
        <Route path="/user" element={<User web3={web3} registry={registry} account={account}/>}/>
        <Route path="/registrar" element={<Registrar web3={web3} registry={registry} account={account}/>}/>
        <Route path="/admin" element={<Admin web3={web3} registry={registry} account={account}/>}/>
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;
