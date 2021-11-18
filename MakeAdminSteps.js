

// 1 backend.. admin jodi banate chai tahle ai steps gulo...... 
// ccreated admin role here with set attribute then needs to upsert(PUT).
app.put('/users/admin', async (req, res) => {
    const user = req.body;
    const filter = {email: user.email};
    const updateDoc = {$set: {role: 'admin'}};
    const result = await usersCollection.updateOne(filter, updateDoc); 
    res.send(result);
  })


// 1 fontend... insert admin role from fonted to database ...
// needs to declare state.
const [email, setEmail] = useState('');

const onSubmit = e => {
    const adminEmail = {email};
    fetch('http://localhost:5000/users/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(adminEmail)
    }).then(res=> res.json())
      .then(data => {
        console.log(data)
        if(data.matchedCount){
            alert('Admin created');
            setEmail('');
        }
      })
     e.preventDefault();
    }

// Backend... Admin can Create an Admin by email address.....................
app.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    const query = {email: email};
    const user = await usersCollection.findOne(query);
    // let inisialy isadmin will be false,
    // but if admin is exist in user?role then he can create an admin.
    let isAdmin = false;
    if(user?.role === 'admin'){
      isAdmin = true;
    }
    res.send({admin: isAdmin});
  }) 


// Fontend... needs to declare this function on useFirebase/useAuth...........
// & return this value as (admin)
    const [admin, setAdmin] = useState(false); // declare in top.

    useEffect( () => {
        fetch(`http://localhost:5000/users/${user.email}`)
        .then(res=> res.json())
        .then(data=> setAdmin(data.admin))
     }, [user.email])

// then used it anywhere as like 
const {admin} = useAuth(); 


// For Example this 2 route will be showed if user is admin otherwise none.
{admin && 
    <Box>
      <Link to={`${url}/makeAdmin`} ><Button color="inherit">Make Admin</Button></Link>
      <Link to={`${url}/addDoctor`}><Button color="inherit">Add Doctor</Button></Link>
   </Box>           
  }



// user jeno Admin page & secute part gulo te jete na pare se jnno PrivateRoute er moto AdminRoute khulte hobe.
// then PrivateRoute & AdminRoute er code same thakbe just useAuth() theke admin k return kore ante hobe then renden er por user.email && admin avabe dilei hobe then redirect '/' dilei sesh.  



/* 


// JWT secure steps............... 

1. (getIdToken) declare in top
2. then onAuthStateChanged this function makes those steps- 
       getIdToken(user)
       .then(idToken =>{
        setToken(idToken);
     })
3. we should store this idToken in a UseState     
    ----declare in top.
    const [token, setToken] = useState('');

4. & you should return token for catching from others route.   

5. go where you create your adminPannel & call (token) frm useAuth.
6. then send authorization in headers file like-

        headers: {
           'authorization' : `Bearer${token}`,
           'Content-Type': 'application/json'
          },
7. go firebase.doc > Fundamentals > Add FireBase - server enviroments >
  npm install firebase-admin --save         


8. To generate a private key file for your service account:
  ---go project settings > Service Accounts.
  --Click Generate New Private Key, then confirm by clicking Generate Key.
  --Securely store the JSON file containing the key.

9.--- copy clipBord from service account & paste it in Server index.js
  --- replace json adminsdk.json file name on  >

  const admin = require("firebase-admin");
  const serviceAccount = require('./doctors-portal-4cb0c-firebase-adminsdk.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });


10. jodi kew k admin banate chai, tahle check koree dekbo se admin kina & tar request ta valied user kina, jodi valied hoy then oke admin role set kore dibo.....if non-valied then tahle take status.code dekhay dibo....

*/


