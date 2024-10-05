import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDl-UwYQ6Ipi97EADyWs0qowRoChkTLNkY",
  authDomain: "ptresidents.firebaseapp.com",
  databaseURL:
    "https://ptresidents-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ptresidents",
  storageBucket: "ptresidents.appspot.com",
  messagingSenderId: "451549583873",
  appId: "1:451549583873:web:fbb8d9f8caefc71c6dfe00",
  measurementId: "G-GF7PRQGW64",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 定义变量，标记是否已添加行
let rowAdded = false;

// 添加新行，用户输入名字并输入商品数量
function addRow() {
  if (!rowAdded) {
    let table = document.getElementById("productTable");
    let row = table.insertRow();

    // 第一个单元格是用户名字
    let nameCell = row.insertCell(0);
    nameCell.innerHTML =
      '<input type="text" placeholder="输入姓名" id="userName">';

    // 后面三个单元格是商品数量
    for (let i = 1; i <= 3; i++) {
      let cell = row.insertCell(i);
      cell.innerHTML =
        '<input type="number" placeholder="数量" id="quantity' + i + '">';
    }

    // 最后一个单元格是保存按钮
    let actionCell = row.insertCell(4);
    actionCell.innerHTML = '<button onclick="saveData()">保存</button>';

    rowAdded = true; // 标记已添加一行
  } else {
    alert("每个用户只能添加一行！");
  }
}

// 手动保存数据
function saveData() {
  let userName = document.getElementById("userName").value;
  let quantities = [
    document.getElementById("quantity1").value || 0, // 商品1数量
    document.getElementById("quantity2").value || 0, // 商品2数量
    document.getElementById("quantity3").value || 0, // 商品3数量
  ];

  if (userName.trim() === "") {
    alert("请填写用户名！");
    return;
  }

  // 存储到 Firebase，按用户名字存储
  set(ref(database, "products/" + userName), {
    product1: { quantity: quantities[0] },
    product2: { quantity: quantities[1] },
    product3: { quantity: quantities[2] },
  })
    .then(() => {
      alert("数据已保存！");
    })
    .catch((error) => {
      alert("保存失败: " + error.message);
    });
}

// 读取数据并显示
onValue(ref(database, "products"), function (snapshot) {
  let data = snapshot.val();
  if (data) {
    // 清除已存在的行
    let table = document.getElementById("productTable");
    while (table.rows.length > 2) {
      table.deleteRow(2);
    }

    // 遍历每个用户
    for (let userName in data) {
      let userData = data[userName];
      let row = table.insertRow();

      // 填充用户数据
      let nameCell = row.insertCell(0);
      nameCell.innerHTML = userName; // 用户名字

      let product1Cell = row.insertCell(1);
      product1Cell.innerHTML = userData.product1.quantity; // 商品1数量

      let product2Cell = row.insertCell(2);
      product2Cell.innerHTML = userData.product2.quantity; // 商品2数量

      let product3Cell = row.insertCell(3);
      product3Cell.innerHTML = userData.product3.quantity; // 商品3数量

      let actionCell = row.insertCell(4);
      actionCell.innerHTML = "已保存"; // 提示已保存的状态
    }
  }
});

window.addRow = addRow;
window.saveData = saveData;
