import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  remove,
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

let rowAdded = false;

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
    actionCell.innerHTML = '<button onclick="saveRow()">保存</button>';

    rowAdded = true; // 标记已添加一行
  } else {
    alert("每个用户只能添加一行！");
  }
}

function saveRow() {
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

  set(ref(database, "users/" + userName), {
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

// 编辑行的内容
function editRow(userName, button) {
  let row = button.parentNode.parentNode;
  let inputs = row.querySelectorAll('input[type="number"]');

  if (button.textContent === "编辑") {
    // 点击编辑按钮时，允许编辑
    inputs.forEach((input) => {
      input.removeAttribute("disabled"); // 确保移除disabled属性
    });
    button.textContent = "保存";
  } else {
    // 点击保存按钮时，保存更新
    let quantities = Array.from(inputs).map((input) => {
      let value = input.value;
      return value === "" ? 0 : parseInt(value, 10); // 如果输入为空，默认值为0
    });

    set(ref(database, "users/" + userName), {
      product1: { quantity: quantities[0] },
      product2: { quantity: quantities[1] },
      product3: { quantity: quantities[2] },
    })
      .then(() => {
        alert("数据已更新！");
        inputs.forEach((input) => (input.disabled = true));
        button.textContent = "编辑";
      })
      .catch((error) => {
        alert("更新失败: " + error.message);
      });
  }
}

function deleteRow(userName, button) {
  if (confirm(`确定要删除用户 ${userName} 的数据吗？`)) {
    let row = button.parentNode.parentNode;
    row.remove(); // 从前端删除这一行

    // 从 Firebase 中删除
    const userRef = ref(database, "users/" + userName);

    // 正确调用 remove() 方法
    remove(userRef)
      .then(() => {
        alert("数据已删除！");
      })
      .catch((error) => {
        alert("删除失败: " + error.message);
      });
  }
}

// 读取数据并显示
onValue(ref(database, "users"), function (snapshot) {
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
      product1Cell.innerHTML = `<input type="number" value="${userData.product1.quantity}" disabled />`; // 商品1数量

      let product2Cell = row.insertCell(2);
      product2Cell.innerHTML = `<input type="number" value="${userData.product2.quantity}" disabled />`; // 商品2数量

      let product3Cell = row.insertCell(3);
      product3Cell.innerHTML = `<input type="number" value="${userData.product3.quantity}" disabled />`; // 商品3数量

      // 编辑和删除按钮
      let actionCell = row.insertCell(4);
      actionCell.innerHTML = `
        <button onclick="editRow('${userName}', this)">编辑</button>
        <button onclick="deleteRow('${userName}', this)">删除</button>
      `;
    }
  }
});

window.addRow = addRow;
window.saveRow = saveRow;
window.editRow = editRow;
window.deleteRow = deleteRow;
