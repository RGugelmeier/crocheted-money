import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useState, useEffect, useRef } from 'react';
import Numpad from './Numpad'
import './ContextMenu'
import axios from "axios";
import ContextMenu from './ContextMenu';

function App() {
  // Hooks
  const contextMenuRef = useRef(null)
  const [contextMenu, setContextMenu] = useState({
    position: {
      x: 0,
      y: 0
    },
    toggled: false
  })
  const [rightClickedItem, setRightClickedItem] = useState(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stuffyList, setList] = useState([]);
  const [total, setTotal] = useState(0)
  const [goal, setGoal] = useState(1000)

  const fetchAPI = async () => {
    try {
      const response = await axios.get("https://crocheted-money-production.up.railway.app/api/fetch_stuffies");
      setList(response.data || [])
    } catch (error) {
      console.error("Fetch error:", error);
      setList([])
    }
  };

  function handleOnContextMenu(e, rightClickItem){
    e.preventDefault()

    const contextMenuAttr = contextMenuRef.current.getBoundingClientRect()

    const isLeft = e.clientX < window?.innerWidth / 2

    let x
    let y = e.clientY

    if(isLeft) {
      x = e.clientX
    } 
    else{
      x = e.clientX - contextMenuAttr.width
    }

    setContextMenu({
      position: {
        x, 
        y
      },
      toggled: true
    })

    setRightClickedItem(rightClickItem)
  }

  const fetchGoal = async () => {
    try {
      const response = await axios.get("https://crocheted-money-production.up.railway.app/api/fetch_goal_data")
      setGoal(response.data.target_goal)
      setTotal(response.data.target_progress)
    } catch (error) {
      console.error("Goal fetch error:", error);
    }
  }

  useEffect(() => {
    fetchAPI()
  }, [])

  useEffect(() => {
    fetchGoal()
  }, [])



  function resetContextMenu(){
    setContextMenu({
      position: {
        x: 0,
        y: 0
      },
      toggled: false
    })
  }
  useEffect(() => {
    function handler(e){
      if(contextMenuRef.current){
        if(!contextMenuRef.current.contains(e.target)){
          resetContextMenu()
        }
      }
    }

    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  })

  // The 'stuffies' array converted to a list of buttons. The buttons call 'AddToTotal' when clicked.
  const listStuffies = () => {
    const handleClick = (stuffy) => {
      AddToTotal(stuffy.Price)
    }

    return(
      <div className='container'>
        {stuffyList.map((stuffy) => (
              <button key={stuffy.id} onClick={() => handleClick(stuffy)} onContextMenu={(e) => handleOnContextMenu(e, stuffy)}>
                {stuffy.StuffyName}<br/>${stuffy.Price}
              </button>
        ))}
      </div>
    );
  };

  // Adds a new stuffy to the array
  async function addNewStuffy(name, price){
    // Id is automatically set by the DB
    try{
    // Send a post request to the add_new_stuffies endpoint
      const response = await axios.post('https://crocheted-money-production.up.railway.app/api/add_new_stuffy', {StuffyName: name, Price: parseFloat(price)});
      //Reload the quick add list
      fetchAPI()
      //Close the modal
      handleCloseQuickAddModal()
    }
    catch(error){
      console.error("Error submitting form: ", error)
    }
  }

  async function editStuffy(id, newName, newPrice){
    try{
      const response = await axios.patch('https://crocheted-money-production.up.railway.app/api/edit_stuffy', { stuffyId: id, new_name: newName, new_price: newPrice})
      fetchAPI()
      handleCloseEditModal()
    }
    catch(error)
    {
      console.error(`Error editting stuffy with id: ${id}`)
    }
  } 

  async function deleteStuffy(id){
    try{
      const response = await axios.delete('https://crocheted-money-production.up.railway.app/api/delete_stuffy', { data: { stuffyId: id } })
      fetchAPI()
    }
    catch(error){
      console.error(`Error deleting stuffy with id: ${id}. Error: `, error)
    }
  }

  // Adds an amount to the total. Updates the database progress as well.
  async function AddToTotal(amount){
    try{
      const newTotal = total + amount
      setTotal(newTotal)
      const response = await axios.patch('https://crocheted-money-production.up.railway.app/api/set_target_progress', {target_progress: newTotal})
    }
    catch(error){
      console.error("Error modifying goal progress: ", error)
    }
  }

  async function ManuallyEditGoal(newGoal){
    if(isNaN(newGoal))
    {
      newGoal = 0;
    }
    else if(newGoal < 0)
    {
      alert("Value must be greater than or equal to 0")
      return;
    }
    if(confirm(`Would you like to set your total to ${newGoal}?`))
    {
      try{
        setTotal(newGoal)
        const response = await axios.patch('https://crocheted-money-production.up.railway.app/api/set_target_progress', {target_progress: newGoal})
      }
      catch(error){
        console.error("Error modifying goal progress", error)
      }
    }
  }

  const handleShowQuickAddModal = () => setShowQuickAddModal(true);
  const handleCloseQuickAddModal = () => {
    setShowQuickAddModal(false);
    setName('');
    setPrice('');
  };
  const handleShowEditModal = () => {
    setName(rightClickedItem?.StuffyName || '');
    setPrice(rightClickedItem?.Price || '');
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setName('');
    setPrice('');
  }

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <main>
      <div>
        <h2>Goal</h2>
        {total} <progress value={total} max={goal}/> {goal}
      </div>

      <div>
        <Form>
          <Form.Label>
            Manually Enter Total
          </Form.Label>
          <Form.Control
            type="number"
            id="manualTotal"
            defaultValue={0.00}
            min={0}
          />
        </Form>
        <button onClick={() => ManuallyEditGoal(parseFloat(document.getElementById('manualTotal').value))}>Submit</button>
        <h2>Add To Goal</h2>
        <Numpad onEnter={AddToTotal}/>
        <h2>Quick Add</h2>
        <button onClick={handleShowQuickAddModal}>Add New Stuffy Type</button>
        {listStuffies()}
      </div>

      <ContextMenu
        contextMenuRef={contextMenuRef}
        isToggled={contextMenu.toggled}
        positionX={contextMenu.position.x}
        positionY={contextMenu.position.y}
        buttons={[
          {
            text: "Edit Stuffy",
            icon: "✏️",
            onClick: () => handleShowEditModal(),
            isSpacer: false,
          },
          {
            text: "Delete Stuffy",
            icon: "🗑️",
            onClick: () => deleteStuffy(rightClickedItem?.id),
            isSpacer: false,
          }
        ]}
      />

      <div className='modal show' style={{ display: 'block', position: 'initial'}}>
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Stuffy</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Edit Name</Form.Label>
                <Form.Control
                  type="text"
                  autoFocus
                  id='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Form.Label>Edit Price</Form.Label>
                <Form.Control
                  type="number"
                  id='price'
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => editStuffy(rightClickedItem?.id, name, price)}>Submit</Button>
            <Button onClick={handleCloseEditModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>

      <div className='modal show' style={{ display: 'block', position: 'initial'}}>
        <Modal show={showQuickAddModal} onHide={handleCloseQuickAddModal}>
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
            <Button onClick={handleCloseQuickAddModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </main>
  )
}

export default App