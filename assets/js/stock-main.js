import { addComma } from "/js/common.js";
import getToken from "./common.js";

const token = getToken();

rankListData();

async function rankListData() {
  const stockUrl = "/api/stock/stockRank";

  try {
    const stockList = await axios.get(stockUrl);
    const list = stockList.data.list.output.slice(0, 20);

    const mainDom = document.querySelector(".rank-list-wrap");
    mainDom.innerHTML = list
      .map((list) => {
        const formattedPrice = addComma(list.stck_prpr);

        const priceClass = parseFloat(list.prdy_ctrt) <= 0 ? "minus" : "plus";

        return `
            <li>
              <a href='/views/stock-detail.html?code=${list.mksc_shrn_iscd}&name=${list.hts_kor_isnm}'></a>
              <div class="rank-name">
                <p><span>${list.data_rank}</span> ${list.hts_kor_isnm}</p>
              </div>
              <div class="rank-price">
                <p>${formattedPrice} 원</p>
                <span class=${priceClass}>${list.prdy_ctrt}%</span>
              <div>
            </li>
            `;
      })
      .join("");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

/* 랭킹 데이터 가져오기 */

async function getAccountRank() {
  const apiUrl = "/api/accounts/rank";

  try {
    const result = await axios.get(apiUrl, {
      headers: {
        Authorization: token
      }
    });

    const topTenAccounts = result.data.topTenAccounts;

    return topTenAccounts;
  } catch (error) {
    if (error.response.status === 401) {
      alert("로그인이 필요합니다.");
      drPopupOpen(".hm-popup-login");
    } else {
      console.error(error.response);
      const errorMessage = error.response.data.message;
      alert(errorMessage);
    }
  }
}

async function spreadTopTenAccounts() {
  const mainDom = document.querySelector(".account-rank-list");
  const topTenAccounts = await getAccountRank();

  /* 랭킹 기준 날짜 보여주기 */
  const rankUpdatedAt = new Date(topTenAccounts[0].rankUpdatedAt);

  const koreanTime = `${rankUpdatedAt.getFullYear()}-${String(rankUpdatedAt.getMonth() + 1).padStart(2, "0")}-${String(rankUpdatedAt.getDate()).padStart(2, "0")} ${String(rankUpdatedAt.getHours()).padStart(2, "0")}:${String(rankUpdatedAt.getMinutes()).padStart(2, "0")}`;

  $(".criteria-date").text(`* ${koreanTime} 기준`);

  let rank = 0;

  mainDom.innerHTML = topTenAccounts
    .map((account) => {
      const { id, name: accountName, totalValue, profit, profitPercentage, accountNumber, user } = account;

      const formatProfit = profit > 0 ? `${addComma(profit)}` : `${addComma(profit)}`;

      const formatValues = addComma(totalValue);

      rank += 1;

      return `
      <tr data-id=${id}>
      <th scope="row">${rank}</th>
      <td>${user.nickName}</td>
      <td>${accountName}</td>
      <td>${accountNumber}</td>
      <td>${formatProfit} 원</td>
      <td>${profitPercentage}%</td>
      <td>${formatValues} 원</td>
    </tr>
      `;
    })
    .join("");
}

await spreadTopTenAccounts();
