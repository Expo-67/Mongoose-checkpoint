import express from "express"; // Import Express
import mongoose from "mongoose"; // Import Mongoose
import dotenv from "dotenv"; // Import dotenv for environment variables

dotenv.config(); // Load environment variables

// Create an Express application
const app = express();

// Establishing connection with MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Define a simple route
app.get("/", (req, res) => {
  res.send("Welcome to the API!"); // Response for the home route
});

// Person schema
const PersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, //Validator
  },
  age: {
    type: Number,
    required: true, //Validator
    min: 0, // age should be a positive number
  },
  favoriteFoods: {
    type: [String],
    default: [], // an empty array
  },
  email: {
    type: String,
    unique: true, // email put as unique
  },
});

// Create a model from the schema
const Person = mongoose.model("Person", PersonSchema);

//Route to find people by name
app.get("/people/:name", async (req, res) => {
  const name = req.params.name; // get the name from the request parameters
  try {
    const people = await Person.find({ name: name }); // find matching records
    res.json(people); // send records in json format
  } catch (err) {
    console.error("Error finding people", err); // handles the error
    res.status(500).send("Internal Server Error"); // error response
  }
});
//Who has a certain food in their favorites using
app.get("/person/food/:food", async (req, res) => {
  const food = req.params.food;
  try {
    const person = await Person.findOne({ favoriteFoods: food });
    if (!person) {
      return res.status(404).send("No person found with that favorite food");
    }
    res.json(person);
  } catch (err) {
    console.error("Error finding person", err);
    res.status(500).send("Internal server Error");
  }
});

// Route to update a person's favorite foods
app.put("/person/:personId/favoriteFood", async (req, res) => {
  const { personId } = req.params;
  try {
    const person = await Person.findById(personId);
    if (!person) {
      return res.status(404).send("Person not found");
    }
    person.favoriteFoods.push("hamburger");
    await person.save();

    res.status(200).json(person);
  } catch (err) {
    console.error("Error updating favorite Food", err);
    res.status(500).send("Internal server error");
  }
});
// Route to find a person by name and set the persons age to 20
app.put("/person/updateAge/:personName", async (req, res) => {
  const { personName } = req.params; // Get personName from the request parameters

  try {
    // Find the person by name and update their age to 20
    const updatedPerson = await Person.findOneAndUpdate(
      { name: personName }, // Search filter
      { age: 20 }, // Update object
      { new: true } // Options: return the updated document
    );

    if (!updatedPerson) {
      return res.status(404).send("Person not found."); // Handle person not found
    }

    res.status(200).json(updatedPerson); // Respond with the updated person
  } catch (err) {
    console.error("Error updating person's age:", err);
    res.status(500).send("Internal Server Error"); // Handle errors
  }
});
// Route to delete a person by ID
app.delete("/person/delete/:personId", async (req, res) => {
  const { personId } = req.params; // Get personId from the request parameters

  try {
    // Find the person by _id and remove them
    const deletedPerson = await Person.findByIdAndRemove(personId);

    if (!deletedPerson) {
      return res.status(404).send("Person not found."); // Handle person not found
    }

    res.status(200).send(`Successfully deleted: ${deletedPerson.name}`); // Respond with a success message
  } catch (err) {
    console.error("Error deleting person:", err);
    res.status(500).send("Internal Server Error"); // Handle errors
  }
});

// Route to delete all people named
app.delete("/person/deleteByName/:name", async (req, res) => {
  const { name } = req.params; // Get the name from the request parameters

  try {
    // Remove all people
    const result = await Person.deleteMany({ name: name });

    if (result.deletedCount === 0) {
      return res.status(404).send("No person found."); // Handle no match
    }

    res
      .status(200)
      .send(
        `Successfully deleted ${result.deletedCount} people named ${name}.`
      ); // Respond with success message
  } catch (err) {
    console.error("Error deleting people:", err);
    res.status(500).send("Internal Server Error"); // Handle errors
  }
});
// Route to find people who like burritos
app.get("/person/findByFood", async (req, res) => {
  try {
    // Chain query helpers to find people who like burritos
    const people = await Person.find({ favoriteFoods: "burritos" }) // Find people with "burritos" in favoriteFoods
      .sort({ name: 1 }) // Sort by name (ascending)
      .limit(2) // Limit to 2 results
      .select("-age") // Exclude the 'age' field
      .exec(); // Execute the query

    res.status(200).json(people); // Send the results
  } catch (err) {
    console.error("Error finding people:", err);
    res.status(500).send("Internal Server Error"); // Handle errors
  }
});

//For a single record
// //A new person document
// const newPerson = new Person({
//   name: "William",
//   age: 25,
//   favoriteFoods: ["Sushi", "Swizz roll", "Shrimps"],
//   email: "william@example.com",
// });

// // Save the new person document
// const savePerson = async () => {
//   try {
//     const savedPerson = await newPerson.save(); // Call save() directly
//     console.log("New person added to the database:", savedPerson);
//   } catch (err) {
//     console.error("Error adding new person:", err); // Handle error
//   }
// };
// savePerson();

// Start the server and listen on port 3001

//For Many records
//Create an array of people
const arrayOfPeople = [
  {
    name: "John",
    age: 30,
    favoriteFoods: ["Pizza", "Burger"],
    email: "john@example.com",
  },
  {
    name: "Jane",
    age: 28,
    favoriteFoods: ["Salad", "Sushi"],
    email: "jane@example.com",
  },
  {
    name: "Alice",
    age: 25,
    favoriteFoods: ["Pasta", "Ice Cream"],
    email: "alice@example.com",
  },
  {
    name: "Bob",
    age: 35,
    favoriteFoods: ["Steak", "Fries"],
    email: "bob@example.com",
  },
];
// insert multiple records
const createManyPeople = async (people) => {
  try {
    const savedPeople = await Person.create(people);
    console.log("People added to the database:", savedPeople);
  } catch (err) {
    console.error("Error adding people:", err);
  }
};
// call the function
// createManyPeople(arrayOfPeople);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
