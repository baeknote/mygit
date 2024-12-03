import React from "react";
import ChatBox from "../components/ChatBox";

export default function HomePage() {
  return (
    <div>
      <h1>JIKS HomePage</h1>
      <h3>상황 예시-관리자에게 질문이 있음</h3>
      <div className="img-container">
        <img id="jiks" src="guidance_img01.png" alt="manager"></img>
        <img id="소개" src="jiks.com_sub1_sub1_02.php.png"></img>
      </div>
      <ChatBox />
    </div>
  );
}
