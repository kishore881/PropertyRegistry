import { useState, useEffect } from "react";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import IpfsForm from '../components/IPFS';

function Registrar({web3, registry, account}) {

    const [error, setError] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [transactionState, setTransactionState] = useState('');
    const [status, setStatus] = useState(null);
    const [hash, setHash] = useState('');

    const mintToken = async (user, ipfs_id, callback) => {

        let user_adr;
        try{
            user_adr = web3.utils.toChecksumAddress(user);  
        } catch (e){
            setError('Invalid address');
            setRegistering(false);
        }
        
        registry.methods.register(user_adr, ipfs_id).send({from: account})
        .on('transactionHash', (hash) => {
            setTransactionState('Pending');
            setStatus(`Transaction Pending.\n Tx hash: ${hash}`)
        })
        .on('receipt', (receipt) => {
            setTransactionState('Success');
            setStatus(`Registered successfully.\n Token Id: ${receipt.events.Transfer.returnValues['tokenId']}\n Tx hash: ${receipt.transactionHash} \n`)
            setRegistering(false);
            callback();
        })
        .on('error', (error, receipt) => {
            if(error.code !== 4001) {
                setError(error.message);
            }
            setRegistering(false);
        });
    }

    const registerProperty = (e) => {
        e.preventDefault();
        setRegistering(true);
        
        let ipfs_id = e.target[0].value;
        let user = e.target[1].value;
        console.log(ipfs_id, user);
        mintToken(user, ipfs_id, res => e.target.reset());
    }

    useEffect(() => {

        if(!web3 || !registry || !account) return;
        let registrar_hash = web3.utils.keccak256("REGISTRAR")
        registry.methods.hasRole(registrar_hash, account).call((err, res) => {

            if(err) {
                setError('Role Check: ' + err.message.split('{')[0]);
            } else if(!res) {
                setError(`Role Check: Address ${account} does not have access to REGISTRAR role.`);
            }
        });
      
    }, [account, registry, web3]);

    return (
        <Container className="my-3" style={{maxWidth:'720px'}}>
            <IpfsForm setHash={setHash}/>
            <hr/>
            <Form className="py-3 my-3" onSubmit={registerProperty}>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="register-ipfs-input">Property IPFS Hash</Form.Label>
                    <Form.Control type="text-input" id="register-ipfs-input" aria-describedby="property-ipfs" value={hash} disabled />
                    <Form.Text id="property-ipfs" muted>
                        This hash is taken from the form above automatically.
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="register-user-input">User Adress</Form.Label>
                    <Form.Control type="text-input" id="register-user-input" aria-describedby="userId"/>
                    <Form.Text id="userId" muted>
                        Enter Ethereum Address of the new owner of the Property
                    </Form.Text>
                </Form.Group>
                {
                    registering === false ?
                        <Button variant="primary" type="submit"> Register Property</Button> :
                        <Spinner animation="border" />
                }
            </Form>
            {
                error !== null ? 
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        <Alert.Heading>Error occurred!</Alert.Heading>
                        <p>{error}</p>
                    </Alert> : (
                status !== null ? 
                    <Alert variant={transactionState==='Pending' ? 'info' : 'success'} onClose={() => setStatus(null)} dismissible>
                        <Alert.Heading>{transactionState}</Alert.Heading>
                        <p>{status}</p>
                    </Alert> : <></>
                )
            }
        </Container>
    )
}

export default Registrar;