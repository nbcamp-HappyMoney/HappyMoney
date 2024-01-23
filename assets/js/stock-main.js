import token from '../js/common.js'
console.log(token());

async function rankListData() {
  const stockUrl = "http://localhost:3000/api/stock/stockRank";

  try {
    const stockList = await axios.get(stockUrl);
    const list = stockList.data.list.output.slice(0, 10);
    console.log(list);

    const mainDom = document.querySelector(".rank-list-wrap");
    mainDom.innerHTML = list
      .map((list) => {
        const formattedPrice = addComma(list.stck_prpr);
        const percentClass = $(".rank-list-wrap .rank-price span").addClass("mius");
        const priceClass = parseFloat(list.prdy_ctrt) < 0 ? percentClass : "";
        return `
            <li>
              <a href='#none'></a>
              <div class="rank-name">
                <p><span>${list.data_rank}</span> ${list.hts_kor_isnm}</p>
              </div>
              <div class="rank-price">
                <p>${formattedPrice} 원</p>
                <span>${list.prdy_ctrt}%</span>
              <div>
            </li>
            `;
      })
      .join("");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

function addComma(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.addEventListener("DOMContentLoaded", rankListData);