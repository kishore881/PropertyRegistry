import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {Navbar, Container, Button, Modal, Dropdown} from 'react-bootstrap'
import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3'

function NavBar({account, setAccount, setWeb3}) {

    const [noProviderError, setnoProviderError] = useState(false);
    const [incorrectChain, setIncorrectChain] = useState(false);
    let location = useLocation();

    const handleAccountsChanged = (accounts) => {
        console.log("did account change")
        if(accounts.length > 0){
            setAccount(accounts[0]);
        }else{
            setAccount(null);
        }
    }

    const connectAccount = (e) => {
        e.preventDefault();

        window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
            handleAccountsChanged(accounts)
        });
        window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    const handleChainChanged = (_chainId) => {
        if(_chainId !== '0x4') {
            setIncorrectChain(true);
        } else {
            setIncorrectChain(false);
        }
    }

    const initializeApp = (provider) => {

        window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
            
            handleChainChanged(chainId);

            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('accountChanged', () => this.forceUpdate())
            
            setWeb3(new Web3(provider));
        });
    }

    useEffect(() => {

        detectEthereumProvider().then(provider => {

            if(provider) {
                initializeApp(provider);
            } else {
                setnoProviderError(true);
            }
        });
      
    }, []);
    
    const displayAddress = account === null || account === undefined ? "" : `${account.substr(0, 6)}...${account.substr(38, 42)}`;

    return(
        <Navbar bg="primary" variant="dark">
            <Container>
                <Navbar.Brand> <Link to={'/'} className={'text-white'} style={{textDecoration: 'none'}}>
                    Property Registry {location.pathname !== '/' ? ' - ' + location.pathname.substring(1).toUpperCase() : ''}
                </Link> </Navbar.Brand>
                {
                    account === null || account === undefined ?
                        <Button className='btn btn-secondary rounded shadow-lg' onClick={connectAccount}>Connect MetaMask</Button> :
                        <Dropdown>
                            <Dropdown.Toggle split variant="success" id="dropdown-split-basic">
                                {displayAddress}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item as={Link} to="/user">User Dashboard</Dropdown.Item>
                                <Dropdown.Item as={Link} to="/registrar">Registrar Dashboard</Dropdown.Item>
                                {/* <Dropdown.Item as={Link} to="/admin">Admins</Dropdown.Item> */}
                            </Dropdown.Menu>
                        </Dropdown>
                }
            </Container>
            <Modal show={noProviderError} onHide={() => setnoProviderError(false)}>
                <Modal.Header closeButton> <Modal.Title>MetaMask Not Found</Modal.Title> </Modal.Header>
                <Modal.Body>
                    <p>Property Registry requires MetaMask browser extension to work. Please Install MetaMask from <a href='https://metamask.io' target='_blank' rel="noreferrer">metamask.io</a></p>
                </Modal.Body>
            </Modal>
            <Modal show={incorrectChain} onHide={() => setIncorrectChain(false)}>
                <Modal.Header closeButton> <Modal.Title>IncorrectChain</Modal.Title> </Modal.Header>
                <Modal.Body>
                    <p>Property Registry is available only on Ropsten Test Network. Please choose the same in MetaMask extension.</p>
                </Modal.Body>
            </Modal>
        </Navbar>
    )

}

export default NavBar;