import { useState } from 'react';
import { Form, Spinner, Button, Alert } from 'react-bootstrap';
import { create } from 'ipfs-http-client';

const ipfs_client = create('https://ipfs.infura.io:5001/api/v0');

function IpfsForm ({setHash}) {

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
        <Form className="py-3 mb-3" onSubmit={generatePropertyHash}>
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
            <div className='d-flex flex-nowrap justify-content-between'>
            {
                generating === false ? <Button type="submit" variant="outline-primary"> Upload Property</Button> : <Spinner animation="border"/>
            }
            {
                generatedHash !== '' && <Button variant="outline-light"> <a href={`https://ipfs.io/ipfs/${generatedHash}`} target='_blank' rel="noreferrer">{generatedHash} &#128279;</a> </Button>
            }
            </div>
        </Form>
    )
}

export default IpfsForm;