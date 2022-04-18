import { useState, useEffect } from "react";
import { Container, Modal } from "react-bootstrap";

function Admin({web3, registry, account}) {

    const [error, setError] = useState(null);

    useEffect(() => {

        if(!web3 || !registry || !account) return;
        let registrar_hash = web3.utils.keccak256("ADMIN")
        registry.methods.hasRole(registrar_hash, account).call((err, res) => {

            if(err) {
                setError('Role Check: ' + err.message.split('{')[0]);
            } else if(!res) {
                setError(`Role Check: Address ${account} does not have access to ADMIN role.`);
            }
        });
      
    }, [account, registry, web3]);

    return (
        <Container className="my-3" style={{maxWidth:'720px'}}>
            <Modal show={error !== null} onHide={() => setError(null)} style={{color: 'var(--danger)', overflowX: "wrap"}}>
                <Modal.Header closeButton> <Modal.Title>Error</Modal.Title> </Modal.Header>
                <Modal.Body> <p> {error} </p> </Modal.Body>
            </Modal>

        </Container>
    )
}

export default Admin;