let accountsData={
    accounts:[]
}
function redirectToGoogle(){ 
    window.location.href="https://www.google.com"
}
const account="accounts.json";
async function loadAccounts(){
try{
    const response=await fetch(accountsUrl);
    if(!response.ok){
        throw new Error('Network response was not ok:${response.statusText}')
    }
    accountsData=await response.json();
}catch(error){
 console.error("error loadingaccounts",error)

}
}
loadAccounts();
console.log(accountsData)
function checkUser(user){
    for (let i=0;i<accountsData["accounts"].length;i++){
        if(user==accountsData["accounts"][i].email){
        return i};
    }
    return -1;
 }

document.getElementById('loginappform').addEventListener('submit', function (event) {
event.preventDefault();

// Collect form data
const formData = new FormData(event.target);
const formObject = Object.fromEntries(formData.entries());
position=checkUser(formObject["email"]);
if(position<0){
    alert('you are not registered')
}
else if(formObject["password"]!=accountsData["accounts"]["position"].password){
    alert('wrong password')
} else{
    location.replace("home.html")
}

//  fetch('loginappform.json').then(response=>response.json()).then(loginappform=>{
  //  const user=loginappform.find(user=>user.email===email);
   // if(user.password===password){
     //   document.getElementById('message').textContent='Login Succesfull';}else{
       //     document.getElementById('message').textContent='email does not exist';}
      //  })
      //  .catch(error =>console.error('Error fetching users:' ,error ));})


// Transform the object to a JSON string
//const jsonString = JSON.stringify(formObject, null, 2);

// Create a Blob with the JSON data
//const blob = new Blob([jsonString], { type: 'application/json' });

// Create a download link
// const url = URL.createObjectURL(blob);
// const a = document.createElement('a');
// a.href = url;
// a.download = 'loginappform.json';
// a.click();
// URL.revokeObjectURL(url);
});