import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSend, FiMinimize2, FiMaximize2, FiTrash2, FiZap, FiHeart } from 'react-icons/fi'

// ── Complete Q&A Knowledge Base ──────────────────────────────────────────────
const QA = [
  // Greetings
  {
    k: ['hi','hello','hey','helo','hai','hii','hiii','yo','hola','vanakkam','namaste','sup'],
    a: "Hi there! 👋 Happy to see you!\n\nI'm Diya 🌸 your NGO Hub assistant!\n\nWhat can I help you with today? 😊💚"
  },
  {
    k: ['how are you','how r u','how are u','how r you','how do you do','how you doing','hows it going','how is you'],
    a: "I'm doing amazing, thank you for asking! 😊💚\n\nAlways happy and ready to help with NGO Hub!\n\nWhat do you need today? 🌸"
  },
  {
    k: ['what is your name','who are you','your name','introduce yourself','who r u','tell me about yourself','what are you'],
    a: "I'm Diya 🌸 — your AI assistant for NGO Hub!\n\nI know everything about this donation platform:\n💰 Donations\n📝 Registration\n🛡️ Admin operations\n🔧 Error fixes\n\nJust ask me anything! 😊"
  },
  {
    k: ['good morning','gm','morning','gud morning','good mrng','காலை வணக்கம்'],
    a: "Good Morning! ☀️😊\n\nHope you have a wonderful day!\n\nI'm Diya 🌸 — ask me anything about NGO Hub! 💚"
  },
  {
    k: ['good afternoon','afternoon','good noon'],
    a: "Good Afternoon! 🌤️😊\n\nHope your day is going great!\n\nHow can I help you with NGO Hub? 💚"
  },
  {
    k: ['good evening','evening','gud evening','மாலை வணக்கம்'],
    a: "Good Evening! 🌙😊\n\nNice to hear from you!\n\nHow can I help with NGO Hub? 💚"
  },
  {
    k: ['good night','gn','night','gud night','இரவு வணக்கம்'],
    a: "Good Night! 🌙✨\n\nSweet dreams!\n\nCome back anytime! 🌸💚"
  },
  {
    k: ['ok','okay','k','ohk','alright','sure','got it','understood','i see','ok da','hmm','fine'],
    a: "Great! 😊\n\nLet me know if you need anything else!\n\nI'm always here to help 💚🌸"
  },
  {
    k: ['thank you','thank','thanks','thanku','ty','tq','thx','nandri','dhanyawad','thankful'],
    a: "You're very welcome! 😊💚\n\nHappy to help anytime!\n\nAnything else I can help with? 🌸"
  },
  {
    k: ['bye','goodbye','see you','ok bye','tata','cya','ttyl','take care','later','see ya'],
    a: "Bye bye! 👋😊\n\nCome back anytime you need help!\n\nHave a wonderful day! 🌸💚"
  },
  {
    k: ['nice','great','awesome','cool','wow','amazing','fantastic','wonderful','perfect','superb','excellent','brilliant'],
    a: "That's great to hear! 😊🎉\n\nIs there anything else I can help you with about NGO Hub? 💚"
  },
  {
    k: ['help','what can you do','what do you know','assist me','support','what you know'],
    a: "I can help with everything about NGO Hub! 🌸\n\n💰 How to donate money or goods\n📝 How to register\n🔑 Login credentials\n✅ Approve campaigns\n🔧 Fix 500, 401, 403 errors\n📡 All API endpoints\n⚙️ Server configuration\n👥 User roles\n🏢 Create NGOs & campaigns\n🚐 Schedule pickups\n\nJust ask me anything! 😊"
  },
  {
    k: ['who made this','who created this','who built this','developer','who developed'],
    a: "NGO Hub was built as a full-stack project! 🎉\n\n⚙️ Backend: Spring Boot 3.x + Java 17\n🗄️ Database: MySQL + JPA\n🔐 Security: JWT Auth\n⚛️ Frontend: React + Vite\n🎨 Tailwind CSS\n✨ Framer Motion\n🤖 AI: Claude by Anthropic\n\nI'm Diya 🌸 — AI assistant built into this platform!"
  },

  // Auth & Login
  {
    k: ['how to register','register','signup','sign up','create account','new account','registration'],
    a: "How to Register! 📝\n\n1️⃣ Click Login in navbar\n2️⃣ Click Create one link\n3️⃣ Fill your details:\n   • Full Name\n   • Email\n   • Password\n   • Phone\n   • Address\n4️⃣ Select Role: DONOR or VOLUNTEER\n5️⃣ Click Create Account\n6️⃣ Login with your credentials ✅"
  },
  {
    k: ['how to login','login','sign in','signin','log in'],
    a: "How to Login! 🔐\n\n1️⃣ Go to /login page\n2️⃣ Enter Email\n3️⃣ Enter Password\n4️⃣ Click Sign In\n\nTest Credentials:\n👑 Admin: admin@ngo.com / admin123\n💚 Donor: john@example.com / password123\n🤝 Volunteer: volunteer@example.com / password123"
  },
  {
    k: ['admin credential','admin login','admin password','admin email','admin user','admin details'],
    a: "Admin Credentials! 👑\n\nEmail: admin@ngo.com\nPassword: admin123\n\nAdmin can:\n✅ Approve/Reject campaigns\n👥 Manage Donors & Volunteers\n🚨 Create Urgent Needs\n📊 Generate Reports\n🏢 Create NGOs"
  },
  {
    k: ['donor credential','donor login','donor password','donor email','donor details'],
    a: "Donor Credentials! 💚\n\nEmail: john@example.com\nPassword: password123\n\nDonor can:\n💰 Donate Money\n👕 Donate Clothes/Food/Grocery\n📦 Schedule Pickup\n📋 View History"
  },
  {
    k: ['volunteer credential','volunteer login','volunteer password','volunteer email'],
    a: "Volunteer Credentials! 🤝\n\nEmail: volunteer@example.com\nPassword: password123\n\nVolunteer can:\n📋 View Tasks\n▶️ Start Pickup\n✅ Complete Pickup"
  },
  {
    k: ['all credentials','test credentials','all passwords','all users','test users','credentials'],
    a: "All Test Credentials! 🔑\n\n👑 Admin:\nadmin@ngo.com / admin123\n\n💚 Donor:\njohn@example.com / password123\n\n🤝 Volunteer:\nvolunteer@example.com / password123"
  },

  // Donation
  {
    k: ['how to donate money','donate money','money donation','donate cash'],
    a: "Donate Money! 💰\n\n1️⃣ Login as DONOR\n2️⃣ Click Donate in navbar\n3️⃣ Click Money card\n4️⃣ Select Campaign from dropdown\n5️⃣ Choose amount:\n   ₹100 / ₹250 / ₹500 / ₹1000 / ₹2500 / ₹5000\n   OR enter custom amount\n6️⃣ Click Submit Donation ❤️\n\n⚠️ Campaign must be ACTIVE status!"
  },
  {
    k: ['how to donate','donate','donation','make donation','i want to donate'],
    a: "How to Donate! 💚\n\nStep 1 — Login as DONOR\nStep 2 — Click Donate in navbar\nStep 3 — Choose type:\n   💰 Money\n   👕 Clothes\n   🍱 Food\n   🛒 Grocery\n\nStep 4 — Select Campaign\nStep 5 — Fill details\nStep 6 — Submit! ✅"
  },
  {
    k: ['donate clothes','clothes donation','donate food','food donation','donate grocery','grocery donation','donate goods','goods donation'],
    a: "Donate Goods! 📦\n\n1️⃣ Login as DONOR\n2️⃣ Donate page → Click Clothes/Food/Grocery\n3️⃣ Select Campaign\n4️⃣ Describe items:\n   e.g. 10 winter jackets, good condition\n5️⃣ Optional: Add pickup address + time\n6️⃣ Submit ✅\n\nA volunteer will collect your items!"
  },
  {
    k: ['schedule pickup','pickup request','how to pickup','arrange pickup','book pickup'],
    a: "Schedule Pickup! 🚐\n\n1️⃣ Login as DONOR\n2️⃣ Donate Goods first\n3️⃣ In form fill:\n   📍 Pickup Address\n   📅 Pickup Date & Time\n4️⃣ Submit — volunteer will collect!\n\nView pickups: History page → Pickups tab"
  },
  {
    k: ['donation history','my donations','view history','past donations','previous donations','history'],
    a: "Donation History! 📋\n\n1️⃣ Login as DONOR\n2️⃣ Click History in navbar\n3️⃣ See two tabs:\n   💰 Donations — all your donations\n   🚐 Pickups — all scheduled pickups\n\nShows: type, amount, status, date"
  },

  // Campaign
  {
    k: ['create campaign','new campaign','add campaign','how to create campaign','make campaign'],
    a: "Create Campaign! 📣\n\nPOST /api/campaigns\nAuthorization: Bearer ADMIN_TOKEN\n\n{\n  title: Winter Clothes Drive,\n  description: Collecting warm clothes,\n  donationType: CLOTHES,\n  targetAmount: 50000,\n  startDate: 2025-01-01,\n  endDate: 2025-12-31,\n  ngoId: 1\n}\n\nTypes: MONEY, CLOTHES, FOOD, GROCERY\n⚠️ Admin must APPROVE after creating!"
  },
  {
    k: ['approve campaign','how to approve campaign','campaign approve','approve pending'],
    a: "Approve Campaign! ✅\n\nMethod 1 - Frontend:\n1️⃣ Login as Admin\n2️⃣ Admin Console → Campaigns\n3️⃣ Click Approve on PENDING campaign\n\nMethod 2 - Postman:\nPOST /api/admin/campaign/approve\nAuthorization: Bearer ADMIN_TOKEN\n{ campaignId: 1 }\n\n✅ PENDING → ACTIVE\nNow donors can donate!"
  },
  {
    k: ['only pending campaigns','pending error','already active','already approved'],
    a: "Error: Only PENDING campaigns can be approved! 🔧\n\nMeaning: Campaign already ACTIVE!\n\nFix:\n1️⃣ GET /api/campaigns\n2️⃣ Check status\n3️⃣ If ACTIVE → no action needed ✅\n4️⃣ Only approve PENDING ones!"
  },
  {
    k: ['all campaigns','view campaigns','campaign list','what is campaign','campaign'],
    a: "Campaigns Info! 📣\n\nView all: GET /api/campaigns\nView one: GET /api/campaigns/{id}\n\nStatuses:\n⏳ PENDING — awaiting approval\n✅ ACTIVE — accepting donations\n❌ REJECTED — rejected by admin\n🏁 COMPLETED — goal achieved\n\nTypes: MONEY, CLOTHES, FOOD, GROCERY"
  },

  // Errors
  {
    k: ['500 error','500 internal server error','internal server error','server error 500'],
    a: "Fix 500 Error! 🔧\n\nCause: Database table missing\n\nFix:\n1️⃣ MySQL Workbench → Run:\nDROP DATABASE IF EXISTS ngo_donation_db;\nCREATE DATABASE ngo_donation_db;\n\n2️⃣ application.properties:\nspring.jpa.hibernate.ddl-auto=update\n\n3️⃣ Remove this line if exists:\nspring.jpa.properties.hibernate.dialect=...\n\n4️⃣ Restart Spring Boot ✅"
  },
  {
    k: ['401 unauthorized','unauthorized error','401 error','invalid token','token expired'],
    a: "Fix 401 Unauthorized! 🔧\n\nCause: Token missing in headers\n\nFix:\n1️⃣ Login:\nPOST /api/auth/login\n{ email: admin@ngo.com, password: admin123 }\n\n2️⃣ Copy token from response\n\n3️⃣ Postman Headers:\nKey: Authorization\nValue: Bearer YOUR_TOKEN\n\n⚠️ Space after Bearer is important!"
  },
  {
    k: ['403 forbidden','forbidden error','403 error','no permission','insufficient permission'],
    a: "Fix 403 Forbidden! 🔧\n\nCause: Wrong role for this API\n\nFix:\n1️⃣ Login as Admin:\nadmin@ngo.com / admin123\n\n2️⃣ Use admin token for:\n• /api/admin/* endpoints\n• POST /api/ngos\n• Approve/reject campaigns"
  },
  {
    k: ['table not exist','table missing','users not exist','table does not exist','table doesnt exist'],
    a: "Fix Table Not Exist! 🔧\n\napplication.properties:\n\n✅ Set:\nspring.jpa.hibernate.ddl-auto=update\n\n❌ Remove this line:\nspring.jpa.properties.hibernate.dialect=...\n\nSave → Restart Spring Boot ✅\nTables auto-created!"
  },
  {
    k: ['grocery not showing','grocery missing','not showing dropdown','missing in dropdown','dropdown empty'],
    a: "Fix Grocery Not Showing! 🛒\n\n1️⃣ POST /api/campaigns\nAuthorization: Bearer ADMIN_TOKEN\n{\n  title: Grocery for Elderly,\n  donationType: GROCERY,\n  targetAmount: 40000,\n  startDate: 2025-01-01,\n  endDate: 2025-12-31,\n  ngoId: 1\n}\n\n2️⃣ Note id from response\n\n3️⃣ POST /api/admin/campaign/approve\n{ campaignId: YOUR_ID }\n\n4️⃣ Refresh frontend ✅"
  },
  {
    k: ['error','fix error','some error','there is error','getting error','problem','issue','not working'],
    a: "Tell me the exact error! 🔧\n\nCommon errors I fix:\n• 500 Internal Server Error\n• 401 Unauthorized\n• 403 Forbidden\n• Table not exist\n• Only PENDING campaigns error\n• Grocery not showing\n• Database connection error\n\nType exact error message! 😊"
  },

  // Platform
  {
    k: ['what is ngo hub','about ngo hub','about this project','about this app','what is this app'],
    a: "About NGO Hub! 🌍\n\nFull-stack Donation Management Platform!\n\n⚙️ Backend: Spring Boot 3.x + Java 17\n🗄️ Database: MySQL + JPA\n🔐 Security: JWT Auth\n⚛️ Frontend: React + Vite\n🎨 Tailwind CSS\n✨ Framer Motion\n🤖 AI Chatbot: Claude\n\nFeatures:\n💰 Money & Goods Donations\n🚐 Pickup Scheduling\n📊 Admin Dashboard\n👥 4 User Roles"
  },
  {
    k: ['user roles','what roles','all roles','types of users','role','roles'],
    a: "User Roles! 👥\n\n1️⃣ GUEST 🌐\n   View NGOs and Campaigns\n   No login needed\n\n2️⃣ DONOR 💚\n   Donate Money & Goods\n   Schedule Pickup\n   View History\n\n3️⃣ VOLUNTEER 🤝\n   View Assigned Tasks\n   Update Task Status\n\n4️⃣ ADMIN 👑\n   Approve/Reject Campaigns\n   Manage All Users\n   Generate Reports"
  },
  {
    k: ['all api','all endpoints','list api','api endpoints','api list'],
    a: "All API Endpoints! 📡\n\nAUTH:\nPOST /api/auth/register\nPOST /api/auth/login\n\nNGO:\nGET  /api/ngos\nPOST /api/ngos\n\nCAMPAIGN:\nGET  /api/campaigns\nPOST /api/campaigns\n\nDONATION:\nPOST /api/donations/money\nPOST /api/donations/goods\nGET  /api/donations/history/{id}\n\nPICKUP:\nPOST /api/pickups/request\nGET  /api/pickups/{donorId}\n\nVOLUNTEER:\nGET /api/tasks/volunteer/{id}\nPUT /api/tasks/updateStatus/{id}\n\nADMIN:\nPOST /api/admin/campaign/approve\nPOST /api/admin/campaign/reject\nGET  /api/admin/donors\nGET  /api/admin/volunteers\nGET  /api/admin/reports"
  },
  {
    k: ['which port','server port','backend port','frontend port','port number'],
    a: "Server Ports! 🔌\n\nBackend: http://localhost:8081\nFrontend: http://localhost:3000\nMySQL: localhost:3306\n\nDatabase: ngo_donation_db\nUsername: root\nPassword: moki@amma123"
  },
  {
    k: ['application.properties','properties file','configuration','spring config','spring boot config'],
    a: "application.properties! ⚙️\n\nserver.port=8081\n\nspring.datasource.url=jdbc:mysql://localhost:3306/ngo_donation_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true\nspring.datasource.username=root\nspring.datasource.password=moki@amma123\n\nspring.jpa.hibernate.ddl-auto=update\nspring.jpa.show-sql=true\n\napp.jwt.secret=NGODonationSecretKey2024\napp.jwt.expiration=86400000"
  },
  {
    k: ['volunteer task','my task','view task','update task','task status','task management'],
    a: "Volunteer Tasks! 🤝\n\n1️⃣ Login as VOLUNTEER\n2️⃣ Volunteer Dashboard → My Tasks\n3️⃣ See all assigned pickups\n\nUpdate Status:\n▶️ Click Start Pickup\n   ASSIGNED → IN_PROGRESS\n✅ Click Mark Complete\n   IN_PROGRESS → COMPLETED\n\nPostman:\nPUT /api/tasks/updateStatus/{id}\n{ status: IN_PROGRESS }"
  },
  {
    k: ['create ngo','add ngo','new ngo','how to create ngo','ngo management'],
    a: "Create NGO! 🏢\n\nPOST /api/ngos\nAuthorization: Bearer ADMIN_TOKEN\n\n{\n  name: Hope Foundation,\n  description: Helping communities,\n  address: Chennai Tamil Nadu,\n  contactEmail: hope@ngo.org,\n  contactPhone: 9000000001\n}\n\nSearch: GET /api/ngos?location=Chennai"
  },
  {
    k: ['all pages','page list','routes','navigation','what pages are there','pages'],
    a: "All Pages! 🗺️\n\n/ → Home (Donor wall)\n/ngos → NGO list\n/campaigns → Campaigns\n/donate → Donate form\n/history → My donations\n/volunteer → My tasks\n/admin → Admin dashboard\n/contact → Contact us\n/login → Login\n/register → Register"
  },
  {
    k: ['how to run','start project','run project','how to start','start backend','start frontend','run the app'],
    a: "Run the Project! 🚀\n\nBackend (IntelliJ):\n1️⃣ Open ngo-donation-backend\n2️⃣ Wait for Maven\n3️⃣ Run DonationApplication.java\n4️⃣ Runs on port 8081 ✅\n\nFrontend (VS Code):\n1️⃣ Open ngo-frontend\n2️⃣ npm install\n3️⃣ npm run dev\n4️⃣ Opens http://localhost:3000 ✅"
  },
  {
    k: ['urgent need','create urgent need','emergency banner','urgent banner'],
    a: "Create Urgent Need! 🚨\n\nPostman:\nPOST /api/admin/urgent-need\nAuthorization: Bearer ADMIN_TOKEN\n\n{\n  title: URGENT Flood Relief,\n  description: Food and blankets needed,\n  createdByAdminId: 3\n}\n\nOr Frontend:\nAdmin Console → Urgent Needs → Fill form!"
  },
  {
    k: ['generate report','create report','reports','admin report','view report'],
    a: "Generate Reports! 📊\n\nPostman:\nPOST /api/admin/reports/generate?type=MONTHLY_SUMMARY\nAuthorization: Bearer ADMIN_TOKEN\n\nReport Types:\n• MONTHLY_SUMMARY\n• DONOR_REPORT\n• CAMPAIGN_REPORT\n• VOLUNTEER_REPORT\n\nOr Admin Console → Reports"
  },
  {
    k: ['dark mode','light mode','theme','toggle theme','change theme'],
    a: "Dark/Light Mode! 🌙\n\nClick the Sun/Moon icon in the top navbar!\n\n☀️ Sun = Light mode\n🌙 Moon = Dark mode\n\nDefault is Dark mode 😊"
  },
  {
    k: ['jwt token','what is jwt','bearer token','token','how to use token'],
    a: "JWT Token! 🔐\n\nAfter login you get a JWT token.\n\nUse in all protected APIs:\nHeader Key: Authorization\nHeader Value: Bearer YOUR_TOKEN_HERE\n\nToken expires: 24 hours\n\nIf expired → Login again for new token!"
  },
  {
    k: ['postman','how to use postman','test api','api testing'],
    a: "Using Postman! 📬\n\n1️⃣ Download: postman.com\n2️⃣ Create new request\n3️⃣ Set Method: GET/POST/PUT\n4️⃣ Enter URL\n5️⃣ Headers tab → Add:\n   Content-Type: application/json\n   Authorization: Bearer TOKEN\n6️⃣ Body tab → raw → JSON\n7️⃣ Click Send!\n\nTest order:\nRegister → Login → Create NGO → Create Campaign → Approve → Donate"
  },
  {
    k: ['ngo hub','what is ngo','ngo'],
    a: "NGO Hub! 🌍\n\nNGO = Non-Governmental Organization\n\nNGO Hub is a platform that connects:\n💚 Donors — people who want to give\n🏢 NGOs — organizations helping people\n🤝 Volunteers — people who help collect\n\nYou can donate:\n💰 Money\n👕 Clothes\n🍱 Food\n🛒 Groceries"
  },
  // EmailJS Setup
  {
    k: ['emailjs','email js','emailjs setup','email integration','contact form email','template id','public key','emailjs template','emailjs public key'],
    a: "Da you need to get Template ID and Public Key from EmailJS. Follow these exact steps!\n\n✅ Get Template ID\nStep 1\nClick \"Email Templates\" in left sidebar\nStep 2\nClick \"Create New Template\"\nStep 3\nFill exactly like this:\nTo Email:\nmokitha8166@gmail.com\nSubject:\nNew Message from {{from_name}} - NGO Hub\nBody:\nHello Mokitha!\n\nYou received a new message from NGO Hub Contact Form.\n\n=====================================\nName    : {{from_name}}\nEmail   : {{from_email}}\nSubject : {{subject}}\n=====================================\n\nMessage:\n{{message}}\n\n=====================================\nSent from NGO Hub Website\nStep 4\nClick \"Save\" button\nStep 5\nCopy your Template ID like: template_xxxxxxx\n\n✅ Get Public Key\nStep 1\nClick \"Account\" in left sidebar\nStep 2\nClick \"General\" tab\nStep 3\nScroll down to API Keys\nStep 4\nCopy your Public Key\n\n✅ After getting both — tell me da!\nReply like this:\nTemplate ID : template_xxxxxxx\nPublic Key  : xxxxxxxxxxxxxxx"
  },
]

// ── Smart score-based answer matcher ────────────────────────────────────────
const getAnswer = (input) => {
  const text = input.toLowerCase().trim()

  let bestMatch = null
  let bestScore = 0

  for (const item of QA) {
    for (const k of item.k) {
      let score = 0

      if (text === k) {
        score = 100  // exact match
      } else if (text.startsWith(k) && k.length >= 3) {
        score = 85   // text starts with keyword
      } else if (k.startsWith(text) && text.length >= 3) {
        score = 75   // keyword starts with text
      } else if (text.includes(' ' + k + ' ') || text.includes(k + ' ') || text.includes(' ' + k)) {
        score = 70   // keyword as word boundary
      } else if (text.includes(k) && k.length >= 5) {
        score = 60   // text contains keyword (min 5 chars)
      } else if (k.includes(text) && text.length >= 5) {
        score = 50   // keyword contains text (min 5 chars)
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = item.a
      }
    }
  }

  if (bestScore >= 50) return bestMatch

  // Smart fallback
  return "I heard you! 😊\n\nI'm best with NGO Hub questions. Try asking:\n\n👋 'hi' — greeting\n🌅 'good morning' — morning wish\n💰 'how to donate' — donation steps\n📝 'how to register' — registration\n🔑 'all credentials' — login details\n✅ 'approve campaign' — admin guide\n🔧 'fix 500 error' — error fix\n📡 'all apis' — all endpoints\n🚀 'how to run' — start project\n\nWhat would you like to know? 🌸"
}

// ── Message Bubble ───────────────────────────────────────────────────────────
const Bubble = ({ msg }) => {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
        ${isUser
          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
          : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'}`}>
        {isUser ? 'U' : '🌸'}
      </div>
      <div className={`max-w-[83%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
        ${isUser
          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-sm'
          : 'bg-slate-800 text-slate-100 border border-emerald-500/20 rounded-tl-sm'}`}>
        {msg.content}
      </div>
    </motion.div>
  )
}

// ── Typing Indicator ─────────────────────────────────────────────────────────
const Typing = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex gap-2 items-end"
  >
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-xs">
      🌸
    </div>
    <div className="bg-slate-800 border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  </motion.div>
)

// ── Quick Suggestion Chips ───────────────────────────────────────────────────
const CHIPS = [
  '👋 Hi Diya!',
  '💰 How to donate?',
  '📝 How to register?',
  '🔑 All credentials',
  '✅ Approve campaign?',
  '🔧 Fix 500 error',
]

// ── Main Chatbot Component ───────────────────────────────────────────────────
export default function AIChatbot() {
  const [open, setOpen]         = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [msgs, setMsgs]         = useState([{
    role: 'assistant',
    content: "Hi! I'm Diya 🌸 your NGO Hub assistant!\n\nI can help with:\n💰 Donate money or goods\n📝 Register as donor/volunteer\n🛡️ Admin operations\n🔧 Fix API errors\n❓ Any platform questions\n\nJust ask me anything! 😊"
  }])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [unread, setUnread]     = useState(0)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  const send = async (text) => {
    const txt = (text || input).trim()
    if (!txt || loading) return
    setInput('')
    setMsgs(prev => [...prev, { role: 'user', content: txt }])
    setLoading(true)
    // Natural typing delay
    await new Promise(r => setTimeout(r, 500))
    const answer = getAnswer(txt)
    setMsgs(prev => [...prev, { role: 'assistant', content: answer }])
    if (!open) setUnread(u => u + 1)
    setLoading(false)
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const clear = () => {
    setMsgs([{
      role: 'assistant',
      content: "Chat cleared! 😊\n\nAsk me anything about NGO Hub! 🌸"
    }])
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpen(true)}
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/40 flex items-center justify-center border border-emerald-400/30"
            >
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-emerald-400"
              />
              <FiHeart className="text-white text-2xl relative z-10" />
              {unread > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-20"
                >
                  {unread}
                </motion.div>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            className={`fixed z-[9999] flex flex-col overflow-hidden rounded-3xl border border-emerald-500/20 shadow-2xl shadow-black/60
              ${expanded ? 'inset-4 sm:inset-8' : 'bottom-6 right-6 w-[360px] sm:w-[400px] h-[600px]'}`}
            style={{ background: 'linear-gradient(145deg, #0f172a 0%, #042f2e 100%)' }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b border-emerald-500/20 flex-shrink-0"
              style={{ background: 'linear-gradient(90deg, rgba(5,150,105,0.25) 0%, rgba(15,118,110,0.25) 100%)' }}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30">
                  🌸
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">Diya</p>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40">
                    <FiZap className="text-emerald-400 text-xs" />
                    <span className="text-emerald-300 text-xs font-semibold">AI</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">NGO Hub Assistant • Always here 💚</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={clear}
                  title="Clear chat"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <FiTrash2 className="text-sm" />
                </button>
                <button
                  onClick={() => setExpanded(e => !e)}
                  title="Expand"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-all"
                >
                  {expanded ? <FiMinimize2 className="text-sm" /> : <FiMaximize2 className="text-sm" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title="Close"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <FiX className="text-sm" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {msgs.map((m, i) => <Bubble key={i} msg={m} />)}
              {loading && <Typing />}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion Chips */}
            {msgs.length <= 2 && !loading && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
                {CHIPS.map(c => (
                  <motion.button
                    key={c}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => send(c)}
                    className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all"
                  >
                    {c}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-emerald-500/10">
              <div className="flex items-end gap-2 bg-slate-800/60 rounded-2xl border border-white/8 px-4 py-2.5 focus-within:border-emerald-500/50 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Ask me anything… 💬"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none max-h-28 leading-relaxed"
                  style={{ scrollbarWidth: 'none' }}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                >
                  {loading
                    ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <FiSend className="text-white text-xs" />}
                </motion.button>
              </div>
              <p className="text-center text-xs text-slate-600 mt-1.5">
                ⚡ NGO Hub AI • Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
