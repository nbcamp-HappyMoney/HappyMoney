/* 내가 쓴 게시글 가져오는 함수 */
import { token } from './common.js'


const getMyPosts = async (token) => {
  try {
    const apiUrl = `http://localhost:3000/api/posts/my`

    const result = await axios.get(apiUrl, {
      headers: {
        'Authorization': token,
      }
    })
    const latestPosts = result.data.data

    const mainDom = document.querySelector(".board-list")

    mainDom.innerHTML = latestPosts
      .map(post => {
        const { title, nickName, category, createdAt, commentNumbers } = post

        const formattedDate = createdAt.split("T")[0];
        const commentClass = commentNumbers === 0 ? "comment hidden" : "comment";

        return `
        <li class="contents">
           <a href="#none"></a>
           <div class="list-info">
             <div class="classification">${category}</div>
             <div class="title">${title}</div>
             <div class=${commentClass}>
               <img src="../images/comment.png" alt="comment-icon" class="comment-icon" />
               <span class="comment-number">${commentNumbers}</span>
             </div>
           </div>
           <div class="list-info-2">
             <div class="author">${nickName}</div>
             <div class="date">${formattedDate}</div>
           </div>
        </li>
        <hr />
        `
      }).join("")
  } catch (error) {
    console.error(error)
  }
}

await getMyPosts(token)