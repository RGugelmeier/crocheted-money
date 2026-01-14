import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useState, useEffect } from 'react';
import Numpad from './Numpad'
import axios from "axios";

function App() {
  // Hooks
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stuffyList, setList] = useState([]);
  const [total, setTotal] = useState(0)
  const [goal, setGoal] = useState(1000)

  const fetchAPI = async () => {
    const response = await axios.get("http://localhost:5000/api/fetch_stuffies");
    setList(response.data)
  };

  const fetchGoal = async () => {
    const response = await axios.get("http://localhost:5000/api/fetch_goal_data")
    setGoal(response.data.target_goal)
    setTotal(response.data.target_progress)
    console.log(response.data.target_goal, response.data.target_progress)
  }

  useEffect(() => {
    fetchAPI()
  }, [])

  useEffect(() => {
    fetchGoal()
  }, [])

  // The 'stuffies' array converted to a list of buttons. The buttons call 'AddToTotal' when clicked.
  const listStuffies = () => {
    const handleClick = (stuffy) => {
      AddToTotal(stuffy.Price)
    }

    return(
      <div className='container'>
        {stuffyList.map((stuffy) => (
              <button key={stuffy.id} onClick={() => handleClick(stuffy)}>
                {stuffy.StuffyName}<br/>${stuffy.Price}
              </button>
        ))}
      </div>
    );
  };

  // Adds a new stuffy to the array
  async function addNewStuffy(name, price){
    console.log("Entered")
    // Id is automatically set by the DB
    try{
    // Send a post request to the add_new_stuffies endpoint
      const response = await axios.post('http://localhost:5000/api/add_new_stuffy', {StuffyName: name, Price: parseFloat(price)});
      console.log(response)
      //Reload the quick add list
      fetchAPI()
      //Close the modal
      handleClose()
    }
    catch(error){
      console.error("Error submitting form: ", error);
    }
  }

  // Adds an amount to the total. Updates the database progress as well.
  async function AddToTotal(amount){
    try{
      const newTotal = total + amount
      setTotal(newTotal)
      const response = await axios.patch('http://localhost:5000/api/set_target_progress', {target_progress: newTotal})
      console.log(response)
    }
    catch(error){
      console.error("Error modifying goal progress: ", error)
    }
  }

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setName('');
    setPrice('');
  };

  return (
    <main>

      <div>
        <h2>Goal</h2>
        {total} <progress value={total} max={goal}/> {goal}
      </div>

      <div>
        <h2>Add To Goal</h2>
        <Numpad onEnter={AddToTotal}/>
        <h3>Quick Add</h3>
        <button onClick={handleShow}>Add New Stuffy Type</button>
        {listStuffies()}
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Stuffy Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Stuffy Name</Form.Label>
              <Form.Control
                type="text"
                autoFocus
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stuffy Price</Form.Label>
              <Form.Control 
                type="number" 
                placeholder='0.00' 
                id='price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => addNewStuffy(name, price)}>Submit</Button>
          <Button onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </main>
  )
}

export default App