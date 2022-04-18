import { useState } from 'react';
import { Form, Spinner, Button, Alert } from 'react-bootstrap';
import { create } from 'ipfs-http-client';

const ipfs_client = create('http://ipfs.infura.io:5001/api/v0');

function IpfsForm ({setHash}) {

    // useEffect(async () => {
    //     try {
    //         let added = await ipfs_client.add('a formatted json string')
    //         console.log(added)
    //         console.log(added.cid.toV0().toString())
    //         console.log(added.cid.toV1().toString())
    //     } catch (error) {
    //         console.log('ipfs error', error)
    //     }
    // }, [])

    const [generating, setGenerating] = useState(false);
    const [generatedHash, setGeneratedHash] = useState('');

    const setCID = (cid) => {
        setGeneratedHash(cid);
        setHash(cid);
    }

    const generatePropertyHash = async (e) => {
        e.preventDefault();
        setGenerating(true);
        let property = {"vesion": "0"};
        property["unique_id"] = e.target[0].value;
        property["address"] = e.target[1].value;

        let content = JSON.stringify(property)
        const added = await ipfs_client.add(content)
        const cid = added.cid.toV0().toString()
        setCID(cid);
        setGenerating(false);
    }

    return (
        <>
        <Form className="py-3 my-3" onSubmit={generatePropertyHash}>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="unique-id-input">Property Unique ID</Form.Label>
                <Form.Control type="text-input" id="unique-id-input" aria-describedby="property-id"/>
                <Form.Text id="property-id" muted>
                    Enter the UNIQUE ID for the property
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="address-input">Address</Form.Label>
                <Form.Control type="text-input" id="address-input" aria-describedby="address"/>
                <Form.Text id="address" muted>
                    Enter Address of the Property
                </Form.Text>
            </Form.Group>
            {
                generating === false ?
                    <Button variant="primary" type="submit"> Upload Property</Button> :
                    <Spinner animation="border" />
            }
        </Form>
        <Alert variant="info">
            <Alert.Heading>Property IPFS Hash</Alert.Heading>
            <p> Use the form above to fill the property informtion. The data will be uploaded to IPFS and the CID of the data will be used in registering the property on Ethereum</p>
            {generatedHash !== '' ?
                <>
                    <hr/>
                    <p>CID: {generatedHash}.<br/> click <a href={`https://ipfs.io/ipfs/${generatedHash}`} target='_blank' rel="noreferrer">here</a> to view the uploaded content</p>
                </> :
                null
            }
        </Alert>
</>
    )
}

export default IpfsForm;