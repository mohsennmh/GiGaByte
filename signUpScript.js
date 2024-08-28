let accountsData={
                accounts:[]
            }

const accountsUrl="accounts.json";

async function loadAccounts(){
    try{
        const response=await fetch(accountsUrl);
        if(!response.ok){
            throw new Error(`Network response was not ok: ${response.statusText}`)
            }

        accountsData=await response.json();

        }catch(error){
            console.error("Error loading accounts",error)
        }
    }

loadAccounts();


function checkUser(user){
    for (let i=0; i<accountsData["accounts"].length;i++){
        if (user==accountsData["accounts"][i].email){
            return true;
        }
    }
    return false;
}

document.getElementById("signUpForm").addEventListener("submit", function (event){
            event.preventDefault();

            const formData = new FormData(event.target);

            const formObject = Object.fromEntries(formData.entries());

            //passwords must match or else submission is invalid
            if (!formObject["password"].match(/[a-z]/)){
                alert("Your password should a small letter")
            }
            else if(checkUser(formObject["email"])){
                alert("Email is already registered")
            }
            else if (!formObject["password"].match(/[A-Z]/g)){
                alert("Your password should have a capital letter")
            }
            else if (!formObject["password"].match(/[0-9]/g)){
                alert("Your password should have a number")
            }
            else if (formObject["password"].length<8){
                alert("Your password should have at least 8 characters in it")
            }
            else if (formObject["password"]!=formObject["confirmPassword"]){
                alert("Passwords Do Not Match")
            } 
            else {
                accountsData["accounts"].push(formObject)

                const jsonString= JSON.stringify(accountsData,null,2);

                const blob = new Blob([jsonString],{type:"application/json"});
                const url= URL.createObjectURL(blob);

                const a= document.createElement("a");
                a.href=url;
                a.download="accounts";
                a.click();
                URL.revokeObjectURL(url);
                
                //after submission, directs to homepage.Replace link if needed
                location.replace("home.html")
            }
         })
