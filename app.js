const express = require('express');
const app = express();
const model = require('./schema');
const bodyParser = require('body-parser');

const port=5000

require('dotenv').config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs")

const login = (async (req, res, next) => {

        const email = req.body.email;
        const result = await model.findOne({ email });
        res.locals.res1 = result; // Make res1 available to all routes
        console.log("this res.locals.res1:", res.locals.res1, "--------");


        console.log("hi i am middle ware=========================================================================================");
        next();
});
const del = (async (req, res, next) => {
        const email = req.query.email;
        res.locals.del=email
        console.log("this is delete middleware: ",res.locals.del);
         next()
})
app.use(del)
app.use(login) 

app.get("/", async (req, res) => {
        // let data = await model.find()
        // let data1 = data.map(doc => doc.items).flat(); // Flatten the array

        // // res.render("form",{data1});


        res.render("reg")


});

app.get('/reg', (req, res) => {

        res.render("reg")

})
app.get('/login', (req, res) => {

        res.render("login")

})
app.post('/reg', async (req, res) => {
        const data = req.body

        const check = await model.find({ email: data.email });
        if (check.length === 0 && (data.name !== '' || data.phoneno !== '' || data.email !== '')) {
                const modelsave = new model(data)
                const save = await modelsave.save()
                console.log("this is data is savad in mongo: ", save);
                res.render("login")
        }
        else {
                const errorMessage = "Email address is already in use.  u have entered empty field ";
                const script = `
                  <script>
                      alert("${errorMessage}");
                      window.location.href = "/registration"; // Redirect back to login page
                  </script>
              `;
                res.send(script);
        }



})




app.post('/login', async (req, res) => {

        const data = req.body
        console.log(data);
        const find1 = await model.find(data)  //check email and password

        if (find1.length == 0) {
                const errorMessage = "  Wroung password or email address!!! ";


                res.send(` 
          <script>
          
      
                  alert("${errorMessage}")
                   window.location.href="/login"
                   </script>
          `)
        }
        else {
                const email = data.email
                const result = await model.findOne({ email });
                console.log("this is email id: ", result);
                // const res1=result.email
                // //   res.render("project/index", { result })
                let data2 = await model.find({ email: req.body.email })
                let data1 = data2.map(doc => doc.items).flat(); // Flatten the array
                console.log("res1 data1========>", res.locals.res1, "<= res1 data");
                res.render("form", { data1, res1: res.locals.res1 });

        }

})







app.post("/render", async (req, res) => {
        const newData = req.body.items.trim();

        // const emailid=res.locals.res1;
        const emailid = req.body.email.trim();
        console.log("this is requested email: ", req.body.email.trim());
        // Update the existing document or insert a new one if it doesn't exist
        let res1 = await model.updateOne({ email: emailid }, { $push: { items: { arraydata: newData } } }, { upsert: true });
        let data = await model.find({ email: emailid })
        console.log("find data email: ", data);
        let data1 = data.map(doc => doc.items).flat(); // Flatten the array

        console.log("Items in the database:", data1);

        const res2 = {
                email: emailid
        }
        console.log("printing...", res2.email);

        res.render("form", { data1, res1: { email: emailid } });

});





app.get('/delete_todo/:item', async (req, res) => {
        const item = req.params.item.trim(); // Trim whitespace
        const email = req.query.email; // Get the email from the query parameters
        console.log("this is delete middleware2: ",res.locals.del);

        console.log("delete this email id data: ", email);
        console.log("this is item id", item);

        try {
                const result = await model.updateMany({ email: email }, {
                        $pull: {
                                items: { arraydata: item }
                        }
                });
                console.log("Update result:", result);

                let data = await model.find({ email: email });
                let data1 = data.map(doc => doc.items).flat(); // Flatten the array

                res.render("form", { data1, res1: {email:res.locals.del} });
                
        } catch (error) {
                console.error("Error deleting item:", error);
                res.status(500).send("Internal Server Error");
        }
});




app.listen(process.env.PORT || port, ()=> console.log("listening to port 5000"))  
 