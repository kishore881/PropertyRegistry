import { Form, Button, Spinner, Alert, Container, ListGroup, Accordion, Table } from "react-bootstrap";
import { useState } from "react";

function Home ({web3, registry}) {
    // console.log(registry);

    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [ipfsProperty, setIPFS] = useState(null);
    const [owner, setOwner] = useState(null);
    const [history, setHistory] = useState(null);

    const getHistory = async (tokenId) => {

        registry.getPastEvents('Transfer', {filter: {tokenId: tokenId}, fromBlock: 0, toBlock: 'latest' },
            (error, eventResult) => {
                if (error)
                    setError(error.message.split('{')[0]);
                else
                    setHistory(eventResult);
            }
        );

    }

    const getOwner = async (tokenId) => {

         registry.methods.ownerOf(tokenId).call((err, res) => {
            if(err !== null){
                setError('Owner: ' + err.message.split('{')[0]);
            } else{
                setOwner(res);
            }
        });

    }

    const getIPFSLink = async (tokenId) => {

        registry.methods.cid(tokenId).call((err, res) => {
            if(err !== null){
                setError('IPFS Link: ' + err.message.split('{')[0]);
            } else{
                setIPFS(res);
            }
        });
    }

    const searchProperty = async (e) => {
        e.preventDefault();
        setSearching(true);

        let tokenId;
        try {
            tokenId = web3.utils.toBN(e.target[0].value);    
        } catch (e) {
            setError('Invalid tokenId');
            setSearching(false);
        }
        
        await Promise.all([
            getIPFSLink(tokenId),

            getOwner(tokenId),
        
            getHistory(tokenId),
        ])

        setSearching(false);

    }

    return(
        <Container className="my-3" style={{maxWidth:'720px'}}>
            <Form className="py-3 my-3" onSubmit={searchProperty}>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="search-input">Search Property</Form.Label>
                    <Form.Control type="text-input" id="search-input" aria-describedby="propertySearch"/>
                    <Form.Text id="propertySearch" muted>
                        Enter ID of any property to see its history.
                    </Form.Text>
                </Form.Group>
                {
                    searching === false ?
                        <Button variant="primary" type="submit"> Search </Button> :
                        <Spinner animation="border" />
                }
            </Form>
            {error !== null &&
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    <Alert.Heading>Error occurred!</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            }
            {
            (error === null && ipfsProperty !== null && owner !== null && history !== null) &&
            <ListGroup variant="flush">
                <ListGroup.Item>IPFS Document Hash: <span className="h6"><a href={`https://ipfs.io/ipfs/${ipfsProperty}`} target='_blank' rel="noreferrer">{ipfsProperty}</a></span></ListGroup.Item>
                <ListGroup.Item>Owned By: <span className="h6">{owner}</span></ListGroup.Item>
                <Accordion flush>
                <Accordion.Item  eventKey="0">
                    <Accordion.Header>History:</Accordion.Header>
                    <Accordion.Body>
                    {history !== null &&
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Owner</th>
                                <th>Operator</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                history.map((transfer, index) =>{
                                    return (<tr key={index}>
                                        <td> {index + 1} </td>
                                        <td> {transfer.returnValues['from']}</td>
                                    </tr>)
                                    }
                                )
                            }            
                            {
                                history.length > 0 && 
                                <tr>
                                    <td> {history.length+1} </td>
                                    <td> {history[history.length - 1].returnValues['to']}</td>
                                </tr>
                            }
                        </tbody>
                    </Table>
                    }
                    </Accordion.Body>
                </Accordion.Item>
                </Accordion>
            </ListGroup>
            }
        </Container>
    )
}

export default Home;