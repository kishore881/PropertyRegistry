import { Container, Button, Modal, Card, Placeholder, Form, Alert, Spinner, Accordion, ListGroup, Table } from "react-bootstrap";
import { useState, useEffect } from 'react';

function User ({web3, registry, account}) {
    
    const [count, setCount] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [error, setError] = useState(null);
    const [showTransferModal, setTransferModal] = useState(false);
    const [transfering, setTransfering] = useState(false);
    const [status, setStatus] = useState(null);
    const [historyToken, setHistoryToken] = useState(null);
    const [tokenOwner, setTokenOwner] = useState(null);
    const [tokenHash, setTokenHash] = useState(null);
    const [tokenHistory, setTokenHistory] = useState(null);

    const resetTokenDetails = () => {
        setHistoryToken(null)
        setTokenOwner(null);
        setTokenHash(null);
        setTokenHistory(null);
    }

    const closeTransferModal = () => {
        setStatus(null);
        setTransferModal(false);
    }

    const getTokenByIndex = (index) => {
        return new Promise((resolve, reject) => {
            registry.methods.tokenOfOwnerByIndex(account, index).call((err, res) => {
                if(err !== null){
                    reject('Property: ' +  err.message.split('{')[0]);
                }
                resolve(res);
            })
        })
    }

    const getIPFSbyToken = (tokenId) => {
        return new Promise((resolve, reject) => {
            registry.methods.cid(tokenId).call((err, res) => {
                if(err !== null){
                    reject('IPFS: ' +  err.message.split('{')[0]);
                }
                resolve(res);
            })
        })
    }
    
    const getTokens = () => {
        if(account === null) return;
        let properties = [];
        for (let i = 0; i < count; i++) {
            properties.push(i);
        }
        Promise.all(
            properties.map(i => {
                return new Promise((resolve, reject) => {
                    getTokenByIndex(i).then((tokenId) => {
                        getIPFSbyToken(tokenId).then((ipfs) => {
                            properties[i] = ({'tokenId': tokenId, 'ipfs': ipfs})
                            resolve(true);
                        }).catch(error => {setError(error)})
                    }).catch(error => {setError(error)})
                })
            })
        ).then(() => {setTokens(properties)});
    }

    useEffect(() => {
        getTokens();
    }, [count]);

    useEffect(()=>{

        if(account === null) return;
        registry.methods.balanceOf(account).call((err, res) => {
            if(err !== null){
                setError('Balance: ' + err.message.split('{')[0]);
            } else{
                setCount(res);
            }
        })
    }, [account, registry])

    const getPlaceholder = () => {
        let res = []
        if(count > tokens.length) {
            for(let i = 0; i < count; i++){
                res.push(
                    <Card key={i} style={{ width: '25rem' }} className="m-2">
                        <Card.Body>
                            <Placeholder as={Card.Title} animation="glow"> <Placeholder xs={6} /> </Placeholder>
                            <Placeholder as={Card.Subtitle} animation="glow"> <Placeholder xs={12} /> </Placeholder>
                        </Card.Body>
                    </Card>
                )
            }
        }
        return res
    }

    const transferToken = (to_user, property, callback) => {
        let to_adr;
        try{
            to_adr = web3.utils.toChecksumAddress(to_user);  
        } catch (e){
            setError('Invalid address');
            setTransfering(false);
        }
        
        registry.methods.safeTransferFrom(account, to_adr, property).send({from: account})
        .on('transactionHash', (hash) => {
            setStatus(`Transaction Pending.\n Tx hash: ${hash}`)
        })
        .on('receipt', (receipt) => {
            setStatus(`Transaction successfully.\n Tx hash: ${receipt.transactionHash}`)
            callback();
            setCount(count-1);
            setTimeout(closeTransferModal, 3000);
        })
        .on('error', (error, receipt) => {
            if(error.code !== 4001) {
                setError(error.message);
            }
            setTransfering(false);
        });
    }

    const transferProperty = (e) => {
        e.preventDefault();
        setTransfering(true);

        let property = e.target[0].value
        let user = e.target[1].value

        transferToken(user, property, () => e.target.reset());
    }

    const getHistory = async (tokenId) => {

        registry.getPastEvents('Transfer', {filter: {tokenId: tokenId}, fromBlock: 0, toBlock: 'latest' },
            (error, eventResult) => {
                if (error)
                    setError(error.message.split('{')[0]);
                else
                    setTokenHistory(eventResult);
            }
        );

    }

    const getOwner = async (tokenId) => {

         registry.methods.ownerOf(tokenId).call((err, res) => {
            if(err !== null){
                setError('Owner: ' + err.message.split('{')[0]);
            } else{
                setTokenOwner(res);
            }
        });

    }

    const getIPFSLink = async (tokenId) => {

        registry.methods.cid(tokenId).call((err, res) => {
            if(err !== null){
                setError('IPFS Link: ' + err.message.split('{')[0]);
            } else{
                setTokenHash(res);
            }
        });
    }

    useEffect(() => {
        if(historyToken == null) return;
        let tokenId = web3.utils.toBN(historyToken);

        getIPFSLink(tokenId);
        getOwner(tokenId);
        getHistory(tokenId);

    }, [historyToken]);

    return (
        <Container className="my-3" style={{maxWidth:'900px'}}>
            <Modal show={error !== null} onHide={() => setError(null)} style={{overflowX: "wrap"}}>
                <Modal.Header closeButton> <Modal.Title>Error</Modal.Title> </Modal.Header>
                <Modal.Body> <p> {error} </p> </Modal.Body>
            </Modal>
            <Modal size='xl' centered show={showTransferModal} style={{overflowX: "wrap"}}>
                <Modal.Header className="border-bottom"> <Modal.Title>Transfer Property</Modal.Title> </Modal.Header>
                <Modal.Body> 
                    <Form id="transfer-form"  onSubmit={transferProperty}>
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="transfer-property-input">Property ID</Form.Label>
                            <Form.Control type="text-input" id="transfer-property-input" aria-describedby="propertyId"/>
                            <Form.Text id="propertyId" muted>
                                Enter the property ID
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="user-input">User Adress</Form.Label>
                            <Form.Control type="text-input" id="user-input" aria-describedby="userId"/>
                            <Form.Text id="userId" muted>
                                Enter Eth Address to transfer the property to.
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-top">
                    {
                        transfering === false ?
                        <>
                            <Button onClick={closeTransferModal}>Cancel</Button>
                            <Button variant="danger" type="submit" form="transfer-form"> Transfer Property</Button> 
                        </>:
                        (
                            status !== null ? <Alert variant="primary">{status}</Alert> :
                            <Spinner animation="border" variant="danger" className="mx-auto"/>
                        )
                    }
                </Modal.Footer>
            </Modal>
            <div className="d-flex flex-nowrap justify-content-between">
                <p className="h5 my-auto">Your Properties {count > 0 ? `(${count})`: ''}</p>
                <Button variant="warning" onClick={() => setTransferModal(true)}>Transfer Property</Button>
            </div>
            <hr className="my-0"/>
            <div className="m-3 d-flex flex-wrap justify-content-around">
                {
                    getPlaceholder()
                }
                {
                    tokens.map((token, index) => {
                        return (
                            <Card key={index} onClick={() => setHistoryToken(token.tokenId)} style={{ width: '25rem', cursor:'pointer'}} className="m-2">
                                <Card.Body>
                                    <Card.Title>{token.tokenId}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{token.ipfs}</Card.Subtitle>
                                </Card.Body>
                            </Card>
                        )
                    })
                }
            </div>
            { historyToken != null &&
            <Modal size='xl' centered show style={{overflowX: "wrap"}} onHide={resetTokenDetails}>
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title>{historyToken}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item>IPFS Document Hash: 
                            <span className="h6 mx-3 placeholder-glow"> 
                                {tokenHash !== null ? <a href={`https://ipfs.io/ipfs/${tokenHash}`} target='_blank' rel="noreferrer">{tokenHash}</a> : <Placeholder xs={6}/>}
                            </span>
                        </ListGroup.Item>
                        <ListGroup.Item>Owned By: 
                            <span className="h6 mx-3 placeholder-glow">
                                {tokenOwner !== null ? tokenOwner : <Placeholder xs={6}/>}
                            </span>
                        </ListGroup.Item>
                        <Accordion flush>
                            <Accordion.Item  eventKey="0">
                                <Accordion.Header>History:</Accordion.Header>
                                <Accordion.Body>
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Owner</th>
                                                <th>Operator</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {   tokenHistory !== null &&
                                            tokenHistory.map((transfer, index) =>{
                                                return (
                                                <tr key={index}>
                                                    <td> {index + 1} </td>
                                                    <td> {transfer.returnValues['from']}</td>
                                                </tr>)
                                            })
                                        }            
                                        {
                                            tokenHistory!== null && tokenHistory.length > 0 && 
                                            <tr>
                                                <td> {tokenHistory.length+1} </td>
                                                <td> {tokenHistory[tokenHistory.length - 1].returnValues['to']}</td>
                                            </tr>
                                        }
                                        </tbody>
                                    </Table>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </ListGroup>
                </Modal.Body>
            </Modal>
            }
        </Container>
    )
}

export default User;