// Simple auth demo using localStorage as fallback.
// Functions:
// - registerUser({fullname,email,password,role})
// - signIn(email,password)
// - signOut()
// For production: replace with Firebase Auth calls.

(function(){
  const STORAGE_KEY = "carwash_users_v1";
  const sessionKey = "carwash_session_v1";

  function readUsers(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    }catch(e){ return [] }
  }
  function writeUsers(u){ localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }

  function registerUser({fullname,email,password,role}){
    const users = readUsers();
    if(users.find(x=>x.email===email)) throw new Error("อีเมลนี้มีอยู่แล้ว");
    users.push({id:Date.now()+"-"+Math.random().toString(36).slice(2),fullname,email,password,role});
    writeUsers(users);
    return true;
  }

  function signIn(email,password){
    const users = readUsers();
    const usr = users.find(u=>u.email===email && u.password===password);
    if(!usr) throw new Error("ไม่พบผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง");
    localStorage.setItem(sessionKey, JSON.stringify({id:usr.id,fullname:usr.fullname,email:usr.email,role:usr.role}));
    return usr;
  }

  function signOut(){
    localStorage.removeItem(sessionKey);
  }

  function getSession(){
    try{ return JSON.parse(localStorage.getItem(sessionKey)); }catch{ return null }
  }

  // Expose to window for pages
  window.CarwashAuth = { registerUser, signIn, signOut, getSession };

  // Page hooks
  document.addEventListener("DOMContentLoaded", ()=>{
    // Register page
    const regForm = document.getElementById("registerForm");
    if(regForm){
      regForm.addEventListener("submit", e=>{
        e.preventDefault();
        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const role = document.getElementById("role").value;
        try{
          registerUser({fullname,email,password,role});
          alert("สมัครสำเร็จ ล็อกอินได้เลย");
          location.href = "index.html";
        }catch(err){ alert(err.message) }
      });
    }

    // Login page
    const loginForm = document.getElementById("loginForm");
    if(loginForm){
      loginForm.addEventListener("submit", e=>{
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        try{
          const u = signIn(email,password);
          // enable links based on role
          enableLinks(u.role);
          alert("เข้าสู่ระบบสำเร็จ: " + u.fullname);
        }catch(err){ alert(err.message) }
      });

      // If already logged in, enable links
      const s = getSession();
      if(s) enableLinks(s.role);
    }

    function enableLinks(role){
      const toWasher = document.getElementById("toWasher");
      const toAdmin = document.getElementById("toAdmin");
      if(toWasher) toWasher.removeAttribute("aria-disabled");
      if(role === "admin"){
        if(toAdmin) toAdmin.removeAttribute("aria-disabled");
      }else{
        if(toAdmin) toAdmin.setAttribute("aria-disabled","true");
      }
    }
  });
})();
