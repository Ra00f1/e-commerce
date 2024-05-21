const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const { ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3001; // Adjust port number as needed

// Enable CORS for all routes
app.use(cors());

// Replace with your actual MongoDB connection URI
const uri = "mongodb+srv://raoofagh:T6bp26wlEf1C7pDp@cluster0.sadjhyu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let client;

//______________________________________________________        DB      ______________________________________________________________
async function connectToDb() {
  console.log("Connecting to MongoDB...");
  try {
    client = await MongoClient.connect(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit on connection failure
  }
}

// Connect to MongoDB on app startup
connectToDb();

// Parse incoming JSON data
app.use(bodyParser.json());

//______________________________________________________        Login      ______________________________________________________________
// Function to validate user credentials
async function isValidUser(username, password) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Users");

    // Find user by username
    const user = await collection.findOne({ username: username });

    if (!user) {
      return { valid: false, message: "Username not found" }; // Username not found
    }

    console.log(user.password);
    console.log(password);

    // Compare passwords
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    return { valid: isPasswordValid, message: isPasswordValid ? "Login successful" : "Password is wrong" };
  } catch (error) {
    console.error("Error validating user:", error);
    // Distinguish between password validation error and other errors
    if (error.name === 'bcrypt.Inequal') {
      return { valid: false, message: "Password is wrong" };
    } else {
      return { valid: false, message: "Internal server error" }; // Internal server error
    }
  }
}

// API endpoint for user login (POST request)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  }

  const isValid = await isValidUser(username, password);

  if (!isValid.valid) {
    return res.status(401).json({ message: isValid.message }); // Unauthorized
  }

  // Login successful (replace with appropriate response for your application)
  res.status(200).json({ message: "Login successful" });
});

//______________________________________________________        Register      ______________________________________________________________
async function createUser(email, username, password) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Users");

    // Check if user already exists
    const existingUser = await collection.findOne({ $or: [{ username: username }, { email: email }] });
    if (existingUser) {
      return { success: false, message: "Username or email already exists" };
    }

    // Check if the Users collection is empty
    const isCollectionEmpty = await collection.countDocuments({}) === 0;

    let newUserID;
    if (isCollectionEmpty) {
      // If the collection is empty, start userID from 1
      newUserID = 1;
    } else {
      // If the collection is not empty, find the user with the highest userID and increment it by 1
      const lastUser = await collection.find().sort({ userID: -1 }).limit(1).toArray();
      newUserID = lastUser[0].userID + 1;
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the saltRounds

    // Create new user
    const user = { userID: newUserID, email: email, username: username, password: hashedPassword };
    await collection.insertOne(user);

    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for user signup (POST request)
app.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  console.log(email, username, password);

  if (!email || !username || !password) {
    return res.status(400).json({ message: "Missing email, username or password" });
  }

  const result = await createUser(email, username, password);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // Signup successful (replace with appropriate response for your application)
  res.status(200).json({ message: "Signup successful" });
});

//______________________________________________________        Add Items      ______________________________________________________________

// Function to add a new item
async function addItem(name, id, stock, price, pictureUrl, description, CategoryID) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Items");

    // Check if item already exists
    const existingItem = await collection.findOne({ id: id });
    if (existingItem) {
      return { success: false, message: "Item with this ID already exists" };
    }

    // Create new item
    const item = { name: name, id: id, stock: stock, price: price, pictureUrl: pictureUrl, description: description, CategoryID: CategoryID};
    await collection.insertOne(item);

    return { success: true, message: "Item added successfully" };
  } catch (error) {
    console.error("Error adding item:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for adding items (POST request)
app.post('/addItem', async (req, res) => {
  const { name, id, stock, price, pictureUrl, description, CategoryID} = req.body;

  if (!name || !id || !stock || !price || !pictureUrl || !description || !CategoryID) {
    return res.status(400).json({ message: "Missing item details" });
  }

  const result = await addItem(name, id, stock, price, pictureUrl, description, CategoryID);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // Item added successfully (replace with appropriate response for your application)
  res.status(200).json({ message: "Item added successfully" });
});

//______________________________________________________        Get Items      ______________________________________________________________

// Function to get a single item's details
async function getItem(id) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Items");

    // Convert id to number
    id = Number(id);

    // Find item by id
    const item = await collection.findOne({ id: id });

    // If item not found, return success: false
    if (!item) {
      return { success: false, message: "Item not found" };
    }

    // Return item details
    return { success: true, item: item };
  } catch (error) {
    console.error("Error getting item:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for getting a single item (GET request)
app.get('/getItem/:id', async (req, res) => {
  const id = req.params.id; // Get id from URL parameters
  const result = await getItem(id);

  if (!result.success) {
    return res.status(404).json({ message: result.message }); // Not found
  }

  // Return item details
  res.status(200).json(result.item);
});

//______________________________________________________        Get All Items      ______________________________________________________________

// Function to get specific details of all items
async function getAllItems() {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Items");

    // Project only desired fields
    const projection = { imageUrl: 1, name: 1, price: 1, categoryID: 1 };

    // Find all items
    const items = await collection.find({}, { _id:0, imageUrl: 1, name: 1, price: 1, categoryID: 1 }).toArray();

    return { success: true, items: items };
  } catch (error) {
    console.error("Error getting items:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for getting item details (GET request)
app.get('/getAllItems', async (req, res) => {
  const result = await getAllItems();

  if (!result.success) {
    return res.status(500).json({ message: result.message }); // Internal server error
  }

  // Return item details
  res.status(200).json(result.items);
});

//______________________________________________________        Get Items by Category      ______________________________________________________________

// Function to get specific details of all items in a specific category
async function getItemWithCategory(CategoryID) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Items");

    // Get all items in the specified category with specific fields
    const items = await collection.find({ CategoryID: CategoryID }, { projection: { pictureUrl: 1, name: 1, price: 1, CategoryID: 1 } }).toArray();

    // Return item details
    return { success: true, items: items };
  } catch (error) {
    console.error("Error getting items:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for getting item details in a specific category (GET request)
app.get('/getItems/:CategoryID', async (req, res) => {
  const CategoryID = Number(req.params.CategoryID); // Convert CategoryID to number

  if (!CategoryID) {
    return res.status(400).json({ message: "Missing CategoryID" });
  }

  const result = await getItemWithCategory(CategoryID);

  if (!result.success) {
    return res.status(500).json({ message: result.message }); // Internal server error
  }

  // Return item details
  res.status(200).json(result.items);
});

//______________________________________________________        Add To Basket      ______________________________________________________________

// Function to add an item to a user's basket
async function addToBasket(userID, productID, quantity) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Basket");

    // Find existing item for the user and product
    const existingItem = await collection.findOne({ userID: userID, productID: productID });

    if (existingItem) {
      // Update quantity of existing item
      const updatedQuantity = existingItem.quantity + quantity;
      await collection.updateOne({ _id: existingItem._id }, { $set: { quantity: updatedQuantity } });
      return { success: true, message: "Item quantity updated in basket" };
    } else {
      // Create new basket item if it doesn't exist
      const basketItem = { userID: userID, productID: productID, quantity: quantity };
      await collection.insertOne(basketItem);
      return { success: true, message: "Item added to basket successfully" };
    }

  } catch (error) {
    console.error("Error adding item to basket:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for adding an item to a user's basket (POST request)
app.post('/addToBasket', async (req, res) => {
  const { userID, productID, quantity } = req.body;

  if (!userID || !productID) {
    return res.status(400).json({ message: "Missing userID or productID" });
  }

  const result = await addToBasket(userID, productID, quantity);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // Item added to basket successfully
  res.status(200).json({ message: "Item added to basket successfully" });
});

//______________________________________________________        Get Basket Items      ______________________________________________________________

// Function to get the items in a user's basket
async function getBasket(userID) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Basket");

    // Convert userID to number if necessary (assuming userID in database is a number)
    const numericUserID = Number(userID);

    // Find basket items by userID
    const basketItems = await collection.find({ userID: numericUserID }).toArray();

    console.log("Found basket items for userID:", userID); // For debugging

    return { success: true, items: basketItems };
  } catch (error) {
    console.error("Error getting basket items:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for getting the items in a user's basket (GET request)
app.get('/getBasket/:userID', async (req, res) => {
  const userID = req.params.userID; // Get userID from URL parameters

  if (!userID) {
    return res.status(400).json({ message: "Missing userID" });
  }

  const result = await getBasket(userID);

  if (!result.success) {
    return res.status(500).json({ message: result.message }); // Internal server error
  }

  // Return basket items
  res.status(200).json(result.items);
});

//______________________________________________________        Remove one Item from Basket      ______________________________________________________________

// Function to remove a single item from a user's basket
async function removeOneFromBasket(userID, productID) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Basket");

    // Find existing item for the user and product
    const existingItem = await collection.findOne({ userID: userID, productID: productID });

    if (!existingItem) {
      return { success: false, message: "Item not found in basket" };
    }

    if (existingItem.quantity === 1) {
      // Remove item from basket if quantity is 1
      await collection.deleteOne({ _id: existingItem._id });
      return { success: true, message: "Item removed from basket" };
    } else {
      // Decrease quantity of existing item
      const updatedQuantity = existingItem.quantity - 1;
      await collection.updateOne({ _id: existingItem._id }, { $set: { quantity: updatedQuantity } });
      return { success: true, message: "Item quantity decreased in basket" };
    }

  } catch (error) {
    console.error("Error removing item from basket:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for removing a single item from a user's basket (POST request)
app.post('/removeOneFromBasket', async (req, res) => {
  const { userID, productID } = req.body;

  if (!userID || !productID) {
    return res.status(400).json({ message: "Missing userID or productID" });
  }

  const result = await removeOneFromBasket(userID, productID);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // Item removed from basket successfully
  res.status(200).json({ message: "Item removed from basket successfully" });
});

//______________________________________________________        Remove all Items from Basket      ______________________________________________________________

// Function to remove all items from a user's basket
async function removeAllFromBasket(userID) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Basket");

    // Find all items for the user
    const basketItems = await collection.find({ userID: userID }).toArray();

    if (basketItems.length === 0) {
      return { success: false, message: "Basket is empty" };
    }

    // Remove all items from basket
    await collection.deleteMany({ userID: userID });
    return { success: true, message: "All items removed from basket" };

  } catch (error) {
    console.error("Error removing all items from basket:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for removing all items from a user's basket (POST request)
app.post('/removeAllFromBasket', async (req, res) => {
  const userID = req.body.userID;

  if (!userID) {
    return res.status(400).json({ message: "Missing userID" });
  }

  const result = await removeAllFromBasket(userID);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // All items removed from basket successfully
  res.status(200).json({ message: "All items removed from basket successfully" });
});

//______________________________________________________        Remove One Item From Basket      ______________________________________________________________

// Function to remove a single item from a user's basket
async function removeOneItemFromBasket(userID, productID) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Basket");

    // Find existing item for the user and product
    const existingItem = await collection.findOne({ userID: userID, productID: productID });

    if (!existingItem) {
      return { success: false, message: "Item not found in basket" };
    }
    // Remove item from basket
    await collection.deleteOne({ _id: existingItem._id });
    return { success: true, message: "Item removed from basket" };

  } catch (error) {
    console.error("Error removing item from basket:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for removing a single item from a user's basket (POST request)
app.post('/removeOneItemFromBasket', async (req, res) => {
  const { userID, productID } = req.body;

  if (!userID || !productID) {
    return res.status(400).json({ message: "Missing userID or productID" });
  }

  const result = await removeOneItemFromBasket(userID, productID);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // Item removed from basket successfully
  res.status(200).json({ message: "Item removed from basket successfully" });
});

//______________________________________________________        Listen      ______________________________________________________________

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
//TODO: Search item by name
//TODO: user info
//TODO: purchase history
//TODO: change quantity count of item after purchase
