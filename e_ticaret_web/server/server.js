const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// MongoDB's connection string
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
async function isValidUser(email, password) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Users");

    // Find user by username
    const user = await collection.findOne({ email: email });

    if (!user) {
      return { valid: false, message: "Username not found" }; // Username not found
    }

    // Compare passwords
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    // Return validation result and user data if successful
    if (isPasswordValid) {
      console.log(user);
      return { valid: true, user: user };
    } else {
        return { valid: false, message: "Password is wrong" }; // Password is wrong
    }
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  }

  const isValid = await isValidUser(email, password);

  if (!isValid.valid) {
    return res.status(401).json({ message: isValid.message }); // Unauthorized
  }

  // Login successful
  res.status(200).json({ message: "Login successful" , data: isValid.user});
});

//______________________________________________________        Register      ______________________________________________________________
async function createUser(email, username, password) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Users");

    // Check if user already exists
    const existingUser = await collection.findOne({ $or: [{ username: username }, { email: email }] });
    if (existingUser) {
      console.log("Username or email already exists");
      return { success: false, message: "Username or email already exists" };
    }

    // Check if the Users collection is empty
    const isCollectionEmpty = await collection.countDocuments({}) === 0;

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the saltRounds

    // Create new user
    const user = { email: email, username: username, password: hashedPassword };
    await collection.insertOne(user);
    console.log("User created successfully");

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

  // Signup successful
  res.status(200).json({ message: "Signup successful" });
});

//______________________________________________________        Add Items      ______________________________________________________________

// Function to add a new item
async function addItem(name, stock, price, pictureUrl, description, CategoryID) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Items");

    // Check if item already exists
    const existingItem = await collection.findOne({ name: name });
    if (existingItem) {
      return { success: false, message: "Item with this name already exists" };
    }

    // Create new item
    const item = { name: name, stock: stock, price: price, pictureUrl: pictureUrl, description: description, CategoryID: CategoryID};
    await collection.insertOne(item);

    return { success: true, message: "Item added successfully" };
  } catch (error) {
    console.error("Error adding item:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for adding items (POST request)
app.post('/addItem', async (req, res) => {
  const { name, stock, price, pictureUrl, description, CategoryID} = req.body;

  if (!name || !stock || !price || !pictureUrl || !description || !CategoryID) {
    return res.status(400).json({ message: "Missing item details" });
  }

  const result = await addItem(name, stock, price, pictureUrl, description, CategoryID);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // Item added successfully
  res.status(200).json({ message: "Item added successfully" });
});

//______________________________________________________        Get Items      ______________________________________________________________

// Function to get a single item's details
async function getItem(id) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Items");

    // Find item by id
    const item = await collection.findOne({ _id: id });

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

    // Specify fields to return(Not used at the moment, but can be used to limit the fields returned by the query)
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

//______________________________________________________        Add To Basket      ______________________________________________________________
//TODO: Change to add all teh details fo teh product to the basket not just the productID
//Function to add an item to a user's basket
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

    // Find basket items by userID
    const basketItems = await collection.find({ userID: userID }).toArray();
    if (basketItems.length === 0) {
      console.log("Basket is empty for userID:", userID);
    }
    else
    {
        console.log("Basket is not empty for userID:", userID);
    }
    console.log("Found items in the basket:", basketItems); // For debugging

    // Get the information of all the items in the basket using the productID
    const itemsCollection = db.collection("Items");
    for (const basketItem of basketItems) {

      // Turn basketItem.productID into an ObjectId
      const basketItemID = new ObjectId(basketItem.productID);

      const item = await itemsCollection.findOne({ _id: basketItemID });
      basketItem.item = item;
      basketItem.quantity = basketItem.quantity;
    }

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

    console.log("userID: ", userID);
    console.log("productID: ", productID);

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

//______________________________________________________        Purchase      ______________________________________________________________

// Function to Purchase a user's basket
async function Purchase(userID) {
  try {
    const db = client.db("Eticaret");
    const basketCollection = db.collection("Basket");
    const historyCollection = db.collection("UserPurchaseHistory");
    const itemsCollection = db.collection("Items");

    // Get all teh items in teh Items collection
    const items = await itemsCollection.find({}).toArray();

    // Get the user's basket
    const basketItems = await basketCollection.find({ userID: userID }).toArray();

    if (basketItems.length === 0) {
      return { success: false, message: "Basket is empty", data: false};
    }

    // Check if there is enough stock for each item
    for (const basketItem of basketItems) {
      const basketItemID = new ObjectId(basketItem.productID);

      for (const item of items) {

        if (item._id.toString() === basketItemID.toString()) {
          if (item.stock < basketItem.quantity) {
            return { success: false, message: "Not enough stock for item: " + item.name, data: false};
          }
        }
      }
    }

    // Process the purchase
    for (const basketItem of basketItems) {
      // Add to UserPurchaseHistory
      await historyCollection.insertOne(basketItem);

      for (const item of items) {
        if (item._id.toString() === basketItem.productID.toString()) {
          // Reduce stock in Items
          const updatedStock = item.stock - basketItem.quantity;
          await itemsCollection.updateOne({ _id: basketItem.productID }, { $set: { stock: updatedStock } });
        }
      }
    }

    // Clear the user's basket
    await basketCollection.deleteMany({ userID: userID });

    return { success: true, message: "Checkout successful" , data: true};
  } catch (error) {
    console.error("Error during checkout:", error);
    return { success: false, message: "Internal server error", data: false};
  }
}

// API endpoint for checkout (POST request)
app.post('/purchase', async (req, res) => {
  const userID = req.body.userID;

  if (!userID) {
    return res.status(400).json({ message: "Missing userID" });
  }

  const result = await Purchase(userID);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // Checkout successful
  res.status(200).json({ message: "Checkout successful" });
});

//______________________________________________________        Get Purchase History      ______________________________________________________________
// Not used at the moment
// Function to get the purchase history of a user
async function getPurchaseHistory(userID) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("UserPurchaseHistory");

    // Find purchase history by userID
    const purchaseHistory = await collection.find({ userID: userID }).toArray();

    return { success: true, history: purchaseHistory };
  } catch (error) {
    console.error("Error getting purchase history:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for getting the purchase history of a user (GET request)
app.get('/getPurchaseHistory/:userID', async (req, res) => {
  const userID = req.params.userID; // Get userID from URL parameters

  if (!userID) {
    return res.status(400).json({ message: "Missing userID" });
  }

  const result = await getPurchaseHistory(userID);

  if (!result.success) {
    return res.status(500).json({ message: result.message }); // Internal server error
  }

  // Return purchase history
  res.status(200).json(result.history);
});

//______________________________________________________        Add User Info      ______________________________________________________________
// Not used at the moment
// Function to save user information
async function saveUserInfo(userID, address, phone_number, birth_date) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("UserInfo");

    // Check if user info already exists
    const existingUserInfo = await collection.findOne({ userID: userID });
    if (existingUserInfo) {
      return { success: false, message: "User info already exists" };
    }

    // Create new user info
    const userInfo = { userID: userID, address: address, phone_number: phone_number, birth_date: birth_date };
    await collection.insertOne(userInfo);

    return { success: true, message: "User info saved successfully" };
  } catch (error) {
    console.error("Error saving user info:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for saving user info (POST request)
app.post('/saveUserInfo', async (req, res) => {
  const temp = req.body;
  console.log(temp);
  const{userID, address, phone_number, birth_date} = temp;
  console.log(userID, address, phone_number, birth_date);

  if (!userID || !address || !phone_number || !birth_date) {
    return res.status(400).json({ message: "Missing user info details" });
  }

  const result = await saveUserInfo(userID, address, phone_number, birth_date);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // User info saved successfully
  res.status(200).json({ message: "User info saved successfully" });
});

//______________________________________________________        Get User Info      ______________________________________________________________
// Not used at the moment
// Function to get user information
async function getUserInfo(userID) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("UserInfo");

    // Find user info by userID
    const userInfo = await collection.findOne({ userID: userID });

    if (!userInfo) {
      return { success: false, message: "User info not found" };
    }

    return { success: true, info: userInfo };
  } catch (error) {
    console.error("Error getting user info:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for getting user info (GET request)
app.get('/getUserInfo/:userID', async (req, res) => {
  const userID = req.params.userID; // Get userID from URL parameters

  if (!userID) {
    return res.status(400).json({ message: "Missing userID" });
  }

  const result = await getUserInfo(userID);

  if (!result.success) {
    return res.status(500).json({ message: result.message }); // Internal server error
  }

  // Return user info
  res.status(200).json(result.info);
});

//______________________________________________________        Update User Info      ______________________________________________________________
// Not used at the moment
// Function to update user information
async function updateUserInfo(userID, address, phone_number, birth_date) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("UserInfo");

    // Find existing user info
    const existingUserInfo = await collection.findOne({ userID: userID });

    if (!existingUserInfo) {
      return { success: false, message: "User info not found" };
    }

    // Update user info
    await collection.updateOne({ userID: userID }, { $set: { address: address, phone_number: phone_number, birth_date: birth_date } });

    return { success: true, message: "User info updated successfully" };
  } catch (error) {
    console.error("Error updating user info:", error);
    return { success: false, message: "Internal server error" };
  }

}

// API endpoint for updating user info (POST request)
app.post('/updateUserInfo', async (req, res) => {
  const { userID, address, phone_number, birth_date } = req.body;

  if (!userID || !address || !phone_number || !birth_date) {
    return res.status(400).json({ message: "Missing user info details" });
  }

  const result = await updateUserInfo(userID, address, phone_number, birth_date);

  if (!result.success) {
    return res.status(400).json({ message: result.message }); // Bad request
  }

  // User info updated successfully
  res.status(200).json({ message: "User info updated successfully" });
});

//______________________________________________________        Search      ______________________________________________________________
// Not used at the moment
// Function to search items by name
async function searchItems(query) {
  try {
    const db = client.db("Eticaret");
    const collection = db.collection("Items");

    // Use MongoDB's $regex operator to find items whose names contain the query
    const items = await collection.find({ name: { $regex: query, $options: 'i' } }).toArray();

    return { success: true, items: items };
  } catch (error) {
    console.error("Error searching items:", error);
    return { success: false, message: "Internal server error" };
  }
}

// API endpoint for searching items (GET request)
app.get('/searchItems/:query', async (req, res) => {
  const query = req.params.query; // Get query from URL parameters

  if (!query) {
    return res.status(400).json({ message: "Missing search query" });
  }

  const result = await searchItems(query);

  if (!result.success) {
    return res.status(500).json({ message: result.message }); // Internal server error
  }

  // Return search results
  res.status(200).json(result.items);
});

//______________________________________________________        Listen      ______________________________________________________________

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

//TODO: ______________________________________________________      TODOS      ______________________________________________________________
//TODO: ______________________________________________________      USER INFO      ______________________________________________________________
//TODO: Connect Get User Info
//TODO: connect Save User Info

//TODO: ______________________________________________________      General      ______________________________________________________________
//TODO: Clean the code
//TODO: Clear the Duplicates

//TODO: Change the DB like purchasehistory to have small case letter
//TODO: change the DB like PurchaseHistory so they store all the data and don't use prodcutID
//TODO: change the UserID field as mongo already creates _id field for each user(same can be done for profuctID if needed)
