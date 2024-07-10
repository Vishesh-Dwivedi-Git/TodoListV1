const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://visheshdwiveditry:vishesh1234@cluster0.r0n0wkf.mongodb.net/todolistDB?retryWrites=true&w=majority")
    .then(() => console.log('Connected to MongoDB Atlas!'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model('Item', itemsSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

const defaultItems = [
    { name: 'Welcome to your to-do list!' },
    { name: 'Hit the + button to add a new item.' },
    { name: '← Hit this to delete an item.' }
];

// Ensure there are default items in the database on server start
app.get("/", async (req, res) => {
    try {
        const items = await Item.find({});
        if (items.length === 0) {
            await Item.insertMany(defaultItems);
            console.log("Successfully saved default items to DB");
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: items });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching items");
    }
});

// Handling the creation of new items
app.post("/", async (req, res) => {
    const itemName = req.body.newItem;
    const listTitle = req.body.list;
    const item = new Item({ name: itemName });

    try {
        if (listTitle === "Today") {
            await item.save();
            res.redirect("/");
        } else {
            const foundList = await List.findOne({ name: listTitle });
            foundList.items.push(item);
            await foundList.save();
            res.redirect("/" + listTitle);
        }
    } catch (err) {
        console.error("Error saving item:", err);
        res.status(500).send("Error saving item");
    }
});

// Deleting items
app.post("/delete", async (req, res) => {
    const checkboxId = req.body.checkbox;
    const listTitle = req.body.listName;

    try {
        if (listTitle === "Today") {
            await Item.findByIdAndDelete(checkboxId);
            console.log("Successfully deleted!");
            res.redirect("/");
        } else {
            const foundList = await List.findOneAndUpdate(
                { name: listTitle },
                { $pull: { items: { _id: checkboxId } } },
                { new: true }
            );

            if (foundList.items.length === 0) {
                foundList.items = defaultItems;
                await foundList.save();
            }

            res.redirect("/" + listTitle);
        }
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).send("Error deleting item");
    }
});

// Handling custom lists
app.get("/:customListName", async (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    try {
        let foundList = await List.findOne({ name: customListName });
        if (!foundList) {
            const list = new List({ name: customListName, items: defaultItems });
            await list.save();
            res.redirect("/" + customListName);
        } else {
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching list");
    }
});

app.listen(4000, () => {
    console.log("Server started on port 4000");
});
