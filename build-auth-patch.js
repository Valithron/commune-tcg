const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(file, 'utf8');

html = html.replace(
  "authBusy=true;renderLogin();let path='/api/auth/login',body={userId:u.id,pin};if(!u.pinSet){let c=document.getElementById('pin2').value;",
  "let c=document.getElementById('pin2')?document.getElementById('pin2').value:'';authBusy=true;renderLogin();let path='/api/auth/login',body={userId:u.id,pin};if(!u.pinSet){"
);

fs.writeFileSync(file, html);
console.log('Auth setup patch applied.');
